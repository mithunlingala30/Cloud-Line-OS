import { useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { githubLight } from "@uiw/codemirror-theme-github";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { api } from "../api";
import "../styles/custom_pages.css";

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
  python: 'def solve():\n    # Write your program here\n    name = input()\n    print(f"Hello, {name}!")\n\nif __name__ == "__main__":\n    solve()\n',
  c: '#include <stdio.h>\n\nint main() {\n    char name[100];\n    // Read input, output hello message\n    if (scanf("%99s", name) == 1) {\n        printf("Hello, %s!\\n", name);\n    }\n    return 0;\n}\n',
  cpp: '#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string name;\n    // Read input, output hello message\n    if (cin >> name) {\n        cout << "Hello, " << name << "!" << endl;\n    }\n    return 0;\n}\n',
  java: 'import java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input, output hello message\n        if (sc.hasNext()) {\n            String name = sc.next();\n            System.out.println("Hello, " + name + "!");\n        }\n    }\n}\n',
};

export default function Playground() {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(DEFAULT_TEMPLATES.python);
  const [stdin, setStdin] = useState("World");
  const [stdout, setStdout] = useState("");
  const [stderr, setStderr] = useState("");
  const [running, setRunning] = useState(false);
  const [runStatus, setRunStatus] = useState(null); // 'success' | 'error' | null
  const [runDuration, setRunDuration] = useState(null);

  // Local storage for snippets
  const [snippets, setSnippets] = useState(() => {
    try {
      const stored = localStorage.getItem("cloudline_playground_snippets");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [newSnippetName, setNewSnippetName] = useState("");
  const [activeSnippetId, setActiveSnippetId] = useState(null);

  useEffect(() => {
    localStorage.setItem("cloudline_playground_snippets", JSON.stringify(snippets));
  }, [snippets]);

  // Sync sample input based on active language or basic placeholder
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(DEFAULT_TEMPLATES[lang]);
    setStdout("");
    setStderr("");
    setRunStatus(null);
    setRunDuration(null);
    setActiveSnippetId(null);
  };

  const handleRun = async () => {
    setRunning(true);
    setStdout("");
    setStderr("");
    setRunStatus(null);
    setRunDuration(null);

    const startTime = performance.now();
    try {
      const res = await api.runCode({
        language,
        source_code: code,
        stdin: stdin,
      });

      const endTime = performance.now();
      setRunDuration(Math.round(endTime - startTime));

      if (res.status === "success") {
        setStdout(res.stdout || "(no output)");
        setStderr(res.stderr || "");
        setRunStatus(res.stderr ? "error" : "success");
      } else {
        setStdout(res.stdout || "");
        setStderr(res.stderr || `Execution returned status: ${res.status}`);
        setRunStatus("error");
      }
    } catch (e) {
      const endTime = performance.now();
      setRunDuration(Math.round(endTime - startTime));
      setStderr(e.message || "Failed to reach the backend execution engine.");
      setRunStatus("error");
    } finally {
      setRunning(false);
    }
  };

  // Snippet Operations
  const handleSaveSnippet = (e) => {
    e.preventDefault();
    if (!newSnippetName.trim()) return;

    const newSnippet = {
      id: Date.now().toString(),
      name: newSnippetName.trim(),
      language,
      code,
      stdin,
      date: new Date().toLocaleDateString(),
    };

    setSnippets([newSnippet, ...snippets]);
    setActiveSnippetId(newSnippet.id);
    setNewSnippetName("");
  };

  const handleLoadSnippet = (snippet) => {
    setLanguage(snippet.language);
    setCode(snippet.code);
    setStdin(snippet.stdin || "");
    setStdout("");
    setStderr("");
    setRunStatus(null);
    setRunDuration(null);
    setActiveSnippetId(snippet.id);
  };

  const handleDeleteSnippet = (e, id) => {
    e.stopPropagation();
    setSnippets(snippets.filter((s) => s.id !== id));
    if (activeSnippetId === id) {
      setActiveSnippetId(null);
    }
  };

  // Upload/Download scripts
  const handleDownload = () => {
    const extensions = { python: "py", cpp: "cpp", c: "c", java: "java" };
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `playground_code.${extensions[language] || "txt"}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        setCode(content);
      }
    };
    reader.readAsText(file);
    // Clear validation event so same file can upload again
    e.target.value = "";
  };

  return (
    <div className="page">
      <div style={{ marginTop: 10, marginBottom: 20 }}>
        <h2 style={{ fontSize: "1.8rem" }}>Interactive Playground</h2>
        <p style={{ color: "var(--ink-soft)", fontSize: "0.95rem" }}>
          Write custom programs, run with arbitrary inputs, and inspect compiled output. Perfect for developer sandboxing.
        </p>
      </div>

      <div className="playground-shell">
        {/* Sidebar for snippets */}
        <aside className="panel playground-sidebar" style={{ padding: "20px" }}>
          <div className="sidebar-title">Saved Snippets</div>
          
          <form className="new-snippet-form" onSubmit={handleSaveSnippet}>
            <input
              type="text"
              placeholder="Snippet Name..."
              value={newSnippetName}
              onChange={(e) => setNewSnippetName(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary btn-sm" style={{ width: "100%" }}>
              💾 Save Workspace
            </button>
          </form>

          <div className="snippets-list">
            {snippets.length === 0 ? (
              <div style={{ padding: "20px 10px", fontSize: "0.8rem", color: "var(--ink-soft)", textAlign: "center" }}>
                No saved snippets yet. Create one above!
              </div>
            ) : (
              snippets.map((s) => (
                <div
                  key={s.id}
                  className={`snippet-item ${activeSnippetId === s.id ? "active" : ""}`}
                  onClick={() => handleLoadSnippet(s)}
                >
                  <div className="snippet-info">
                    <span className="snippet-name">{s.name}</span>
                    <span className="snippet-meta">
                      {LANG_LABELS[s.language] || s.language} · {s.date}
                    </span>
                  </div>
                  <button
                    className="btn-delete-snippet"
                    onClick={(e) => handleDeleteSnippet(e, s.id)}
                    title="Delete snippet"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Main Compiler Workspace */}
        <div className="compiler-workspace">
          <div className="panel">
            {/* Toolbar */}
            <div className="editor-toolbar playground-toolbar">
              <div className="toolbar-left">
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

                {/* File Upload Trigger */}
                <label className="btn-secondary btn-sm" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  📤 Import
                  <input
                    type="file"
                    style={{ display: "none" }}
                    accept=".py,.cpp,.c,.java,.txt"
                    onChange={handleFileUpload}
                  />
                </label>

                {/* File Download */}
                <button className="btn-secondary btn-sm" onClick={handleDownload} title="Export script file">
                  📥 Export
                </button>
              </div>

              <div className="toolbar-right">
                <button
                  className="btn-ghost btn-sm"
                  onClick={() => setCode(DEFAULT_TEMPLATES[language])}
                  style={{ marginRight: 6 }}
                >
                  Reset Template
                </button>
                <button
                  className="btn-primary btn-sm"
                  onClick={handleRun}
                  disabled={running}
                  style={{ minWidth: 98 }}
                >
                  {running ? "Compiling…" : "▶ Run Program"}
                </button>
              </div>
            </div>

            {/* CodeMirror Editor */}
            <CodeMirror
              value={code}
              height="380px"
              theme={githubLight}
              extensions={LANG_EXTENSIONS[language]}
              onChange={setCode}
            />

            {/* Split Input / Output Panels */}
            <div className="compiler-splits">
              <div className="io-layout">
                {/* Input Panel */}
                <div className="panel io-panel">
                  <div className="io-header">
                    <span>stdin / custom input</span>
                    <span style={{ fontSize: "0.78rem", color: "var(--ink-soft)" }}>Standard Input</span>
                  </div>
                  <textarea
                    className="input-area"
                    placeholder="Provide standard inputs for reader methods..."
                    value={stdin}
                    onChange={(e) => setStdin(e.target.value)}
                  />
                </div>

                {/* Output Panel */}
                <div className="panel io-panel">
                  <div className="io-header">
                    <span>stdout / output terminal</span>
                    {runStatus && (
                      <span className={`status-badge ${runStatus === "success" ? "success" : "error"}`}>
                        {runStatus === "success" ? "Success" : "Error"}
                      </span>
                    )}
                  </div>
                  <div className="output-container">
                    {running && <div style={{ color: "var(--accent)" }}>Sending execution request...</div>}
                    {!running && stderr && <div style={{ color: "#c93737" }}>{stderr}</div>}
                    {!running && stdout && <div style={{ color: "#16233d" }}>{stdout}</div>}
                    {!running && !stdout && !stderr && (
                      <div style={{ color: "var(--ink-soft)", fontStyle: "italic" }}>
                        Console is empty. Run your program to compile.
                      </div>
                    )}
                  </div>
                  {(runDuration !== null || runStatus) && (
                    <div className="output-info-row">
                      {runDuration !== null && <span>Duration: {runDuration}ms</span>}
                      {runStatus && (
                        <span>
                          Status: {runStatus === "success" ? "Exit Success ✓" : "Exit Failure ✗"}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
