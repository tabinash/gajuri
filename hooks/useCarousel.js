import { useState, useCallback } from "react";

/**
 * Hook for managing carousel/image slider state
 * @param {number} itemCount - Total number of items in the carousel
 * @returns {Object} Carousel state and controls
 */
export function useCarousel(itemCount) {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % itemCount);
  }, [itemCount]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + itemCount) % itemCount);
  }, [itemCount]);

  const goTo = useCallback((newIndex) => {
    setIndex(newIndex);
  }, []);

  return { index, next, prev, goTo, setIndex };
}
