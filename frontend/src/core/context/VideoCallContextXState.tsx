/**
 * Video Call Context - XState-Powered Global Video Call State Provider
 * @purpose: Provide video call state and actions to all components using XState
 * 
 * This replaces the old event-based VideoCallContext with a deterministic
 * state machine that prevents race conditions and stale signals.
 */

import { createContext, useContext, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useMachine } from '@xstate/react';
import { videoCallMachine, VideoCallContext as MachineContext } from '../machines/videoCall.machine';
import { agoraManager, createSocketEventBridge, socketEmitters, audioManagerXState } from '../machines/videoCall.actors';
import { useGlobalState } from './GlobalStateContext';

// ==================== TYPES ====================

interface VideoCallContextType {
    // State (derived from machine)
    callState: MachineContext & { status: string };
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
    closeModal: () => void;

    // Config
    callPrice: number;
    callDuration: number;
}

// ==================== CONSTANTS ====================

const VIDEO_CALL_DURATION = parseInt(import.meta.env.VITE_VIDEO_CALL_DURATION || '300', 10);
const VIDEO_CALL_PRICE = parseInt(import.meta.env.VITE_VIDEO_CALL_PRICE || '500', 10);

// ==================== CONTEXT ====================

const VideoCallContext = createContext<VideoCallContextType | undefined>(undefined);

interface VideoCallProviderProps {
    children: ReactNode;
}

// ==================== PROVIDER ====================

