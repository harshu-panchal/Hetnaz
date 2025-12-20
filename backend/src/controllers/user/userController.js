import * as userService from '../../services/user/userService.js';
import User from '../../models/User.js';

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
        const user = await userService.getUserProfile(req.user.id);
        res.status(200).json({
            status: 'success',
            data: { user }
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

/**
 * Get approved female users for discover page - with caching
 */
export const discoverFemales = async (req, res, next) => {
    try {
        const { filter = 'all', limit = 20, page = 1 } = req.query;
        const cacheKey = `discover:females:${filter}:${page}:${limit}`;

        // Try cache first (but only for first page to keep it fresh)
        const { default: memoryCache, CACHE_TTL } = await import('../../core/cache/memoryCache.js');

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

        // Base query: approved, active females
        const query = {
            role: 'female',
            approvalStatus: 'approved',
            isBlocked: { $ne: true },
        };

        // Filter options
        let sortOption = { lastSeen: -1 };

        if (filter === 'online') {
            query.isOnline = true;
        } else if (filter === 'new') {
            sortOption = { createdAt: -1 };
        } else if (filter === 'popular') {
            sortOption = { coinBalance: -1 };
        }

        // Use lean() for faster read-only queries
        const users = await User.find(query)
            .select('profile.name profile.age profile.photos profile.bio profile.occupation profile.location.city isOnline lastSeen createdAt')
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        // Transform for frontend
        const profiles = users.map(user => ({
            id: user._id,
            name: user.profile?.name || 'Anonymous',
            age: user.profile?.age,
            avatar: user.profile?.photos?.[0]?.url || null,
            bio: user.profile?.bio,
            occupation: user.profile?.occupation,
            location: user.profile?.location?.city,
            isOnline: user.isOnline,
            distance: '-- km',
            chatCost: 50,
        }));

        const total = await User.countDocuments(query);

        const responseData = {
            profiles,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        };

        // Cache first page for 30 seconds
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

        const user = await User.findById(userId)
            .select('profile isOnline lastSeen role approvalStatus');

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
                    location: user.profile?.location?.city,
                    interests: user.profile?.interests || [],
                    isOnline: user.isOnline,
                    lastSeen: user.lastSeen,
                }
            }
        });
    } catch (error) {
        next(error);
    }
};
