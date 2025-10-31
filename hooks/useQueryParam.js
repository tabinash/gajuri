import { useSearchParams } from "next/navigation";

/**
 * Hook to get a single query parameter value
 * @param {string} key - The query parameter key
 * @param {*} defaultValue - Default value if parameter doesn't exist
 * @returns {string|null} The parameter value or default
 */
export function useQueryParam(key, defaultValue = null) {
  const searchParams = useSearchParams();
  const value = searchParams?.get(key);
  return value !== null ? value : defaultValue;
}

/**
 * Hook to get multiple query parameters at once
 * @param {string[]} keys - Array of query parameter keys
 * @returns {Object} Object with keys as properties
 */
export function useQueryParams(keys) {
  const searchParams = useSearchParams();

  return keys.reduce((acc, key) => {
    acc[key] = searchParams?.get(key) ?? null;
    return acc;
  }, {});
}
