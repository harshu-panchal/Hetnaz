import User from '../../models/User.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.js';
import { invalidateUserCache } from '../../middleware/auth.js';

/**
 * Resubmit verification document
 * @param {string} userId - User ID
 * @param {string} aadhaarCardUrl - New Aadhaar card URL
 */
export const resubmitVerification = async (userId, aadhaarCardUrl) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new NotFoundError('User not found');
    }

    // Only allow if status is 'rejected' (or 'pending' if they want to update it?)
    // Requirement says "What if the Female does not send a clear photo... Admin requests to resend... User logs in and attaches image"
    // So likely the status is 'rejected'.
    if (user.approvalStatus !== 'rejected' && user.approvalStatus !== 'resubmit_requested' && user.approvalStatus !== 'pending') {
        throw new BadRequestError('Verification cannot be resubmitted currently.');
    }

    user.verificationDocuments.aadhaarCard = {
        url: aadhaarCardUrl,
        uploadedAt: new Date(),
        verified: false,
    };

    // Set back to pending specifically
    user.approvalStatus = 'pending';
    user.rejectionReason = undefined; // Clear previous rejection reason

    await user.save();

    return user;
};

/**
 * Get user profile details
 * @param {string} userId 
 */
export const getUserProfile = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new NotFoundError('User not found');
    }
    return user;
};

/**
 * Update user profile
 * @param {string} userId
 * @param {Object} data - Update data
 */
export const updateUserProfile = async (userId, data) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new NotFoundError('User not found');
    }

    // Initialize profile if it doesn't exist
    if (!user.profile) user.profile = {};

    if (data.name) user.profile.name = data.name;
    if (data.bio) user.profile.bio = data.bio;
    if (data.age) user.profile.age = data.age;
    if (data.occupation) user.profile.occupation = data.occupation;

    // Handle location updates - consolidated into profile.location
    if (data.city || data.location || (data.latitude !== undefined && data.longitude !== undefined)) {
        if (!user.profile.location) {
            user.profile.location = {
                fullAddress: '',
                city: '',
                coordinates: {
                    type: 'Point',
                    coordinates: [0, 0]
                }
            };
        }

        // Update full address - prioritize 'location' field which contains complete address
        if (data.location) {
            user.profile.location.fullAddress = data.location;
            // Also set city for backward compatibility (extract first part before comma)
            user.profile.location.city = data.location.split(',')[0].trim();
        } else if (data.city) {
            user.profile.location.city = data.city;
            user.profile.location.fullAddress = data.city; // Fallback
        }

        if (data.state) user.profile.location.state = data.state;
        if (data.country) user.profile.location.country = data.country;

        // Handle coordinates from Google Maps Autocomplete
        if (data.latitude !== undefined && data.longitude !== undefined) {
            const lat = parseFloat(data.latitude);
            const lng = parseFloat(data.longitude);

            if (!isNaN(lat) && !isNaN(lng)) {
                // Set coordinates correctly for GeoJSON [longitude, latitude]
                user.profile.location.coordinates = {
                    type: 'Point',
                    coordinates: [lng, lat]
                };
                // Ensure Mongoose knows this nested object changed
                user.markModified('profile.location');
                user.markModified('profile.location.coordinates');
            }
        }
    }

    if (data.interests && Array.isArray(data.interests)) {
        user.profile.interests = data.interests;
    }

    if (data.photos) {
        // Map string URLs to photo objects
        // Assuming frontend sends array of strings
        user.profile.photos = data.photos.map((url, index) => ({
            url,
            isPrimary: index === 0,
            uploadedAt: new Date()
        }));
    }

    await user.save();

    // Invalidate auth cache so next request gets fresh data
    invalidateUserCache(userId);

    return user;
};
