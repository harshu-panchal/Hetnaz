/**
 * Video Call Actors - XState Side Effects
 * @purpose: Handle async operations (Agora, Socket, Media) as XState Actors
 * 
 * Actors are spawned/invoked by the state machine and automatically
 * cleaned up when the machine transitions to a new state.
 */

import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import socketService from '../services/socket.service';

// ==================== TYPES ====================

export interface AgoraCredentials {
    channelName: string;
    token: string;
    uid: number;
    appId: string;
}

// ==================== AGORA CLIENT MANAGER ====================

/**
 * Singleton Agora client manager to prevent UID conflicts
 */
class AgoraClientManager {
    private client: IAgoraRTCClient | null = null;
    private localVideoTrack: ICameraVideoTrack | null = null;
    private localAudioTrack: IMicrophoneAudioTrack | null = null;
    private isJoining = false;
    private currentChannel: string | null = null;

    constructor() {
        // Configure Agora SDK
        AgoraRTC.setLogLevel(1); // INFO level
    }

    async initializeMedia(): Promise<{ localVideoTrack: ICameraVideoTrack; localAudioTrack: IMicrophoneAudioTrack }> {
        console.log('📹 [AgoraManager] Initializing local media...');

        // Clean up existing tracks first
        await this.cleanupTracks();

        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
            { AEC: true, ANS: true, AGC: true },
            {
                encoderConfig: { width: 640, height: 480, frameRate: 24, bitrateMax: 1000 },
                optimizationMode: 'motion'
            }
        );

        this.localAudioTrack = audioTrack;
        this.localVideoTrack = videoTrack;

