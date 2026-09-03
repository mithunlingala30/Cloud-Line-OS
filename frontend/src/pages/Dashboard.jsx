import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { listProblems } from "../api";
import "../styles/custom_pages.css";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [problems, setProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [activeTab, setActiveTab] = useState("snippets"); // "snippets" | "submissions"
  const navigate = useNavigate();

  // Load user status
  useEffect(() => {
    return onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      setLoadingUser(false);
    });
  }, []);

  // Load problems list to synchronize analytics
  useEffect(() => {
    listProblems()
      .then((res) => {
        setProblems(res || []);
        setLoadingProblems(false);
      })
      .catch(() => {
        setLoadingProblems(false);
      });
  }, []);

  // Read solved problems from localStorage
  const solvedProblemIds = useMemo(() => {
    try {
      const stored = localStorage.getItem("cloudline_solved_problems");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  // Read saved snippets from localStorage
  const snippets = useMemo(() => {
    try {
      const stored = localStorage.getItem("cloudline_playground_snippets");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  // Read submission history from localStorage
  const submissions = useMemo(() => {
    try {
      const stored = localStorage.getItem("cloudline_submissions");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  // Compute breakdown stats
  const analytics = useMemo(() => {
    const totalProblems = problems.length;
    const totalSolved = solvedProblemIds.length;

    let solvedEasy = 0;
    let solvedMedium = 0;
    let solvedHard = 0;

    let totalEasy = 0;
    let totalMedium = 0;
    let totalHard = 0;

    problems.forEach((p) => {
      if (p.difficulty === "Easy") totalEasy++;
      if (p.difficulty === "Medium") totalMedium++;
      if (p.difficulty === "Hard") totalHard++;

      if (solvedProblemIds.includes(p.id)) {
        if (p.difficulty === "Easy") solvedEasy++;
        if (p.difficulty === "Medium") solvedMedium++;
        if (p.difficulty === "Hard") solvedHard++;
      }
    });

    return {
      totalProblems,
      totalSolved,
      solvedEasy,
      solvedMedium,
      solvedHard,
      totalEasy: totalEasy || 1, // avoid division by zero
      totalMedium: totalMedium || 1,
      totalHard: totalHard || 1,
    };
  }, [problems, solvedProblemIds]);

  const solvedPercentage = useMemo(() => {
    if (analytics.totalProblems === 0) return 0;
    return Math.round((analytics.totalSolved / analytics.totalProblems) * 100);
  }, [analytics]);

  // Compute circular progress properties
  const radius = 50;
  const strokeDashoffset = useMemo(() => {
    const circumference = 2 * Math.PI * radius; // ~314.16
    return circumference - (solvedPercentage / 100) * circumference;
  }, [solvedPercentage]);

  if (loadingUser) {
    return (
      <div className="page" style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}>
        <div className="state-msg">Loading dashboard context...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ marginTop: 10, marginBottom: 20 }}>
        <h2>Developer Dashboard</h2>
        <p style={{ color: "var(--ink-soft)", fontSize: "0.95rem" }}>
          Track challenge accomplishments, review saved program scripts, and explore execution history metrics.
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Profile Card & Progress Analytics */}
        <aside className="panel profile-card">
          <div className="profile-avatar">
            {user?.email ? user.email.charAt(0).toUpperCase() : "?"}
          </div>
          <div className="profile-details">
            <span className="profile-email">{user?.email || "Guest Coder"}</span>
            <span className="profile-joined">
              {user ? `Account: Verified Developer` : "Local Sync / Guest Session"}
            </span>
          </div>

          <div className="profile-divider"></div>

          {/* Core circular progress */}
          <div className="stats-visual-container">
            <h4 style={{ fontSize: "0.9rem", color: "var(--ink-soft)" }}>Core Progress</h4>
            <div className="progress-circle-wrap">
              <svg className="progress-circle-svg">
                <circle
                  className="progress-circle-bg"
                  cx="60"
                  cy="60"
                  r={radius}
                />
                <circle
                  className="progress-circle-bar"
                  cx="60"
                  cy="60"
                  r={radius}
                  style={{
                    strokeDashoffset: strokeDashoffset,
                  }}
                />
              </svg>
              <div className="progress-circle-text">
                <span className="progress-count">{solvedPercentage}%</span>
                <span className="progress-label">Solved</span>
              </div>
            </div>
            <span style={{ fontSize: "0.78rem", fontWeight: 650, color: "var(--ink)" }}>
              {analytics.totalSolved} / {analytics.totalProblems} Challenges Completed
            </span>
          </div>
        </aside>

        {/* Tabbed Activity / Saved code sections */}
        <main className="dashboard-content">
          {/* Top Quick Stats Grid */}
          <div className="stats-summary-grid">
            <div className="panel stat-box easy">
              <b>{analytics.solvedEasy}<span style={{ fontSize: "0.9rem", color: "var(--ink-soft)" }}>/{analytics.totalEasy}</span></b>
              <span>☀️ Easy Solved</span>
            </div>
            <div className="panel stat-box medium">
              <b>{analytics.solvedMedium}<span style={{ fontSize: "0.9rem", color: "var(--ink-soft)" }}>/{analytics.totalMedium}</span></b>
              <span>⛅ Medium Solved</span>
            </div>
            <div className="panel stat-box hard">
              <b>{analytics.solvedHard}<span style={{ fontSize: "0.9rem", color: "var(--ink-soft)" }}>/{analytics.totalHard}</span></b>
              <span>⛈️ Hard Solved</span>
            </div>
          </div>

          {/* Activity / Snippets Panel */}
          <div className="panel activity-card" style={{ minHeight: "360px", padding: 24 }}>
            <div className="dashboard-tabs">
              <button
                className={`dashboard-tab ${activeTab === "snippets" ? "active" : ""}`}
                onClick={() => setActiveTab("snippets")}
              >
                Saved Playground Scripts ({snippets.length})
              </button>
              <button
                className={`dashboard-tab ${activeTab === "submissions" ? "active" : ""}`}
                onClick={() => setActiveTab("submissions")}
              >
                Submission History ({submissions.length})
              </button>
            </div>

            {/* Snippets Tab list */}
            {activeTab === "snippets" && (
              <div className="history-list">
                {snippets.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "var(--ink-soft)", fontSize: "0.9rem" }}>
                    No snippets saved yet. Head to the{" "}
                    <Link to="/playground" style={{ color: "var(--accent)", fontWeight: 700 }}>
                      Playground
                    </Link>{" "}
                    to compile and save some code!
                  </div>
                ) : (
                  snippets.map((s) => (
                    <div key={s.id} className="history-item">
                      <div className="history-item-left">
                        <span className="history-item-title">{s.name}</span>
                        <div className="history-item-meta">
                          <span className="tech-icon" style={{ padding: "2px 6px", fontSize: "0.7rem", borderRadius: 4 }}>
                            {s.language.toUpperCase()}
                          </span>
                          <span>Saved: {s.date}</span>
                        </div>
                      </div>
                      <Link to="/playground" className="btn-secondary btn-sm">
                        Load in Playground
                      </Link>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Submissions Tab list */}
            {activeTab === "submissions" && (
              <div className="history-list">
                {submissions.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "var(--ink-soft)", fontSize: "0.9rem" }}>
                    No challenge attempts yet. Start solving problems details from our{" "}
                    <Link to="/problems" style={{ color: "var(--accent)", fontWeight: 700 }}>
                      Challenges directory
                    </Link>
                    !
                  </div>
                ) : (
                  submissions.map((sub, i) => (
                    <div key={i} className="history-item">
                      <div className="history-item-left">
                        <span className="history-item-title">{sub.problemTitle}</span>
                        <div className="history-item-meta">
                          <span className="tech-icon" style={{ padding: "2px 6px", fontSize: "0.7rem", borderRadius: 4 }}>
                            {sub.language.toUpperCase()}
                          </span>
                          <span>Timestamp: {sub.date}</span>
                        </div>
                      </div>
                      <div 
                        className="history-verdict" 
                        style={{
                          background: sub.verdict === "Accepted" ? "var(--success-tint)" : "var(--thunder-tint)",
                          color: sub.verdict === "Accepted" ? "#1f8a67" : "#c93737"
                        }}
                      >
                        {sub.verdict}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
