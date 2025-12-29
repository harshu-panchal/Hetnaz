/**
 * Agora Token Service - Generate RTC Tokens for Video Calls
 * @owner: Video Call Feature
 * @purpose: Securely generate Agora RTC tokens for video calling
 */

import pkg from 'agora-token';
const { RtcTokenBuilder, RtcRole } = pkg;
import logger from '../../utils/logger.js';

// Environment config
const AGORA_APP_ID = process.env.AGORA_APP_ID;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

// Token expiry (24 hours in seconds - Agora recommends short-lived tokens)
const TOKEN_EXPIRY_SECONDS = 86400;

/**
 * Generate an Agora RTC token for a video call
 * @param {string} channelName - Unique channel name (typically callId)
 * @param {string} uid - User ID (numeric string or 0 for auto-assign)
 * @param {string} role - 'publisher' (can send/receive) or 'subscriber' (receive only)
 * @returns {string} RTC token
 */
export const generateRtcToken = (channelName, uid, role = 'publisher') => {
    console.log('🎥 Generating Agora token...');
    console.log('   Channel:', channelName);
    console.log('   UID:', uid);
    console.log('   Role:', role);
    console.log('   App ID exists:', !!AGORA_APP_ID);
    console.log('   Certificate exists:', !!AGORA_APP_CERTIFICATE);

    if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
        logger.error('❌ Agora credentials not configured');
        logger.error('   AGORA_APP_ID:', AGORA_APP_ID ? 'SET' : 'MISSING');
        logger.error('   AGORA_APP_CERTIFICATE:', AGORA_APP_CERTIFICATE ? 'SET' : 'MISSING');
        throw new Error('Video calling is not configured');
    }

    const agoraRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

    // Token expiry timestamp
    const privilegeExpiredTs = Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_SECONDS;

    // Generate token
    // Using buildTokenWithUid for string/numeric UID
    const token = RtcTokenBuilder.buildTokenWithUid(
        AGORA_APP_ID,
        AGORA_APP_CERTIFICATE,
        channelName,
        parseInt(uid) || 0, // Agora uses numeric UIDs
        agoraRole,
        privilegeExpiredTs,
        privilegeExpiredTs
    );

    logger.info(`✅ Agora token generated for channel: ${channelName}, uid: ${uid}`);

    return token;
};

/**
 * Get Agora App ID (safe to expose to client)
 * @returns {string} Agora App ID
 */
export const getAppId = () => {
    return AGORA_APP_ID;
};

/**
 * Validate Agora configuration
 * @returns {boolean} True if configured
 */
export const isConfigured = () => {
    return !!(AGORA_APP_ID && AGORA_APP_CERTIFICATE);
};

export default {
    generateRtcToken,
    getAppId,
    isConfigured,
};
