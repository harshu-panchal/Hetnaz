import User from '../../models/User.js';
import { calculateDistance, formatDistance } from '../../utils/distanceCalculator.js';
import memoryCache, { CACHE_TTL } from '../../core/cache/memoryCache.js';
import * as userService from '../../services/user/userService.js';
import { NotFoundError } from '../../utils/errors.js';

export const resubmitVerification = async (req, res, next) => {
    try {
        const { aadhaarCardUrl } = req.body;
        const user = await userService.resubmitVerification(req.user.id, aadhaarCardUrl);

        res.status(200).json({
            status: 'success',
            data: {
                user,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getProfile = async (req, res, next) => {
    try {
        // req.user is already populated by auth middleware
        res.status(200).json({
            status: 'success',
            data: { user: req.user }
        });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const user = await userService.updateUserProfile(req.user.id, req.body);
        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteAccount = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        // Soft delete user
        user.isActive = false;
        user.isDeleted = true;

        // Clear personal data (Privacy)
        if (user.profile) {
            user.profile.name = 'Deleted User';
            user.profile.name_en = 'Deleted User';
            user.profile.name_hi = 'डिलीट किया गया उपयोगकर्ता';
            user.profile.bio = '';
            user.profile.bio_en = '';
            user.profile.bio_hi = '';
            user.profile.photos = [];
            user.profile.location = {
                city: '',
                state: '',
                country: '',
                coordinates: { type: 'Point', coordinates: [0, 0] }
            };
        }

        user.phoneNumber = `deleted_${user._id}_${Date.now()}`; // Allow phone number reuse
        await user.save({ validateBeforeSave: false });

        // Handle cascading deactivation (mark chats as inactive)
        const { default: relationshipManager } = await import('../../core/relationships/relationshipManager.js');
        await relationshipManager.handleCascadeDelete(userId, 'user');

        res.status(200).json({
            status: 'success',
            message: 'Account deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get approved female users for discover page - with caching
 */
export const discoverFemales = async (req, res, next) => {
    try {
        const { filter = 'all', limit = 20, page = 1, language = 'en' } = req.query;
        const cacheKey = `discover:females:${req.user.id}:${filter}:${page}:${limit}:${language}`;

        // Try cache first (but only for first page to keep it fresh)
        if (parseInt(page) === 1) {
            const cached = memoryCache.get(cacheKey);
            if (cached) {
                return res.status(200).json({
                    status: 'success',
                    data: cached,
                    cached: true,
                });
            }
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Use data from already authenticated req.user
        const currentUser = req.user;
        const blockedUserIds = currentUser?.blockedUsers || [];
        const currentUserCoords = currentUser?.profile?.location?.coordinates?.coordinates;
        const hasCurrentUserCoords = currentUserCoords && currentUserCoords[0] !== 0 && currentUserCoords[1] !== 0;

        // Find users who have blocked the current user (using index on blockedUsers)
        const usersWhoBlockedMe = await User.find({
            blockedUsers: currentUser._id
        }).select('_id').lean();
        const blockerIds = usersWhoBlockedMe.map(u => u._id);

        const query = {
            _id: {
                $ne: currentUser._id,
                $nin: [...blockedUserIds, ...blockerIds]
            },
            role: 'female',
            approvalStatus: 'approved',
            isBlocked: { $ne: true },
            isActive: true,
            isDeleted: false,
        };

        // Filter and Sort options
        let sortOption = { isOnline: -1, lastSeen: -1 };

        if (filter === 'online') {
            query.isOnline = true;
            sortOption = { lastSeen: -1 };
        } else if (filter === 'new') {
            sortOption = { createdAt: -1 };
        } else if (filter === 'popular') {
            sortOption = { coinBalance: -1, lastSeen: -1 };
        } else if (filter === 'all') {
            sortOption = { isOnline: -1, lastSeen: -1 };
        }

        const nameField = language === 'hi' ? 'profile.name_hi' : 'profile.name_en';
        const bioField = language === 'hi' ? 'profile.bio_hi' : 'profile.bio_en';

        // Parallel execution of count and find
        const [users, total] = await Promise.all([
            User.find(query)
                .select(`profile.name profile.bio ${nameField} ${bioField} profile.age profile.photos profile.occupation profile.location isOnline lastSeen createdAt`)
                .sort(sortOption)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            User.countDocuments(query)
        ]);

        // Transform for frontend
        const profiles = users.map(user => {
            let distanceFormatted = 'Location not set';
            const userCoords = user.profile?.location?.coordinates?.coordinates;
            const hasUserCoords = userCoords && userCoords[0] !== 0 && userCoords[1] !== 0;

            if (hasCurrentUserCoords && hasUserCoords) {
                const distanceKm = calculateDistance(
                    { lat: currentUserCoords[1], lng: currentUserCoords[0] },
                    { lat: userCoords[1], lng: userCoords[0] }
                );
                distanceFormatted = formatDistance(distanceKm);
            }

            const name = (language === 'hi' ? user.profile?.name_hi : user.profile?.name_en) || user.profile?.name;
            const bio = (language === 'hi' ? user.profile?.bio_hi : user.profile?.bio_en) || user.profile?.bio;

            return {
                id: user._id,
                name: name || 'Anonymous',
                age: user.profile?.age,
                avatar: user.profile?.photos?.[0]?.url || null,
                bio: bio,
                occupation: user.profile?.occupation,
                isOnline: user.isOnline,
                distance: distanceFormatted,
                chatCost: 50,
            };
        });

        const responseData = {
            profiles,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        };

        // Cache first page
        if (parseInt(page) === 1) {
            memoryCache.set(cacheKey, responseData, CACHE_TTL.DISCOVER);
        }

        res.status(200).json({
            status: 'success',
            data: responseData
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get a specific user's profile by ID
 */
export const getUserById = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await User.findOne({
            _id: userId,
            isActive: true,
            isDeleted: false
        })
            .select('profile isOnline lastSeen role approvalStatus phoneNumber verificationDocuments createdAt isVerified isBlocked')
            .lean();

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }

        // Only return approved females or any user to admin
        if (user.role === 'female' && user.approvalStatus !== 'approved' && req.user.role !== 'admin') {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }

        // Use req.user from auth middleware
        const currentUser = req.user;
        const currentUserCoords = currentUser?.profile?.location?.coordinates?.coordinates;
        const hasCurrentUserCoords = currentUserCoords && currentUserCoords[0] !== 0 && currentUserCoords[1] !== 0;

        let distanceFormatted = 'Location not set';
        let exactLocation = null;

        const targetUserCoords = user.profile?.location?.coordinates?.coordinates;
        const hasTargetUserCoords = targetUserCoords && targetUserCoords[0] !== 0 && targetUserCoords[1] !== 0;

        if (currentUser?.role === 'admin') {
            exactLocation = user.profile?.location?.city || null;
        } else if (hasCurrentUserCoords && hasTargetUserCoords) {
            const distanceKm = calculateDistance(
                { lat: currentUserCoords[1], lng: currentUserCoords[0] },
                { lat: targetUserCoords[1], lng: targetUserCoords[0] }
            );
            distanceFormatted = formatDistance(distanceKm);
        }

        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    name: user.profile?.name || 'Anonymous',
                    age: user.profile?.age,
                    avatar: user.profile?.photos?.[0]?.url || null,
                    photos: user.profile?.photos || [],
                    bio: user.profile?.bio,
                    occupation: user.profile?.occupation,
                    city: user.profile?.location?.city || '',
                    ...(currentUser?.role === 'admin' ? { location: exactLocation } : { distance: distanceFormatted }),
                    interests: user.profile?.interests || [],
                    isOnline: user.isOnline,
                    lastSeen: user.lastSeen,
                    phoneNumber: currentUser?.role === 'admin' ? user.phoneNumber : undefined,
                    role: user.role,
                    approvalStatus: user.approvalStatus,
                    verificationDocuments: currentUser?.role === 'admin' ? (user.verificationDocuments || {}) : undefined,
                    createdAt: currentUser?.role === 'admin' ? user.createdAt : undefined,
                    isVerified: currentUser?.role === 'admin' ? user.isVerified : undefined,
                    isBlocked: currentUser?.role === 'admin' ? user.isBlocked : undefined
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get public platform settings (costs, limits)
 */
export const getAppSettings = async (req, res, next) => {
    try {
        const { default: AppSettings } = await import('../../models/AppSettings.js');
        const settings = await AppSettings.getSettings();

        res.status(200).json({
            status: 'success',
            data: { settings }
        });
    } catch (error) {
        next(error);
    }
};
