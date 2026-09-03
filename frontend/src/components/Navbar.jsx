import { Link } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../firebase";

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="brand-cloud" aria-hidden="true">☁</span>
        <span>Cloudline</span>
      </Link>
      <nav className="navbar-links">
        <Link to="/problems">Problems</Link>
        <Link to="/playground">Playground</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/profile">Profile</Link>
        {user ? (
          <div className="navbar-user" style={{ marginLeft: 6 }}>
            <Link
              to="/profile"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                background: "var(--cloud-tint)",
                borderRadius: "999px",
                border: "1px solid var(--border-soft)",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "var(--ink)",
              }}
              title="View your Profile"
            >
              <span>👤</span>
              <span className="navbar-email">{user.email.split("@")[0]}</span>
            </Link>
            <button className="btn-ghost btn-sm" onClick={() => signOut(auth)} title="Sign out">
              Sign out
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn-primary btn-sm" style={{ marginLeft: 6 }}>
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}
