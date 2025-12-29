/**
 * Video Call Service - Agora SDK Client for Video Calling
 * @purpose: Manage Agora video call connections and signaling
 * 
 * UPDATED: Replaced WebRTC with Agora SDK for more reliable video calls
 */

import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack, IRemoteVideoTrack, IRemoteAudioTrack } from 'agora-rtc-sdk-ng';
import socketService from './socket.service';

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

        console.log('📞 Agora video call socket listeners initialized');
    }

    /**
     * Request a video call
     */
    async requestCall(receiverId: string, receiverName: string, receiverAvatar: string, chatId: string, callerName: string, callerAvatar: string): Promise<void> {
        if (this.callState.status !== 'idle') {
            throw new Error('Already in a call');
        }

        this.updateState({
            status: 'requesting',
            remoteUserId: receiverId,
            remoteUserName: receiverName,
            remoteUserAvatar: receiverAvatar,
            isIncoming: false,
        });

        // Pre-initialize local media
        try {
            await this.initializeLocalMedia();
        } catch (error) {
            this.updateState({ status: 'idle', error: 'Camera/Microphone access denied' });
            throw error;
        }

        // Send call request via socket
        socketService.emitToServer('call:request', {
            receiverId,
            chatId,
            callerName,
            callerAvatar,
        });
    }

    /**
     * Accept an incoming call
     */
    async acceptCall(callId: string): Promise<void> {
        if (this.callState.status !== 'ringing') {
            throw new Error('No incoming call to accept');
        }

        this.updateState({ status: 'connecting' });

        // Initialize local media
        try {
            await this.initializeLocalMedia();
        } catch (error) {
            this.updateState({ status: 'idle', error: 'Camera/Microphone access denied' });
            throw error;
        }

        // Accept call via socket - backend will send Agora credentials
        socketService.emitToServer('call:accept', { callId });
    }

    /**
     * Reject an incoming call
     */
    rejectCall(callId: string): void {
        socketService.emitToServer('call:reject', { callId });
        this.cleanup();
    }

    /**
     * End the current call
     */
    endCall(): void {
        if (!this.callState.callId) return;

        socketService.emitToServer('call:end', { callId: this.callState.callId });
        this.cleanup();
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

            // Create local audio and video tracks
            [this.localAudioTrack, this.localVideoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
                {}, // Audio config
                {
                    encoderConfig: {
                        width: 640,
                        height: 480,
                        frameRate: 24,
                        bitrateMax: 1000,
                    }
                } // Video config
            );

            this.updateState({
                localVideoTrack: this.localVideoTrack,
                localAudioTrack: this.localAudioTrack,
            });

            console.log('📹 Local media initialized successfully');
        } catch (error) {
            console.error('Failed to get local media:', error);
            throw error;
        }
    }

    private async joinAgoraChannel(credentials: AgoraCredentials): Promise<void> {
        try {
            console.log('🎥 Joining Agora channel:', credentials.channelName);

            // Create Agora client if not exists
            if (!this.agoraClient) {
                this.agoraClient = AgoraRTC.createClient({
                    mode: 'rtc',
                    codec: 'vp8'
                });

                // Handle remote user publishing
                this.agoraClient.on('user-published', async (user, mediaType) => {
                    console.log('🎥 Remote user published:', user.uid, mediaType);

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

                // Handle connection state changes
                this.agoraClient.on('connection-state-change', (curState, _prevState, reason) => {
                    console.log('🎥 Agora connection state:', curState, 'reason:', reason);

                    if (curState === 'CONNECTED') {
                        // Notify backend that call is connected
                        socketService.emitToServer('call:connected', { callId: this.callState.callId });
                    } else if (curState === 'DISCONNECTED' || curState === 'DISCONNECTING') {
                        if (reason === 'NETWORK_ERROR') {
                            socketService.emitToServer('call:connection-failed', { callId: this.callState.callId });
                        }
                    }
                });
            }

            // Use appId from credentials or fallback to env
            const appId = credentials.appId || AGORA_APP_ID;

            // Join the channel
            await this.agoraClient.join(
                appId,
                credentials.channelName,
                credentials.token,
                credentials.uid
            );

            console.log('🎥 Joined Agora channel successfully');

            // Publish local tracks
            if (this.localAudioTrack && this.localVideoTrack) {
                await this.agoraClient.publish([this.localAudioTrack, this.localVideoTrack]);
                console.log('🎥 Published local tracks');
            }

            this.updateState({
                agoraChannel: credentials.channelName,
                agoraToken: credentials.token,
                agoraUid: credentials.uid,
            });

        } catch (error: any) {
            console.error('Failed to join Agora channel:', error);
            socketService.emitToServer('call:connection-failed', { callId: this.callState.callId });
            throw error;
        }
    }

    private async cleanup(): Promise<void> {
        console.log('🧹 Cleaning up video call resources...');

        // Stop and close local tracks
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

        // Leave Agora channel
        if (this.agoraClient) {
            try {
                await this.agoraClient.leave();
            } catch (e) {
                console.warn('Error leaving Agora channel:', e);
            }
            this.agoraClient = null;
        }

        this.remoteVideoTrack = null;
        this.remoteAudioTrack = null;


        // Reset state
        this.callState = this.getInitialState();
        this.notifyListeners('stateChange', this.callState);

        console.log('🧹 Cleanup complete');
    }

    // ==================== SOCKET EVENT HANDLERS ====================

    private handleIncomingCall(data: any): void {
        console.log('📞 Incoming call:', data);
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
        console.log('📞 Outgoing call status:', data);
        this.updateState({
            callId: data.callId,
            status: 'ringing',
            duration: data.duration || VIDEO_CALL_DURATION,
        });
    }

    private async handleCallAccepted(data: any): Promise<void> {
        console.log('📞 Call accepted with Agora credentials:', data);
        this.updateState({ status: 'connecting' });

        // Join Agora channel with provided credentials
        if (data.agora) {
            try {
                await this.joinAgoraChannel(data.agora);
            } catch (error) {
                console.error('Failed to join Agora channel:', error);
                this.updateState({ status: 'ended', error: 'Failed to connect video call' });
                setTimeout(() => this.cleanup(), 2000);
            }
        }
    }

    private async handleCallProceed(data: any): Promise<void> {
        console.log('📞 Proceeding with Agora credentials:', data);

        // Join Agora channel with provided credentials
        if (data.agora) {
            try {
                await this.joinAgoraChannel(data.agora);
            } catch (error) {
                console.error('Failed to join Agora channel:', error);
                this.updateState({ status: 'ended', error: 'Failed to connect video call' });
                setTimeout(() => this.cleanup(), 2000);
            }
        }
    }

    private handleCallRejected(data: any): void {
        console.log('📞 Call rejected:', data);
        this.updateState({
            status: 'ended',
            error: data.refunded ? 'Call rejected. Coins refunded.' : 'Call rejected.',
        });
        setTimeout(() => this.cleanup(), 2000);
    }

    private handleCallStarted(data: any): void {
        console.log('📞 Call started:', data);
        this.updateState({
            status: 'connected',
            startTime: data.startTime || Date.now(),
            duration: data.duration || VIDEO_CALL_DURATION,
        });
    }

    private handleCallEnded(data: any): void {
        console.log('📞 Call ended:', data);
        this.updateState({
            status: 'ended',
            error: data.reason === 'rejected' ? 'Call rejected' : null,
        });
        setTimeout(() => this.cleanup(), 2000);
    }

    private handleForceEnd(data: any): void {
        console.log('📞 Force end:', data);
        this.updateState({
            status: 'ended',
            error: data.reason === 'timer_expired' ? 'Call time limit reached' : 'Call ended',
        });
        setTimeout(() => this.cleanup(), 2000);
    }

    private handleCallError(data: any): void {
        console.error('📞 Call error:', data);
        this.updateState({
            status: 'ended',
            error: data.message,
        });
        setTimeout(() => this.cleanup(), 2000);
    }

    private handleMissedCall(data: any): void {
        console.log('📞 Missed call:', data);
        this.updateState({
            status: 'ended',
            error: 'Call missed. Coins refunded.',
        });
        setTimeout(() => this.cleanup(), 2000);
    }
}

// Singleton instance
const videoCallService = new VideoCallService();

export default videoCallService;
