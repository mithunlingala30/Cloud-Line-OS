import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { listProblems } from "../api";
import DifficultyBadge from "../components/DifficultyBadge";
import "../styles/custom_pages.css";

const AVATAR_PRESETS = ["⚡", "🚀", "💻", "☁️", "🧠", "🎯", "🔥", "🏆", "🐱", "☕"];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [problems, setProblems] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("solved"); // "solved" | "submissions" | "snippets" | "badges"

  // Profile custom state stored in localStorage
  const [profileData, setProfileData] = useState(() => {
    try {
      const stored = localStorage.getItem("cloudline_user_profile");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return {
      displayName: "",
      handle: "",
      role: "Algorithm Specialist",
      bio: "Solving algorithmic puzzles, building distributed systems, and mastering data structures on Cloudline.",
      location: "San Francisco, CA",
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      targetGoal: "Master 50 Core DSA Challenges",
      avatarEmoji: "⚡",
    };
  });

  // Load user auth state
  useEffect(() => {
    return onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      setLoadingUser(false);
    });
  }, []);

  // Load problems list
  useEffect(() => {
    listProblems()
      .then((res) => setProblems(res || []))
      .catch(() => setProblems([]));
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

  // Compute analytics & breakdown
  const stats = useMemo(() => {
    const totalProblems = problems.length;
    const totalSolved = solvedProblemIds.length;

    let easySolved = 0;
    let medSolved = 0;
    let hardSolved = 0;

    let easyTotal = 0;
    let medTotal = 0;
    let hardTotal = 0;

    const topicMap = {};

    problems.forEach((p) => {
      if (p.difficulty === "Easy") easyTotal++;
      if (p.difficulty === "Medium") medTotal++;
      if (p.difficulty === "Hard") hardTotal++;

      const isSolved = solvedProblemIds.includes(p.id);
      if (isSolved) {
        if (p.difficulty === "Easy") easySolved++;
        if (p.difficulty === "Medium") medSolved++;
        if (p.difficulty === "Hard") hardSolved++;
      }

      if (Array.isArray(p.tags)) {
        p.tags.forEach((tag) => {
          if (!topicMap[tag]) topicMap[tag] = { total: 0, solved: 0 };
          topicMap[tag].total += 1;
          if (isSolved) topicMap[tag].solved += 1;
        });
      }
    });

    const acceptedSubmissions = submissions.filter((s) => s.verdict === "Accepted").length;
    const totalSubmissions = submissions.length;
    const acceptanceRate =
      totalSubmissions > 0
        ? Math.round((acceptedSubmissions / totalSubmissions) * 100)
        : totalSolved > 0
        ? 85
        : 0;

    // XP calculation: 100 per Easy, 250 per Medium, 500 per Hard + 20 per submission
    const totalXP = easySolved * 100 + medSolved * 250 + hardSolved * 500 + totalSubmissions * 20;

    let tier = "Novice Explorer";
    if (totalXP >= 1500) tier = "Diamond Grandmaster 💎";
    else if (totalXP >= 800) tier = "Gold Architect 🏆";
    else if (totalXP >= 300) tier = "Silver Specialist ⚡";
    else if (totalXP > 0) tier = "Bronze Coder 🌟";

    return {
      totalProblems,
      totalSolved,
      easySolved,
      medSolved,
      hardSolved,
      easyTotal: easyTotal || 1,
      medTotal: medTotal || 1,
      hardTotal: hardTotal || 1,
      acceptanceRate,
      totalXP,
      tier,
      topicList: Object.entries(topicMap).sort((a, b) => b[1].total - a[1].total),
    };
  }, [problems, solvedProblemIds, submissions]);

  // Solved percentage & Circular SVG
  const solvedPercent =
    stats.totalProblems > 0 ? Math.round((stats.totalSolved / stats.totalProblems) * 100) : 0;
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (solvedPercent / 100) * circumference;

  // Generate heatmap days (last 60 days)
  const heatmapCells = useMemo(() => {
    const cells = [];
    const today = new Date();
    // Map dates to submission activity
    const activityMap = {};
    submissions.forEach((s) => {
      try {
        const d = new Date(s.date).toDateString();
        activityMap[d] = (activityMap[d] || 0) + 1;
      } catch {}
    });

    for (let i = 59; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateKey = d.toDateString();
      const count = activityMap[dateKey] || 0;
      let level = 0;
      if (count >= 5) level = 4;
      else if (count >= 3) level = 3;
      else if (count >= 2) level = 2;
      else if (count >= 1) level = 1;
      cells.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        count,
        level,
      });
    }
    return cells;
  }, [submissions]);

  // Achievements definition
  const achievements = useMemo(() => {
    const list = [
      {
        id: "first_blood",
        title: "First Step",
        desc: "Solve your very first challenge on Cloudline",
        icon: "🏁",
        unlocked: stats.totalSolved >= 1,
      },
      {
        id: "easy_master",
        title: "Sunshine Coder",
        desc: "Solve 3 or more Easy problems",
        icon: "☀️",
        unlocked: stats.easySolved >= 3,
      },
      {
        id: "medium_master",
        title: "Ascent Climber",
        desc: "Solve 2 or more Medium challenges",
        icon: "⛅",
        unlocked: stats.medSolved >= 2,
      },
      {
        id: "hard_tamer",
        title: "Storm Breaker",
        desc: "Conquer at least 1 Hard level problem",
        icon: "⛈️",
        unlocked: stats.hardSolved >= 1,
      },
      {
        id: "streak_master",
        title: "Streak Runner",
        desc: "Submit 5 total solution judgments",
        icon: "🔥",
        unlocked: submissions.length >= 5,
      },
      {
        id: "polyglot",
        title: "Language Polyglot",
        desc: "Execute code in multiple programming languages",
        icon: "🌐",
        unlocked: new Set(submissions.map((s) => s.language)).size >= 2,
      },
    ];
    return list;
  }, [stats, submissions]);

  // Form state for profile modal
  const [formData, setFormData] = useState(profileData);

  function handleSaveProfile(e) {
    e.preventDefault();
    setProfileData(formData);
    try {
      localStorage.setItem("cloudline_user_profile", JSON.stringify(formData));
    } catch (err) {
      console.error(err);
    }
    setIsEditModalOpen(false);
  }

  // Display values
  const displayName =
    profileData.displayName || (user?.email ? user.email.split("@")[0] : "Cloud Developer");
  const handle = profileData.handle || (user?.email ? `@${user.email.split("@")[0]}` : "@guest_coder");

  if (loadingUser) {
    return (
      <div className="page" style={{ textAlign: "center", padding: "100px 0" }}>
        <div className="state-msg">Loading profile details...</div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Profile Header & Identity Banner */}
      <section className="profile-hero-banner">
        <div className="profile-hero-content">
          <div className="profile-main-identity">
            <div className="profile-avatar-large">
              <span>{profileData.avatarEmoji || "⚡"}</span>
              <span className="profile-level-badge">{stats.totalXP} XP</span>
            </div>

            <div className="profile-info-block">
              <h1>
                {displayName}
                <span className="profile-badge-pill">{stats.tier}</span>
              </h1>
              <div className="profile-handle">{handle}</div>
              <div className="profile-bio">{profileData.bio}</div>

              <div className="profile-meta-tags">
                <span className="profile-meta-item">📍 {profileData.location || "Earth"}</span>
                <span className="profile-meta-item">
                  🎯 Target: <b>{profileData.targetGoal || "50 Challenges"}</b>
                </span>
                {profileData.github && (
                  <span className="profile-meta-item">
                    💻 <a href={profileData.github} target="_blank" rel="noreferrer">GitHub</a>
                  </span>
                )}
                {profileData.linkedin && (
                  <span className="profile-meta-item">
                    🔗 <a href={profileData.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
            <button className="btn-secondary btn-sm" onClick={() => {
              setFormData(profileData);
              setIsEditModalOpen(true);
            }}>
              ✏️ Edit Profile
            </button>
            {user ? (
              <button
                className="btn-ghost btn-sm"
                style={{ fontSize: "0.8rem", color: "var(--thunder)" }}
                onClick={() => signOut(auth)}
              >
                Sign Out ({user.email})
              </button>
            ) : (
              <Link to="/login" className="btn-primary btn-sm">
                Sign In to Sync
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Metrics Row */}
      <div className="profile-stats-row">
        <div className="metric-card">
          <div className="metric-icon-box blue">🏆</div>
          <div className="metric-info">
            <span>Total Solved</span>
            <b>{stats.totalSolved} / {stats.totalProblems}</b>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box gold">⚡</div>
          <div className="metric-info">
            <span>Cloudline XP</span>
            <b>{stats.totalXP} pts</b>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box green">🎯</div>
          <div className="metric-info">
            <span>Acceptance Rate</span>
            <b>{stats.acceptanceRate}%</b>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box purple">🔥</div>
          <div className="metric-info">
            <span>Current Streak</span>
            <b>{submissions.length > 0 ? "Active 🔥" : "Ready"}</b>
          </div>
        </div>
      </div>

      {/* Main Grid: Progress Visuals & Activity Center */}
      <div className="dashboard-grid">
        {/* Left Side: Circular Analytics & Topic Mastery */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Circular Progress & Difficulty Breakdown */}
          <div className="panel" style={{ padding: 24 }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: 16 }}>Progress Summary</h3>
            <div className="stats-visual-container">
              <div className="progress-circle-wrap">
                <svg className="progress-circle-svg">
                  <circle className="progress-circle-bg" cx="60" cy="60" r={radius} />
                  <circle
                    className="progress-circle-bar"
                    cx="60"
                    cy="60"
                    r={radius}
                    style={{ strokeDashoffset }}
                  />
                </svg>
                <div className="progress-circle-text">
                  <span className="progress-count">{solvedPercent}%</span>
                  <span className="progress-label">Solved</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
              <div className="skill-row">
                <div className="skill-row-meta">
                  <span style={{ color: "var(--success)" }}>☀️ Easy</span>
                  <span>{stats.easySolved} / {stats.easyTotal}</span>
                </div>
                <div className="skill-bar-track">
                  <div
                    className="skill-bar-fill"
                    style={{
                      width: `${Math.round((stats.easySolved / stats.easyTotal) * 100)}%`,
                      background: "var(--success)",
                    }}
                  />
                </div>
              </div>

              <div className="skill-row">
                <div className="skill-row-meta">
                  <span style={{ color: "var(--sun)" }}>⛅ Medium</span>
                  <span>{stats.medSolved} / {stats.medTotal}</span>
                </div>
                <div className="skill-bar-track">
                  <div
                    className="skill-bar-fill"
                    style={{
                      width: `${Math.round((stats.medSolved / stats.medTotal) * 100)}%`,
                      background: "var(--sun)",
                    }}
                  />
                </div>
              </div>

              <div className="skill-row">
                <div className="skill-row-meta">
                  <span style={{ color: "var(--thunder)" }}>⛈️ Hard</span>
                  <span>{stats.hardSolved} / {stats.hardTotal}</span>
                </div>
                <div className="skill-bar-track">
                  <div
                    className="skill-bar-fill"
                    style={{
                      width: `${Math.round((stats.hardSolved / stats.hardTotal) * 100)}%`,
                      background: "var(--thunder)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Topic / Category Mastery */}
          <div className="panel" style={{ padding: 24 }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: 14 }}>Topic Mastery</h3>
            <div className="skills-progress-list">
              {stats.topicList.slice(0, 6).map(([tag, data]) => {
                const percent = Math.round((data.solved / data.total) * 100);
                return (
                  <div key={tag} className="skill-row">
                    <div className="skill-row-meta">
                      <span style={{ textTransform: "capitalize" }}>#{tag}</span>
                      <span style={{ color: "var(--ink-soft)" }}>
                        {data.solved}/{data.total} ({percent}%)
                      </span>
                    </div>
                    <div className="skill-bar-track">
                      <div className="skill-bar-fill" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right Side: Heatmap, Tabs (Solved, Submissions, Snippets, Badges) */}
        <main className="dashboard-content">
          {/* Submission Activity Heatmap */}
          <div className="heatmap-card">
            <div className="heatmap-header">
              <span className="heatmap-title">Submission Activity (Last 60 Days)</span>
              <div className="heatmap-legend">
                <span>Less</span>
                <div className="heatmap-cell" />
                <div className="heatmap-cell level-1" />
                <div className="heatmap-cell level-2" />
                <div className="heatmap-cell level-3" />
                <div className="heatmap-cell level-4" />
                <span>More</span>
              </div>
            </div>

            <div className="heatmap-grid">
              {heatmapCells.map((cell, idx) => (
                <div
                  key={idx}
                  className={`heatmap-cell ${cell.level > 0 ? `level-${cell.level}` : ""}`}
                  title={`${cell.date}: ${cell.count} submissions`}
                />
              ))}
            </div>
          </div>

          {/* Tabbed Activity / Records View */}
          <div className="panel" style={{ padding: 24, minHeight: 380 }}>
            <div className="dashboard-tabs">
              <button
                className={`dashboard-tab ${activeTab === "solved" ? "active" : ""}`}
                onClick={() => setActiveTab("solved")}
              >
                Solved Problems ({stats.totalSolved})
              </button>
              <button
                className={`dashboard-tab ${activeTab === "submissions" ? "active" : ""}`}
                onClick={() => setActiveTab("submissions")}
              >
                Recent Submissions ({submissions.length})
              </button>
              <button
                className={`dashboard-tab ${activeTab === "snippets" ? "active" : ""}`}
                onClick={() => setActiveTab("snippets")}
              >
                Playground Scripts ({snippets.length})
              </button>
              <button
                className={`dashboard-tab ${activeTab === "badges" ? "active" : ""}`}
                onClick={() => setActiveTab("badges")}
              >
                Achievements ({achievements.filter((a) => a.unlocked).length}/{achievements.length})
              </button>
            </div>

            {/* Solved Problems Tab */}
            {activeTab === "solved" && (
              <div className="history-list">
                {stats.totalSolved === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "var(--ink-soft)" }}>
                    No problems solved yet. Browse our{" "}
                    <Link to="/problems" style={{ color: "var(--accent)", fontWeight: 700 }}>
                      Problems Directory
                    </Link>{" "}
                    to solve your first challenge!
                  </div>
                ) : (
                  problems
                    .filter((p) => solvedProblemIds.includes(p.id))
                    .map((p) => (
                      <div key={p.id} className="history-item">
                        <div className="history-item-left">
                          <Link
                            to={`/problems/${p.id}`}
                            className="history-item-title"
                            style={{ color: "var(--ink)" }}
                          >
                            {p.title}
                          </Link>
                          <div className="history-item-meta">
                            <DifficultyBadge difficulty={p.difficulty} />
                            <span>✓ Completed</span>
                          </div>
                        </div>
                        <Link to={`/problems/${p.id}`} className="btn-secondary btn-sm">
                          Practice Again
                        </Link>
                      </div>
                    ))
                )}
              </div>
            )}

            {/* Submissions Tab */}
            {activeTab === "submissions" && (
              <div className="history-list">
                {submissions.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "var(--ink-soft)" }}>
                    No submissions recorded yet. Submit your code in the{" "}
                    <Link to="/problems" style={{ color: "var(--accent)", fontWeight: 700 }}>
                      problem solver
                    </Link>
                    !
                  </div>
                ) : (
                  submissions.map((sub, i) => (
                    <div key={i} className="history-item">
                      <div className="history-item-left">
                        <span className="history-item-title">{sub.problemTitle || "Challenge"}</span>
                        <div className="history-item-meta">
                          <span className="tech-icon" style={{ padding: "2px 6px", fontSize: "0.7rem" }}>
                            {(sub.language || "code").toUpperCase()}
                          </span>
                          <span>Timestamp: {sub.date}</span>
                        </div>
                      </div>
                      <div
                        className="history-verdict"
                        style={{
                          background: sub.verdict === "Accepted" ? "var(--success-tint)" : "var(--thunder-tint)",
                          color: sub.verdict === "Accepted" ? "#1f8a67" : "#c93737",
                        }}
                      >
                        {sub.verdict}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Snippets Tab */}
            {activeTab === "snippets" && (
              <div className="history-list">
                {snippets.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "var(--ink-soft)" }}>
                    No snippets saved yet. Visit the{" "}
                    <Link to="/playground" style={{ color: "var(--accent)", fontWeight: 700 }}>
                      Playground
                    </Link>{" "}
                    to compile and save your code!
                  </div>
                ) : (
                  snippets.map((s) => (
                    <div key={s.id} className="history-item">
                      <div className="history-item-left">
                        <span className="history-item-title">{s.name}</span>
                        <div className="history-item-meta">
                          <span className="tech-icon" style={{ padding: "2px 6px", fontSize: "0.7rem" }}>
                            {s.language.toUpperCase()}
                          </span>
                          <span>Saved: {s.date}</span>
                        </div>
                      </div>
                      <Link to="/playground" className="btn-secondary btn-sm">
                        Open in Playground
                      </Link>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Badges Tab */}
            {activeTab === "badges" && (
              <div className="badges-showcase-grid">
                {achievements.map((badge) => (
                  <div
                    key={badge.id}
                    className={`badge-card-item ${badge.unlocked ? "unlocked" : "locked"}`}
                  >
                    <div className="badge-icon-box">{badge.icon}</div>
                    <div className="badge-text-box">
                      <h4>{badge.title}</h4>
                      <p>{badge.desc}</p>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          color: badge.unlocked ? "var(--success)" : "var(--ink-soft)",
                          marginTop: 4,
                          display: "inline-block",
                        }}
                      >
                        {badge.unlocked ? "✓ Unlocked" : "🔒 In Progress"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Developer Profile</h3>
              <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="modal-form">
              <div className="form-group">
                <label>Choose Avatar Icon</label>
                <div className="avatar-preset-grid">
                  {AVATAR_PRESETS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className={`avatar-preset-btn ${formData.avatarEmoji === emoji ? "active" : ""}`}
                      onClick={() => setFormData({ ...formData, avatarEmoji: emoji })}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Developer Handle / Username</label>
                <input
                  type="text"
                  placeholder="e.g. @alex_coder"
                  value={formData.handle}
                  onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Bio / Headline</label>
                <textarea
                  rows={3}
                  placeholder="Tell the world about your coding journey..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  placeholder="e.g. Seattle, WA"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Target Coding Goal</label>
                <input
                  type="text"
                  placeholder="e.g. Conquer Top 50 LeetCode Mediums"
                  value={formData.targetGoal}
                  onChange={(e) => setFormData({ ...formData, targetGoal: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>GitHub Profile Link</label>
                <input
                  type="url"
                  placeholder="https://github.com/yourname"
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>LinkedIn Profile Link</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/yourname"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary btn-sm">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
