import axios from "axios";

/**
 * Central Axios instance for the entire app.
 * All API calls should import and use this.
 */
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    // Admin-only app: always send admin token
    Authorization: "ADMIN_SECRET_123",
  },
});

export default api;
