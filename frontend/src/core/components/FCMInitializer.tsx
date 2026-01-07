/**
 * FCM Initializer Component (OPTIMIZED)
 * - Runs ONCE per session using sessionStorage flag
 * - Fire-and-forget token saving
 * - NO blocking operations
 */

import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import fcmService from '../services/fcm.service';
import apiClient from '../api/client';

const FCM_SESSION_KEY = 'fcm_initialized_session';

export const FCMInitializer = () => {
    const { user } = useAuth();
    const initAttempted = useRef(false);

    useEffect(() => {
        // Guard: Only run if user is logged in
        if (!user?.id) return;

        // Guard: Only run ONCE per session
        if (initAttempted.current) return;
        if (sessionStorage.getItem(FCM_SESSION_KEY) === user.id) return;

        initAttempted.current = true;

        // Mark session as initialized immediately (prevents re-entry)
        sessionStorage.setItem(FCM_SESSION_KEY, user.id);

        // Run FCM setup in background (non-blocking)
        const initFCM = async () => {
            try {
                const token = await fcmService.getFCMToken(user.id);
                if (token) {
                    // Fire and forget - backend handles async
                    fcmService.saveFCMTokenToBackend(token, apiClient).catch(() => { });
                    fcmService.onForegroundMessage((payload: any) => {
                        const title = payload.notification?.title || 'New Message';
                        const body = payload.notification?.body || 'You have a notification';
                        fcmService.showNotification(title, { body, icon: '/logo-192x192.png' });
                    });
                }
            } catch (e) {
                // Silent fail - FCM is non-critical
            }
        };

        // Delay FCM init by 5 seconds to prioritize dashboard
        const timeoutId = setTimeout(initFCM, 5000);
        return () => clearTimeout(timeoutId);
    }, [user?.id]);

    return null;
};
