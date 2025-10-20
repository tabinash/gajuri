import { http } from "./http.js";

const exploreCache = new Map();
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes in ms

export const exploreRepository = {
  // GET /api/explore (institutional users)
  getExploreData: async ({ forceRefresh = false } = {}) => {
    const cacheKey = "explore_data";
    const cached = exploreCache.get(cacheKey);

    // Check if cache exists and is still valid
    if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await http.get(`/institutional-users`);

      // Save fresh data with timestamp
      exploreCache.set(cacheKey, {
        data: response,
        timestamp: Date.now(),
      });

      return response;
    } catch (error) {
      console.error("Error fetching explore data:", error);
      throw error;
    }
  },
};
