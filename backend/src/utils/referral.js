/**
 * Referral Utility - Helper functions for referral codes
 */

/**
 * Normalize referral code: Remove spaces and convert to uppercase
 * @param {string} code 
 * @returns {string}
 */
export const normalizeReferralCode = (code) => {
    if (!code) return '';
    return code.replace(/\s+/g, '').toUpperCase();
};

/**
 * Generate a unique referral ID for a user
 * Format: USER + Random alphanumeric (e.g. USER1A2B)
 * @param {string} prefix 
 * @returns {string}
 */
export const generateReferralId = (prefix = 'USER') => {
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${randomStr}`;
};
