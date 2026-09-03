import os, subprocess, tempfile, shutil

GCC = r"C:\msys64\ucrt64\bin\gcc.exe"
MSYS2_BIN = r"C:\msys64\ucrt64\bin"

c_code = r"""
#include <stdio.h>
int main() {
  int a, b;
  scanf("%d %d", &a, &b);
  printf("%d\n", a + b);
  return 0;
}
"""

print(f"[1] GCC exists at path: {os.path.exists(GCC)}")

env = os.environ.copy()
env["PATH"] = MSYS2_BIN + os.pathsep + env.get("PATH", "")

workdir = tempfile.mkdtemp(prefix="gcc_debug_")
src = os.path.join(workdir, "main.c")
with open(src, "w") as f:
    f.write(c_code)

print(f"[2] Source written to: {src}")
print(f"[3] Running: {GCC} main.c -O2 -o main_exec -lm")

result = subprocess.run(
    [GCC, "main.c", "-O2", "-o", "main_exec", "-lm"],
    cwd=workdir,
    capture_output=True,
    text=True,
    env=env,
)

print(f"[4] Return code: {result.returncode}")
print(f"[5] STDOUT: '{result.stdout}'")
print(f"[6] STDERR: '{result.stderr}'")

exe = os.path.join(workdir, "main_exec.exe")
print(f"[7] Executable created: {os.path.exists(exe)}")

if os.path.exists(exe):
    run = subprocess.run(
        [exe],
        cwd=workdir,
        input="3 5",
        capture_output=True,
        text=True,
        env=env,
    )
    print(f"[8] Run return code: {run.returncode}")
    print(f"[9] Run STDOUT: '{run.stdout}'")
    print(f"[10] Run STDERR: '{run.stderr}'")

shutil.rmtree(workdir, ignore_errors=True)
print("Done.")
