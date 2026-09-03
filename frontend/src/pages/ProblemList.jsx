import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listProblems } from "../api";
import DifficultyBadge from "../components/DifficultyBadge";
import "../styles/custom_pages.css";

const POPULAR_TAGS = [
  "All",
  "array",
  "string",
  "math",
  "two-pointer",
  "hash-map",
  "binary-search",
  "dynamic-programming",
  "sorting",
  "matrix",
];

export default function ProblemList() {
  const [problems, setProblems] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All"); // "All" | "Solved" | "Unsolved"
  const [selectedTag, setSelectedTag] = useState("All");
  const [sortBy, setSortBy] = useState("id-asc"); // "id-asc" | "id-desc" | "title-asc" | "diff-asc" | "diff-desc"
  const [viewMode, setViewMode] = useState("table"); // "table" | "grid"
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [slowLoad, setSlowLoad] = useState(false);
  const navigate = useNavigate();

  // Read solved problems from localStorage
  const solvedProblemIds = useMemo(() => {
    try {
      const stored = localStorage.getItem("cloudline_solved_problems");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    const slowTimer = setTimeout(() => setSlowLoad(true), 4000);

    listProblems()
      .then((data) => {
        setProblems(data || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => clearTimeout(slowTimer));

    return () => clearTimeout(slowTimer);
  }, []);

  // Compute counts
  const counts = useMemo(() => {
    if (!problems) return { total: 0, Easy: 0, Medium: 0, Hard: 0, Solved: 0 };
    return problems.reduce(
      (acc, p) => {
        acc.total += 1;
        if (acc[p.difficulty] !== undefined) acc[p.difficulty] += 1;
        if (solvedProblemIds.includes(p.id)) acc.Solved += 1;
        return acc;
      },
      { total: 0, Easy: 0, Medium: 0, Hard: 0, Solved: 0 }
    );
  }, [problems, solvedProblemIds]);

  // Extract all available tags dynamically
  const allAvailableTags = useMemo(() => {
    if (!problems) return POPULAR_TAGS;
    const tagSet = new Set();
    problems.forEach((p) => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach((t) => tagSet.add(t.toLowerCase()));
      }
    });
    return ["All", ...Array.from(tagSet)];
  }, [problems]);

  // Filtered & Sorted problems
  const filteredAndSorted = useMemo(() => {
    if (!problems) return [];

    const difficultyWeight = { Easy: 1, Medium: 2, Hard: 3 };

    return problems
      .filter((p) => {
        // Search filter
        const q = search.trim().toLowerCase();
        const matchesSearch =
          !q ||
          p.title?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q)) ||
          p.id?.toLowerCase().includes(q);

        // Difficulty filter
        const matchesDifficulty =
          difficultyFilter === "All" || p.difficulty === difficultyFilter;

        // Status filter
        const isSolved = solvedProblemIds.includes(p.id);
        const matchesStatus =
          statusFilter === "All" ||
          (statusFilter === "Solved" && isSolved) ||
          (statusFilter === "Unsolved" && !isSolved);

        // Tag filter
        const matchesTag =
          selectedTag === "All" ||
          p.tags?.map((t) => t.toLowerCase()).includes(selectedTag.toLowerCase());

        return matchesSearch && matchesDifficulty && matchesStatus && matchesTag;
      })
      .sort((a, b) => {
        if (sortBy === "title-asc") return (a.title || "").localeCompare(b.title || "");
        if (sortBy === "diff-asc")
          return (difficultyWeight[a.difficulty] || 0) - (difficultyWeight[b.difficulty] || 0);
        if (sortBy === "diff-desc")
          return (difficultyWeight[b.difficulty] || 0) - (difficultyWeight[a.difficulty] || 0);
        if (sortBy === "id-desc") return (b.id || "").localeCompare(a.id || "");
        return (a.id || "").localeCompare(b.id || ""); // default id-asc
      });
  }, [problems, search, difficultyFilter, statusFilter, selectedTag, sortBy, solvedProblemIds]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, difficultyFilter, statusFilter, selectedTag, sortBy, pageSize]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const paginatedProblems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, currentPage, pageSize]);

  // Handle Pick Random Challenge
  function handlePickRandom() {
    if (!filteredAndSorted.length) return;
    const unsolvedList = filteredAndSorted.filter((p) => !solvedProblemIds.includes(p.id));
    const pool = unsolvedList.length > 0 ? unsolvedList : filteredAndSorted;
    const randomPick = pool[Math.floor(Math.random() * pool.length)];
    if (randomPick) {
      navigate(`/problems/${randomPick.id}`);
    }
  }

  return (
    <div className="page">
      {/* Sleek Hero Banner with Quick Stats & Actions */}
      <section className="problems-hero-banner">
        <div className="problems-hero-info">
          <h1>
            Practice, <span className="text-gradient">with clear skies.</span>
          </h1>
          <p>
            Sharpen algorithmic problem-solving with verified test suites, multi-language compiler execution, and instant verdicts.
          </p>
        </div>

        <div className="problems-hero-actions">
          <div className="progress-pill-card">
            <span className="progress-pill-circle">
              {counts.Solved}/{counts.total}
            </span>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <b style={{ fontSize: "0.88rem" }}>Completed</b>
              <span style={{ fontSize: "0.72rem", color: "var(--ink-soft)" }}>
                {counts.total > 0 ? Math.round((counts.Solved / counts.total) * 100) : 0}% mastery
              </span>
            </div>
          </div>

          <button className="quick-pick-btn" onClick={handlePickRandom} title="Pick a random problem to solve">
            <span>🎲</span> Pick Random
          </button>
        </div>
      </section>

      {/* Category Tags Carousel */}
      <div className="category-bar-wrapper">
        {allAvailableTags.slice(0, 12).map((tag) => (
          <button
            key={tag}
            className={`category-pill ${selectedTag === tag ? "active" : ""}`}
            onClick={() => setSelectedTag(tag)}
          >
            {tag === "All" ? "⚡ All Topics" : `#${tag}`}
          </button>
        ))}
      </div>

      {/* Modern Filter Toolbar */}
      <div className="problem-controls-bar">
        {/* Search input with icon */}
        <div className="search-box-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search problems, topics, keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear-btn" onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </div>

        {/* Difficulty Filter Chips */}
        <div className="filter-group">
          {["All", "Easy", "Medium", "Hard"].map((d) => (
            <button
              key={d}
              className={`filter-chip ${difficultyFilter === d ? "active" : ""}`}
              onClick={() => setDifficultyFilter(d)}
            >
              {d}{" "}
              <span style={{ opacity: 0.75, fontSize: "0.75rem", marginLeft: 2 }}>
                {d === "All" ? `(${counts.total})` : `(${counts[d] || 0})`}
              </span>
            </button>
          ))}
        </div>

        {/* Status & Sort Selectors */}
        <div className="filter-group">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by solved status"
          >
            <option value="All">Status: All</option>
            <option value="Solved">Status: Solved ✓</option>
            <option value="Unsolved">Status: Unsolved</option>
          </select>

          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort problems"
          >
            <option value="id-asc">Sort: # Default</option>
            <option value="title-asc">Sort: Title (A-Z)</option>
            <option value="diff-asc">Sort: Easy → Hard</option>
            <option value="diff-desc">Sort: Hard → Easy</option>
          </select>

          {/* View Mode Switcher */}
          <div className="view-mode-toggle">
            <button
              className={`view-btn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
              title="Table View"
            >
              ☰ Table
            </button>
            <button
              className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              ⊞ Grid
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="state-msg">
          Couldn't reach the backend ({error}). Make sure the FastAPI server is running or Firestore connection is active.
        </div>
      )}

      {/* Loading Skeletons */}
      {!error && problems === null && (
        <div style={{ marginTop: 20 }}>
          <div className="skeleton-row" />
          <div className="skeleton-row" />
          <div className="skeleton-row" />
          <div className="skeleton-row" />
          <div className="skeleton-row" />
          {slowLoad && (
            <div className="state-msg" style={{ padding: "16px 0" }}>
              Waking up the server — this can take a few moments on cold start...
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!error && problems !== null && filteredAndSorted.length === 0 && (
        <div className="state-msg" style={{ padding: "60px 0" }}>
          <div style={{ fontSize: "2rem", marginBottom: 10 }}>🔍</div>
          <b>No problems matched your search filters.</b>
          <p style={{ color: "var(--ink-soft)", fontSize: "0.88rem", marginTop: 4 }}>
            Try adjusting your query or resetting difficulty & topic filters.
          </p>
          <button
            className="btn-secondary btn-sm"
            style={{ marginTop: 14 }}
            onClick={() => {
              setSearch("");
              setDifficultyFilter("All");
              setStatusFilter("All");
              setSelectedTag("All");
            }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Problems Display: Neat Table View */}
      {!error && problems !== null && filteredAndSorted.length > 0 && viewMode === "table" && (
        <div className="problems-table-card">
          <table className="problems-table">
            <thead>
              <tr>
                <th style={{ width: "48px", textAlign: "center" }}>Status</th>
                <th style={{ width: "60px" }}>#</th>
                <th>Title & Topic Tags</th>
                <th style={{ width: "120px" }}>Difficulty</th>
                <th style={{ width: "100px", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProblems.map((p, idx) => {
                const isSolved = solvedProblemIds.includes(p.id);
                const displayIndex = (currentPage - 1) * pageSize + idx + 1;
                return (
                  <tr key={p.id}>
                    <td style={{ textAlign: "center" }}>
                      {isSolved ? (
                        <span className="table-status-icon table-status-solved" title="Solved">
                          ✓
                        </span>
                      ) : (
                        <span className="table-status-icon table-status-unsolved" title="Unsolved">
                          ○
                        </span>
                      )}
                    </td>
                    <td style={{ color: "var(--ink-soft)", fontWeight: 600, fontSize: "0.85rem" }}>
                      {displayIndex}
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <Link to={`/problems/${p.id}`} className="problem-row-title">
                          {p.title}
                        </Link>
                        <div className="table-tags-wrap">
                          {(p.tags || []).map((t) => (
                            <span
                              key={t}
                              className="tag-pill"
                              style={{ cursor: "pointer" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTag(t);
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td>
                      <DifficultyBadge difficulty={p.difficulty} />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link
                        to={`/problems/${p.id}`}
                        className={`btn-sm ${isSolved ? "btn-secondary" : "btn-primary"}`}
                        style={{ padding: "6px 14px", textDecoration: "none", display: "inline-block" }}
                      >
                        {isSolved ? "Review" : "Solve"}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Problems Display: Neat Grid View */}
      {!error && problems !== null && filteredAndSorted.length > 0 && viewMode === "grid" && (
        <div className="problem-grid">
          {paginatedProblems.map((p) => {
            const isSolved = solvedProblemIds.includes(p.id);
            return (
              <Link key={p.id} to={`/problems/${p.id}`} className="problem-card">
                <div className="problem-card-top">
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <h3>{p.title}</h3>
                    {isSolved && <span className="solved-card-pill">✓ Solved</span>}
                  </div>
                  <DifficultyBadge difficulty={p.difficulty} />
                </div>
                <div className="problem-card-tags">
                  {(p.tags || []).map((t) => (
                    <span key={t} className="tag-pill">
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {!error && filteredAndSorted.length > 0 && (
        <div className="pagination-bar">
          <div>
            Showing{" "}
            <b>
              {Math.min((currentPage - 1) * pageSize + 1, filteredAndSorted.length)} -{" "}
              {Math.min(currentPage * pageSize, filteredAndSorted.length)}
            </b>{" "}
            of <b>{filteredAndSorted.length}</b> challenges
          </div>

          <div className="pagination-controls">
            <button
              className="page-num-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                return (
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1
                );
              })
              .map((page, idx, arr) => {
                const prev = arr[idx - 1];
                return (
                  <span key={page} style={{ display: "flex", alignItems: "center" }}>
                    {prev && page - prev > 1 && (
                      <span style={{ padding: "0 4px", color: "var(--ink-soft)" }}>…</span>
                    )}
                    <button
                      className={`page-num-btn ${currentPage === page ? "active" : ""}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  </span>
                );
              })}

            <button
              className="page-num-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              ›
            </button>

            <select
              className="filter-select"
              style={{ marginLeft: 8, padding: "6px 10px" }}
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              <option value={15}>15 / page</option>
              <option value={30}>30 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
