/**
 * SMS India Hub Service
 * @purpose: Integration for sending OTP and notifications via SMS India Hub
 */

import axios from 'axios';
import { getEnvConfig } from '../../config/env.js';
import AppSettings from '../../models/AppSettings.js';

const config = getEnvConfig();

const SMS_API_KEY = config.smsHubApiKey;
const SMS_SENDER_ID = config.smsHubSenderId || 'TXTSMS';
const SMS_ENTITY_ID = config.smsHubEntityId;
const SMS_OTP_TEMPLATE_ID = config.smsHubOtpTemplateId;
const SMS_API_URL = 'https://cloud.smsindiahub.in/api/mt/SendSMS';

/**
 * Send SMS using SMS India Hub
 * @param {string} mobile - 10-digit mobile number OR with 91 prefix
 * @param {string} message - Message content
 * @param {string} templateId - DLT Template ID (Required for Indian SMS)
 */
export const sendSMS = async (mobile, message, templateId) => {
    try {
        if (!SMS_API_KEY) {
            console.warn('[SMS-SERVICE] Mobile Hub API Key not found. Skipping SMS send.');
            return { success: false, error: 'API Key missing' };
        }

        // Ensure mobile is in 10-digit format for the API or as required by provider
        // SMS India Hub usually expects 91 prefix for India
        let formattedMobile = mobile;
        if (mobile.startsWith('+')) formattedMobile = mobile.substring(1);
        if (formattedMobile.length === 10) formattedMobile = '91' + formattedMobile;

        const params = {
            APIKey: SMS_API_KEY,
            senderid: SMS_SENDER_ID,
            channel: 2, // 2 for Transactional/OTP
            DCS: 0,
            flashsms: 0,
            number: formattedMobile,
            text: message,
            route: 1, // Route 1 is usually for Transactional
        };

        // Add DLT Template ID if provided
        if (templateId) {
            params.EntityId = SMS_ENTITY_ID;
            params.DltTemplateId = templateId;
        }

        console.log(`[SMS-SERVICE] Sending SMS to ${formattedMobile}...`);

        const response = await axios.get(SMS_API_URL, { params });

        console.log('[SMS-SERVICE] Response:', response.data);

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('[SMS-SERVICE] Error sending SMS:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Send OTP specifically
 * @param {string} mobile 
 * @param {string} otp 
 */
export const sendOTP = async (mobile, otp) => {
    // DLT Template: Welcome to the ##var## powered by SMSINDIAHUB. Your OTP for registration is ##var##
    // Template ID: 1007801291964877107
    // First ##var## = Platform Name
    // Second ##var## = OTP Code
    const templateId = SMS_OTP_TEMPLATE_ID;

    // Use HETNAZ as platform name (matches approved DLT template format)
    const platformName = 'HETNAZ';
    const message = `Welcome to the ${platformName} powered by SMSINDIAHUB. Your OTP for registration is ${otp}`;

    return await sendSMS(mobile, message, templateId);
};
