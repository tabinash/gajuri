import { useState, useEffect } from "react";

/**
 * Hook to get the current logged-in user from localStorage
 * @returns {Object} Current user data and utilities
 */
export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const userData = localStorage.getItem("chemiki-userProfile");
      const parsed = userData ? JSON.parse(userData) : null;
      setUser(parsed);
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    userId: user?.id,
    username: user?.username,
    avatar: user?.profilePhotoUrl,
    isAuthenticated: !!user,
    loading,
  };
}