        console.log('✅ [AgoraManager] Local media initialized');
        return { localVideoTrack: videoTrack, localAudioTrack: audioTrack };
    }

    async joinChannel(
        credentials: AgoraCredentials,
        onRemoteUserPublished: (user: any, mediaType: string) => void,
        onRemoteUserUnpublished?: (user: any, mediaType: string) => void,
        onRemoteUserLeft?: (user: any) => void
    ): Promise<void> {
        if (this.isJoining) {
            console.warn('⚠️ [AgoraManager] Join already in progress');
            return;
        }

        // Check if already connected to this channel
        if (this.client && this.client.connectionState === 'CONNECTED' && this.currentChannel === credentials.channelName) {
            console.log('✅ [AgoraManager] Already connected to channel:', credentials.channelName);
            return;
        }

        this.isJoining = true;

        try {
            // Clean up existing client
            if (this.client) {
                await this.leaveChannel();
            }

            // Create new client
            this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

            // Enable Cloud Proxy for reliable connections in India
            try {
                this.client.startProxyServer(3);
                console.log('🌐 [AgoraManager] Cloud Proxy enabled');
            } catch (e) {
                console.warn('⚠️ [AgoraManager] Could not start proxy:', e);
            }

            // Set up event handlers
            this.client.on('user-published', async (user, mediaType) => {
                console.log('🎥 [AgoraManager] Remote user published:', user.uid, mediaType);
                if (this.client?.connectionState === 'CONNECTED') {
                    await this.client.subscribe(user, mediaType);
                    onRemoteUserPublished(user, mediaType);
                }
            });

            this.client.on('user-unpublished', (user, mediaType) => {
                console.log('🎥 [AgoraManager] Remote user unpublished:', user.uid, mediaType);
                onRemoteUserUnpublished?.(user, mediaType);
            });

            this.client.on('user-left', (user) => {
                console.log('🎥 [AgoraManager] Remote user left:', user.uid);
                onRemoteUserLeft?.(user);
            });

            // Join with retry logic
            const maxRetries = 3;
            let lastError: Error | null = null;

            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    console.log(`🎥 [AgoraManager] Join attempt ${attempt}/${maxRetries}...`);
                    await this.client.join(credentials.appId, credentials.channelName, credentials.token, credentials.uid);
                    this.currentChannel = credentials.channelName;
                    console.log('✅ [AgoraManager] Joined channel:', credentials.channelName);
                    break;
                } catch (error: any) {
                    lastError = error;
                    console.warn(`⚠️ [AgoraManager] Join attempt ${attempt} failed:`, error.message);
                    if (attempt < maxRetries) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            }

            if (!this.client || this.client.connectionState !== 'CONNECTED') {
                throw lastError || new Error('Failed to join channel');
            }

            // Publish local tracks
            if (this.localVideoTrack && this.localAudioTrack) {
                await this.client.publish([this.localVideoTrack, this.localAudioTrack]);
                console.log('✅ [AgoraManager] Published local tracks');
            }

        } finally {
            this.isJoining = false;
        }
    }

    async leaveChannel(): Promise<void> {
        console.log('🧹 [AgoraManager] Leaving channel...');

        if (this.client) {
            try {
                await this.client.leave();
            } catch (e) {
                console.warn('⚠️ [AgoraManager] Error leaving channel:', e);
            }
            this.client = null;
            this.currentChannel = null;
        }
    }

    async cleanupTracks(): Promise<void> {
        console.log('🧹 [AgoraManager] Cleaning up tracks...');

        if (this.localAudioTrack) {
            this.localAudioTrack.stop();
            this.localAudioTrack.close();
            this.localAudioTrack = null;
        }

        if (this.localVideoTrack) {
            this.localVideoTrack.stop();
            this.localVideoTrack.close();
            this.localVideoTrack = null;
        }
    }

    async fullCleanup(): Promise<void> {
        await this.leaveChannel();
        await this.cleanupTracks();

        // Emergency DOM cleanup
        document.querySelectorAll('[id^="agora-video-"]').forEach(el => el.remove());

        console.log('🧹 [AgoraManager] Full cleanup complete');
    }

    toggleMute(): boolean {
        if (!this.localAudioTrack) {
            console.warn('⚠️ [AgoraManager] Cannot toggle mute: No audio track');
            return false;
        }
        try {
            const isCurrentlyEnabled = this.localAudioTrack.enabled;
            const targetEnabledState = !isCurrentlyEnabled;
            this.localAudioTrack.setEnabled(targetEnabledState);
            console.log(`🎤 [AgoraManager] Mute toggled. Audio Enabled: ${isCurrentlyEnabled} -> ${targetEnabledState}`);
            return targetEnabledState;
        } catch (error) {
            console.error('❌ [AgoraManager] Failed to toggle mute:', error);
            return false;
        }
    }

    toggleCamera(): boolean {
        if (!this.localVideoTrack) {
            console.warn('⚠️ [AgoraManager] Cannot toggle camera: No video track');
            return false;
        }
        try {
            const isCurrentlyEnabled = this.localVideoTrack.enabled;
            const targetEnabledState = !isCurrentlyEnabled;
            this.localVideoTrack.setEnabled(targetEnabledState);
            console.log(`🎥 [AgoraManager] Camera toggled. Video Enabled: ${isCurrentlyEnabled} -> ${targetEnabledState}`);
            return targetEnabledState;
        } catch (error) {
            console.error('❌ [AgoraManager] Failed to toggle camera:', error);
            return false;
        }
    }

    getLocalTracks() {
        return {
            localVideoTrack: this.localVideoTrack,
            localAudioTrack: this.localAudioTrack,
        };
    }
}

// Singleton instance with HMR support
let agoraManager: AgoraClientManager;

if (import.meta.env.DEV) {
    if (!(globalThis as any).__agoraManagerXState) {
        (globalThis as any).__agoraManagerXState = new AgoraClientManager();
    }
    agoraManager = (globalThis as any).__agoraManagerXState;
} else {
    agoraManager = new AgoraClientManager();
}

export { agoraManager };

// ==================== SOCKET EVENT BRIDGE ====================

/**
 * Bridge socket events to XState machine
 */
