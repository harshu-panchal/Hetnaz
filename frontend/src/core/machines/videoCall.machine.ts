/**
 * Video Call State Machine - XState Implementation
 * @purpose: Manage video call lifecycle with deterministic state transitions
 * 
 * STATES:
 * - idle: No active call
 * - requesting: Male is initiating a call
 * - ringing: Call is ringing (outgoing for male, incoming for female)
 * - connecting: Call accepted, establishing Agora connection
 * - connected: Live video call in progress
 * - interrupted: Call temporarily paused (network drop, can rejoin)
 * - ended: Call has ended (with optional rejoin window)
 * 
 * This machine enforces that only legal transitions can occur,
 * preventing race conditions and stale signal interference.
 */

import { setup, assign } from 'xstate';
import type { ICameraVideoTrack, IMicrophoneAudioTrack, IRemoteVideoTrack, IRemoteAudioTrack } from 'agora-rtc-sdk-ng';

// ==================== TYPES ====================

export interface VideoCallContext {
    // Call identification
    callId: string | null;
    chatId: string | null;

    // Remote user info
    remoteUserId: string | null;
    remoteUserName: string | null;
    remoteUserAvatar: string | null;

    // Caller info (for incoming calls)
    callerName: string | null;
    callerAvatar: string | null;

    // Agora credentials
    agoraChannel: string | null;
    agoraToken: string | null;
    agoraUid: number | null;
    agoraAppId: string | null;

    // Media tracks
    localVideoTrack: ICameraVideoTrack | null;
    localAudioTrack: IMicrophoneAudioTrack | null;
    remoteVideoTrack: IRemoteVideoTrack | null;
    remoteAudioTrack: IRemoteAudioTrack | null;

    // Call timing
    startTime: number | null;
    duration: number;
    remainingTime: number;

    // UI state
    isMuted: boolean;
    isCameraOff: boolean;
    isIncoming: boolean;
    isPeerDisconnected: boolean;

    // Rejoin tracking
    wasRejoined: boolean;
    canRejoin: boolean;
    canRejoinFromServer?: boolean; // Server's authoritative rejoin decision

    // Error state
    error: string | null;
}

// ==================== EVENTS ====================

export type VideoCallEvent =
    // User actions
    | { type: 'REQUEST_CALL'; receiverId: string; receiverName: string; receiverAvatar: string; chatId: string; callerName: string; callerAvatar: string }
    | { type: 'ACCEPT_CALL' }
    | { type: 'REJECT_CALL' }
    | { type: 'END_CALL' }
    | { type: 'REJOIN_CALL' }
    | { type: 'TOGGLE_MUTE' }
    | { type: 'TOGGLE_CAMERA' }
    | { type: 'CLOSE_MODAL' }

    // Socket events from backend
    | { type: 'CALL_INCOMING'; callId: string; callerId: string; callerName: string; callerAvatar: string; chatId: string }
    | { type: 'CALL_OUTGOING'; callId: string }
    | { type: 'CALL_ACCEPTED'; callId: string; agora: { channelName: string; token: string; uid: number; appId: string } }
    | { type: 'CALL_PROCEED'; callId: string; agora: { channelName: string; token: string; uid: number; appId: string } }
    | { type: 'CALL_REJECTED'; callId: string; refunded?: boolean }
    | { type: 'CALL_STARTED'; callId: string; startTime: number; duration: number }
    | { type: 'CALL_ENDED'; callId: string; reason: string; canRejoin?: boolean; remainingTime?: number }
    | { type: 'CALL_FORCE_END'; callId: string; reason: string }
    | { type: 'CALL_MISSED'; callId: string }
    | { type: 'CALL_ERROR'; message: string }
    | { type: 'CALL_CLEAR_ALL' }
    | { type: 'PEER_WAITING'; callId: string }
    | { type: 'PEER_REJOINED'; callId: string }
    | { type: 'REJOIN_PROCEED'; callId: string; agora: { channelName: string; token: string; uid: number; appId: string }; remainingSeconds: number; startTime: number }

    // Media events
    | { type: 'MEDIA_INITIALIZED'; localVideoTrack: ICameraVideoTrack; localAudioTrack: IMicrophoneAudioTrack }
    | { type: 'MEDIA_FAILED'; error: string }
    | { type: 'AGORA_CONNECTED' }
    | { type: 'AGORA_FAILED'; error: string }
    | { type: 'REMOTE_USER_JOINED'; videoTrack?: IRemoteVideoTrack; audioTrack?: IRemoteAudioTrack }
    | { type: 'REMOTE_USER_LEFT' }
    | { type: 'REMOTE_TRACK_UPDATED'; videoTrack?: IRemoteVideoTrack | null; audioTrack?: IRemoteAudioTrack | null }

    // Timer events
    | { type: 'TIMER_TICK' }
    | { type: 'TIMER_EXPIRED' }
    | { type: 'REJOIN_TIMEOUT' };

