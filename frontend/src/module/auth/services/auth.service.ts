// @ts-nocheck
/**
 * Auth Service
 * @owner: Sujal
 * @purpose: Handle authentication API calls
 */

import axios from 'axios';
import { SignupData, LoginData, OnboardingData, BasicProfileData, InterestsData } from '../types/auth.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Register a new user
 */
/**
 * Request OTP for signup with pre-formatted payload
 */
export const requestSignupOtp = async (payload: any) => {
    try {
        console.log('Requesting Signup OTP with payload:', payload);
        const response = await axios.post(`${API_URL}/auth/signup-request`, payload);
        return response.data;
    } catch (error: any) {
        console.error('Registration failed:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Registration failed');
    }
};

/**
 * Register a new user (Legacy wrapper, constructs payload then calls requestSignupOtp)
 */
export const registerUser = async (onboardingData: {
    signup: SignupData;
    basicProfile: BasicProfileData;
    interests: InterestsData;
    aadhaarCardUrl?: string;
}) => {
    const payload = formatSignupPayload(onboardingData);
    return requestSignupOtp(payload);
};

export const formatSignupPayload = (onboardingData: {
    signup: SignupData;
    basicProfile: BasicProfileData;
    interests: InterestsData;
    aadhaarCardUrl?: string;
}) => {
    const { signup, basicProfile, interests, aadhaarCardUrl } = onboardingData;

    return {
        phoneNumber: signup.phone,
        role: basicProfile.gender === 'female' ? 'female' : 'male',
        name: signup.fullName,
        age: calculateAge(basicProfile.dateOfBirth),
        aadhaarCardUrl: aadhaarCardUrl,
        location: basicProfile.location,
        bio: interests.bio,
        interests: interests.interests,
        photos: interests.photos
    };
};

export const loginWithOtp = async (phoneNumber: string) => {
    try {
        // Enforce 91 prefix for backend consistency
        const formattedPhone = phoneNumber.length === 10 ? `91${phoneNumber}` : phoneNumber;
        const response = await axios.post(`${API_URL}/auth/login-request`, { phoneNumber: formattedPhone });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Login failed');
    }
};

/**
 * Helper to calculate age from DOB
 */
export const calculateAge = (dob: string): number => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};
