import { http } from "./http.js";

const CACHE_KEY_PREFIX = "chemiki-userProfile-";
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // ⏱ 5 minutes cache expiry

// -------------------- FETCH BY USER ID (with cache) --------------------
export const getUserProfileById = async (userId) => {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${userId}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > CACHE_EXPIRY_MS;

      if (!isExpired) {
        console.log(`⚡ Using cached user profile for ID: ${userId}`);
        return { data, fromCache: true };
      } else {
        console.log(`🕒 Cache expired for ID: ${userId}, refetching...`);
      }
    }

    // If no cache or expired → fetch from API
    console.log(`🌐 Fetching user profile from API for ID: ${userId}`);
    const response = await http.get(`/auth/user-details?userId=${userId}`);
    console.log("🚀 Get User Profile By ID Response:", response);

    // Store fresh data in cache
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        data: response.data,
        timestamp: Date.now(),
      })
    );

    return response;
  } catch (error) {
    console.error(`❌ Error fetching user profile for ID ${userId}:`, error);
    throw error;
  }
};

// -------------------- FETCH BY PHONE NUMBER (no cache) --------------------
export const getUserProfile = async (phoneNumber) => {
  try {
    console.log(`🌐 Fetching user profile from API for: ${phoneNumber}`);
    const response = await http.get(
      `/auth/user-details?phoneNumber=${phoneNumber}`
    );
    console.log("🚀 Get User Profile Response:", response);

    localStorage.setItem("chemiki-userProfile", JSON.stringify(response.data));
    return response;
  } catch (error) {
    console.error(`❌ Error fetching user profile for ${phoneNumber}:`, error);
    throw error;
  }
};

// -------------------- UPDATE PROFILE --------------------
export const updateProfile = async (userId, data) => {
  try {
    console.log(`🌐 Updating profile for`, userId);
    const response = await http.put(`/profile`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("🚀 Update User Profile Response:", response);

    // ✅ Refetch & update cache after update
    await getUserProfileById(userId);

    // ✅ Also update the generic cache (if used)
    localStorage.setItem(
      `${CACHE_KEY_PREFIX}${userId}`,
      JSON.stringify({ data: response.data, timestamp: Date.now() })
    );

    return response;
  } catch (error) {
    console.error(`❌ Error updating user profile:`, error);
    throw error;
  }
};