// ==================== INITIAL CONTEXT ====================

const VIDEO_CALL_DURATION = parseInt(import.meta.env.VITE_VIDEO_CALL_DURATION || '300', 10);

const initialContext: VideoCallContext = {
    callId: null,
    chatId: null,
    remoteUserId: null,
    remoteUserName: null,
    remoteUserAvatar: null,
    callerName: null,
    callerAvatar: null,
    agoraChannel: null,
    agoraToken: null,
    agoraUid: null,
    agoraAppId: null,
    localVideoTrack: null,
    localAudioTrack: null,
    remoteVideoTrack: null,
    remoteAudioTrack: null,
    startTime: null,
    duration: VIDEO_CALL_DURATION,
    remainingTime: VIDEO_CALL_DURATION,
    isMuted: false,
    isCameraOff: false,
    isIncoming: false,
    isPeerDisconnected: false,
    wasRejoined: false,
    canRejoin: false,
    error: null,
};

// ==================== GUARDS ====================

const guards = {
    isValidCallId: ({ context, event }: { context: VideoCallContext; event: any }) => {
        if (!event.callId) return true; // Events without callId are always valid
        return event.callId === context.callId;
    },
    canRejoin: ({ context }: { context: VideoCallContext }) => {
        return context.canRejoin && !context.wasRejoined && context.remainingTime > 10;
    },
    hasTimeRemaining: ({ context }: { context: VideoCallContext }) => {
        return context.remainingTime > 0;
    },
};

// ==================== ACTIONS ====================

const actions = {
    // Context setters
    setCallRequest: assign({
        remoteUserId: ({ event }) => (event as any).receiverId,
        remoteUserName: ({ event }) => (event as any).receiverName,
        remoteUserAvatar: ({ event }) => (event as any).receiverAvatar,
        chatId: ({ event }) => (event as any).chatId,
        callerName: ({ event }) => (event as any).callerName,
        callerAvatar: ({ event }) => (event as any).callerAvatar,
        isIncoming: () => false,
        error: () => null,
    }),

    setIncomingCall: assign({
        callId: ({ event }) => (event as any).callId,
        remoteUserId: ({ event }) => (event as any).callerId,
        remoteUserName: ({ event }) => (event as any).callerName,
        remoteUserAvatar: ({ event }) => (event as any).callerAvatar,
        chatId: ({ event }) => (event as any).chatId,
        isIncoming: () => true,
        error: () => null,
    }),

    setOutgoingCallId: assign({
        callId: ({ event }) => (event as any).callId,
    }),

    setAgoraCredentials: assign({
        agoraChannel: ({ event }) => (event as any).agora?.channelName || null,
        agoraToken: ({ event }) => (event as any).agora?.token || null,
        agoraUid: ({ event }) => (event as any).agora?.uid || null,
        agoraAppId: ({ event }) => (event as any).agora?.appId || null,
    }),

    setLocalTracks: assign({
        localVideoTrack: ({ event }) => (event as any).localVideoTrack,
        localAudioTrack: ({ event }) => (event as any).localAudioTrack,
    }),

    setRemoteTracks: assign({
        remoteVideoTrack: ({ event }) => (event as any).videoTrack ?? null,
        remoteAudioTrack: ({ event }) => (event as any).audioTrack ?? null,
    }),

    updateRemoteTracks: assign({
        remoteVideoTrack: ({ context, event }) => (event as any).videoTrack !== undefined ? (event as any).videoTrack : context.remoteVideoTrack,
        remoteAudioTrack: ({ context, event }) => (event as any).audioTrack !== undefined ? (event as any).audioTrack : context.remoteAudioTrack,
    }),

    clearRemoteTracks: assign({
        remoteVideoTrack: () => null,
        remoteAudioTrack: () => null,
    }),

    setCallStarted: assign({
        startTime: ({ event }) => (event as any).startTime || Date.now(),
        duration: ({ event }) => (event as any).duration || VIDEO_CALL_DURATION,
        remainingTime: ({ event }) => (event as any).duration || VIDEO_CALL_DURATION,
    }),

    setCallEnded: assign({
        canRejoin: ({ event }) => (event as any).canRejoin || false,
        canRejoinFromServer: ({ event }) => (event as any).canRejoin, // Preserve server's explicit decision
        remainingTime: ({ context, event }) => (event as any).remainingTime ?? context.remainingTime,
        error: ({ event }) => {
            const reason = (event as any).reason;
            if (reason === 'timer_expired') return 'Call time limit reached';
            if (reason === 'rejected') return 'Call rejected';
            if (reason === 'soft_end') return null; // No error for soft end
            if (reason === 'caller_ended' || reason === 'receiver_ended') return 'The other user ended the call';
            return 'Call ended';
        },
    }),

    setRejoinData: assign({
        agoraChannel: ({ event }) => (event as any).agora?.channelName || null,
        agoraToken: ({ event }) => (event as any).agora?.token || null,
        agoraUid: ({ event }) => (event as any).agora?.uid || null,
        agoraAppId: ({ event }) => (event as any).agora?.appId || null,
        remainingTime: ({ event }) => (event as any).remainingSeconds || 0,
        startTime: ({ event }) => (event as any).startTime || Date.now(),
        wasRejoined: () => true,
        canRejoin: () => false,
    }),

    setPeerDisconnected: assign({
        isPeerDisconnected: () => true,
    }),

    setPeerRejoined: assign({
        isPeerDisconnected: () => false,
        remainingTime: ({ context, event }) => (event as any).remainingTime ?? context.remainingTime,
    }),

    toggleMute: assign({
        isMuted: ({ context }) => !context.isMuted,
    }),

    toggleCamera: assign({
        isCameraOff: ({ context }) => !context.isCameraOff,
    }),

    setError: assign({
        error: ({ event }) => (event as any).error || (event as any).message || 'An error occurred',
    }),

    decrementTimer: assign({
        remainingTime: ({ context }) => Math.max(0, context.remainingTime - 1),
    }),

    resetContext: assign(initialContext),
};

