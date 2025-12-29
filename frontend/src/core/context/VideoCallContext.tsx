/**
 * Video Call Context - Simplified with new Agora service
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import socketService from '../services/socket.service';
import agoraVideoCallService from '../services/agoraVideoCall.service';
import type { ICameraVideoTrack } from 'agora-rtc-sdk-ng';

interface VideoCallState {
    status: 'idle' | 'requesting' | 'ringing' | 'connecting' | 'connected' | 'ended';
    callId: string | null;
    remoteUserId: string | null;
    remoteUserName: string | null;
    remoteUserAvatar: string | null;
    isIncoming: boolean;
    localVideoTrack: ICameraVideoTrack | null;
    remoteVideoTrack: any | null;
    isMicOff: boolean;
    isCameraOff: boolean;
    error: string | null;
}

interface VideoCallContextType {
    callState: VideoCallState;
    requestCall: (
        receiverId: string,
        receiverName: string,
        receiverAvatar: string,
        chatId: string,
        callerName: string,
        callerAvatar: string
    ) => Promise<void>;
    acceptCall: () => Promise<void>;
    rejectCall: () => Promise<void>;
    endCall: () => Promise<void>;
    toggleMicrophone: (enabled: boolean) => Promise<void>;
    toggleCamera: (enabled: boolean) => Promise<void>;
    toggleMute: () => Promise<void>; // Alias for toggleMicrophone
    isInCall: boolean;
    callPrice: number;
    remainingTime: number;
}

const VideoCallContext = createContext<VideoCallContextType | undefined>(undefined);

export const VideoCallProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [callState, setCallState] = useState<VideoCallState>({
        status: 'idle',
        callId: null,
        remoteUserId: null,
        remoteUserName: null,
        remoteUserAvatar: null,
        isIncoming: false,
        localVideoTrack: null,
        remoteVideoTrack: null,
        isMicOff: false,
        isCameraOff: false,
        error: null,
    });

    // Call duration timer (5 minutes = 300 seconds)
    const [remainingTime, setRemainingTime] = useState(300);

    // Setup Agora callbacks
    useEffect(() => {
        agoraVideoCallService.onLocalVideoReady = (track) => {
            console.log('✅ Local video ready');
            setCallState(prev => ({ ...prev, localVideoTrack: track }));
        };

        agoraVideoCallService.onRemoteVideoReady = (user) => {
            console.log('✅ Remote video ready from user:', user.uid);
            setCallState(prev => ({ ...prev, remoteVideoTrack: user.videoTrack }));
        };

        agoraVideoCallService.onRemoteUserLeft = (uid) => {
            console.log('👋 Remote user left:', uid);
            setCallState(prev => ({ ...prev, remoteVideoTrack: null }));
        };
    }, []);

    // Setup socket event listeners
    useEffect(() => {
        // Incoming call
        socketService.on('call:incoming', (data: any) => {
            console.log('📞 Incoming call from:', data.callerName);
            setCallState({
                status: 'ringing',
                callId: data.callId,
                remoteUserId: data.callerId,
                remoteUserName: data.callerName,
                remoteUserAvatar: data.callerAvatar,
                isIncoming: true,
                localVideoTrack: null,
                remoteVideoTrack: null,
                isMicOff: false,
                isCameraOff: false,
                error: null,
            });
        });

        // Call accepted (for caller)
        socketService.on('call:accepted', async (data: any) => {
            console.log('✅ Call accepted, joining Agora channel...');
            setCallState(prev => ({ ...prev, status: 'connecting' }));

            try {
                await agoraVideoCallService.joinChannel(data.agora);
                setCallState(prev => ({ ...prev, status: 'connected' }));
            } catch (error: any) {
                console.error('❌ Failed to join Agora:', error);
                setCallState(prev => ({ ...prev, status: 'ended', error: error.message }));
            }
        });

        // Call proceed (for receiver)
        socketService.on('call:proceed', async (data: any) => {
            console.log('✅ Proceeding with call, joining Agora channel...');

            try {
                await agoraVideoCallService.joinChannel(data.agora);
                setCallState(prev => ({ ...prev, status: 'connected' }));
            } catch (error: any) {
                console.error('❌ Failed to join Agora:', error);
                setCallState(prev => ({ ...prev, status: 'ended', error: error.message }));
            }
        });

        // Call rejected
        socketService.on('call:rejected', () => {
            console.log('❌ Call rejected');
            setCallState(prev => ({ ...prev, status: 'ended', error: 'Call rejected' }));
            setTimeout(() => {
                setCallState({
                    status: 'idle',
                    callId: null,
                    remoteUserId: null,
                    remoteUserName: null,
                    remoteUserAvatar: null,
                    isIncoming: false,
                    localVideoTrack: null,
                    remoteVideoTrack: null,
                    isMicOff: false,
                    isCameraOff: false,
                    error: null,
                });
            }, 2000);
        });

        // Call ended
        socketService.on('call:ended', async () => {
            console.log('📞 Call ended');
            await agoraVideoCallService.leaveChannel();
            setCallState(prev => ({ ...prev, status: 'ended' }));
            setTimeout(() => {
                setCallState({
                    status: 'idle',
                    callId: null,
                    remoteUserId: null,
                    remoteUserName: null,
                    remoteUserAvatar: null,
                    isIncoming: false,
                    localVideoTrack: null,
                    remoteVideoTrack: null,
                    isMicOff: false,
                    isCameraOff: false,
                    error: null,
                });
            }, 2000);
        });

        // Call error
        socketService.on('call:error', (data: any) => {
            console.error('❌ Call error:', data.message);
            setCallState(prev => ({ ...prev, status: 'ended', error: data.message }));
        });

        return () => {
            socketService.off('call:incoming', () => { });
            socketService.off('call:accepted', () => { });
            socketService.off('call:proceed', () => { });
            socketService.off('call:rejected', () => { });
            socketService.off('call:ended', () => { });
            socketService.off('call:error', () => { });
        };
    }, []);

    // Request a call
    const requestCall = useCallback(
        async (
            receiverId: string,
            receiverName: string,
            receiverAvatar: string,
            chatId: string,
            callerName: string,
            callerAvatar: string
        ): Promise<void> => {
            console.log('📞 Requesting call to:', receiverName);

            setCallState({
                status: 'requesting',
                callId: null,
                remoteUserId: receiverId,
                remoteUserName: receiverName,
                remoteUserAvatar: receiverAvatar,
                isIncoming: false,
                localVideoTrack: null,
                remoteVideoTrack: null,
                isMicOff: false,
                isCameraOff: false,
                error: null,
            });

            // Send call request to backend
            socketService.emitToServer('call:request', {
                receiverId,
                chatId,
                callerName,
                callerAvatar,
            });
        },
        []
    );

    // Accept call
    const acceptCall = useCallback(async (): Promise<void> => {
        if (callState.callId) {
            console.log('✅ Accepting call:', callState.callId);
            setCallState(prev => ({ ...prev, status: 'connecting' }));

            // Send accept to backend
            socketService.emitToServer('call:accept', { callId: callState.callId });
        }
    }, [callState.callId]);

    // Reject call
    const rejectCall = useCallback(async (): Promise<void> => {
        if (callState.callId) {
            console.log('❌ Rejecting call:', callState.callId);
            socketService.emitToServer('call:reject', { callId: callState.callId });
            setCallState({
                status: 'idle',
                callId: null,
                remoteUserId: null,
                remoteUserName: null,
                remoteUserAvatar: null,
                isIncoming: false,
                localVideoTrack: null,
                remoteVideoTrack: null,
                isMicOff: false,
                isCameraOff: false,
                error: null,
            });
        }
    }, [callState.callId]);

    // End call
    const endCall = useCallback(async (): Promise<void> => {
        console.log('📞 Ending call');

        if (callState.callId) {
            socketService.emitToServer('call:end', { callId: callState.callId });
        }

        await agoraVideoCallService.leaveChannel();

        setCallState({
            status: 'idle',
            callId: null,
            remoteUserId: null,
            remoteUserName: null,
            remoteUserAvatar: null,
            isIncoming: false,
            localVideoTrack: null,
            remoteVideoTrack: null,
            isMicOff: false,
            isCameraOff: false,
            error: null,
        });
    }, [callState.callId]);

    // Toggle microphone
    const toggleMicrophone = useCallback(async (enabled: boolean): Promise<void> => {
        await agoraVideoCallService.toggleMicrophone(enabled);
        setCallState(prev => ({ ...prev, isMicOff: !enabled }));
    }, []);

    // Toggle mute (alias for toggleMicrophone)
    const toggleMute = useCallback(async (): Promise<void> => {
        const newMicState = !callState.isMicOff;
        await toggleMicrophone(newMicState);
    }, [callState.isMicOff, toggleMicrophone]);

    // Toggle camera
    const toggleCamera = useCallback(async (enabled: boolean): Promise<void> => {
        await agoraVideoCallService.toggleCamera(enabled);
        setCallState(prev => ({ ...prev, isCameraOff: !enabled }));
    }, []);

    return (
        <VideoCallContext.Provider
            value={{
                callState,
                requestCall,
                acceptCall,
                rejectCall,
                endCall,
                toggleMicrophone,
                toggleCamera,
                toggleMute,
                isInCall: callState.status === 'connected' || callState.status === 'connecting',
                callPrice: parseInt(import.meta.env.VITE_VIDEO_CALL_PRICE || '500'),
                remainingTime,
            }}
        >
            {children}
        </VideoCallContext.Provider>
    );
};

export const useVideoCall = (): VideoCallContextType => {
    const context = useContext(VideoCallContext);
    if (!context) {
        throw new Error('useVideoCall must be used within VideoCallProvider');
    }
    return context;
};
