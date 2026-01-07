/**
 * Firebase Cloud Messaging (FCM) Configuration and Initialization
 * @purpose: Handle push notifications for the web app
 */

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

console.log('[FCM] 🚀 Initializing Firebase Cloud Messaging module...');

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

console.log('[FCM] 📋 Firebase Config Loaded:', {
    projectId: firebaseConfig.projectId || '❌ MISSING',
    messagingSenderId: firebaseConfig.messagingSenderId || '❌ MISSING',
    appId: firebaseConfig.appId ? '✅ Present' : '❌ MISSING',
    fullConfig: firebaseConfig
});

// VAPID Public Key for FCM
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;
console.log('[FCM] 🔑 VAPID Key:', VAPID_KEY ? '✅ Present' : '❌ MISSING');

let app: ReturnType<typeof initializeApp> | undefined;
let messaging: ReturnType<typeof getMessaging> | undefined;

try {
    // Initialize Firebase
    console.log('[FCM] 🔧 Initializing Firebase app...');
    app = initializeApp(firebaseConfig);
    console.log('[FCM] ✅ Firebase app initialized successfully');

    // Initialize Firebase Cloud Messaging
    console.log('[FCM] 🔧 Getting Firebase Messaging instance...');
    messaging = getMessaging(app);
    console.log('[FCM] ✅ Firebase Messaging initialized successfully');
} catch (error) {
    console.error('[FCM] ❌ Firebase initialization error:', error);
    console.error('[FCM] ❌ Error details:', {
        message: (error as Error).message,
        code: (error as { code?: string }).code,
        stack: (error as Error).stack
    });
}

/**
 * Request notification permission from the user
 * @returns {Promise<string>} Permission status: 'granted', 'denied', or 'default'
 */
export const requestNotificationPermission = async () => {
    console.log('[FCM] 📢 === REQUESTING NOTIFICATION PERMISSION ===');

    // Check if notifications are supported
    if (!('Notification' in window)) {
        console.error('[FCM] ❌ This browser does not support notifications');
        return 'denied';
    }

    console.log('[FCM] 📊 Current permission status:', Notification.permission);

    // If already granted, return early
    if (Notification.permission === 'granted') {
        console.log('[FCM] ✅ Permission already granted');
        return 'granted';
    }

    // If already denied, return early
    if (Notification.permission === 'denied') {
        console.warn('[FCM] ⚠️ Permission was previously denied');
        return 'denied';
    }

    try {
        console.log('[FCM] 🔔 Requesting permission from user...');
        const permission = await Notification.requestPermission();
        console.log('[FCM] 📊 Permission response:', permission);

        if (permission === 'granted') {
            console.log('[FCM] ✅ User granted notification permission!');
        } else {
            console.warn('[FCM] ⚠️ User denied notification permission');
        }

        return permission;
    } catch (error) {
        console.error('[FCM] ❌ Error requesting permission:', error);
        return 'denied';
    }
};

/**
 * Get FCM token for the device
 * @param {string} userId - User ID to associate with the token
 * @returns {Promise<string|null>} FCM token or null if failed
 */
export const getFCMToken = async (userId: string): Promise<string | null> => {
    console.log('[FCM] 🎟️ === GETTING FCM TOKEN ===');
    console.log('[FCM] 👤 User ID:', userId);

    if (!messaging) {
        console.error('[FCM] ❌ Messaging not initialized. Cannot get token.');
        return null;
    }

    if (!VAPID_KEY) {
        console.error('[FCM] ❌ VAPID key is missing. Cannot get token.');
        return null;
    }

    try {
        // Request permission first
        console.log('[FCM] 1️⃣ Requesting notification permission...');
        const permission = await requestNotificationPermission();

        if (permission !== 'granted') {
            console.warn('[FCM] ⚠️ Cannot get token without permission');
            return null;
        }

        console.log('[FCM] 2️⃣ Getting FCM token from Firebase...');
        console.log('[FCM] 📋 VAPID Key:', VAPID_KEY.substring(0, 20) + '...');

        const token = await getToken(messaging, { vapidKey: VAPID_KEY });

        if (token) {
            console.log('[FCM] ✅ FCM Token received successfully!');
            console.log('[FCM] 🎟️ Token (first 30 chars):', token.substring(0, 30) + '...');
            console.log('[FCM] 📏 Token length:', token.length);
            console.log('[FCM] 🎟️ Full Token:', token);
            return token;
        } else {
            console.warn('[FCM] ⚠️ No token received from Firebase');
            return null;
        }
    } catch (error) {
        console.error('[FCM] ❌ Error getting FCM token:', error);
        console.error('[FCM] ❌ Error details:', {
            message: (error as Error).message,
            code: (error as { code?: string }).code,
            name: (error as Error).name,
            stack: (error as Error).stack
        });
        return null;
    }
};

