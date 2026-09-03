"""
demo_test.py - exercises every language the backend supports by
POSTing real source code to POST /run and printing the results.

Run with the server already up:
    python demo_test.py
"""

import json
import sys
import urllib.request
import urllib.error

# Force UTF-8 output on Windows
sys.stdout.reconfigure(encoding="utf-8")

BASE = "http://localhost:8000"

# ── Sample programs per language ─────────────────────────────────────────────
SAMPLES = {
    "python": {
        "source_code": "a, b = map(int, input().split())\nprint(f'Hello from Python! sum={a+b}')\n",
        "stdin": "3 4",
    },
    "c": {
        "source_code": r"""
#include <stdio.h>
int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("Hello from C! sum=%d\n", a + b);
    return 0;
}
""",
        "stdin": "3 4",
    },
    "cpp": {
        "source_code": r"""
#include <bits/stdc++.h>
using namespace std;
int main() {
    int a, b; cin >> a >> b;
    cout << "Hello from C++! sum=" << (a + b) << endl;
    return 0;
}
""",
        "stdin": "3 4",
    },
    "java": {
        "source_code": r"""
import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt(), b = sc.nextInt();
        System.out.println("Hello from Java! sum=" + (a + b));
    }
}
""",
        "stdin": "3 4",
    },
    "javascript": {
        "source_code": r"""
const data = require("fs").readFileSync(0, "utf8").trim().split(" ").map(Number);
console.log(`Hello from JavaScript! sum=${data[0] + data[1]}`);
""",
        "stdin": "3 4",
    },
}

# ── Edge / guardrail cases ────────────────────────────────────────────────────
EDGE_CASES = {
    "python_infinite_loop": {
        "language": "python",
        "source_code": "while True:\n    pass\n",
        "stdin": "",
    },
    "cpp_compile_error": {
        "language": "cpp",
        "source_code": "int main() { retrun 0 }\n",
        "stdin": "",
    },
    "python_runtime_error": {
        "language": "python",
        "source_code": "print(1/0)\n",
        "stdin": "",
    },
    "python_hello_world": {
        "language": "python",
        "source_code": 'print("hello")\n',
        "stdin": "hello",
    },
}


# ── HTTP helper ───────────────────────────────────────────────────────────────
def call_run(language: str, source_code: str, stdin: str = "") -> dict:
    """
    POST /run
    Body: { "language": "python", "source_code": "...", "stdin": "..." }
    """
    payload = json.dumps({
        "language": language,
        "source_code": source_code,
        "stdin": stdin,
    }).encode()

    req = urllib.request.Request(
        f"{BASE}/run",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            return json.load(resp)
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        return {"status": f"HTTP {e.code}", "stdout": "", "stderr": body,
                "exit_code": None, "time_ms": None, "error_line": None}


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    print("=" * 70)
    print("  LeetCode Backend — multi-language /run demo")
    print("=" * 70)

    for lang, cfg in SAMPLES.items():
        r = call_run(lang, cfg["source_code"], cfg["stdin"])
        tag = "[OK] " if r.get("status") == "success" else "[ERR]"
        print(f"\n{tag} [{lang:10s}]  status={r.get('status','?'):14s}  "
              f"time={r.get('time_ms') or 0:>6} ms")
        print(f"   stdout : {r.get('stdout','').strip()!r}")
        if r.get("stderr", "").strip():
            print(f"   stderr : {r.get('stderr','').strip()!r}")
        if r.get("error_line"):
            print(f"   error_line: {r['error_line']}")

    print("\n" + "=" * 70)
    print("  Guardrail / edge-case checks")
    print("=" * 70)

    for name, cfg in EDGE_CASES.items():
        r = call_run(cfg["language"], cfg["source_code"], cfg["stdin"])
        tag = "[OK] " if r.get("status") == "success" else "[WARN]"
        print(f"\n{tag} {name}")
        print(f"   status : {r.get('status','?')}")
        print(f"   stdout : {r.get('stdout','').strip()!r}")
        if r.get("stderr", "").strip():
            print(f"   stderr : {r.get('stderr','').strip()[:200]!r}")
        if r.get("error_line"):
            print(f"   error_line: {r['error_line']}")


if __name__ == "__main__":
    main()
