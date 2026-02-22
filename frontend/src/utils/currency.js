/**
 * Format a number as Indian Currency (INR).
 * Handles the Indian numbering system (Lakhs/Crores) automatically via 'en-IN' locale.
 * @param {number|string} amount - The amount to format.
 * @returns {string} - Formatted string (e.g., "₹1,50,000.00").
 */
export const formatCurrency = (amount) => {
    const num = Number(amount);
    if (isNaN(num)) return '₹0.00';

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
};

/**
 * Format a number using Indian numbering system without currency symbol.
 * @param {number|string} value - The value to format.
 * @returns {string} - Formatted string (e.g., "1,50,000").
 */
export const formatNumber = (value) => {
    const num = Number(value);
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('en-IN').format(num);
};