export function createSocketEventBridge(send: (event: any) => void) {
    const handlers = {
        'call:incoming': (data: any) => {
            console.log('📞 [SocketBridge] call:incoming', data);
            send({
                type: 'CALL_INCOMING',
                callId: data.callId,
                callerId: data.callerId,
                callerName: data.callerName,
                callerAvatar: data.callerAvatar,
                chatId: data.chatId,
            });
        },
        'call:outgoing': (data: any) => {
            console.log('📞 [SocketBridge] call:outgoing', data);
            send({ type: 'CALL_OUTGOING', callId: data.callId });
        },
        'call:accepted': (data: any) => {
            console.log('📞 [SocketBridge] call:accepted', data);
            send({
                type: 'CALL_ACCEPTED',
                callId: data.callId,
                agora: data.agora,
            });
        },
        'call:proceed': (data: any) => {
            console.log('📞 [SocketBridge] call:proceed', data);
            send({
                type: 'CALL_PROCEED',
                callId: data.callId,
                agora: data.agora,
            });
        },
        'call:rejected': (data: any) => {
            console.log('📞 [SocketBridge] call:rejected', data);
            send({ type: 'CALL_REJECTED', callId: data.callId, refunded: data.refunded });
        },
        'call:started': (data: any) => {
            console.log('📞 [SocketBridge] call:started', data);
            send({
                type: 'CALL_STARTED',
                callId: data.callId,
                startTime: data.startTime,
                duration: data.duration,
            });
        },
        'call:ended': (data: any) => {
            console.log('📞 [SocketBridge] call:ended', data);
            send({
                type: 'CALL_ENDED',
                callId: data.callId,
                reason: data.reason,
                canRejoin: data.canRejoin,
                remainingTime: data.remainingTime,
            });
        },
        'call:force-end': (data: any) => {
            console.log('📞 [SocketBridge] call:force-end', data);
            send({ type: 'CALL_FORCE_END', callId: data.callId, reason: data.reason });
        },
        'call:missed': (data: any) => {
            console.log('📞 [SocketBridge] call:missed', data);
            send({ type: 'CALL_MISSED', callId: data.callId });
        },
        'call:error': (data: any) => {
            console.log('📞 [SocketBridge] call:error', data);
            send({ type: 'CALL_ERROR', message: data.message });
        },
        'call:clear-all': () => {
            console.log('🚨 [SocketBridge] call:clear-all');
            send({ type: 'CALL_CLEAR_ALL' });
        },
        'call:waiting': (data: any) => {
            console.log('📞 [SocketBridge] call:waiting', data);
            send({ type: 'PEER_WAITING', callId: data.callId });
        },
        'call:peer-rejoined': (data: any) => {
            console.log('📞 [SocketBridge] call:peer-rejoined', data);
            send({
                type: 'PEER_REJOINED',
                callId: data.callId,
                remainingTime: data.remainingTime
            });
        },
        'call:rejoin-proceed': (data: any) => {
            console.log('📞 [SocketBridge] call:rejoin-proceed', data);
            console.log('📞 [SocketBridge] rejoin remainingSeconds:', data.remainingSeconds);
            send({
                type: 'REJOIN_PROCEED',
                callId: data.callId,
                agora: data.agora,
                remainingSeconds: data.remainingSeconds,
                startTime: data.startTime,
            });
        },
    };

    // Register all handlers
    Object.entries(handlers).forEach(([event, handler]) => {
        socketService.on(event, handler);
    });

    // Return cleanup function
    return () => {
        Object.entries(handlers).forEach(([event, handler]) => {
            socketService.off(event, handler);
        });
    };
}

// ==================== SOCKET EMITTERS ====================

export const socketEmitters = {
    requestCall: (receiverId: string, chatId: string, callerName: string, callerAvatar: string) => {
        socketService.emitToServer('call:request', {
            receiverId,
            chatId,
            callerName,
            callerAvatar,
        });
    },

    acceptCall: (callId: string) => {
        socketService.emitToServer('call:accept', { callId });
    },

    rejectCall: (callId: string) => {
        socketService.emitToServer('call:reject', { callId });
    },

    endCall: (callId: string) => {
        socketService.emitToServer('call:end', { callId });
    },

    cancelCall: (callId: string) => {
        socketService.emitToServer('call:cancel', { callId });
    },

    rejoinCall: (callId: string) => {
        console.log('📞 [SocketEmitter] Emitting call:rejoin with callId:', callId);
        socketService.emitToServer('call:rejoin', { callId });
    },

    notifyConnected: (callId: string) => {
        socketService.emitToServer('call:connected', { callId });
    },

    reportConnectionFailed: (callId: string) => {
        socketService.emitToServer('call:connection-failed', { callId });
    },
};

// ==================== AUDIO MANAGER ====================

class AudioManagerXState {
    private ringtone: HTMLAudioElement | null = null;

    playRingtone() {
        try {
            this.ringtone = new Audio('/sounds/ringtone.mp3');
            this.ringtone.loop = true;
            this.ringtone.play().catch(e => console.warn('Ringtone play failed:', e));
        } catch (e) {
            console.warn('Failed to create ringtone:', e);
        }
    }

    stopRingtone() {
        if (this.ringtone) {
            this.ringtone.pause();
            this.ringtone.currentTime = 0;
            this.ringtone = null;
        }
    }
}

export const audioManagerXState = new AudioManagerXState();
