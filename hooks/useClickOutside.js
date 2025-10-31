import { useEffect, useRef } from "react";

/**
 * Hook that handles clicks outside of a referenced element
 * @param {Function} handler - Function to call when click outside is detected
 * @returns {React.RefObject} - Ref to attach to the element
 */
export function useClickOutside(handler) {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handler]);

  return ref;
}
