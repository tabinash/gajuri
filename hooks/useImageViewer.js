"use client";

import { useState, useCallback } from "react";

/**
 * Hook to manage fullscreen image viewer state
 * @returns {Object} - { isOpen, currentIndex, images, open, close, goTo, next, prev }
 */
export function useImageViewer() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState([]);

  const open = useCallback((imageArray, startIndex = 0) => {
    if (!imageArray || imageArray.length === 0) return;
    setImages(imageArray);
    setCurrentIndex(startIndex);
    setIsOpen(true);
    // Prevent body scroll when viewer is open
    document.body.style.overflow = "hidden";
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = "";
  }, []);

  const goTo = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  const next = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  return {
    isOpen,
    currentIndex,
    images,
    open,
    close,
    goTo,
    next,
    prev,
  };
}
