import axios from "axios";

function normalizeApiUrl(url) {
  const cleanUrl = url.replace(/\/+$/, "");
  return cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;
}

/**
 * Central Axios instance for the entire app.
 * All API calls should import and use this.
 */
const apiBaseUrl = normalizeApiUrl(
  process.env.REACT_APP_API_URL || "http://localhost:5000/api"
);

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    // Admin-only app: always send admin token
    Authorization: "ADMIN_SECRET_123",
  },
});

export default api;
