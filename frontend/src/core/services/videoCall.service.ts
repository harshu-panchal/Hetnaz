/**
 * Video Call Service - Agora SDK Client for Video Calling
 * @purpose: Manage Agora video call connections and signaling
 * 
 * UPDATED: Replaced WebRTC with Agora SDK for more reliable video calls
 */

import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack, IRemoteVideoTrack, IRemoteAudioTrack } from 'agora-rtc-sdk-ng';
import socketService from './socket.service';
import { audioManager } from '../utils/audioManager';

// Environment config
const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID || '';

export const VIDEO_CALL_PRICE = parseInt(import.meta.env.VITE_VIDEO_CALL_PRICE || '500', 10);
export const VIDEO_CALL_DURATION = parseInt(import.meta.env.VITE_VIDEO_CALL_DURATION || '300', 10);

export interface CallState {
    callId: string | null;
    status: 'idle' | 'requesting' | 'ringing' | 'connecting' | 'connected' | 'ended';
    isIncoming: boolean;
    remoteUserId: string | null;
    remoteUserName: string | null;
    remoteUserAvatar: string | null;
    localVideoTrack: ICameraVideoTrack | null;
    localAudioTrack: IMicrophoneAudioTrack | null;
    remoteVideoTrack: IRemoteVideoTrack | null;
    remoteAudioTrack: IRemoteAudioTrack | null;
    startTime: number | null;
    duration: number;
    error: string | null;
    isMuted: boolean;
    isCameraOff: boolean;
    wasRejoined: boolean;
    isPeerDisconnected: boolean;
    // Agora specific
    agoraChannel: string | null;
    agoraToken: string | null;
    agoraUid: number | null;
}

interface AgoraCredentials {
    channelName: string;
    token: string;
    uid: number;
    appId: string;
}

type CallEventCallback = (data: any) => void;

class VideoCallService {
    private agoraClient: IAgoraRTCClient | null = null;
    private localVideoTrack: ICameraVideoTrack | null = null;
    private localAudioTrack: IMicrophoneAudioTrack | null = null;
    private remoteVideoTrack: IRemoteVideoTrack | null = null;
    private remoteAudioTrack: IRemoteAudioTrack | null = null;
    private callState: CallState = this.getInitialState();
    private listeners: Map<string, Set<CallEventCallback>> = new Map();
    private listenersInitialized = false;
    private isJoining = false;

    constructor() {
        // Configure Agora SDK
        AgoraRTC.setLogLevel(1); // 0=DEBUG, 1=INFO, 2=WARNING, 3=ERROR, 4=NONE

        // Auto-initialize socket listeners
        this.setupSocketListeners();
    }

    private getInitialState(): CallState {
        return {
            callId: null,
            status: 'idle',
            isIncoming: false,
            remoteUserId: null,
            remoteUserName: null,
            remoteUserAvatar: null,
            localVideoTrack: null,
            localAudioTrack: null,
            remoteVideoTrack: null,
            remoteAudioTrack: null,
            startTime: null,
            duration: VIDEO_CALL_DURATION,
            error: null,
            isMuted: false,
            isCameraOff: false,
            wasRejoined: false,
            isPeerDisconnected: false,
            agoraChannel: null,
            agoraToken: null,
            agoraUid: null,
        };
    }

