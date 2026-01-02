/**
 * Auth Service - Authentication Logic
 * @owner: Sujal
 * @purpose: Handle user registration and login
 */

import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import { getEnvConfig } from '../../config/env.js';
import { BadRequestError, UnauthorizedError } from '../../utils/errors.js';

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

        const user = await User.findOne({ phoneNumber: normalizedPhone });
        if (!user) {
            console.log('[AUTH] User not found for phone:', normalizedPhone);
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

    // BYPASS LOGIC (123456 Bypass active ONLY for Admin)
    const isAdmin = user.role === 'admin';
    const isBypass = otpCode === '123456' && isAdmin;

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

    // Check if user already exists
    const existingUser = await User.findOne({ phoneNumber: normalizedPhone });
    if (existingUser) {
        throw new BadRequestError('Phone number already in use. Please login.');
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

export const verifySignupOtp = async (phoneNumber, otpCode) => {
    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    // For signup, we check the otpRecord first
    const otpRecord = await Otp.findOne({ phoneNumber: normalizedPhone, type: 'signup' });

    if (!otpRecord) {
        throw new BadRequestError('OTP not requested or expired');
    }

    // BYPASS LOGIC Check role from pending signup data
    const isBypass = otpCode === '123456' && otpRecord.signupData?.role === 'admin';

    if (!isBypass) {
        if (otpRecord.otp !== otpCode) {
            throw new BadRequestError('Invalid OTP');
        }
    }

    const userData = otpRecord.signupData;
    if (!userData) {
        throw new BadRequestError('Session expired. Please sign up again.');
    }

    const { role, name, age, aadhaarCardUrl, location, bio, interests, photos } = userData;

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
        }
    };

    // Female-specific setup
    if (role === 'female') {
        // Need to ensure aadhaarUrl is present if role is female - actually validated in request step ideally?
        // But let's re-check or use what we have.

        userPayload.verificationDocuments = {
            aadhaarCard: {
                url: aadhaarCardUrl || '',
                uploadedAt: new Date(),
                verified: false
            }
        };
        userPayload.approvalStatus = 'pending';
        userPayload.isVerified = false;
    }

    // Create user
    const newUser = await User.create(userPayload);

    // Clear OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    return newUser;
};

export const generateToken = (userId) => {
    return signToken(userId);
};
