/**
 * Video Call Service - WebRTC & Socket.IO Client for Video Calling
 * @purpose: Manage WebRTC peer connection and video call signaling
 */

import socketService from './socket.service';

// Environment config
const STUN_URL = import.meta.env.VITE_STUN_URL || 'stun:stun.l.google.com:19302';
const TURN_URLS = (import.meta.env.VITE_TURN_URL || '').split(',').filter(Boolean);
const TURN_USERNAME = import.meta.env.VITE_TURN_USERNAME || '';
const TURN_PASSWORD = import.meta.env.VITE_TURN_PASSWORD || '';

export const VIDEO_CALL_PRICE = parseInt(import.meta.env.VITE_VIDEO_CALL_PRICE || '500', 10);
export const VIDEO_CALL_DURATION = parseInt(import.meta.env.VITE_VIDEO_CALL_DURATION || '300', 10);

// Build ICE servers config
const getIceServers = (): RTCIceServer[] => {
    const servers: RTCIceServer[] = [
        { urls: STUN_URL },
    ];

    // Add TURN servers if configured
    TURN_URLS.forEach((url: string) => {
        if (url) {
            servers.push({
                urls: url,
                username: TURN_USERNAME,
                credential: TURN_PASSWORD,
            });
        }
    });

    return servers;
};

export interface CallState {
    callId: string | null;
    status: 'idle' | 'requesting' | 'ringing' | 'connecting' | 'connected' | 'ended';
    isIncoming: boolean;
    remoteUserId: string | null;
    remoteUserName: string | null;
    remoteUserAvatar: string | null;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    startTime: number | null;
    duration: number;
    error: string | null;
    isMuted: boolean;
    isCameraOff: boolean;
}

type CallEventCallback = (data: any) => void;

class VideoCallService {
    private peerConnection: RTCPeerConnection | null = null;
    private localStream: MediaStream | null = null;
    private remoteStream: MediaStream | null = null;
    private callState: CallState = this.getInitialState();
    private listeners: Map<string, Set<CallEventCallback>> = new Map();
    private iceCandidatesQueue: RTCIceCandidate[] = [];
    private remoteDescriptionSet = false;

    private getInitialState(): CallState {
        return {
            callId: null,
            status: 'idle',
            isIncoming: false,
            remoteUserId: null,
            remoteUserName: null,
            remoteUserAvatar: null,
            localStream: null,
            remoteStream: null,
            startTime: null,
            duration: VIDEO_CALL_DURATION,
            error: null,
            isMuted: false,
            isCameraOff: false,
        };
    }

