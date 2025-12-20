/**
 * Video Call Context - Global Video Call State Provider
 * @purpose: Provide video call state and actions to all components
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import videoCallService, { CallState, VIDEO_CALL_PRICE, VIDEO_CALL_DURATION } from '../services/videoCall.service';

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

    // Config
    callPrice: number;
    callDuration: number;
}

const VideoCallContext = createContext<VideoCallContextType | undefined>(undefined);

interface VideoCallProviderProps {
    children: ReactNode;
}

export const VideoCallProvider = ({ children }: VideoCallProviderProps) => {
    console.log('📞📞📞 VideoCallProvider RENDERING');
    const [callState, setCallState] = useState<CallState>(videoCallService.getState());
    const [remainingTime, setRemainingTime] = useState(VIDEO_CALL_DURATION);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize socket listeners on mount
    useEffect(() => {
        console.log('📞📞📞 VideoCallProvider useEffect RUNNING');
        videoCallService.setupSocketListeners();

        // Subscribe to state changes
        const unsubscribe = videoCallService.onStateChange((newState: CallState) => {
            setCallState(newState);

            // Reset timer when call starts
            if (newState.status === 'connected' && newState.startTime) {
                const elapsed = Math.floor((Date.now() - newState.startTime) / 1000);
                setRemainingTime(Math.max(0, newState.duration - elapsed));
            }

            // Clear timer when call ends
            if (newState.status === 'idle' || newState.status === 'ended') {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }
                setRemainingTime(VIDEO_CALL_DURATION);
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
        if (callState.status === 'connected') {
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
    }, [callState.status]);

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
            await videoCallService.requestCall(receiverId, receiverName, receiverAvatar, chatId, callerName, callerAvatar);
        },
        []
    );

    const acceptCall = useCallback(async (): Promise<void> => {
        if (callState.callId) {
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
        callPrice: VIDEO_CALL_PRICE,
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
