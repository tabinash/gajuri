import { http } from "./http.js";

const peopleCache = new Map();
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes in ms

export const peopleRepository = {
  // GET /api/people (friends/neighbors)
  getPeopleData: async ({ forceRefresh = false } = {}) => {
    const cacheKey = "people_data";
    const cached = peopleCache.get(cacheKey);

    // Check if cache exists and is still valid
    if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await http.get(`/auth/general-user`);

      // Save fresh data with timestamp
      peopleCache.set(cacheKey, {
        data: response,
        timestamp: Date.now(),
      });

      return response;
    } catch (error) {
      console.error("Error fetching people data:", error);
      throw error;
    }
  },
};
