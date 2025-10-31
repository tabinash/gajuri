/**
 * Date and time utility functions
 */

/**
 * Convert an ISO date string to relative time (e.g., "2 hours ago")
 * @param {string} iso - ISO date string
 * @returns {string} Relative time string or empty string if invalid
 */
export function relativeTimeFromISO(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["min", 60],
  ];
  for (const [label, sec] of units) {
    const v = Math.floor(diffSec / sec);
    if (v >= 1) return `${v} ${label}${v > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

/**
 * Format a date object or ISO string to a localized date string
 * @param {Date|string} date - Date object or ISO string
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string|undefined} Formatted date or undefined if invalid
 */
export function formatDate(date, options = {}) {
  if (!date) return undefined;
  const d = new Date(date);
  if (isNaN(d.getTime())) return undefined;

  return d.toLocaleDateString(undefined, {
    month: options.month || "short",
    day: options.day || "numeric",
    year: options.year || "numeric",
    ...options,
  });
}
