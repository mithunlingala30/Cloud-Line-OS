// API layer for the LeetCode clone.
//
// Problems are read directly from Firebase Firestore (client SDK) so the
// frontend works even when the Render backend /problems/ endpoint is
// unavailable (e.g. missing service-account key on the server side).
//
// Code execution (/run and /submit) still goes through the FastAPI backend.

import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import { app } from "./firebase";
import { DEFAULT_PROBLEMS } from "./problems-data";

const BASE_URL =
  import.meta.env.VITE_API_URL || "https://leetcode-backend-3dy7.onrender.com";

const COLD_START_TIMEOUT_MS = 60_000;

const db = getFirestore(app);

// ─── Firestore helpers (with resilient fallback) ──────────────────────────────

export async function listProblems() {
  try {
    const snap = await getDocs(collection(db, "problems"));
    if (snap.docs && snap.docs.length > 0) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn("Firestore fetch failed, attempting backend/local fallback:", err.message);
  }

  // Fallback to backend /problems/ endpoint
  try {
    const backendData = await request("/problems/");
    if (Array.isArray(backendData) && backendData.length > 0) return backendData;
  } catch (backendErr) {
    console.warn("Backend fetch failed, using built-in problem catalog:", backendErr.message);
  }

  // Instant built-in fallback
  return DEFAULT_PROBLEMS;
}

export async function getProblem(id) {
  try {
    const snap = await getDoc(doc(db, "problems", id));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
  } catch (err) {
    console.warn("Firestore getDoc failed, attempting backend/local fallback:", err.message);
  }

  // Fallback to backend /problems/{id}
  try {
    const backendData = await request(`/problems/${id}`);
    if (backendData && backendData.title) return backendData;
  } catch (backendErr) {
    console.warn("Backend problem lookup failed, checking local catalog:", backendErr.message);
  }

  // Fallback to local problem catalog
  const found = DEFAULT_PROBLEMS.find((p) => p.id === id || p.slug === id);
  if (found) return found;

  throw new Error("Problem not found");
}

// ─── FastAPI backend helpers (run / submit) ───────────────────────────────────

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), COLD_START_TIMEOUT_MS);

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      ...options,
    });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error(
        "The server is taking a while to respond — it may be waking up from sleep. Please try again in a moment."
      );
    }
    throw new Error(
      "Could not reach the backend. Check your connection or try again shortly."
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  listProblems,
  getProblem,
  runCode: (payload) =>
    request("/run", { method: "POST", body: JSON.stringify(payload) }),
  submitCode: (payload) =>
    request("/submit", { method: "POST", body: JSON.stringify(payload) }),
  languages: () => request("/languages"),
};