// ==================== STATE MACHINE ====================

export const videoCallMachine = setup({
    types: {
        context: {} as VideoCallContext,
        events: {} as VideoCallEvent,
    },
    guards,
    actions: actions as any, // Type assertion to avoid complex XState inference issues
    // Note: Type assertion used because XState v5's strict typing struggles with
    // string action references when passed through setup(). The machine works correctly at runtime.
}).createMachine({
    id: 'videoCall',
    initial: 'idle',
    context: initialContext,

    states: {
        // ==================== IDLE ====================
        idle: {
            entry: actions.resetContext,
            on: {
                REQUEST_CALL: {
                    target: 'requesting',
                    actions: actions.setCallRequest,
                },
                CALL_INCOMING: {
                    target: 'ringing',
                    actions: actions.setIncomingCall,
                },
                CALL_CLEAR_ALL: {
                    // Already idle, just ensure cleanup
                    actions: actions.resetContext,
                },
            },
        },

        // ==================== REQUESTING ====================
        // Male is initiating a call - waiting for media permissions
        requesting: {
            on: {
                MEDIA_INITIALIZED: {
                    actions: actions.setLocalTracks,
                },
                CALL_OUTGOING: {
                    target: 'ringing',
                    actions: actions.setOutgoingCallId,
                },
                MEDIA_FAILED: {
                    target: 'idle',
                    actions: actions.setError,
                },
                CALL_ERROR: {
                    target: 'idle',
                    actions: actions.setError,
                },
                END_CALL: {
                    target: 'idle',
                },
                CALL_CLEAR_ALL: {
                    target: 'idle',
                },
            },
        },

        // ==================== RINGING ====================
        // Call is ringing - outgoing (male) or incoming (female)
        ringing: {
            on: {
                // For caller (male) - received acceptance
                CALL_ACCEPTED: {
                    target: 'connecting',
                    actions: actions.setAgoraCredentials,
                    guard: 'isValidCallId',
                },
                // For receiver (female) - user accepts
                ACCEPT_CALL: {
                    target: 'connecting',
                },
                // For receiver (female) - receives credentials after accepting
                CALL_PROCEED: {
                    target: 'connecting',
                    actions: actions.setAgoraCredentials,
                    guard: 'isValidCallId',
                },
                REJECT_CALL: {
                    target: 'idle',
                },
                CALL_REJECTED: {
                    target: 'ended',
                    actions: assign({
                        error: () => 'Call rejected. Coins refunded.',
                    }),
                    guard: 'isValidCallId',
                },
                CALL_MISSED: {
                    target: 'ended',
                    actions: assign({
                        error: () => 'Call missed. Coins refunded.',
                    }),
                    guard: 'isValidCallId',
                },
                END_CALL: {
                    target: 'idle',
                },
                CALL_ERROR: {
                    target: 'idle',
                    actions: actions.setError,
                },
                CALL_CLEAR_ALL: {
                    target: 'idle',
                },
            },
        },

        // ==================== CONNECTING ====================
        // Establishing Agora connection
        connecting: {
            on: {
                MEDIA_INITIALIZED: {
                    actions: actions.setLocalTracks,
                },
                // Female receives credentials after accepting
                CALL_PROCEED: {
                    actions: actions.setAgoraCredentials,
                    guard: 'isValidCallId',
                },
                // Agora successfully connected - transition to connected
                // This handles both initial connection and rejoin cases
                AGORA_CONNECTED: {
                    target: 'connected',
                },
                // Also handle CALL_STARTED in case it arrives
                CALL_STARTED: {
                    target: 'connected',
                    actions: actions.setCallStarted,
                    guard: 'isValidCallId',
                },
                REMOTE_USER_JOINED: {
                    actions: actions.setRemoteTracks,
                },
                REMOTE_TRACK_UPDATED: {
                    actions: actions.updateRemoteTracks,
                },
                AGORA_FAILED: {
                    target: 'ended',
                    actions: actions.setError,
                },
                CALL_ENDED: {
                    target: 'ended',
                    actions: actions.setCallEnded,
                    guard: 'isValidCallId',
                },
                END_CALL: {
                    target: 'idle',
                },
                CALL_ERROR: {
                    target: 'ended',
                    actions: actions.setError,
                },
                CALL_CLEAR_ALL: {
                    target: 'idle',
                },
            },
        },

        // ==================== CONNECTED ====================
        // Live video call in progress
        connected: {
            on: {
                TOGGLE_MUTE: {
                    actions: actions.toggleMute,
                },
                TOGGLE_CAMERA: {
                    actions: actions.toggleCamera,
                },
                REMOTE_USER_JOINED: {
                    actions: actions.setRemoteTracks,
                },
                REMOTE_TRACK_UPDATED: {
                    actions: actions.updateRemoteTracks,
                },
                REMOTE_USER_LEFT: {
                    actions: actions.clearRemoteTracks,
                },
                PEER_WAITING: {
                    actions: actions.setPeerDisconnected,
                    guard: 'isValidCallId',
                },
                PEER_REJOINED: {
                    actions: actions.setPeerRejoined,
                    guard: 'isValidCallId',
                },
                TIMER_TICK: {
                    actions: actions.decrementTimer,
                },
                TIMER_EXPIRED: {
                    target: 'ended',
                    actions: assign({
                        error: () => 'Call time limit reached',
                        canRejoin: () => false,
                    }),
                },
                END_CALL: {
                    target: 'ended',
                    actions: assign({
                        // Intentional end by user is always a hard end
                        canRejoin: () => false,
                    }),
                },
                CALL_ENDED: {
                    target: 'ended',
                    actions: actions.setCallEnded,
                    guard: 'isValidCallId',
                },
                CALL_FORCE_END: {
                    target: 'ended',
                    actions: assign({
                        error: () => 'Call time limit reached',
                        canRejoin: () => false,
                    }),
                    guard: 'isValidCallId',
                },
                CALL_ERROR: {
                    target: 'ended',
                    actions: actions.setError,
                },
                CALL_CLEAR_ALL: {
                    target: 'idle',
                },
            },
        },

        // ==================== INTERRUPTED ====================
        // Call temporarily paused - waiting for rejoin
        interrupted: {
            on: {
                REJOIN_CALL: {
                    target: 'rejoining',
                    guard: 'canRejoin',
                },
                REJOIN_TIMEOUT: {
                    target: 'ended',
                    actions: assign({
                        canRejoin: () => false,
                        error: () => 'Rejoin window expired',
                    }),
                },
                END_CALL: {
                    target: 'idle',
                },
                CALL_CLEAR_ALL: {
                    target: 'idle',
                },
            },
        },

        // ==================== REJOINING ====================
        // User is rejoining an interrupted call
        rejoining: {
            on: {
                REJOIN_PROCEED: {
                    target: 'connecting',
                    actions: actions.setRejoinData,
                    guard: 'isValidCallId',
                },
                AGORA_FAILED: {
                    target: 'ended',
                    actions: actions.setError,
                },
                CALL_ERROR: {
                    target: 'ended',
                    actions: actions.setError,
                },
                END_CALL: {
                    target: 'idle',
                },
                CALL_CLEAR_ALL: {
                    target: 'idle',
                },
            },
        },

        // ==================== ENDED ====================
        // Call has ended - may show rejoin option
        ended: {
            on: {
                REJOIN_CALL: {
                    target: 'rejoining',
                    guard: 'canRejoin',
                },
                END_CALL: {
                    target: 'idle',
                },
                CLOSE_MODAL: {
                    target: 'idle',
                },
                // Auto-transition after rejoin window
                REJOIN_TIMEOUT: {
                    target: 'idle',
                },
                CALL_CLEAR_ALL: {
                    target: 'idle',
                },
                // Allow new calls even from ended state
                REQUEST_CALL: {
                    target: 'requesting',
                    actions: actions.setCallRequest,
                },
                CALL_INCOMING: {
                    target: 'ringing',
                    actions: actions.setIncomingCall,
                },
            },
        },
    },
} as any);

export type VideoCallMachine = typeof videoCallMachine;
export type VideoCallState = ReturnType<typeof videoCallMachine.getInitialSnapshot>;
