/**
 * Auth Service - Authentication Logic
 * @owner: Sujal
 * @purpose: Handle user registration and login
 */

import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import { getEnvConfig } from '../../config/env.js';
import { BadRequestError, UnauthorizedError } from '../../utils/errors.js';
import { normalizeReferralCode, generateReferralId } from '../../utils/referral.js';
import AppSettings from '../../models/AppSettings.js';
import relationshipManager from '../../core/relationships/relationshipManager.js';
import mongoose from 'mongoose';

const { jwtSecret, jwtExpiresIn } = getEnvConfig();

const signToken = (id) => {
    return jwt.sign({ id }, jwtSecret, {
        expiresIn: jwtExpiresIn,
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

import Otp from '../../models/Otp.js';
import { normalizePhoneNumber } from '../../utils/phoneNumber.js';
import * as smsService from '../sms/smsHubService.js';

// Helper to generate numeric OTP
const generateNumericOtp = (length = 4) => {
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10).toString();
    }
    return otp;
};

export const requestLoginOtp = async (phoneNumber) => {
    try {
        console.log('[AUTH] requestLoginOtp called with:', phoneNumber);

        // Normalize phone number (accepts 10 digits, 91+10 digits, or +91+10 digits)
        const normalizedPhone = normalizePhoneNumber(phoneNumber);
        console.log('[AUTH] Normalized phone:', normalizedPhone);

        const user = await User.findOne({ phoneNumber: normalizedPhone, isDeleted: false });
        if (!user) {
            console.log('[AUTH] User not found or account deleted for phone:', normalizedPhone);
            throw new BadRequestError('User not found. Please sign up first.');
        }

        const otp = generateNumericOtp(6);

        // Save/Update OTP
        await Otp.findOneAndUpdate(
            { phoneNumber: normalizedPhone, type: 'login' },
            { otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
            { upsert: true, new: true }
        );

        // Send via SMS provider
        await smsService.sendOTP(normalizedPhone, otp);
        console.log(`[OTP-LOGIN] Mobile: ${normalizedPhone}, Code: ${otp}`);

        return { message: 'OTP sent successfully' };
    } catch (error) {
        console.error('[AUTH] requestLoginOtp error:', error.message);
        throw error;
    }
};

export const verifyLoginOtp = async (phoneNumber, otpCode) => {
    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    const user = await User.findOne({ phoneNumber: normalizedPhone });
    if (!user) {
        throw new BadRequestError('User not found');
    }

    // Import AppSettings dynamically to get admin secret
    const AppSettings = (await import('../../models/AppSettings.js')).default;
    const settings = await AppSettings.getSettings();
    const adminSecret = settings.adminSecret || '123456';

    // BYPASS LOGIC (Admin secret bypass active for Admin and specific test numbers)
    const isAdmin = user.role === 'admin';
    const isBypassNumber = ['911234567899', '911234567895'].includes(normalizedPhone);
    const isBypass = otpCode === adminSecret && (isAdmin || isBypassNumber);

    if (!isBypass) {
        const otpRecord = await Otp.findOne({ phoneNumber: normalizedPhone, type: 'login', otp: otpCode });
        if (!otpRecord) {
            throw new BadRequestError('Invalid or expired OTP');
        }
        // Clear OTP
        await Otp.deleteOne({ _id: otpRecord._id });
    }

    return user;
};

export const requestSignupOtp = async (userData) => {
    const { phoneNumber } = userData;

    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    // Check if user already exists and is not deleted
    const existingUser = await User.findOne({ phoneNumber: normalizedPhone });
    if (existingUser && !existingUser.isDeleted) {
        throw new BadRequestError('Phone number already in use. Please login.');
    }

    // If user existed but was deleted, we can proceed (they will be "overwritten" or a new record created if we handle IDs correctly)
    // Actually, since phoneNumber is unique, we should probably delete the old record or update it.
    // Given the complexity of relationships, it might be safer to hard delete the old record if it was already soft-deleted.
    if (existingUser && existingUser.isDeleted) {
        await User.deleteOne({ _id: existingUser._id });
    }

    const otp = generateNumericOtp(6);

    // Update userData with normalized phone
    const normalizedUserData = { ...userData, phoneNumber: normalizedPhone };

    // Save/Update OTP with pending data
    await Otp.findOneAndUpdate(
        { phoneNumber: normalizedPhone, type: 'signup' },
        {
            otp,
            signupData: normalizedUserData,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        },
        { upsert: true, new: true }
    );

    // Send via SMS provider
    await smsService.sendOTP(normalizedPhone, otp);
    console.log(`[OTP-SIGNUP] Mobile: ${normalizedPhone}, Code: ${otp}`);

    return { message: 'OTP sent successfully' };
};

export const verifySignupOtp = async (phoneNumber, otpCode, io = null) => {
    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    // For signup, we check the otpRecord first
    const otpRecord = await Otp.findOne({ phoneNumber: normalizedPhone, type: 'signup' });

    if (!otpRecord) {
        throw new BadRequestError('OTP not requested or expired');
    }

    // BYPASS LOGIC Check role from pending signup data or specific test numbers
    const isBypassNumber = ['911234567899', '911234567895'].includes(normalizedPhone);
    const isBypass = otpCode === '123456' && (otpRecord.signupData?.role === 'admin' || isBypassNumber);

    if (!isBypass) {
        if (otpRecord.otp !== otpCode) {
            throw new BadRequestError('Invalid OTP');
        }
    }

    const userData = otpRecord.signupData;
    if (!userData) {
        throw new BadRequestError('Session expired. Please sign up again.');
    }

    const { role, name, age, aadhaarCardUrl, location, bio, interests, photos, referralCode } = userData;

    // Normalize referral code if provided
    const normalizedReferralCode = normalizeReferralCode(referralCode);
    let referrer = null;

    if (normalizedReferralCode) {
        referrer = await User.findOne({ referralId: normalizedReferralCode, isDeleted: false });
        if (!referrer) {
            // User typed it wrong or it doesn't exist - but as per requirement, we should show error if wrong
            // Except for casing and spacing which are already handled by normalizeReferralCode
            throw new BadRequestError('Invalid referral ID. Please check and try again.');
        }
    }

    // CRITICAL: Auto-translate name and bio for caching (cost optimization)
    // This translates once on signup and caches both languages in DB
    const { translateProfileData } = await import('../translate/translateService.js');
    const translatedProfile = await translateProfileData({ name, bio });

    // Build user object with cached translations
    const userPayload = {
        phoneNumber,
        role,
        genderPreference: role === 'male' ? 'female' : 'male', // Logic: Male -> Female, Female -> Male
        profile: {
            name: translatedProfile.name,
            name_en: translatedProfile.name_en,
            name_hi: translatedProfile.name_hi,
            age,
            location: {
                city: location || '', // Basic string for now until full geo implementation
                // Default coordinates will be [0,0] from schema
            },
            bio: translatedProfile.bio,
            bio_en: translatedProfile.bio_en,
            bio_hi: translatedProfile.bio_hi,
            interests,
            photos: photos?.map((p, i) => ({
                url: p.url || p, // Handle both object and string formats
                isPrimary: i === 0,
                uploadedAt: new Date()
            }))
        },
        referredBy: referrer ? referrer._id : null,
        referralId: generateReferralId()
    };

    // Female-specific setup
    if (role === 'female') {
        userPayload.verificationDocuments = {
            aadhaarCard: {
                url: aadhaarCardUrl || '',
                uploadedAt: new Date(),
                verified: true // Auto-verified since auto-approved
            }
        };
        // Auto-approve female users on signup
        userPayload.approvalStatus = 'approved';
        userPayload.isVerified = true;
    }

    // Create user with session for transaction atomicity
    const session = await mongoose.startSession();
    session.startTransaction();

    let newUser;
    try {
        newUser = await User.create([userPayload], { session });
        newUser = newUser[0];

        // Process referral reward if referrer exists
        if (referrer) {
            const settings = await AppSettings.getSettings();
            if (settings.referral?.isEnabled && referrer.role === 'male') {
                const rewardAmount = settings.referral.rewardAmount || 200;

                await relationshipManager.updateUserBalanceWithTransaction(
                    referrer._id,
                    {
                        type: 'referral_bonus',
                        direction: 'credit',
                        amountCoins: rewardAmount,
                        description: `Referral bonus for inviting ${newUser.profile.name}`,
                        relatedEntityId: newUser._id,
                        status: 'completed'
                    },
                    session
                );

                // Increment referral count
                await User.findByIdAndUpdate(referrer._id, { $inc: { referralCount: 1 } }, { session });

                // Send non-disturbing notification (handled after transaction commit)
                // Use setImmediate to avoid blocking the auth flow
                setImmediate(async () => {
                    try {
                        const Notification = (await import('../../models/Notification.js')).default;
                        const notification = await Notification.create({
                            userId: referrer._id,
                            type: 'system',
                            title: 'Referral Successful! 🎉',
                            message: `You earned ${rewardAmount} coins for inviting ${newUser.profile.name}.`,
                            actionUrl: '/male/my-profile/referral'
                        });

                        // Emit real-time notification if io is available
                        if (io) {
                            const { emitNotification } = await import('../../socket/index.js');
                            emitNotification(io, referrer._id, notification);
                        }
                    } catch (err) {
                        console.error('Failed to send referral notification:', err);
                    }
                });
            }
        }

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }

    // Clear OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    return newUser;
};

export const generateToken = (userId) => {
    return signToken(userId);
};
