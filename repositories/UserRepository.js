import { http } from "./http.js";

// -------------------- FETCH BY USER ID (no cache) --------------------
export const getUserProfileById = async (userId) => {
  try {
    console.log(`🌐 Fetching user profile from API for ID: ${userId}`);
    const response = await http.get(`/auth/user-details?userId=${userId}`);
    console.log("🚀 Get User Profile By ID Response:", response);
    return response;
  } catch (error) {
    console.error(`❌ Error fetching user profile for ID ${userId}:`, error);
    throw error;
  }
};

// Retry wrapper for userId
export const getUserProfileByIdWithRetry = async (userId, maxRetries = 3) => {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await getUserProfileById(userId);
    } catch (error) {
      lastError = error;
      console.warn(
        `🔄 Retry attempt ${attempt}/${maxRetries} failed for user ID: ${userId}`
      );
      if (attempt === maxRetries) throw lastError;
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt - 1) * 1000));
    }
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

    // ✅ Refetch fresh user profile after update
    await getUserProfileById(userId);

    localStorage.setItem("chemiki-userProfile", JSON.stringify(response.data));

    return response;
  } catch (error) {
    console.error(`❌ Error updating user profile:`, error);
    throw error;
  }
};
