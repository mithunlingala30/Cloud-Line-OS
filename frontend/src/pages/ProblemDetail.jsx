import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import CodeMirror from "@uiw/react-codemirror";
import { githubLight } from "@uiw/codemirror-theme-github";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { api, getProblem } from "../api";
import DifficultyBadge from "../components/DifficultyBadge";

const LANG_EXTENSIONS = {
  python: [python()],
  cpp: [cpp()],
  c: [cpp()],
  java: [java()],
};

const LANG_LABELS = {
  python: "Python 3",
  cpp: "C++",
  c: "C",
  java: "Java",
};

const DEFAULT_TEMPLATES = {
  python: "# Write your solution below.\n# Read input with input(), print your answer.\n\n",
  c: '#include <stdio.h>\n\nint main() {\n    // Write your solution below\n\n    return 0;\n}\n',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n\n    return 0;\n}\n',
  java: 'import java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n\n    }\n}\n',
};

const VERDICT_CLASS = {
  Accepted: "verdict-Accepted",
  "Wrong Answer": "verdict-Wrong",
  "Compile Error": "verdict-Compile",
  "Time Limit Exceeded": "verdict-Time",
  "Runtime Error": "verdict-Runtime",
};

export default function ProblemDetail() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(DEFAULT_TEMPLATES.python);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  useEffect(() => {
    getProblem(id)
      .then((p) => {
        setProblem(p);
        const starter = p.starter_code?.[language];
        setCode(starter || DEFAULT_TEMPLATES[language]);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  function handleLanguageChange(newLang) {
    setLanguage(newLang);
    const starter = problem?.starter_code?.[newLang];
    setCode(starter || DEFAULT_TEMPLATES[newLang]);
    setRunResult(null);
    setSubmitResult(null);
  }

  async function handleRun() {
    setRunning(true);
    setSubmitResult(null);
    const sampleInput = problem?.testcases?.[0]?.input || "";
    try {
      const res = await api.runCode({
        language,
        source_code: code,
        stdin: sampleInput,
      });
      setRunResult(res);
    } catch (e) {
      setRunResult({ status: "internal_error", stderr: e.message, stdout: "" });
    } finally {
      setRunning(false);
    }
  }

  async function handleSubmit() {
    setRunning(true);
    setRunResult(null);
    try {
      const res = await api.submitCode({
        problem_id: id,
        language,
        source_code: code,
        user_id: user?.uid || null,
      });
      setSubmitResult(res);

      if (res && res.verdict) {
        // Track attempt in submission logs
        try {
          const subs = localStorage.getItem("cloudline_submissions");
          const subsArray = subs ? JSON.parse(subs) : [];
          subsArray.unshift({
            problemId: id,
            problemTitle: problem?.title || "Problem Challenge",
            language,
            verdict: res.verdict,
            date: new Date().toLocaleString(),
          });
          localStorage.setItem("cloudline_submissions", JSON.stringify(subsArray.slice(0, 50)));
        } catch (e) {
          console.error(e);
        }

        // If solved successfully, track problem ID
        if (res.verdict === "Accepted") {
          try {
            const solved = localStorage.getItem("cloudline_solved_problems");
            const solvedArray = solved ? JSON.parse(solved) : [];
            if (!solvedArray.includes(id)) {
              solvedArray.push(id);
              localStorage.setItem("cloudline_solved_problems", JSON.stringify(solvedArray));
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    } catch (e) {
      setSubmitResult(null);
      setRunResult({ status: "internal_error", stderr: e.message, stdout: "" });
    } finally {
      setRunning(false);
    }
  }

  if (error) {
    return (
      <div className="page">
        <div className="state-msg">Couldn't load this problem ({error}).</div>
      </div>
    );
  }
  if (!problem) {
    return (
      <div className="page">
        <div className="state-msg">Loading problem…</div>
      </div>
    );
  }

  const verdictClass = submitResult ? VERDICT_CLASS[submitResult.verdict] : "";

  return (
    <div className="page">
      <Link to="/problems" className="btn-ghost" style={{ marginTop: 8 }}>
        ← Back to problems
      </Link>

      <div className="detail-shell">
        <div className="panel panel-desc">
          <h2>{problem.title}</h2>
          <div className="panel-desc-meta">
            <DifficultyBadge difficulty={problem.difficulty} />
            {(problem.tags || []).map((t) => (
              <span key={t} className="tag-pill">
                {t}
              </span>
            ))}
          </div>
          <div className="panel-desc-body">{problem.description}</div>

          {problem.testcases?.[0] && (
            <div style={{ marginTop: 22 }}>
              <h4 style={{ fontSize: "0.95rem", marginBottom: 8 }}>Example</h4>
              <div className="testcase-row">
                <div>
                  <strong>Input</strong>
                  <div className="testcase-io">{problem.testcases[0].input}</div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <strong>Output</strong>
                  <div className="testcase-io">
                    {problem.testcases[0].expected_output}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="panel">
          <div className="editor-toolbar">
            <select
              className="lang-select"
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
            >
              {Object.keys(LANG_LABELS).map((l) => (
                <option key={l} value={l}>
                  {LANG_LABELS[l]}
                </option>
              ))}
            </select>
            <div className="editor-actions">
              <button className="btn-secondary btn-sm" onClick={handleRun} disabled={running}>
                {running ? "Running…" : "Run"}
              </button>
              <button className="btn-primary btn-sm" onClick={handleSubmit} disabled={running}>
                {running ? "Judging…" : "Submit"}
              </button>
            </div>
          </div>

          <CodeMirror
            value={code}
            height="420px"
            theme={githubLight}
            extensions={LANG_EXTENSIONS[language]}
            onChange={setCode}
          />

          {(runResult || submitResult) && (
            <div className="results-panel">
              {submitResult && (
                <>
                  <div className={`verdict-banner ${verdictClass}`}>
                    {submitResult.verdict}
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)" }}>
                    Passed {submitResult.passed_testcases}/
                    {submitResult.total_testcases} test cases
                    {submitResult.runtime_ms != null &&
                      ` · ${submitResult.runtime_ms}ms`}
                  </p>
                  {submitResult.results.map((r, i) => (
                    <div
                      key={i}
                      className={`testcase-row ${r.passed ? "pass" : "fail"}`}
                    >
                      <strong>
                        Test {i + 1}: {r.passed ? "Passed ✓" : "Failed ✗"}
                      </strong>
                      {!r.passed && (
                        <>
                          <div className="testcase-io">Input: {r.input}</div>
                          <div className="testcase-io">
                            Expected: {r.expected_output}
                          </div>
                          <div className="testcase-io">
                            Got: {r.actual_output || "(no output)"}
                          </div>
                          {r.stderr && (
                            <div className="testcase-io">Error: {r.stderr}</div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </>
              )}

              {!submitResult && runResult && (
                <>
                  <div
                    className={`verdict-banner ${
                      runResult.status === "success"
                        ? "verdict-Accepted"
                        : "verdict-Runtime"
                    }`}
                  >
                    {runResult.status === "success"
                      ? "Ran successfully"
                      : runResult.status.replace("_", " ")}
                  </div>
                  <div className="testcase-row">
                    <strong>Output</strong>
                    <div className="testcase-io">
                      {runResult.stdout || "(no output)"}
                    </div>
                    {runResult.stderr && (
                      <>
                        <strong>Error</strong>
                        <div className="testcase-io">{runResult.stderr}</div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
