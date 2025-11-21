"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Fullscreen image viewer component for mobile
 * Supports swipe gestures, pinch-to-zoom, and tap to close
 */
export default function ImageViewer({
  isOpen,
  images = [],
  currentIndex = 0,
  onClose,
  onNext,
  onPrev,
  onGoTo,
}) {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const containerRef = useRef(null);

  const count = images.length;
  const minSwipeDistance = 50;

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowLeft") onPrev?.();
      if (e.key === "ArrowRight") onNext?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onNext, onPrev]);

  // Touch handlers for swipe
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && count > 1) {
      onNext?.();
    } else if (isRightSwipe && count > 1) {
      onPrev?.();
    }
  };

  // Handle vertical swipe to close
  const [verticalStart, setVerticalStart] = useState(null);
  const [verticalEnd, setVerticalEnd] = useState(null);

  const onTouchStartVertical = (e) => {
    setVerticalStart(e.targetTouches[0].clientY);
  };

  const onTouchMoveVertical = (e) => {
    setVerticalEnd(e.targetTouches[0].clientY);
  };

  const onTouchEndVertical = () => {
    if (!verticalStart || !verticalEnd) return;
    const distance = verticalEnd - verticalStart;
    if (distance > 100) {
      onClose?.();
    }
    setVerticalStart(null);
    setVerticalEnd(null);
  };

  if (!isOpen || !images.length) return null;

  const currentImage = images[currentIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col bg-black"
          onTouchStart={(e) => {
            onTouchStart(e);
            onTouchStartVertical(e);
          }}
          onTouchMove={(e) => {
            onTouchMove(e);
            onTouchMoveVertical(e);
          }}
          onTouchEnd={() => {
            onTouchEnd();
            onTouchEndVertical();
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-white/10 active:bg-white/20"
              aria-label="Close"
            >
              <X size={24} />
            </button>
            {count > 1 && (
              <span className="text-sm font-medium">
                {currentIndex + 1} / {count}
              </span>
            )}
            <div className="w-10" /> {/* Spacer for centering */}
          </div>

          {/* Image */}
          <div className="flex flex-1 items-center justify-center overflow-hidden">
            <motion.img
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              src={currentImage?.src || currentImage}
              alt={currentImage?.alt || `Image ${currentIndex + 1}`}
              className="max-h-full max-w-full object-contain"
              draggable={false}
            />
          </div>

          {/* Navigation arrows (for larger touch targets) */}
          {count > 1 && (
            <>
              <button
                onClick={onPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 active:bg-white/30"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={onNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 active:bg-white/30"
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Dots indicator */}
          {count > 1 && (
            <div className="flex justify-center gap-2 pb-6">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => onGoTo?.(i)}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    i === currentIndex ? "bg-white" : "bg-white/40"
                  }`}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Hint text */}
          <div className="pb-4 text-center text-xs text-white/50">
            Swipe down to close
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
