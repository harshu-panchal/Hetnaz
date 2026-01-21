/**
 * Admin Controller
 * @owner: Sujal
 */

import * as adminService from '../../services/admin/adminService.js';
import Gift from '../../models/Gift.js';
import notificationScheduler from '../../jobs/notificationScheduler.js';

import fs from 'fs';
import path from 'path';

/**
 * Get admin dashboard statistics
 */
export const getDashboardStats = async (req, res, next) => {
    try {
        const { stats, charts, recentActivity } = await adminService.getDashboardStats();

        res.status(200).json({
            status: 'success',
            data: { stats, charts, recentActivity }
        });
    } catch (error) {
        next(error);
    }
};

export const getPendingFemales = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status || 'pending';

        const result = await adminService.getPendingFemales({ page, limit }, status);

        res.status(200).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const approveFemale = async (req, res, next) => {
    try {
        const { id } = req.params;
        // req.user.id is the admin ID from auth middleware
        const user = await adminService.approveFemale(id, req.user._id);

        // 👯 Notify nearby male users about new female (Fire-and-Forget)
        setImmediate(() => {
            notificationScheduler.notifyNearbyUsersAboutNewFemale(user)
                .catch(e => console.error('[NEARBY-ALERT] Notification failed:', e));
        });

        res.status(200).json({
            status: 'success',
            data: {
                user,
                message: 'Female user approved successfully'
            }
        });
    } catch (error) {
        next(error);
    }
};

export const rejectFemale = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                status: 'fail',
                message: 'Rejection reason is required'
            });
        }

        const user = await adminService.rejectFemale(id, req.user._id, reason);

        res.status(200).json({
            status: 'success',
            data: {
                user,
                message: 'Female user rejected'
            }
        });
    } catch (error) {
        next(error);
    }
};

