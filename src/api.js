import axios from "axios";

// 1️⃣ DEFINE BASE URL
// We check for the environment variable first.
// If it's just the domain (e.g. ...onrender.com), we append '/api' to it.
let BASE_URL = import.meta.env.VITE_API_URL || "https://abs-software-v2.onrender.com";

// Ensure it doesn't end with a slash to avoid double slashes later
if (BASE_URL.endsWith("/")) {
  BASE_URL = BASE_URL.slice(0, -1);
}

// Ensure it ends with /api if your endpoints expect it (e.g. /api/users/)
// Based on your previous code which used /api prefix:
if (!BASE_URL.endsWith("/api")) {
  BASE_URL += "/api";
}

console.log("📡 API Base URL set to:", BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─────────────────────────────────────────────────────────────
// 2️⃣ REQUEST INTERCEPTOR (Attach Token)
// ─────────────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const access = localStorage.getItem("access_token");
    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────────────────────
// 3️⃣ RESPONSE INTERCEPTOR (Handle 401 & Refresh)
// ─────────────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 (Unauthorized) and we haven't retried yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) throw new Error("No refresh token");

        console.log("🔄 Refreshing token...");
        
        // ⚠️ IMPORTANT: Verify this endpoint with your partner.
        // Common Django SimpleJWT path: /token/refresh/
        // Your previous code had: /users/token/refresh/ or /auth/refresh/
        // I will use /users/token/refresh/ based on your login code context.
        const refreshResponse = await axios.post(`${BASE_URL}/users/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = refreshResponse.data.access;

        // Save new token
        localStorage.setItem("access_token", newAccessToken);
        
        // Attach new token to the RETRY request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        return api(originalRequest);

      } catch (refreshError) {
        console.error("❌ Session expired:", refreshError);
        
        // Logout cleanly
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;