/**
 * String manipulation utilities
 */

/**
 * Extract city name from a location string (e.g., "Kathmandu, Nepal" -> "Kathmandu")
 * @param {string} location - Location string
 * @returns {string} City name or empty string
 */
export function cityFromLocation(location) {
  if (!location) return "";
  return location.split(",")[0]?.trim() || "";
}

/**
 * Normalize job type string to standard format
 * @param {string} jobType - Job type string (can be "full_time", "FULL-TIME", etc.)
 * @returns {string} Normalized job type
 */
export function normalizeJobType(jobType) {
  const type = (jobType || "").toLowerCase().replace(/[_-]/g, " ");
  if (type.includes("full")) return "Full-time";
  if (type.includes("part")) return "Part-time";
  if (type.includes("intern")) return "Internship";
  if (type.includes("contract")) return "Contract";
  if (type.includes("remote")) return "Remote";
  return "Full-time";
}

/**
 * Truncate text to a maximum length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
