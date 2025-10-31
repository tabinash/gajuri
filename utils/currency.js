/**
 * Currency formatting utilities
 */

/**
 * Format a number as NPR currency
 * @param {number} amount - Amount to format
 * @param {object} options - Formatting options
 * @param {boolean} options.showFree - Return "FREE" for zero/invalid amounts (default: true)
 * @param {string} options.currency - Currency code (default: "NPR")
 * @returns {string|undefined} Formatted price or "FREE" or undefined
 */
export function formatPrice(amount, options = {}) {
  const { showFree = true, currency = "NPR" } = options;

  // Handle invalid or zero amounts
  if (typeof amount !== "number" || isNaN(amount) || !amount || amount <= 0) {
    return showFree ? "FREE" : undefined;
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `Rs ${amount}`;
  }
}

/**
 * Format salary (returns undefined for invalid values instead of "FREE")
 * @param {number} amount - Salary amount
 * @returns {string|undefined} Formatted salary or undefined
 */
export function formatSalary(amount) {
  return formatPrice(amount, { showFree: false });
}