    /**
     * Initialize socket event listeners
     */
    setupSocketListeners() {
        if (this.listenersInitialized) {
            console.log('📞 Socket listeners already initialized, skipping');
            return;
        }
        this.listenersInitialized = true;
        console.log('📞📞📞 Setting up Agora video call socket listeners');

        // Incoming call
        socketService.on('call:incoming', this.handleIncomingCall.bind(this));

        // Call accepted by receiver (includes Agora credentials)
        socketService.on('call:accepted', this.handleCallAccepted.bind(this));

        // Proceed with Agora (for receiver, includes Agora credentials)
        socketService.on('call:proceed', this.handleCallProceed.bind(this));

        // Call rejected
        socketService.on('call:rejected', this.handleCallRejected.bind(this));

        // Call started (Agora connected)
        socketService.on('call:started', this.handleCallStarted.bind(this));

        // Call ended
        socketService.on('call:ended', this.handleCallEnded.bind(this));

        // Force end (timer expired)
        socketService.on('call:force-end', this.handleForceEnd.bind(this));

        // Error
        socketService.on('call:error', this.handleCallError.bind(this));

        // Outgoing call status
        socketService.on('call:outgoing', this.handleOutgoingCall.bind(this));

        // Missed call
        socketService.on('call:missed', this.handleMissedCall.bind(this));

        // Rejoin proceed
        socketService.on('call:rejoin-proceed', this.handleRejoinProceed.bind(this));

        // Peer waiting/rejoined events
        socketService.on('call:waiting', this.handlePeerWaiting.bind(this));
        socketService.on('call:peer-rejoined', this.handlePeerRejoined.bind(this));

        console.log('📞 Agora video call socket listeners initialized');
    }

    /**
     * Request a video call
     */
    async requestCall(receiverId: string, receiverName: string, receiverAvatar: string, chatId: string, callerName: string, callerAvatar: string): Promise<void> {
        console.log('═══════════════════════════════════════════════════════');
        console.log('🔵 MALE (CALLER) - STEP 1: Initiating Video Call');
        console.log('═══════════════════════════════════════════════════════');
        console.log('   Receiver ID:', receiverId);
        console.log('   Receiver Name:', receiverName);
        console.log('   Chat ID:', chatId);
        console.log('   Current Status:', this.callState.status);

        // Guardrail: Cleanup if we are in 'ended' state before a new call
        if (this.callState.status === 'ended') {
            console.log('🧹 Cleaning up previous ended session before new request');
            await this.cleanup();
        }

        if (this.callState.status !== 'idle') {
            console.error('❌ MALE - Cannot initiate call - already in call:', this.callState.status);
            throw new Error('Already in a call');
        }

        console.log('🔵 MALE - STEP 2: Setting status to requesting');
        this.updateState({
            status: 'requesting',
            remoteUserId: receiverId,
            remoteUserName: receiverName,
            remoteUserAvatar: receiverAvatar,
            isIncoming: false,
        });

        // Pre-initialize local media
        try {
            console.log('🔵 MALE - STEP 3: Initializing camera and microphone...');
            await this.initializeLocalMedia();
            console.log('✅ MALE - STEP 3 COMPLETE: Camera/mic ready');
        } catch (error: any) {
            console.error('❌ MALE - STEP 3 FAILED:', error.message);
            const errorMsg = error.message || 'Camera/Microphone access denied';
            this.updateState({ status: 'idle', error: errorMsg });
            throw new Error(errorMsg);
        }

        console.log('🔵 MALE - STEP 4: Sending call request to backend...');
        // Send call request via socket
        socketService.emitToServer('call:request', {
            receiverId,
            chatId,
            callerName,
            callerAvatar,
        });
        console.log('✅ MALE - STEP 4 COMPLETE: Request sent to backend');
    }

    /**
     * Accept an incoming call
     */
    async acceptCall(callId: string): Promise<void> {
        console.log('═══════════════════════════════════════════════════════');
        console.log('🟣 FEMALE (RECEIVER) - STEP 1: Accepting Video Call');
        console.log('═══════════════════════════════════════════════════════');
        console.log('   Call ID:', callId);
        console.log('   Current Status:', this.callState.status);

        if (this.callState.status !== 'ringing') {
            console.error('❌ FEMALE - Cannot accept - status is not ringing:', this.callState.status);
            throw new Error('No incoming call to accept');
        }

        console.log('🟣 FEMALE - STEP 2: Setting status to connecting');
        this.updateState({ status: 'connecting' });

        // Initialize local media
        try {
            console.log('🟣 FEMALE - STEP 3: Initializing camera and microphone...');
            await this.initializeLocalMedia();
            console.log('✅ FEMALE - STEP 3 COMPLETE: Camera/mic ready');
        } catch (error: any) {
            console.error('❌ FEMALE - STEP 3 FAILED:', error);
            const errorMsg = error.message || 'Camera/Microphone access denied';
            this.updateState({ status: 'idle', error: errorMsg });
            throw new Error(errorMsg);
        }

        console.log('🟣 FEMALE - STEP 4: Sending call:accept to backend');
        // Accept call via socket - backend will send Agora credentials
        socketService.emitToServer('call:accept', { callId });
        console.log('✅ FEMALE - STEP 4 COMPLETE: Acceptance sent to backend');
    }

