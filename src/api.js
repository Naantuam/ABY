// src/api.js
import axios from "axios";

// Create a new axios instance.
// Note: We use axios.create() here, not the global `api` instance,
// because we don't want the interceptors to run on the refresh request itself.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Automatically include Authorization header if token exists
api.interceptors.request.use(
  (config) => {
    const access = localStorage.getItem("access_token");
    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
    }
    console.log("🔗 API Request:", config.baseURL + config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle token refreshing
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is a 401 and it's not a retry request
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark this request as retried

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          // If no refresh token, log out
          throw new Error("No refresh token available");
        }
        
        // 🚀 Make the refresh token request
        // Note: We use a different endpoint for refreshing
        const response = await axios.post(`${api.defaults.baseURL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;

        // 💾 Save new token
        localStorage.setItem("access_token", newAccessToken);

        // Update the authorization header for the original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // 🔄 Retry the original request with the new token
        return api(originalRequest);

      } catch (refreshError) {
        console.error("❌ Token Refresh Failed:", refreshError.message);
        
        // If refresh fails, log the user out
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        
        // Redirect to login page
        window.location.href = "/"; 
        
        return Promise.reject(refreshError);
      }
    }
    
    // For all other errors, just reject
    console.error("❌ API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
