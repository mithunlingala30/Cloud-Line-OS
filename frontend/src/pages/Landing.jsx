import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import "../styles/custom_pages.css";

const MOCK_CODES = {
  python: `# Fibonacci Sequence in Python 3
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Print first 6 numbers
print([fibonacci(i) for i in range(6)])`,
  cpp: `// Hello World in C++
#include <iostream>
using namespace std;

int main() {
    cout << "Welcome to Cloudline!" << endl;
    cout << "Compiler is online and ready." << endl;
    return 0;
}`,
  javascript: `// Sum of digits in JavaScript
function sumDigits(n) {
    return String(n)
        .split('')
        .reduce((sum, d) => sum + parseInt(d), 0);
}

console.log("Sum:", sumDigits(4827));`
};

const MOCK_OUTPUTS = {
  python: "[0, 1, 1, 2, 3, 5]\n\nExecution time: 4ms\nStatus: Success ✓",
  cpp: "Welcome to Cloudline!\nCompiler is online and ready.\n\nExecution time: 8ms\nStatus: Success ✓",
  javascript: "Sum: 21\n\nExecution time: 2ms\nStatus: Success ✓"
};

export default function Landing() {
  const [user, setUser] = useState(null);
  const [selectedLang, setSelectedLang] = useState("python");
  const [mockConsole, setMockConsole] = useState("Press 'Run Code' to execute the script.");
  const [isRunning, setIsRunning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  const handleRunMock = () => {
    if (isRunning) return;
    setIsRunning(true);
    setMockConsole("Compiling and launching container...");
    
    setTimeout(() => {
      setMockConsole("Running code inside isolated sandbox...\n\n");
      setTimeout(() => {
        setMockConsole(MOCK_OUTPUTS[selectedLang]);
        setIsRunning(false);
      }, 900);
    }, 600);
  };

  const handleLangChange = (lang) => {
    setSelectedLang(lang);
    setMockConsole("Press 'Run Code' to execute the script.");
    setIsRunning(false);
  };

  const handleGetStarted = () => {
    if (user) {
      navigate("/problems");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="page landing-container">
      {/* Hero section */}
      <header className="landing-hero">
        <div className="hero-left">
          <div className="hero-tagline">
            <span style={{ marginRight: 4 }}>⚡</span> Next-Gen Code Compiler
          </div>
          <h1 className="hero-title">
            Solve problems. <br />
            <span className="text-gradient">Practice code.</span> <br />
            Without blockages.
          </h1>
          <p className="hero-subtitle">
            Cloudline is a modern, light-filled platform where you can solve programming challenges or compile and execute source code interactively in our lightweight, isolated execution sandbox.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={handleGetStarted}>
              Get Started
            </button>
            <Link to="/playground" className="btn-secondary">
              Open Playground
            </Link>
          </div>
          <div className="tech-badges">
            <span>Powered by secure interpreters for:</span>
            <span className="tech-icon">Python 3</span>
            <span className="tech-icon">C++ 20</span>
            <span className="tech-icon">C</span>
            <span className="tech-icon">Java</span>
          </div>
        </div>

        <div className="hero-right">
          {/* Interactive Mock Editor Card */}
          <div className="mock-editor-frame">
            <div className="mock-editor-header">
              <div className="mock-dots">
                <span className="mock-dot red"></span>
                <span className="mock-dot yellow"></span>
                <span className="mock-dot green"></span>
              </div>
              <div className="mock-title">sandbox_engine.sh</div>
              <div className="mock-lang">
                <select 
                  style={{
                    background: "transparent",
                    color: "#fff",
                    border: "none",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.75rem",
                    outline: "none",
                    cursor: "pointer"
                  }}
                  value={selectedLang}
                  onChange={(e) => handleLangChange(e.target.value)}
                >
                  <option value="python" style={{ background: "#1e1e2e" }}>Python 3</option>
                  <option value="cpp" style={{ background: "#1e1e2e" }}>C++</option>
                  <option value="javascript" style={{ background: "#1e1e2e" }}>JavaScript</option>
                </select>
              </div>
            </div>
            
            <div className="mock-editor-body">
              <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                {selectedLang === "python" && (
                  <>
                    <span className="mock-comment"># Fibonacci Sequence in Python 3</span>{"\n"}
                    <span className="mock-keyword">def</span> <span className="mock-function">fibonacci</span>(n):{"\n"}
                    {"    "}<span className="mock-keyword">if</span> n &lt;= <span className="mock-number">1</span>:{"\n"}
                    {"        "}<span className="mock-keyword">return</span> n{"\n"}
                    {"    "}<span className="mock-keyword">return</span> fibonacci(n-<span className="mock-number">1</span>) + fibonacci(n-<span className="mock-number">2</span>){"\n\n"}
                    <span className="mock-comment"># Print first 6 numbers</span>{"\n"}
                    <span className="mock-function">print</span>([fibonacci(i) <span className="mock-keyword">for</span> i <span className="mock-keyword">in</span> <span className="mock-function">range</span>(<span className="mock-number">6</span>)])
                  </>
                )}
                {selectedLang === "cpp" && (
                  <>
                    <span className="mock-comment">// Hello World in C++</span>{"\n"}
                    <span className="mock-keyword">#include</span> <span className="mock-string">&lt;iostream&gt;</span>{"\n"}
                    <span className="mock-keyword">using namespace</span> std;{"\n\n"}
                    <span className="mock-keyword">int</span> <span className="mock-function">main</span>() {"{"}{"\n"}
                    {"    "}cout &lt;&lt; <span className="mock-string">"Welcome to Cloudline!"</span> &lt;&lt; endl;{"\n"}
                    {"    "}cout &lt;&lt; <span className="mock-string">"Compiler is online and ready."</span> &lt;&lt; endl;{"\n"}
                    {"    "}<span className="mock-keyword">return</span> <span className="mock-number">0</span>;{"\n"}
                    {"}"}
                  </>
                )}
                {selectedLang === "javascript" && (
                  <>
                    <span className="mock-comment">// Sum of digits in JavaScript</span>{"\n"}
                    <span className="mock-keyword">function</span> <span className="mock-function">sumDigits</span>(n) {"{"}{"\n"}
                    {"    "}<span className="mock-keyword">return</span> <span className="mock-function">String</span>(n){"\n"}
                    {"        "}.split(<span className="mock-string">''</span>){"\n"}
                    {"        "}.reduce((sum, d) =&gt; sum + <span className="mock-function">parseInt</span>(d), <span className="mock-number">0</span>);{"\n"}
                    {"}"}{"\n\n"}
                    console.log(<span className="mock-string">"Sum:"</span>, sumDigits(<span className="mock-number">4827</span>));
                  </>
                )}
              </pre>
            </div>

            <div 
              style={{ 
                background: "#0c0c12", 
                padding: "12px 20px", 
                minHeight: "80px", 
                fontFamily: "var(--font-mono)", 
                fontSize: "0.8rem", 
                color: isRunning ? "#f1fa8c" : "#a6e3a1",
                borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                whiteSpace: "pre-wrap"
              }}
            >
              {mockConsole}
            </div>

            <div className="mock-editor-footer">
              <span style={{ fontSize: "0.75rem", color: "#6c7086" }}>
                stdout console
              </span>
              <button 
                className="mock-run-btn" 
                onClick={handleRunMock}
                disabled={isRunning}
              >
                <span>{isRunning ? "Running..." : "Run Code"}</span>
                <span>▶</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section>
        <div className="landing-section-title">
          <h2>Everything you need to level up.</h2>
          <p>A simple, polished stack designed to make practicing code frictionless.</p>
        </div>
        
        <div className="features-grid">
          <div className="glass-card feature-card">
            <div className="feature-icon-wrapper">
              <span>🧩</span>
            </div>
            <h3>Curated Challenges</h3>
            <p>
              Tackling problems split across Easy, Medium, and Hard. From array manipulations to complex data structures, solve them directly in-browser.
            </p>
          </div>

          <div className="glass-card feature-card">
            <div className="feature-icon-wrapper">
              <span>⚡</span>
            </div>
            <h3>Independent Compiler</h3>
            <p>
              Need a clear workspace to write programs, try code snippets, or run test input files? Use our standalone compiler editor anytime.
            </p>
          </div>

          <div className="glass-card feature-card">
            <div className="feature-icon-wrapper">
              <span>🛡️</span>
            </div>
            <h3>Safe Code Sandboxing</h3>
            <p>
              Your code execution runs inside isolated runtime environments to ensure performance, standard boundaries, and correct output capturing.
            </p>
          </div>

          <div className="glass-card feature-card">
            <div className="feature-icon-wrapper">
              <span>📊</span>
            </div>
            <h3>Developer Metrics</h3>
            <p>
              Monitor your solved problems list, and manage saved editor templates. Keep all your favorite scripts within arms reach.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="landing-stats-section">
        <div className="stat-item">
          <span className="stat-number">50+</span>
          <span className="stat-label">Practice Challenges</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">&lt; 1s</span>
          <span className="stat-label">Execution Latency</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">100%</span>
          <span className="stat-label">Isolated Execution</span>
        </div>
      </section>

      {/* Call to Action callout */}
      <section className="cta-banner">
        <h2>Ready to cloudline your coding?</h2>
        <p>
          Create an account to track your challenge history and keep your playground snippets synced. Or dive straight into practice mode.
        </p>
        <div style={{ display: "flex", gap: 14 }}>
          <button className="btn-secondary" onClick={handleGetStarted}>
            {user ? "Go to Problems" : "Sign in / Register"}
          </button>
          <Link to="/playground" className="btn-primary" style={{ background: "rgba(255, 255, 255, 0.15)", border: "1px solid rgba(255, 255, 255, 0.3)" }}>
            Try Playground
          </Link>
        </div>
      </section>
    </div>
  );
}