    /**
     * Reject an incoming call
     */
    rejectCall(callId: string): void {
        audioManager.stopRingtone();
        socketService.emitToServer('call:reject', { callId });
        this.cleanup();
    }

    /**
     * End the current call
     */
    endCall(): void {
        if (!this.callState.callId) return;

        console.log('📞 Sending call:end to backend');
        socketService.emitToServer('call:end', { callId: this.callState.callId });

        // If we are already in the 'ended' (interrupted/rejoin) screen and click End Permanently
        // then we trigger immediate hard cleanup and return to idle.
        if (this.callState.status === 'ended') {
            console.log('🧹 Manual permanent end requested. Cleaning up.');
            this.cleanup();
            this.updateState({ status: 'idle' });
        } else {
            // Normal end while connected:
            // We DO NOT cleanup yet. We wait for the backend 'call:ended' event.
            // If backend says canRejoin: true, the UI will transition to 'ended' (rejoin mode).
            // If backend says canRejoin: false, it will trigger handleCallEnded -> cleanup.
            console.log('⏸️ Requesting soft end...');
        }
    }

    /**
     * Rejoin an interrupted call
     */
    rejoinCall(): void {
        if (!this.callState.callId) return;
        console.log('🔄 Requesting to rejoin call:', this.callState.callId);
        this.isJoining = false; // Reset guard for rejoin
        socketService.emitToServer('call:rejoin', { callId: this.callState.callId });
        this.updateState({ status: 'connecting' });
    }

    /**
     * Toggle mute
     */
    toggleMute(): boolean {
        if (this.localAudioTrack) {
            const newMuteState = !this.callState.isMuted;
            if (newMuteState) {
                this.localAudioTrack.setEnabled(false);
            } else {
                this.localAudioTrack.setEnabled(true);
            }
            this.updateState({ isMuted: newMuteState });
            return newMuteState;
        }
        return this.callState.isMuted;
    }

    /**
     * Toggle camera
     */
    toggleCamera(): boolean {
        if (this.localVideoTrack) {
            const newCameraOffState = !this.callState.isCameraOff;
            if (newCameraOffState) {
                this.localVideoTrack.setEnabled(false);
            } else {
                this.localVideoTrack.setEnabled(true);
            }
            this.updateState({ isCameraOff: newCameraOffState });
            return newCameraOffState;
        }
        return this.callState.isCameraOff;
    }

    /**
     * Get current call state
     */
    getState(): CallState {
        return { ...this.callState };
    }

    /**
     * Subscribe to state changes
     */
    onStateChange(callback: CallEventCallback): () => void {
        if (!this.listeners.has('stateChange')) {
            this.listeners.set('stateChange', new Set());
        }
        this.listeners.get('stateChange')!.add(callback);

        return () => {
            this.listeners.get('stateChange')?.delete(callback);
        };
    }

    /**
     * Get local video track for rendering
     */
    getLocalVideoTrack(): ICameraVideoTrack | null {
        return this.localVideoTrack;
    }

    /**
     * Get remote video track for rendering
     */
    getRemoteVideoTrack(): IRemoteVideoTrack | null {
        return this.remoteVideoTrack;
    }

    // ==================== PRIVATE METHODS ====================

    private updateState(partialState: Partial<CallState>) {
        this.callState = { ...this.callState, ...partialState };
        this.notifyListeners('stateChange', this.callState);
    }

