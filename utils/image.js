/**
 * Image handling utilities
 */

/**
 * Normalize images array from API (can be strings or objects)
 * @param {Array} images - Array of image URLs or image objects
 * @returns {Array} Array of normalized image objects with src and alt
 */
export function normalizeImages(images) {
  if (!Array.isArray(images)) return [];
  return images
    .map((img) =>
      typeof img === "string"
        ? { src: img, alt: "image" }
        : { src: img?.url || img?.src || "", alt: img?.alt || "image" }
    )
    .filter((i) => i.src);
}

/**
 * Get the first image URL from an array of images
 * @param {Array} images - Array of image URLs
 * @param {string} fallback - Fallback image URL
 * @returns {string} First image URL or fallback
 */
export function firstImage(images, fallback = "https://via.placeholder.com/400x300/EEE/94A3B8?text=Item") {
  const src = Array.isArray(images) && images.length > 0 ? images[0] : "";
  return src || fallback;
}

/**
 * Create a placeholder image URL
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {string} text - Placeholder text
 * @returns {string} Placeholder image URL
 */
export function createImagePlaceholder(width, height, text = "Image") {
  return `https://via.placeholder.com/${width}x${height}/EEE/94A3B8?text=${encodeURIComponent(text)}`;
}
