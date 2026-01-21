/**
 * Video Call Context - Global Video Call State Provider
 * @purpose: Provide video call state and actions to all components
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import videoCallService, { CallState, VIDEO_CALL_PRICE, VIDEO_CALL_DURATION } from '../services/videoCall.service';
import { useGlobalState } from './GlobalStateContext';

interface VideoCallContextType {
    // State
    callState: CallState;
    isInCall: boolean;
    remainingTime: number;

    // Actions
    requestCall: (receiverId: string, receiverName: string, receiverAvatar: string, chatId: string, callerName: string, callerAvatar: string) => Promise<void>;
    acceptCall: () => Promise<void>;
    rejectCall: () => void;
    endCall: () => void;
    toggleMute: () => boolean;
    toggleCamera: () => boolean;
    rejoinCall: () => void;

    // Config
    callPrice: number;
    callDuration: number;
}

const VideoCallContext = createContext<VideoCallContextType | undefined>(undefined);

interface VideoCallProviderProps {
    children: ReactNode;
}

export const VideoCallProvider = ({ children }: VideoCallProviderProps) => {
    const { appSettings } = useGlobalState();
    console.log('📞📞📞 VideoCallProvider RENDERING');
    const [callState, setCallState] = useState<CallState>(videoCallService.getState());
    const [remainingTime, setRemainingTime] = useState(VIDEO_CALL_DURATION);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Initialize socket listeners on mount
    useEffect(() => {
        console.log('📞📞📞 VideoCallProvider useEffect RUNNING');
        videoCallService.setupSocketListeners();

        // Subscribe to state changes
        const unsubscribe = videoCallService.onStateChange((newState: CallState) => {
            setCallState(newState);

            // Sync remaining time when call is active or reconnecting
            if ((newState.status === 'connected' || newState.status === 'connecting') && newState.startTime) {
                const elapsed = Math.floor((Date.now() - newState.startTime) / 1000);
                const timeLeft = Math.max(0, newState.duration - elapsed);
                setRemainingTime(timeLeft);
            }

            // Clear timer when call ends
            // Clear timer when call ends
            if (newState.status === 'idle') {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }
                setRemainingTime(VIDEO_CALL_DURATION);
            }

            // Just stop the timer if ended, but keep value for UI
            if (newState.status === 'ended') {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }

                // Sync with server's remaining time if provided
                if (newState.remainingTimeFromServer !== undefined) {
                    setRemainingTime(newState.remainingTimeFromServer);
                }

                // Do NOT reset remainingTime here so UI can show it
                console.log('🛑 Call ended in Context - Final Time:', newState.remainingTimeFromServer ?? remainingTime);
            }
        });

        return () => {
            unsubscribe();
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    // Countdown timer when connected
    useEffect(() => {
        // Only run countdown if connected AND peer is NOT disconnected (interruption)
        const shouldCountDown = callState.status === 'connected' && !callState.isPeerDisconnected;

        if (shouldCountDown) {
            timerRef.current = setInterval(() => {
                setRemainingTime((prev) => {
                    if (prev <= 1) {
                        // Time's up - backend will force end
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [callState.status, callState.isPeerDisconnected]);

    // Actions
    const requestCall = useCallback(
        async (
            receiverId: string,
            receiverName: string,
            receiverAvatar: string,
            chatId: string,
            callerName: string,
            callerAvatar: string
        ): Promise<void> => {
            // Check permission state first (if supported)
            if (navigator.permissions && navigator.permissions.query) {
                try {
                    const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
                    const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });

                    if (cameraPermission.state === 'denied' || micPermission.state === 'denied') {
                        throw new Error('PERMISSION_DENIED_SETTINGS');
                    }
                } catch (permCheckError) {
                    // If permission query fails, continue to getUserMedia (fallback)
                    console.log('Permission query not supported, proceeding with getUserMedia');
                }
            }

            // Request permissions (triggers system dialog on first call, or fails if previously denied)
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                // Stop tracks immediately - we just needed permission
                stream.getTracks().forEach(track => track.stop());

                // Wait for camera to be fully released (critical for Android)
                await new Promise(resolve => setTimeout(resolve, 200));
            } catch (permError: any) {
                console.error('Permission denied:', permError);

                // Check if it's a permission error
                if (permError.name === 'NotAllowedError' || permError.name === 'PermissionDeniedError') {
                    throw new Error('PERMISSION_DENIED_SETTINGS');
                }

                throw new Error('Camera and microphone access required for video calls. Please enable permissions in your device settings.');
            }

            await videoCallService.requestCall(receiverId, receiverName, receiverAvatar, chatId, callerName, callerAvatar);
        },
        []
    );

    const acceptCall = useCallback(async (): Promise<void> => {
        if (callState.callId) {
            // Check permission state first (if supported)
            if (navigator.permissions && navigator.permissions.query) {
                try {
                    const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
                    const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });

                    if (cameraPermission.state === 'denied' || micPermission.state === 'denied') {
                        throw new Error('PERMISSION_DENIED_SETTINGS');
                    }
                } catch (permCheckError) {
                    console.log('Permission query not supported, proceeding with getUserMedia');
                }
            }

            // Request permissions (triggers system dialog on first call, or fails if previously denied)
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                // Stop tracks immediately - we just needed permission
                stream.getTracks().forEach(track => track.stop());

                // Wait for camera to be fully released (critical for Android)
                await new Promise(resolve => setTimeout(resolve, 200));
            } catch (permError: any) {
                console.error('Permission denied:', permError);

                // Check if it's a permission error
                if (permError.name === 'NotAllowedError' || permError.name === 'PermissionDeniedError') {
                    throw new Error('PERMISSION_DENIED_SETTINGS');
                }

                throw new Error('Camera and microphone access required for video calls. Please enable permissions in your device settings.');
            }

            await videoCallService.acceptCall(callState.callId);
        }
    }, [callState.callId]);

    const rejectCall = useCallback((): void => {
        if (callState.callId) {
            videoCallService.rejectCall(callState.callId);
        }
    }, [callState.callId]);

    const endCall = useCallback((): void => {
        videoCallService.endCall();
    }, []);

    const toggleMute = useCallback((): boolean => {
        return videoCallService.toggleMute();
    }, []);

    const toggleCamera = useCallback((): boolean => {
        return videoCallService.toggleCamera();
    }, []);

    const rejoinCall = useCallback((): void => {
        videoCallService.rejoinCall();
    }, []);

    const isInCall = ['requesting', 'ringing', 'connecting', 'connected'].includes(callState.status);

    const value: VideoCallContextType = {
        callState,
        isInCall,
        remainingTime,
        requestCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleCamera,
        rejoinCall,
        callPrice: appSettings?.messageCosts?.videoCall || VIDEO_CALL_PRICE,
        callDuration: VIDEO_CALL_DURATION,
    };

    return <VideoCallContext.Provider value={value}>{children}</VideoCallContext.Provider>;
};

export const useVideoCall = (): VideoCallContextType => {
    const context = useContext(VideoCallContext);
    if (context === undefined) {
        throw new Error('useVideoCall must be used within a VideoCallProvider');
    }
    return context;
};

export default VideoCallContext;