    private notifyListeners(event: string, data: any) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach((cb) => cb(data));
        }
    }

    private async initializeLocalMedia(): Promise<void> {
        if (this.localVideoTrack && this.localAudioTrack) {
            return;
        }

        try {
            console.log('📹 Initializing local media with Agora...');

            // Create local audio and video tracks directly
            // Permission is already granted by VideoCallContext before this is called
            [this.localAudioTrack, this.localVideoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
                {
                    AEC: true, // Acoustic Echo Cancellation
                    ANS: true, // Automatic Noise Suppression
                    AGC: true, // Automatic Gain Control
                },
                {
                    encoderConfig: {
                        width: 640,
                        height: 480,
                        frameRate: 24,
                        bitrateMax: 1000,
                    },
                    optimizationMode: 'motion', // Better for video calls
                }
            );

            // Ensure video track is enabled and playing
            if (this.localVideoTrack) {
                await this.localVideoTrack.setEnabled(true);
            }

            this.updateState({
                localVideoTrack: this.localVideoTrack,
                localAudioTrack: this.localAudioTrack,
            });

            console.log('📹 Local media initialized successfully');
        } catch (error: any) {
            console.error('Failed to get local media:', error);

            // Provide user-friendly error messages
            if (error.message?.includes('denied') || error.message?.includes('Permission')) {
                throw new Error('Camera/Microphone permission denied. Please enable in your device settings.');
            } else if (error.message?.includes('NotFoundError') || error.message?.includes('not found')) {
                throw new Error('Camera or microphone not found on your device.');
            } else if (error.message?.includes('NotReadableError') || error.message?.includes('not start')) {
                throw new Error('Camera is being used by another app. Please close other apps and try again.');
            }

            throw error;
        }
    }

    // JOIN AGORA CHANNEL
    private async joinAgoraChannel(credentials: AgoraCredentials): Promise<void> {
        if (this.isJoining) {
            console.warn('⚠️ Agora join already in progress, ignoring duplicate call');
            return;
        }

        this.isJoining = true;
        try {
            console.log('🎥 Joining Agora channel:', credentials.channelName);

            // Create Agora client if not exists
            if (!this.agoraClient) {
                this.agoraClient = AgoraRTC.createClient({
                    mode: 'rtc',
                    codec: 'vp8'
                });

                // Enable Cloud Proxy (Force Port 443) for reliable connections in India
                try {
                    this.agoraClient.startProxyServer(3);
                    console.log('🌐 Agora Cloud Proxy (Port 443) enabled');
                } catch (e) {
                    console.warn('⚠️ Could not start Agora Proxy:', e);
                }

                // Handle remote user publishing
                this.agoraClient.on('user-published', async (user, mediaType) => {
                    console.log('🎥 Remote user published:', user.uid, mediaType);

                    try {
                        // Check if we're still connected before subscribing
                        if (this.agoraClient?.connectionState !== 'CONNECTED') {
                            console.warn('⚠️ Cannot subscribe - not connected. State:', this.agoraClient?.connectionState);
                            return;
                        }

                        // Subscribe to their track
                        await this.agoraClient!.subscribe(user, mediaType);

                        if (mediaType === 'video') {
                            this.remoteVideoTrack = user.videoTrack || null;
                            this.updateState({ remoteVideoTrack: this.remoteVideoTrack });
                        }
                        if (mediaType === 'audio') {
                            this.remoteAudioTrack = user.audioTrack || null;
                            this.updateState({ remoteAudioTrack: this.remoteAudioTrack });
                            // Play audio automatically
                            user.audioTrack?.play();
                        }
                    } catch (error: any) {
                        console.error('❌ Failed to subscribe to remote user:', error.message);
                    }
                });

                // Handle remote user unpublishing
                this.agoraClient.on('user-unpublished', (user, mediaType) => {
                    console.log('🎥 Remote user unpublished:', user.uid, mediaType);
                    if (mediaType === 'video') {
                        this.remoteVideoTrack = null;
                        this.updateState({ remoteVideoTrack: null });
                    }
                    if (mediaType === 'audio') {
                        this.remoteAudioTrack = null;
                        this.updateState({ remoteAudioTrack: null });
                    }
                });

                // Handle remote user leaving
                this.agoraClient.on('user-left', (user) => {
                    console.log('🎥 Remote user left:', user.uid);
                    this.remoteVideoTrack = null;
                    this.remoteAudioTrack = null;
                    this.updateState({
                        remoteVideoTrack: null,
                        remoteAudioTrack: null
                    });
                });
            }

            // Use appId from credentials or fallback to env
            const appId = credentials.appId || AGORA_APP_ID;

            if (!appId) {
                throw new Error('Agora App ID is missing. Please check your environment configuration.');
            }

            // Join the channel with up to 3 retries
            let lastError: any;
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    console.log(`🎥 Agora join attempt ${attempt}/3...`);
                    await this.agoraClient.join(
                        appId,
                        credentials.channelName,
                        credentials.token,
                        credentials.uid
                    );
                    console.log('🎥 Joined Agora channel successfully');
                    lastError = null;
                    break; // Success!
                } catch (joinError: any) {
                    lastError = joinError;
                    console.warn(`⚠️ Agora join attempt ${attempt} failed:`, joinError.message);

                    // If it's the last attempt, don't wait
                    if (attempt < 3) {
                        const delay = attempt * 1000;
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }
            }

            if (lastError) {
                console.error('❌ All Agora join attempts failed:', lastError);
                if (lastError.code === 'INVALID_PARAMS') {
                    throw new Error('Invalid Agora credentials. Please contact support.');
                } else if (lastError.code === 'NETWORK_ERROR') {
                    throw new Error('Network error. Please check your internet connection.');
                } else {
                    throw new Error(`Failed to join video call after 3 attempts: ${lastError.message || 'Unknown error'}`);
                }
            }

            // Publish local tracks
            try {
                if (this.localAudioTrack && this.localVideoTrack) {
                    await this.localVideoTrack.setEnabled(true);
                    await this.localAudioTrack.setEnabled(true);

                    await this.agoraClient.publish([this.localAudioTrack, this.localVideoTrack]);
                    console.log('🎥 Published local tracks');
                }

                this.updateState({
                    agoraChannel: credentials.channelName,
                    agoraToken: credentials.token,
                    agoraUid: credentials.uid,
                });

                // Notify backend that we are connected
                if (this.callState.status !== 'connected') {
                    console.log('🎥 Notifying backend: call connected');
                    socketService.emitToServer('call:connected', { callId: this.callState.callId });
                }
            } catch (publishError: any) {
                console.error('❌ Failed to publish local tracks:', publishError);
                if (this.callState.status !== 'connected') {
                    throw publishError;
                }
            }
        } catch (error: any) {
            console.error('Failed to join Agora channel:', error);
            if (this.callState.status !== 'connected') {
                console.log('❌ Reporting connection failure to backend');
                socketService.emitToServer('call:connection-failed', { callId: this.callState.callId });
            }
            throw error;
        } finally {
            this.isJoining = false;
        }
    }

    public async cleanup(): Promise<void> {
        console.log('🧹 Cleaning up video call resources (Hard Cleanup)...');

        this.isJoining = false;

        // 1. Stop and close local tracks
        const audioTrack = this.localAudioTrack;
        if (audioTrack) {
            try {
                audioTrack.stop();
                audioTrack.close();
            } catch (e) {
                console.warn('Error stopping audio track:', e);
            }
            this.localAudioTrack = null;
        }

        const videoTrack = this.localVideoTrack;
        if (videoTrack) {
            try {
                videoTrack.stop();
                videoTrack.close();
            } catch (e) {
                console.warn('Error stopping video track:', e);
            }
            this.localVideoTrack = null;
        }

        // 2. Leave Agora channel and fully destroy client
        const client = this.agoraClient;
        if (client) {
            try {
                const state = client.connectionState;
                if (state !== 'DISCONNECTED') {
                    await client.leave();
                }
                client.removeAllListeners();
            } catch (e) {
                console.warn('Error leaving Agora channel:', e);
            }
            // Only nullify if it's still the same client
            if (this.agoraClient === client) {
                this.agoraClient = null;
            }
        }

        // 3. Reset tracks
        this.remoteVideoTrack = null;
        this.remoteAudioTrack = null;

        // 4. Reset state to IDLE
        this.callState = this.getInitialState();
        this.notifyListeners('stateChange', this.callState);

        console.log('🧹 Cleanup complete. System idle.');
    }

    // ==================== SOCKET EVENT HANDLERS ====================

    private validateCallId(dataCallId?: string): boolean {
        if (!dataCallId) return true;
        if (!this.callState.callId) return true;

        if (dataCallId !== this.callState.callId) {
            console.warn(`⚠️ Ignoring event for mismatched callId. Current: ${this.callState.callId}, Event: ${dataCallId}`);
            return false;
        }
        return true;
    }

    private handleIncomingCall(data: any): void {
        const isActuallyInCall = this.callState.status !== 'idle' && this.callState.status !== 'ended';
        if (this.callState.callId === data.callId || isActuallyInCall) {
            console.log('📞 Ignoring duplicate or overlapping incoming call:', data.callId);
            return;
        }

        if (this.callState.status === 'ended') {
            this.cleanup();
        }

        console.log('📞 Incoming call:', data);
        audioManager.playRingtone();

        this.updateState({
            callId: data.callId,
            status: 'ringing',
            isIncoming: true,
            remoteUserId: data.callerId,
            remoteUserName: data.callerName,
            remoteUserAvatar: data.callerAvatar,
            duration: data.duration || VIDEO_CALL_DURATION,
        });
    }

    private handleOutgoingCall(data: any): void {
        if (!this.validateCallId(data.callId)) return;
        console.log('📞 Outgoing call status:', data);
        audioManager.playRingtone();

        this.updateState({
            callId: data.callId,
            status: 'ringing',
            duration: data.duration || VIDEO_CALL_DURATION,
        });
    }

    private async handleCallAccepted(data: any): Promise<void> {
        if (!this.validateCallId(data.callId)) return;

        const currentStatus = this.callState.status as string;
        if (currentStatus === 'connecting' || currentStatus === 'connected') {
            console.log('📞 Ignoring call:accepted as status is already:', currentStatus);
            return;
        }

        console.log('📞 Call accepted with Agora credentials:', data);

        if (this.callState.status !== 'connected') {
            this.isJoining = false; // Reset guard for rejoin
            this.updateState({ status: 'connecting' });
        }

        if (data.agora) {
            try {
                await this.joinAgoraChannel(data.agora);
            } catch (error) {
                console.error('Failed to join Agora channel:', error);
                if (this.callState.status !== 'connected') {
                    this.updateState({ status: 'ended', error: 'Failed to connect video call' });
                    setTimeout(() => this.cleanup(), 2000);
                }
            }
        }
    }

    private async handleCallProceed(data: any): Promise<void> {
        if (!this.validateCallId(data.callId)) return;

        const currentStatus = this.callState.status as string;
        if (currentStatus === 'connecting' || currentStatus === 'connected') {
            console.log('🎯 Ignoring call:proceed as status is already:', currentStatus);
            return;
        }

        console.log('🎯 STEP 5: Received call:proceed from backend');

        if (data.agora) {
            try {
                await this.joinAgoraChannel(data.agora);
            } catch (error) {
                console.error('❌ Failed to join after proceed:', error);
                if (this.callState.status !== 'connected') {
                    this.cleanup();
                    this.updateState({ status: 'idle' });
                }
            }
        }
    }

    private handleCallRejected(data: any): void {
        if (!this.validateCallId(data.callId)) return;
        console.log('📞 Call rejected:', data);
        this.updateState({
            status: 'ended',
            error: data.refunded ? 'Call rejected. Coins refunded.' : 'Call rejected.',
        });
        setTimeout(() => this.cleanup(), 2000);
    }

    private handleCallStarted(data: any): void {
        if (!this.validateCallId(data.callId)) return;
        if (this.callState.status === 'connected') return;

        console.log('📞 Call started:', data);
        audioManager.stopRingtone();

        this.updateState({
            status: 'connected',
            startTime: data.startTime || Date.now(),
            duration: data.duration || VIDEO_CALL_DURATION,
        });
    }

    private async handleRejoinProceed(data: any): Promise<void> {
        if (!this.validateCallId(data.callId)) return;
        console.log('🔄 STEP 5-REJOIN: Received call:rejoin-proceed');

        if (data.agora) {
            try {
                this.updateState({
                    status: 'connecting',
                    wasRejoined: true,
                    startTime: data.startTime
                });

                await this.joinAgoraChannel(data.agora);
                this.updateState({ status: 'connected' });
                console.log('✅ REJOIN COMPLETE');
            } catch (error) {
                console.error('❌ Failed to rejoin Agora channel:', error);
                this.updateState({ status: 'ended', error: 'Failed to rejoin' });
            }
        }
    }

    private handleCallEnded(data: any): void {
        if (!this.validateCallId(data.callId)) return;
        console.log('📞 Call ended event received:', data);

        let errorMessage = null;
        if (data.reason === 'rejected') errorMessage = 'Call rejected';
        else if (data.reason === 'connection_failed') errorMessage = 'Connection failed. Please try again.';

        this.updateState({
            status: 'ended',
            error: errorMessage,
        });

        const canRejoin = data.canRejoin === true;

        if (canRejoin) {
            console.log('⏳ REJOIN WINDOW OPEN: Soft leave active.');
            if (this.agoraClient) {
                this.agoraClient.leave().catch(e => console.warn('Error during soft leave:', e));
            }
            if (this.localVideoTrack) {
                this.localVideoTrack.setEnabled(false);
            }

            setTimeout(() => {
                if (this.callState.status === 'ended') {
                    console.log('⏳ Rejoin window safety timeout. Hard cleaning up.');
                    this.cleanup();
                }
            }, 70000);
        } else {
            console.log('🧹 No rejoin possible. Hard cleaning up in 1s.');
            setTimeout(() => {
                if (this.callState.status === 'ended') {
                    this.cleanup();
                }
            }, 1000);
        }
    }

    private handleForceEnd(data: any): void {
        if (!this.validateCallId(data.callId)) return;
        console.log('📞 Force end:', data);
        this.updateState({
            status: 'ended',
            error: data.reason === 'timer_expired' ? 'Call time limit reached' : 'Call ended',
        });
        setTimeout(() => this.cleanup(), 1500);
    }

    private handleCallError(data: any): void {
        if (!this.validateCallId(data.callId)) return;
        console.error('📞 Call error:', data);

        this.updateState({
            status: 'ended',
            error: data.message || 'Call error',
        });

        const elapsed = this.callState.startTime
            ? Math.floor((Date.now() - this.callState.startTime) / 1000)
            : 0;
        const remaining = (this.callState.duration || VIDEO_CALL_DURATION) - elapsed;
        const canRejoin = remaining > 10 && !this.callState.wasRejoined;

        if (canRejoin) {
            setTimeout(() => {
                if (this.callState.status === 'ended') {
                    this.cleanup();
                }
            }, 70000);
        } else {
            setTimeout(() => this.cleanup(), 1500);
        }
    }

    private handleMissedCall(data: any): void {
        if (!this.validateCallId(data.callId)) return;
        console.log('📞 Missed call:', data);
        this.updateState({
            status: 'ended',
            error: 'Call missed. Coins refunded.',
        });
        setTimeout(() => this.cleanup(), 1500);
    }

    private handlePeerWaiting(data: any): void {
        if (!this.validateCallId(data.callId)) return;
        console.log('⏳ Peer disconnected. Waiting...', data);
        this.updateState({ isPeerDisconnected: true });
    }

    private handlePeerRejoined(data: any): void {
        if (!this.validateCallId(data.callId)) return;
        console.log('✅ Peer rejoined!', data);
        this.updateState({ isPeerDisconnected: false });
    }
}

// Singleton instance
const videoCallService = new VideoCallService();

export default videoCallService;
