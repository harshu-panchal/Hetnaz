import User from '../../models/User.js';
import Chat from '../../models/Chat.js';
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

        // Import models
        const Chat = (await import('../../models/Chat.js')).default;
        const Transaction = (await import('../../models/Transaction.js')).default;
        const Withdrawal = (await import('../../models/Withdrawal.js')).default;
        const DeletedAccount = (await import('../../models/DeletedAccount.js')).default;

        // Gather statistics before deletion
        const [totalChats, totalTransactions, totalWithdrawals] = await Promise.all([
            Chat.countDocuments({ 'participants.userId': userId }),
            Transaction.countDocuments({ userId }),
            Withdrawal.countDocuments({ userId })
        ]);

        const totalEarnings = await Transaction.aggregate([
            { $match: { userId: user._id, direction: 'credit', status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amountCoins' } } }
        ]);

        const totalSpent = await Transaction.aggregate([
            { $match: { userId: user._id, direction: 'debit', status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amountCoins' } } }
        ]);

        // Create DeletedAccount record for audit
        await DeletedAccount.create({
            phoneNumber: user.phoneNumber,
            name: user.profile?.name || user.profile?.name_en || 'Unknown',
            email: user.email,
            role: user.role,
            deletionSnapshot: {
                userId: user._id,
                coinBalance: user.coinBalance || 0,
                totalEarnings: totalEarnings[0]?.total || 0,
                totalSpent: totalSpent[0]?.total || 0,
                totalChats,
                totalMatches: 0, // Can be enhanced if you have a matches collection
                registrationDate: user.createdAt,
                approvalStatus: user.approvalStatus,
            },
            deletedBy: 'self',
        });

        // Delete all user data (hard delete for clean slate on re-registration)
        await Promise.all([
            // Delete all chats where user is a participant
            Chat.deleteMany({ 'participants.userId': userId }),
            // Delete all transactions
            Transaction.deleteMany({ userId }),
            // Delete all withdrawals
            Withdrawal.deleteMany({ userId }),
            // Delete messages (if you have a separate Message collection)
            // Message.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }] }),
        ]);

        // Finally, delete the user account
        await User.findByIdAndDelete(userId);

        res.status(200).json({
            status: 'success',
            message: 'Account and all associated data deleted successfully'
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

        // Performance: Reduce cache time for online filter to keep it fresh
        const isOnlineFilter = filter === 'online';
        const cacheTTL = isOnlineFilter ? 10 : CACHE_TTL.DISCOVER; // 10s for online, 30s otherwise

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
        const currentUserId = currentUser._id || currentUser.id;
        const blockedUserIds = currentUser?.blockedUsers || [];
        const currentUserCoords = currentUser?.profile?.location?.coordinates?.coordinates;
        const hasCurrentUserCoords = currentUserCoords && currentUserCoords[0] !== 0 && currentUserCoords[1] !== 0;

        // Parallelize helper queries for speed
        const [usersWhoBlockedMe, activeChats] = await Promise.all([
            User.find({ blockedUsers: currentUserId }).select('_id').lean(),
            Chat.find({
                'participants.userId': currentUserId,
                isActive: true
            }).select('participants.userId').lean()
        ]);

        const blockerIds = usersWhoBlockedMe.map(u => u._id);
        const exclusions = [...blockedUserIds, ...blockerIds];

        // Identify users with whom we already have a chat
        const chattedUserIds = new Set(
            activeChats.map(chat =>
                chat.participants.find(p => p.userId.toString() !== currentUserId.toString())?.userId?.toString()
            ).filter(Boolean)
        );

        const query = {
            _id: {
                $ne: currentUserId,
                $nin: exclusions
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
            // Priority: Online > Popularity (Balance) > Last Seen
            sortOption = { isOnline: -1, coinBalance: -1, lastSeen: -1 };
        } else if (filter === 'all') {
            sortOption = { isOnline: -1, lastSeen: -1 };
        }

        const nameField = language === 'hi' ? 'profile.name_hi' : 'profile.name_en';
        const bioField = language === 'hi' ? 'profile.bio_hi' : 'profile.bio_en';

        // Parallel execution of count and find (Main Query)
        const [users, total] = await Promise.all([
            User.find(query)
                .select(`profile.name profile.bio ${nameField} ${bioField} profile.age profile.photos profile.occupation profile.location isOnline lastSeen createdAt coinBalance`)
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
                hasChat: chattedUserIds.has(user._id.toString()), // Tag existing chats
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

        // Cache result (shorter TTL for online)
        if (parseInt(page) === 1) {
            memoryCache.set(cacheKey, responseData, cacheTTL);
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
