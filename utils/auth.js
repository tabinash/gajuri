// utils/auth.js

// Simple logout function - use it everywhere
export const logout = () => {
  // Clear all auth data
  localStorage.removeItem("chemiki-authToken");
  localStorage.removeItem("chemiki-userProfile"); // if you use this

  // Redirect to login
  window.location.href = "/login"; // or window.location.hash = '/login' if using hash routing

  console.log("🚪 User logged out");
};

// Optional: Check if user has valid token
export const isAuthenticated = () => {
  const tokenData = localStorage.getItem("chemiki-authToken");

  if (!tokenData) return false;

  try {
    const tokens = JSON.parse(tokenData);
    return !!tokens.accessToken; // Simple check - just see if token exists
  } catch {
    return false;
  }
};
