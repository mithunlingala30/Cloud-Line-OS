"""
Code execution engine.

IMPORTANT SECURITY NOTE
------------------------
This executes arbitrary user-submitted code. subprocess + rlimits (below) is
fine for a personal project / learning demo, but it is NOT a hard security
boundary — a sufficiently malicious submission could still abuse the host
(e.g. via fork bombs partially, filesystem access, etc.).

For anything public-facing, wrap this executor call inside a locked-down
Docker container per run (or use gVisor/firejail/nsjail), with:
  - no network access
  - read-only root filesystem except /tmp
  - a dedicated low-privilege user
  - strict memory/cpu/pids cgroup limits
See README.md "Hardening for production" section.
"""

import os
import re
import shutil
import subprocess
import tempfile
import time
import uuid
if os.name != "nt":  # `resource` is Unix-only; not available on Windows
    import resource
from dataclasses import dataclass, field
from typing import List, Optional

from app.core.languages import get_language, LanguageConfig

MAX_OUTPUT_CHARS = 20_000
MEMORY_LIMIT_MB = 256


@dataclass
class RunResult:
    status: str            # "success" | "compile_error" | "runtime_error" | "timeout" | "internal_error"
    stdout: str = ""
    stderr: str = ""
    exit_code: Optional[int] = None
    time_ms: Optional[int] = None
    passed: Optional[bool] = None   # set when compared against expected output
    error_line: Optional[int] = None  # 1-indexed source line where error occurred


def _limit_resources():
    """Called in the child process (via preexec_fn) to cap CPU/memory
    and prevent core dumps / runaway processes."""
    try:
        resource.setrlimit(resource.RLIMIT_CPU, (10, 10))  # type: ignore[name-defined]
        mem_bytes = MEMORY_LIMIT_MB * 1024 * 1024
        resource.setrlimit(resource.RLIMIT_AS, (mem_bytes, mem_bytes))  # type: ignore[name-defined]
        resource.setrlimit(resource.RLIMIT_CORE, (0, 0))  # type: ignore[name-defined]
        resource.setrlimit(resource.RLIMIT_NPROC, (64, 64))  # type: ignore[name-defined]
    except Exception:
        # Some limits aren't settable in every environment (e.g. containers
        # without CAP_SYS_RESOURCE) — fail open rather than crash the run.
        pass


def _build_env() -> dict:
    """Build an environment dict for subprocesses.
    On Windows, inject the MSYS2 ucrt64 bin dir so that gcc.exe and compiled
    binaries can resolve their runtime DLLs even when the system PATH hasn't
    been updated in the current process."""
    env = os.environ.copy()
    if os.name == "nt":
        msys2_bin = r"C:\msys64\ucrt64\bin"
        if msys2_bin not in env.get("PATH", ""):
            env["PATH"] = msys2_bin + os.pathsep + env.get("PATH", "")
    return env


def _run_subprocess(cmd: List[str], cwd: str, stdin_data: str, timeout: int):
    start = time.time()
    try:
        proc = subprocess.run(
            cmd,
            cwd=cwd,
            input=stdin_data,
            capture_output=True,
            text=True,
            timeout=timeout,
            preexec_fn=_limit_resources if os.name != "nt" else None,
            env=_build_env(),
        )
        elapsed_ms = int((time.time() - start) * 1000)
        return proc.returncode, proc.stdout, proc.stderr, elapsed_ms, False
    except subprocess.TimeoutExpired as e:
        elapsed_ms = int((time.time() - start) * 1000)
        out = e.stdout or ""
        err = e.stderr or ""
        return None, out, err, elapsed_ms, True


def _enforce_java_classname(code: str) -> str:
    """LeetCode-style constraint: the public class must be named Main so it
    matches Main.java. If the user wrote `public class Solution`, we swap it."""
    return re.sub(r"public\s+class\s+\w+", "public class Main", code, count=1)


# ---------------------------------------------------------------------------
# Error-line extraction
# ---------------------------------------------------------------------------

