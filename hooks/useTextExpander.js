import { useState, useCallback } from "react";

/**
 * Hook for handling text expansion (read more/less functionality)
 * @param {string} text - The text to potentially truncate
 * @param {number} maxLength - Maximum length before truncation (default: 200)
 * @returns {Object} Text expander state and controls
 */
export function useTextExpander(text = "", maxLength = 200) {
  const [expanded, setExpanded] = useState(false);

  const shouldTruncate = text.length > maxLength;
  const displayText = expanded || !shouldTruncate ? text : text.slice(0, maxLength) + "...";

  const toggle = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const expand = useCallback(() => {
    setExpanded(true);
  }, []);

  const collapse = useCallback(() => {
    setExpanded(false);
  }, []);

  return {
    displayText,
    expanded,
    shouldTruncate,
    toggle,
    expand,
    collapse,
  };
}