/**
 * Save FCM token to backend
 * @param {string} token - FCM token
 * @param {Function} apiCall - Function to call backend API
 * @returns {Promise<boolean>} Success status
 */
export const saveFCMTokenToBackend = async (token: string, apiCall: { post: (url: string, data: object) => Promise<{ data: { status: string } }> }): Promise<boolean> => {
    console.log('[FCM] 💾 === SAVING TOKEN TO BACKEND ===');
    console.log('[FCM] 🎟️ Token to save:', token.substring(0, 30) + '...');

    try {
        console.log('[FCM] 📤 Sending POST request to /api/fcm/register...');
        const response = await apiCall.post('/fcm/register', { fcmToken: token });

        console.log('[FCM] 📥 Backend response:', response.data);

        if (response.data.status === 'success') {
            console.log('[FCM] ✅ Token saved to backend successfully!');
            return true;
        } else {
            console.warn('[FCM] ⚠️ Unexpected response from backend:', response.data);
            return false;
        }
    } catch (error) {
        console.error('[FCM] ❌ Error saving token to backend:', error);
        console.error('[FCM] ❌ Error response:', (error as { response?: { data?: unknown } }).response?.data);
        console.error('[FCM] ❌ Error status:', (error as { response?: { status?: number } }).response?.status);
        return false;
    }
};

/**
 * Handle foreground messages (when app is open)
 * @param {Function} callback - Callback to handle the message
 */
export const onForegroundMessage = (callback: (payload: { notification?: { title?: string; body?: string }; data?: Record<string, string> }) => void): void => {
    console.log('[FCM] 👂 Setting up foreground message listener...');

    if (!messaging) {
        console.error('[FCM] ❌ Messaging not initialized. Cannot listen for messages.');
        return;
    }

    onMessage(messaging, (payload) => {
        console.log('[FCM] 📨 === FOREGROUND MESSAGE RECEIVED ===');
        console.log('[FCM] 📦 Full payload:', payload);
        console.log('[FCM] 📋 Notification:', payload.notification);
        console.log('[FCM] 📋 Data:', payload.data);

        if (payload.notification) {
            console.log('[FCM] 📢 Title:', payload.notification.title);
            console.log('[FCM] 📝 Body:', payload.notification.body);
        }

        callback(payload);
    });

    console.log('[FCM] ✅ Foreground message listener registered');
};

/**
 * Show browser notification
 * @param {string} title - Notification title
 * @param {object} options - Notification options
 */
export const showNotification = (title: string, options: NotificationOptions = {}): void => {
    console.log('[FCM] 🔔 === SHOWING BROWSER NOTIFICATION ===');
    console.log('[FCM] 📢 Title:', title);
    console.log('[FCM] 📋 Options:', options);

    if (!('Notification' in window)) {
        console.error('[FCM] ❌ Browser does not support notifications');
        return;
    }

    if (Notification.permission !== 'granted') {
        console.warn('[FCM] ⚠️ No permission to show notification');
        return;
    }

    try {
        const notification = new Notification(title, options);
        console.log('[FCM] ✅ Notification created:', notification);

        notification.onclick = (event) => {
            console.log('[FCM] 👆 Notification clicked:', event);
            window.focus();
            notification.close();
        };
    } catch (error) {
        console.error('[FCM] ❌ Error showing notification:', error);
    }
};

export default {
    requestNotificationPermission,
    getFCMToken,
    saveFCMTokenToBackend,
    onForegroundMessage,
    showNotification,
};
