/**
 * API base URL for backend (must end with /api). In production, set REACT_APP_API_URL when building.
 * Example: REACT_APP_API_URL=https://your-backend.onrender.com/api
 */
const raw = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";
const base = raw.replace(/\/+$/, "");
export const API_BASE = base.endsWith("/api") ? base : base + "/api";