# Each pattern maps a language to a regex that captures the error line number
# from the stderr output produced by that language's compiler/runtime.
#
#   Python  : "  File \"main.py\", line 5"
#   C/C++   : "main.c:5:3: error: ..."  or  "main.cpp:5:3: error: ..."
#   Java    : "Main.java:5: error: ..."
#   JS      : "main.js:5"  (Node.js)
#
_ERROR_LINE_PATTERNS: dict = {
    "python":     re.compile(r'File\s+"[^"]*",\s+line\s+(\d+)', re.IGNORECASE),
    "c":          re.compile(r'\bmain\.c:(\d+):', re.IGNORECASE),
    "cpp":        re.compile(r'\bmain\.cpp:(\d+):', re.IGNORECASE),
    "java":       re.compile(r'\bMain\.java:(\d+):', re.IGNORECASE),
    "javascript": re.compile(r'\bmain\.js:(\d+)', re.IGNORECASE),
}


def _extract_error_line(lang_id: str, stderr: str) -> Optional[int]:
    """Return the first error line number found in *stderr* for the given
    language, or None if we can't find one."""
    pattern = _ERROR_LINE_PATTERNS.get(lang_id)
    if not pattern:
        return None
    match = pattern.search(stderr)
    if match:
        try:
            return int(match.group(1))
        except (ValueError, IndexError):
            return None
    return None


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def execute_code(
    language: str,
    source_code: str,
    stdin_data: str = "",
) -> RunResult:
    """
    Compiles (if needed) and runs source_code with the given stdin.
    Returns a RunResult with stdout/stderr/status/time/error_line.
    """
    try:
        lang_cfg: LanguageConfig = get_language(language)
    except ValueError as e:
        return RunResult(status="internal_error", stderr=str(e))

    run_id = uuid.uuid4().hex
    workdir = tempfile.mkdtemp(prefix=f"lc_{run_id}_")

    try:
        if lang_cfg.id == "java":
            source_code = _enforce_java_classname(source_code)

        source_path = os.path.join(workdir, lang_cfg.source_filename)
        with open(source_path, "w") as f:
            f.write(source_code)

        # --- Compile step (if applicable) ---
        if lang_cfg.compile_cmd:
            rc, out, err, ms, timed_out = _run_subprocess(
                lang_cfg.compile_cmd, workdir, "", lang_cfg.compile_timeout
            )
            if timed_out:
                return RunResult(status="timeout", stderr="Compilation timed out.")
            if rc != 0:
                error_line = _extract_error_line(lang_cfg.id, err)
                return RunResult(
                    status="compile_error",
                    stdout=out[:MAX_OUTPUT_CHARS],
                    stderr=err[:MAX_OUTPUT_CHARS],
                    exit_code=rc,
                    error_line=error_line,
                )

        # --- Run step ---
        # On Windows, subprocess does NOT search cwd for relative executables.
        # Resolve the executable to its absolute path inside workdir.
        run_cmd = list(lang_cfg.run_cmd)
        if not os.path.isabs(run_cmd[0]) and os.path.exists(os.path.join(workdir, run_cmd[0])):
            run_cmd[0] = os.path.join(workdir, run_cmd[0])
        rc, out, err, ms, timed_out = _run_subprocess(
            run_cmd, workdir, stdin_data, lang_cfg.run_timeout
        )
        if timed_out:
            return RunResult(
                status="timeout",
                stdout=out[:MAX_OUTPUT_CHARS],
                stderr="Time Limit Exceeded",
                time_ms=lang_cfg.run_timeout * 1000,
            )

        error_line = _extract_error_line(lang_cfg.id, err) if rc != 0 else None
        status = "success" if rc == 0 else "runtime_error"
        return RunResult(
            status=status,
            stdout=out[:MAX_OUTPUT_CHARS],
            stderr=err[:MAX_OUTPUT_CHARS],
            exit_code=rc,
            time_ms=ms,
            error_line=error_line,
        )

    except Exception as e:
        return RunResult(status="internal_error", stderr=str(e))
    finally:
        shutil.rmtree(workdir, ignore_errors=True)


def run_against_testcases(
    language: str,
    source_code: str,
    testcases: List[dict],
) -> List[RunResult]:
    """
    testcases: [{"input": "...", "expected_output": "..."}, ...]
    Runs the code once per test case (each is a fresh process/sandbox)
    and marks `passed` by comparing trimmed stdout.
    """
    results = []
    for tc in testcases:
        result = execute_code(language, source_code, stdin_data=tc.get("input", ""))
        if result.status == "success":
            expected = (tc.get("expected_output") or "").strip()
            actual = (result.stdout or "").strip()
            result.passed = (expected == actual)
        else:
            result.passed = False
        results.append(result)
    return results