    /**
     * Initialize socket event listeners
     */
    setupSocketListeners() {
        console.log('📞📞📞 Setting up video call socket listeners');
        // Incoming call
        socketService.on('call:incoming', this.handleIncomingCall.bind(this));

        // Call accepted by receiver
        socketService.on('call:accepted', this.handleCallAccepted.bind(this));

        // Proceed with WebRTC (for receiver)
        socketService.on('call:proceed', this.handleCallProceed.bind(this));

        // Call rejected
        socketService.on('call:rejected', this.handleCallRejected.bind(this));

        // Call started (WebRTC connected)
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

        // WebRTC signaling
        socketService.on('webrtc:offer', this.handleWebRTCOffer.bind(this));
        socketService.on('webrtc:answer', this.handleWebRTCAnswer.bind(this));
        socketService.on('webrtc:ice-candidate', this.handleICECandidate.bind(this));

        console.log('📞 Video call socket listeners initialized');
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

        // Start getting local media early
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

        // Accept call via socket
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
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                this.updateState({ isMuted: !audioTrack.enabled });
                return !audioTrack.enabled;
            }
        }
        return this.callState.isMuted;
    }

    /**
     * Toggle camera
     */
    toggleCamera(): boolean {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                this.updateState({ isCameraOff: !videoTrack.enabled });
                return !videoTrack.enabled;
            }
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

        // Return unsubscribe function
        return () => {
            this.listeners.get('stateChange')?.delete(callback);
        };
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

    private async initializeLocalMedia(): Promise<MediaStream> {
        if (this.localStream) {
            return this.localStream;
        }

        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: true,
            });

            this.updateState({ localStream: this.localStream });
            return this.localStream;
        } catch (error) {
            console.error('Failed to get local media:', error);
            throw error;
        }
    }

    private createPeerConnection(): RTCPeerConnection {
        const config: RTCConfiguration = {
            iceServers: getIceServers(),
        };

        this.peerConnection = new RTCPeerConnection(config);

        // Add local tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach((track) => {
                this.peerConnection!.addTrack(track, this.localStream!);
            });
        }

        // Handle remote tracks
        this.peerConnection.ontrack = (event) => {
            console.log('📞 Remote track received');
            if (event.streams && event.streams[0]) {
                this.remoteStream = event.streams[0];
                this.updateState({ remoteStream: this.remoteStream });
            }
        };

        // Handle ICE candidates
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate && this.callState.remoteUserId) {
                socketService.emitToServer('webrtc:ice-candidate', {
                    callId: this.callState.callId,
                    targetUserId: this.callState.remoteUserId,
                    candidate: event.candidate,
                });
            }
        };

        // Handle connection state
        this.peerConnection.onconnectionstatechange = () => {
            console.log('📞 Connection state:', this.peerConnection?.connectionState);

            if (this.peerConnection?.connectionState === 'connected') {
                // Notify backend of WebRTC connection
                socketService.emitToServer('call:connected', { callId: this.callState.callId });
            } else if (this.peerConnection?.connectionState === 'failed') {
                socketService.emitToServer('call:connection-failed', { callId: this.callState.callId });
                this.cleanup();
            }
        };

        this.peerConnection.oniceconnectionstatechange = () => {
            console.log('📞 ICE state:', this.peerConnection?.iceConnectionState);
        };

        return this.peerConnection;
    }

    private async createAndSendOffer(): Promise<void> {
        if (!this.peerConnection || !this.callState.remoteUserId) return;

        try {
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);

            socketService.emitToServer('webrtc:offer', {
                callId: this.callState.callId,
                targetUserId: this.callState.remoteUserId,
                offer: offer,
            });
        } catch (error) {
            console.error('Failed to create offer:', error);
        }
    }

    private async processQueuedCandidates(): Promise<void> {
        if (!this.peerConnection || !this.remoteDescriptionSet) return;

        while (this.iceCandidatesQueue.length > 0) {
            const candidate = this.iceCandidatesQueue.shift();
            if (candidate) {
                try {
                    await this.peerConnection.addIceCandidate(candidate);
                } catch (error) {
                    console.error('Failed to add queued ICE candidate:', error);
                }
            }
        }
    }

    private cleanup(): void {
        // Stop local media
        if (this.localStream) {
            this.localStream.getTracks().forEach((track) => track.stop());
            this.localStream = null;
        }

        // Close peer connection
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        this.remoteStream = null;
        this.iceCandidatesQueue = [];
        this.remoteDescriptionSet = false;

        // Reset state
        this.callState = this.getInitialState();
        this.notifyListeners('stateChange', this.callState);
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

    private handleCallAccepted(data: any): void {
        console.log('📞 Call accepted:', data);
        this.updateState({ status: 'connecting' });

        // Caller creates WebRTC offer
        this.createPeerConnection();
        this.createAndSendOffer();
    }

    private handleCallProceed(data: any): void {
        console.log('📞 Proceeding with call:', data);
        // Receiver waits for offer
        this.createPeerConnection();
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

    private async handleWebRTCOffer(data: any): Promise<void> {
        console.log('📞 Received WebRTC offer');

        if (!this.peerConnection) {
            this.createPeerConnection();
        }

        try {
            await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(data.offer));
            this.remoteDescriptionSet = true;
            await this.processQueuedCandidates();

            const answer = await this.peerConnection!.createAnswer();
            await this.peerConnection!.setLocalDescription(answer);

            socketService.emitToServer('webrtc:answer', {
                callId: data.callId,
                targetUserId: data.fromUserId,
                answer: answer,
            });
        } catch (error) {
            console.error('Failed to handle offer:', error);
        }
    }

    private async handleWebRTCAnswer(data: any): Promise<void> {
        console.log('📞 Received WebRTC answer');

        if (!this.peerConnection) return;

        try {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
            this.remoteDescriptionSet = true;
            await this.processQueuedCandidates();
        } catch (error) {
            console.error('Failed to handle answer:', error);
        }
    }

    private async handleICECandidate(data: any): Promise<void> {
        if (!this.peerConnection) return;

        const candidate = new RTCIceCandidate(data.candidate);

        if (this.remoteDescriptionSet) {
            try {
                await this.peerConnection.addIceCandidate(candidate);
            } catch (error) {
                console.error('Failed to add ICE candidate:', error);
            }
        } else {
            // Queue candidate until remote description is set
            this.iceCandidatesQueue.push(candidate);
        }
    }
}

// Singleton instance
const videoCallService = new VideoCallService();

export default videoCallService;
