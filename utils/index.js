/**
 * Central export for all utility functions
 */

// Date utilities
export { relativeTimeFromISO, formatDate } from "./date";

// Currency utilities
export { formatPrice, formatSalary } from "./currency";

// Image utilities
export { normalizeImages, firstImage, createImagePlaceholder } from "./image";

// String utilities
export { cityFromLocation, normalizeJobType, truncateText } from "./string";

// Storage utilities
export { getItem, setItem, removeItem, clear, storage } from "./storage";
