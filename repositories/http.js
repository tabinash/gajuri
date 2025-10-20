// utils/httpClient.js
import axios from "axios";
import { logout } from "../utils/auth";

const httpClient = axios.create({
  baseURL: "https://test.gajuri.com/api",
  timeout: 300000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ===== Refresh Token Handling =====
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// ===== Request Interceptor =====
httpClient.interceptors.request.use(
  (config) => {
    const tokenData = localStorage.getItem("chemiki-authToken");

    if (tokenData) {
      try {
        const tokens = JSON.parse(tokenData);
        if (tokens.accessToken) {
          console.log("✅ Access token attached:", tokens.accessToken);
          config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
      } catch (error) {
        console.error("❌ Invalid token data:", error);
        logout();
        return Promise.reject(new Error("Invalid token format"));
      }
    }

    config.headers["X-Request-Time"] = new Date().toISOString();
    return config;
  },
  (error) => Promise.reject(error)
);

// ===== Response Interceptor =====
httpClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // 🔒 401 Unauthorized → logout
    if (status === 401) {
      console.log("🔒 Unauthorized - logging out");
      logout();
      return Promise.reject(error);
    }

    // 🔄 403 Forbidden → Refresh token flow
    if (status === 403 && !originalRequest._retry) {
      console.log("🔄 Token expired - attempting refresh");

      if (isRefreshing) {
        // Queue requests until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return httpClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tokenData = JSON.parse(localStorage.getItem("chemiki-authToken"));
        const refreshToken = tokenData?.refreshToken;

        if (!refreshToken) {
          console.log("❌ No refresh token found — logging out");
          logout();
          return Promise.reject(error);
        }

        console.log("Using refresh token:", refreshToken);

        // Request new tokens
        const res = await axios.post(
          "https://test.gajuri.com/api/auth/refresh-token",
          { refreshToken }
        );

        console.log("🔄 Token refreshed successfully:", res.data);

        const newTokens = res.data?.data || res.data; // handle both possible formats
        localStorage.setItem("chemiki-authToken", JSON.stringify(newTokens));

        const newAccessToken = newTokens.accessToken;
        httpClient.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return httpClient(originalRequest);
      } catch (err) {
        processQueue(err, null);

        // 🛑 If refresh token request fails with 401 → logout immediately
        if (err.response?.status === 401) {
          console.log("🔒 Refresh token invalid — logging out");
          logout();
        }

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Other errors (>= 500, etc.)
    return Promise.reject(error);
  }
);

// ===== Helper Methods =====
export const http = {
  get: (url, config = {}) => httpClient.get(url, config),
  post: (url, data = {}, config = {}) => httpClient.post(url, data, config),
  put: (url, data = {}, config = {}) => httpClient.put(url, data, config),
  patch: (url, data = {}, config = {}) => httpClient.patch(url, data, config),
  delete: (url, config = {}) => httpClient.delete(url, config),
};

export default httpClient;
