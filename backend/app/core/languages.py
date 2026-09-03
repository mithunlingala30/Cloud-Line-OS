"""
Defines how each supported language is compiled and executed.

Each entry describes:
- filename: the source file name written to the sandbox dir
- compile_cmd: shell command (list form) to compile, or None if not needed
- run_cmd: shell command (list form) to run the compiled/interpreted program
- timeout: max seconds allowed for compile / run steps

{code_dir} and {classname} are substituted at runtime.
"""

import os
import sys
from dataclasses import dataclass
from typing import Optional, List

# Use the same Python interpreter that is running the server — this avoids the
# Windows App Execution Alias redirect ("python" -> Microsoft Store) that
# causes exit code 9009 in subprocesses.
_PYTHON_CMD = sys.executable

# On Windows, compiled C/C++ executables are .exe; on Unix they have no extension.
_C_EXEC   = "main_exec.exe" if os.name == "nt" else "./main_exec"
_CPP_EXEC = "main_exec.exe" if os.name == "nt" else "./main_exec"

# On Windows, resolve GCC/G++ to their absolute path in MSYS2 ucrt64.
# This ensures subprocesses find gcc/g++ regardless of the inherited PATH.
if os.name == "nt":
    _MSYS2_BIN = r"C:\msys64\ucrt64\bin"
    _GCC_CMD   = os.path.join(_MSYS2_BIN, "gcc.exe")
    _GPP_CMD   = os.path.join(_MSYS2_BIN, "g++.exe")
else:
    _GCC_CMD = "gcc"
    _GPP_CMD = "g++"


@dataclass
class LanguageConfig:
    id: str                     # e.g. "python", "cpp", "c", "java"
    display_name: str
    source_filename: str        # file the submitted code is written to
    compile_cmd: Optional[List[str]]   # None => no compile step
    run_cmd: List[str]
    compile_timeout: int = 10
    run_timeout: int = 5


# NOTE: Java requires the class to be named "Main" (LeetCode does something
# similar under the hood — it wraps user code). We enforce this in executor.py.

LANGUAGES = {
    "python": LanguageConfig(
        id="python",
        display_name="Python 3",
        source_filename="main.py",
        compile_cmd=None,
        run_cmd=[_PYTHON_CMD, "main.py"],
        run_timeout=5,
    ),
    "c": LanguageConfig(
        id="c",
        display_name="C (GCC)",
        source_filename="main.c",
        compile_cmd=[_GCC_CMD, "main.c", "-O2", "-o", "main_exec", "-lm"],
        run_cmd=[_C_EXEC],
        compile_timeout=10,
        run_timeout=5,
    ),
    "cpp": LanguageConfig(
        id="cpp",
        display_name="C++ (G++17)",
        source_filename="main.cpp",
        compile_cmd=[_GPP_CMD, "-std=c++17", "main.cpp", "-O2", "-o", "main_exec"],
        run_cmd=[_CPP_EXEC],
        compile_timeout=15,
        run_timeout=5,
    ),
    "java": LanguageConfig(
        id="java",
        display_name="Java 21",
        source_filename="Main.java",
        compile_cmd=["javac", "Main.java"],
        run_cmd=["java", "Main"],
        compile_timeout=15,
        run_timeout=7,
    ),
    "javascript": LanguageConfig(
        id="javascript",
        display_name="JavaScript (Node.js)",
        source_filename="main.js",
        compile_cmd=None,
        run_cmd=["node", "main.js"],
        run_timeout=5,
    ),
}


def get_language(lang_id: str) -> LanguageConfig:
    lang_id = lang_id.lower()
    if lang_id not in LANGUAGES:
        raise ValueError(
            f"Unsupported language '{lang_id}'. "
            f"Supported: {', '.join(LANGUAGES.keys())}"
        )
    return LANGUAGES[lang_id]
