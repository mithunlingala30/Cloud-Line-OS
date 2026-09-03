import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      if (mode === "signin") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate("/problems");
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    }
  }

  async function handleGoogle() {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/problems");
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    }
  }

  return (
    <div className="page">
      <div className="auth-shell">
        <h2 style={{ marginBottom: 6 }}>
          {mode === "signin" ? "Welcome back" : "Create an account"}
        </h2>
        <p style={{ color: "var(--ink-soft)", marginBottom: 20, fontSize: "0.9rem" }}>
          Sign in to track your submissions.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <button type="submit" className="btn-primary" style={{ width: "100%" }}>
            {mode === "signin" ? "Sign in" : "Sign up"}
          </button>
        </form>
        <button
          className="btn-secondary"
          style={{ width: "100%", marginTop: 10 }}
          onClick={handleGoogle}
        >
          Continue with Google
        </button>
        {error && <div className="auth-error">{error}</div>}
        <p style={{ marginTop: 16, fontSize: "0.85rem" }}>
          {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
          <button
            className="btn-ghost btn-sm"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Create an account" : "Sign in instead"}
          </button>
        </p>
      </div>
    </div>
  );
}
