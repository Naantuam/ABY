import axios from "axios";

// 1️⃣ DEFINE BASE URL
let BASE_URL = import.meta.env.VITE_API_URL || "https://abs-software-v2-s2qp.onrender.com";

// Ensure clean URL (no trailing slash)
if (BASE_URL.endsWith("/")) {
  BASE_URL = BASE_URL.slice(0, -1);
}

// Ensure it ends with /api
if (!BASE_URL.endsWith("/api")) {
  BASE_URL += "/api";
}

console.log("📡 API Base URL set to:", BASE_URL);

// Create the axios instance
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

    // Prevent infinite loops: If the error is 401 AND we haven't retried yet
    // AND the URL that failed wasn't the refresh endpoint itself
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/token/refresh/")
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");

        // If no refresh token exists, we can't refresh. Go to login.
        if (!refreshToken) {
          console.warn("⚠️ No refresh token found. Redirecting to login.");
          throw new Error("No refresh token");
        }

        console.log("🔄 Access token expired. Attempting refresh...");

        // 🚀 THIS IS THE KEY PART YOU ASKED FOR
        // We use a clean 'axios' call (not 'api') to avoid circular interceptors
        const refreshResponse = await axios.post(`${BASE_URL}/users/token/refresh/`, {
          refresh: refreshToken,
        });

        // 1. Get the new token from backend
        const newAccessToken = refreshResponse.data.access;

        // 2. Save it to local storage
        localStorage.setItem("access_token", newAccessToken);
        console.log("✅ Token refreshed successfully!");

        // 3. Update the header of the failed request with the NEW token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // 4. Retry the original request
        return api(originalRequest);

      } catch (refreshError) {
        console.error("❌ Session expired or Refresh Token invalid:", refreshError);

        // If Refresh fails, the user MUST log in again
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = ""; // Force redirect

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;