export const VideoCallProvider = ({ children }: VideoCallProviderProps) => {
    const { appSettings } = useGlobalState();
    const [state, send] = useMachine(videoCallMachine);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const cleanupRef = useRef<(() => void) | null>(null);
    const agoraJoinInitiatedRef = useRef(false); // Track if we've started joining Agora

    // ==================== SOCKET BRIDGE ====================

    useEffect(() => {
        console.log('📞 [XState] Setting up socket event bridge');
        cleanupRef.current = createSocketEventBridge(send);

        return () => {
            console.log('📞 [XState] Cleaning up socket event bridge');
            cleanupRef.current?.();
        };
    }, [send]);

    // ==================== GLOBAL CLEANUP (Prevent Blackout) ====================
    // This ensures resources are cleaned up on page unload, visibility change, or navigation

    useEffect(() => {
        const handleBeforeUnload = () => {
            console.log('📞 [XState] Unload triggered - emergency cleanup');
            agoraManager.fullCleanup();
            audioManagerXState.stopRingtone();
        };

        const handleVisibilityChange = () => {
            // If page becomes hidden while in ended state, cleanup immediately
            if (document.hidden && state.value === 'ended') {
                console.log('📞 [XState] Page hidden while ended - cleanup');
                agoraManager.fullCleanup();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            // Component unmount - full cleanup
            agoraManager.fullCleanup();
            audioManagerXState.stopRingtone();
        };
    }, [state.value]);

    // ==================== AGORA JOIN HANDLER ====================
    // Separate effect for Agora joining to handle race conditions

    useEffect(() => {
        const currentState = state.value as string;
        const hasCredentials = state.context.agoraChannel && state.context.agoraToken;
        const shouldJoin = ['connecting', 'connected'].includes(currentState);

        // Join Agora if we're in a state that requires it, have credentials, and haven't started joining
        if (shouldJoin && hasCredentials && !agoraJoinInitiatedRef.current) {
            console.log('📞 [XState] Triggering Agora join from state:', currentState);
            agoraJoinInitiatedRef.current = true;
            handleAgoraJoin();
        }

        // Reset the join flag when going back to idle, ended, or rejoining
        // This allows rejoin flow to trigger a new Agora join
        if (['idle', 'ended', 'rejoining'].includes(currentState)) {
            agoraJoinInitiatedRef.current = false;
        }
    }, [state.value, state.context.agoraChannel, state.context.agoraToken]);

    // ==================== STATE CHANGE EFFECTS ====================

    useEffect(() => {
        const currentState = state.value as string;
        console.log('📞 [XState] State changed to:', currentState);

        // Handle state-specific side effects
        switch (currentState) {
            case 'ringing':
                if (state.context.isIncoming) {
                    audioManagerXState.playRingtone();
                }
                break;

            case 'connecting':
                audioManagerXState.stopRingtone();
                // Agora join is handled by separate effect above
                break;

            case 'connected':
                // Start countdown timer
                if (!timerRef.current) {
                    timerRef.current = setInterval(() => {
                        send({ type: 'TIMER_TICK' });

                        // Check if time expired
                        if (state.context.remainingTime <= 1) {
                            send({ type: 'TIMER_EXPIRED' });
                        }
                    }, 1000);
                }
                break;

            case 'idle':
            case 'ended':
                // Stop timer
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }

                // Leave Agora channel on ended (but keep tracks for potential rejoin display)
                // This allows rejoin to work with fresh credentials
                if (currentState === 'ended') {
                    agoraManager.leaveChannel();
                }

                // Full cleanup Agora on idle
                if (currentState === 'idle') {
                    agoraManager.fullCleanup();
                    agoraJoinInitiatedRef.current = false; // Reset join flag
                }
                break;
        }
    }, [state.value, send]);

    // Pause timer when peer is disconnected
    useEffect(() => {
        if (state.context.isPeerDisconnected && timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        } else if (!state.context.isPeerDisconnected && state.value === 'connected' && !timerRef.current) {
            timerRef.current = setInterval(() => {
                send({ type: 'TIMER_TICK' });
            }, 1000);
        }
    }, [state.context.isPeerDisconnected, state.value, send]);

    // ==================== AGORA HANDLER ====================

    const handleAgoraJoin = async () => {
        try {
            const credentials = {
                channelName: state.context.agoraChannel!,
                token: state.context.agoraToken!,
                uid: state.context.agoraUid!,
                appId: state.context.agoraAppId!,
            };

            await agoraManager.joinChannel(
                credentials,
                (user, mediaType) => {
                    // Handle remote user publishing
                    if (mediaType === 'video') {
                        send({
                            type: 'REMOTE_TRACK_UPDATED',
                            videoTrack: user.videoTrack,
                        });
                    }
                    if (mediaType === 'audio') {
                        send({
                            type: 'REMOTE_TRACK_UPDATED',
                            audioTrack: user.audioTrack,
                        });
                        user.audioTrack?.play();
                    }
                },
                (_, mediaType) => {
                    // Handle remote user unpublishing
                    if (mediaType === 'video') {
                        send({ type: 'REMOTE_TRACK_UPDATED', videoTrack: null });
                    }
                    if (mediaType === 'audio') {
                        send({ type: 'REMOTE_TRACK_UPDATED', audioTrack: null });
                    }
                },
                () => {
                    // Handle remote user left
                    send({ type: 'REMOTE_USER_LEFT' });
                }
            );

            // Notify backend of successful connection
            if (state.context.callId) {
                socketEmitters.notifyConnected(state.context.callId);
            }

            send({ type: 'AGORA_CONNECTED' });

        } catch (error: any) {
            console.error('❌ [XState] Agora join failed:', error);

            // Only report failure if we're still in connecting state
            if (state.value === 'connecting' && state.context.callId) {
                socketEmitters.reportConnectionFailed(state.context.callId);
            }

            send({ type: 'AGORA_FAILED', error: error.message });
        }
    };

    // ==================== ACTIONS ====================

    const requestCall = useCallback(async (
        receiverId: string,
        receiverName: string,
        receiverAvatar: string,
        chatId: string,
        callerName: string,
        callerAvatar: string
    ): Promise<void> => {
        // Request permissions first
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            stream.getTracks().forEach(track => track.stop());
            await new Promise(resolve => setTimeout(resolve, 200));
        } catch (permError) {
            console.error('Permission denied:', permError);
            throw new Error('Camera and microphone access required for video calls');
        }

        // Send event to machine
        send({
            type: 'REQUEST_CALL',
            receiverId,
            receiverName,
            receiverAvatar,
            chatId,
            callerName,
            callerAvatar,
        });

        // Initialize media
        try {
            const { localVideoTrack, localAudioTrack } = await agoraManager.initializeMedia();
            send({
                type: 'MEDIA_INITIALIZED',
                localVideoTrack,
                localAudioTrack,
            });
        } catch (error: any) {
            send({ type: 'MEDIA_FAILED', error: error.message });
            throw error;
        }

        // Emit to backend
        socketEmitters.requestCall(receiverId, chatId, callerName, callerAvatar);
    }, [send]);

    const acceptCall = useCallback(async (): Promise<void> => {
        if (!state.context.callId) return;

        // Request permissions first
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            stream.getTracks().forEach(track => track.stop());
            await new Promise(resolve => setTimeout(resolve, 200));
        } catch (permError) {
            console.error('Permission denied:', permError);
            throw new Error('Camera and microphone access required for video calls');
        }

        send({ type: 'ACCEPT_CALL' });

        // Initialize media
        try {
            const { localVideoTrack, localAudioTrack } = await agoraManager.initializeMedia();
            send({
                type: 'MEDIA_INITIALIZED',
                localVideoTrack,
                localAudioTrack,
            });
        } catch (error: any) {
            send({ type: 'MEDIA_FAILED', error: error.message });
            throw error;
        }

        // Emit to backend
        socketEmitters.acceptCall(state.context.callId);
    }, [state.context.callId, send]);

    const rejectCall = useCallback((): void => {
        if (state.context.callId) {
            socketEmitters.rejectCall(state.context.callId);
        }
        send({ type: 'REJECT_CALL' });
    }, [state.context.callId, send]);

    const endCall = useCallback((): void => {
        if (state.context.callId) {
            socketEmitters.endCall(state.context.callId);
        }
        send({ type: 'END_CALL' });
    }, [state.context.callId, send]);

    const toggleMute = useCallback((): boolean => {
        const newState = agoraManager.toggleMute();
        send({ type: 'TOGGLE_MUTE' });
        return newState;
    }, [send]);

    const toggleCamera = useCallback((): boolean => {
        const newState = agoraManager.toggleCamera();
        send({ type: 'TOGGLE_CAMERA' });
        return newState;
    }, [send]);

    const rejoinCall = useCallback((): void => {
        console.log('📞 [XState] rejoinCall called, callId:', state.context.callId, 'canRejoin:', state.context.canRejoin);
        if (state.context.callId) {
            console.log('📞 [XState] Emitting call:rejoin to backend');
            socketEmitters.rejoinCall(state.context.callId);
        }
        send({ type: 'REJOIN_CALL' });
    }, [state.context.callId, state.context.canRejoin, send]);

    const closeModal = useCallback((): void => {
        send({ type: 'CLOSE_MODAL' });
    }, [send]);

    // ==================== DERIVED STATE ====================

    const currentStatus = state.value as string;
    const isInCall = ['requesting', 'ringing', 'connecting', 'connected', 'interrupted', 'rejoining', 'ended'].includes(currentStatus);

    // Get local tracks from Agora manager
    const localTracks = agoraManager.getLocalTracks();

    const callState: MachineContext & { status: string } = {
        ...state.context,
        status: currentStatus,
        // Ensure local tracks are always current from Agora manager
        localVideoTrack: localTracks.localVideoTrack || state.context.localVideoTrack,
        localAudioTrack: localTracks.localAudioTrack || state.context.localAudioTrack,
    };

    // ==================== VALUE ====================

    const value: VideoCallContextType = {
        callState,
        isInCall,
        remainingTime: state.context.remainingTime,
        requestCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleCamera,
        rejoinCall,
        closeModal,
        callPrice: appSettings?.messageCosts?.videoCall || VIDEO_CALL_PRICE,
        callDuration: VIDEO_CALL_DURATION,
    };

    return <VideoCallContext.Provider value={value}>{children}</VideoCallContext.Provider>;
};

// ==================== HOOK ====================

export const useVideoCall = (): VideoCallContextType => {
    const context = useContext(VideoCallContext);
    if (context === undefined) {
        throw new Error('useVideoCall must be used within a VideoCallProvider');
    }
    return context;
};

export default VideoCallContext;
