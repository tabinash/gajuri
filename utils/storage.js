/**
 * LocalStorage utilities for safe storage operations
 */

/**
 * Get an item from localStorage and parse it as JSON
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist or parsing fails
 * @returns {*} Parsed value or default value
 */
export function getItem(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage: ${key}`, error);
    return defaultValue;
  }
}

/**
 * Set an item in localStorage as JSON
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON stringified)
 */
export function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage: ${key}`, error);
  }
}

/**
 * Remove an item from localStorage
 * @param {string} key - Storage key
 */
export function removeItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage: ${key}`, error);
  }
}

/**
 * Clear all items from localStorage
 */
export function clear() {
  try {
    localStorage.clear();
  } catch (error) {
    console.error("Error clearing localStorage", error);
  }
}

/**
 * Storage object with all methods
 */
export const storage = {
  get: getItem,
  set: setItem,
  remove: removeItem,
  clear,
};