export const requestResubmitFemale = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                status: 'fail',
                message: 'Reason for resubmission is required'
            });
        }

        const user = await adminService.requestResubmitFemale(id, req.user._id, reason);

        res.status(200).json({
            status: 'success',
            data: {
                user,
                message: 'Resubmission request sent to user'
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * List all users for admin
 */
export const listUsers = async (req, res, next) => {
    try {
        const filters = {
            search: req.query.search,
            role: req.query.role,
            status: req.query.status
        };
        const pagination = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 20
        };

        const result = await adminService.listUsers(filters, pagination);

        res.status(200).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * List all transactions for admin
 */
export const listTransactions = async (req, res, next) => {
    try {
        const filters = {
            search: req.query.search,
            type: req.query.type,
            status: req.query.status
        };
        const pagination = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 20
        };

        const result = await adminService.listTransactions(filters, pagination);

        res.status(200).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        next(error);
    }
};



/**
 * Get platform settings
 */
export const getAppSettings = async (req, res, next) => {
    try {
        const settings = await adminService.getAppSettings();

        res.status(200).json({
            status: 'success',
            data: { settings }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update platform settings
 */
export const updateAppSettings = async (req, res, next) => {
    try {
        const settings = await adminService.updateAppSettings(req.body, req.user._id);

        res.status(200).json({
            status: 'success',
            data: { settings }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * List all gifts with costs
 */
export const listGifts = async (req, res, next) => {
    try {
        const gifts = await Gift.find()
            .select('name category imageUrl cost isActive displayOrder')
            .sort({ displayOrder: 1, name: 1 });

        res.status(200).json({
            status: 'success',
            data: { gifts }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update gift cost
 */
export const updateGiftCost = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { cost } = req.body;

        if (typeof cost !== 'number' || cost < 0) {
            return res.status(400).json({
                status: 'fail',
                message: 'Valid cost is required (must be a positive number)'
            });
        }

        const gift = await Gift.findByIdAndUpdate(
            id,
            { cost },
            { new: true, runValidators: true }
        );

        if (!gift) {
            return res.status(404).json({
                status: 'fail',
                message: 'Gift not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: { gift }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Toggle user block status
 */
export const toggleBlockUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await adminService.toggleBlockUser(id, req.user._id);

        res.status(200).json({
            status: 'success',
            data: {
                user,
                message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Toggle user verification status
 */
export const toggleVerifyUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await adminService.toggleVerifyUser(id, req.user._id);

        res.status(200).json({
            status: 'success',
            data: {
                user,
                message: `User verification ${user.isVerified ? 'enabled' : 'disabled'} successfully`
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete user
 */
export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        await adminService.deleteUser(id, req.user._id);

        res.status(200).json({
            status: 'success',
            message: 'User deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new gift
 */
export const createGift = async (req, res, next) => {
    try {
        const { name, category, imageUrl, cost, description } = req.body;

        if (!name || !category || !imageUrl || typeof cost !== 'number') {
            return res.status(400).json({
                status: 'fail',
                message: 'Name, category, imageUrl, and cost are required'
            });
        }

        // Get max displayOrder for new gift
        const maxOrderGift = await Gift.findOne().sort({ displayOrder: -1 }).lean();
        const displayOrder = (maxOrderGift?.displayOrder || 0) + 1;

        const gift = await Gift.create({
            name,
            category,
            imageUrl,
            cost,
            description,
            displayOrder,
            isActive: true
        });

        res.status(201).json({
            status: 'success',
            data: { gift }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a gift
 */
export const deleteGift = async (req, res, next) => {
    try {
        const { id } = req.params;

        const gift = await Gift.findByIdAndDelete(id);

        if (!gift) {
            return res.status(404).json({
                status: 'fail',
                message: 'Gift not found'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Gift deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// ============== ADMIN PROFILE MANAGEMENT ==============
import User from '../../models/User.js';
import Otp from '../../models/Otp.js';
import * as smsService from '../../services/sms/smsHubService.js';
import { normalizePhoneNumber } from '../../utils/phoneNumber.js';
import AppSettings from '../../models/AppSettings.js';

// Helper to generate numeric OTP
const generateNumericOtp = (length = 6) => {
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10).toString();
    }
    return otp;
};

/**
 * Get admin profile (phone number and masked secret)
 */
export const getAdminProfile = async (req, res, next) => {
    try {
        const admin = await User.findById(req.user._id).select('phoneNumber profile');
        const settings = await AppSettings.getSettings();

        res.status(200).json({
            status: 'success',
            data: {
                phoneNumber: admin.phoneNumber,
                name: admin.profile?.name || 'Admin',
                // Mask the admin secret for security display
                secretMasked: settings.adminSecret ? '******' : 'Not Set',
                hasSecret: !!settings.adminSecret
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Request OTP for admin profile changes
 */
export const requestAdminOtp = async (req, res, next) => {
    try {
        const { phoneNumber, action } = req.body;

        if (!phoneNumber || !action) {
            return res.status(400).json({
                status: 'fail',
                message: 'Phone number and action are required'
            });
        }

        const normalizedPhone = normalizePhoneNumber(phoneNumber);
        const otp = generateNumericOtp(6);

        // Save OTP with action type
        await Otp.findOneAndUpdate(
            { phoneNumber: normalizedPhone, type: 'admin_profile' },
            {
                otp,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
                action // 'add_phone' or 'change_secret'
            },
            { upsert: true, new: true }
        );

        // Send via SMS provider
        await smsService.sendOTP(normalizedPhone, otp);
        console.log(`[ADMIN-OTP] Phone: ${normalizedPhone}, Code: ${otp}, Action: ${action}`);

        res.status(200).json({
            status: 'success',
            message: 'OTP sent successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update admin phone number (add another admin)
 */
export const updateAdminPhone = async (req, res, next) => {
    try {
        const { phoneNumber, otp } = req.body;

        if (!phoneNumber || !otp) {
            return res.status(400).json({
                status: 'fail',
                message: 'Phone number and OTP are required'
            });
        }

        const normalizedPhone = normalizePhoneNumber(phoneNumber);

        // Verify OTP
        const otpRecord = await Otp.findOne({
            phoneNumber: normalizedPhone,
            type: 'admin_profile',
            action: 'add_phone',
            otp
        });

        if (!otpRecord) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid or expired OTP'
            });
        }

        // Check if user already exists
        let adminUser = await User.findOne({ phoneNumber: normalizedPhone });

        if (adminUser) {
            // Update existing user to admin role
            adminUser.role = 'admin';
            await adminUser.save();
        } else {
            // Create new admin user
            adminUser = await User.create({
                phoneNumber: normalizedPhone,
                role: 'admin',
                isVerified: true,
                isActive: true,
                profile: {
                    name: 'Admin'
                }
            });
        }

        // Clear OTP
        await Otp.deleteOne({ _id: otpRecord._id });

        res.status(200).json({
            status: 'success',
            message: 'Admin phone number added successfully',
            data: { phoneNumber: normalizedPhone }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update admin secret key
 */
export const updateAdminSecret = async (req, res, next) => {
    try {
        const { phoneNumber, otp, newSecret } = req.body;

        if (!phoneNumber || !otp || !newSecret) {
            return res.status(400).json({
                status: 'fail',
                message: 'Phone number, OTP, and new secret are required'
            });
        }

        if (newSecret.length < 6) {
            return res.status(400).json({
                status: 'fail',
                message: 'Secret must be at least 6 characters'
            });
        }

        const normalizedPhone = normalizePhoneNumber(phoneNumber);

        // Verify the phone is the current admin's phone
        if (req.user.phoneNumber !== normalizedPhone) {
            return res.status(403).json({
                status: 'fail',
                message: 'You can only update secret using your own phone number'
            });
        }

        // Verify OTP
        const otpRecord = await Otp.findOne({
            phoneNumber: normalizedPhone,
            type: 'admin_profile',
            action: 'change_secret',
            otp
        });

        if (!otpRecord) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid or expired OTP'
            });
        }

        // Update the admin secret in AppSettings
        const settings = await AppSettings.getSettings();
        settings.adminSecret = newSecret;
        await settings.save();

        // Clear OTP
        await Otp.deleteOne({ _id: otpRecord._id });

        res.status(200).json({
            status: 'success',
            message: 'Admin secret updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get deleted accounts list
 */
export const getDeletedAccounts = async (req, res, next) => {
    try {
        const { search = '', role = 'all', page = 1, limit = 20 } = req.query;

        const result = await adminService.getDeletedAccounts(
            { search, role },
            { page, limit }
        );

        res.status(200).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        next(error);
    }
};
