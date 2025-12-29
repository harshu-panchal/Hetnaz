/**
 * Agora Video Call Service - Simplified Implementation
 * Following official Agora Web SDK quickstart guide
 */

import AgoraRTC, {
    IAgoraRTCClient,
    ICameraVideoTrack,
    IMicrophoneAudioTrack,
    IAgoraRTCRemoteUser,
} from 'agora-rtc-sdk-ng';

interface AgoraCredentials {
    appId: string;
    channelName: string;
    token: string;
    uid: number;
}

class AgoraVideoCallService {
    private client: IAgoraRTCClient | null = null;
    private localAudioTrack: IMicrophoneAudioTrack | null = null;
    private localVideoTrack: ICameraVideoTrack | null = null;
    private remoteUsers: Map<number, IAgoraRTCRemoteUser> = new Map();

    // Callbacks for UI updates
    public onLocalVideoReady: ((track: ICameraVideoTrack) => void) | null = null;
    public onRemoteUserJoined: ((user: IAgoraRTCRemoteUser) => void) | null = null;
    public onRemoteUserLeft: ((uid: number) => void) | null = null;
    public onRemoteVideoReady: ((user: IAgoraRTCRemoteUser) => void) | null = null;

    /**
     * Initialize Agora client
     */
    initializeClient(): void {
        console.log('🎥 Initializing Agora client...');

        // Create client
        this.client = AgoraRTC.createClient({
            mode: 'rtc',
            codec: 'vp8'
        });

        // Setup event listeners
        this.setupEventListeners();

        console.log('✅ Agora client initialized');
    }

    /**
     * Setup event listeners (must be done before joining channel)
     */
    private setupEventListeners(): void {
        if (!this.client) return;

        console.log('🎥 Setting up Agora event listeners...');

        // Handle remote user publishing
        this.client.on('user-published', async (user, mediaType) => {
            console.log('🎥 Remote user published:', user.uid, mediaType);

            try {
                // Subscribe to the remote user
                await this.client!.subscribe(user, mediaType);
                console.log('✅ Subscribed to', mediaType, 'from user', user.uid);

                // Store remote user
                this.remoteUsers.set(user.uid as number, user);

                if (mediaType === 'video') {
                    // Notify UI that remote video is ready
                    this.onRemoteVideoReady?.(user);
                }

                if (mediaType === 'audio') {
                    // Play audio automatically
                    user.audioTrack?.play();
                }
            } catch (error) {
                console.error('❌ Failed to subscribe:', error);
            }
        });

        // Handle remote user unpublishing
        this.client.on('user-unpublished', (user, mediaType) => {
            console.log('🎥 Remote user unpublished:', user.uid, mediaType);
        });

        // Handle remote user leaving
        this.client.on('user-left', (user) => {
            console.log('🎥 Remote user left:', user.uid);
            this.remoteUsers.delete(user.uid as number);
            this.onRemoteUserLeft?.(user.uid as number);
        });

        // Handle connection state changes
        this.client.on('connection-state-change', (curState, prevState, reason) => {
            console.log('🎥 Connection state:', prevState, '->', curState, 'Reason:', reason);
        });
    }

    /**
     * Join a channel
     */
    async joinChannel(credentials: AgoraCredentials): Promise<void> {
        if (!this.client) {
            this.initializeClient();
        }

        console.log('🎥 Joining channel:', credentials.channelName);
        console.log('   App ID:', credentials.appId);
        console.log('   UID:', credentials.uid);

        try {
            // Join the channel
            await this.client!.join(
                credentials.appId,
                credentials.channelName,
                credentials.token,
                credentials.uid
            );
            console.log('✅ Joined channel successfully');

            // Create local media tracks
            await this.createLocalMediaTracks();

            // Publish local tracks
            await this.publishLocalTracks();

        } catch (error: any) {
            console.error('❌ Failed to join channel:', error);
            throw new Error(`Failed to join video call: ${error.message}`);
        }
    }

    /**
     * Create local audio and video tracks
     */
    private async createLocalMediaTracks(): Promise<void> {
        console.log('🎥 Creating local media tracks...');

        try {
            // Create microphone audio track
            this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
                AEC: true, // Acoustic Echo Cancellation
                ANS: true, // Automatic Noise Suppression
                AGC: true, // Automatic Gain Control
            });

            // Create camera video track
            this.localVideoTrack = await AgoraRTC.createCameraVideoTrack({
                encoderConfig: {
                    width: 640,
                    height: 480,
                    frameRate: 24,
                    bitrateMax: 1000,
                },
                optimizationMode: 'motion',
            });

            console.log('✅ Local media tracks created');

            // Notify UI that local video is ready
            this.onLocalVideoReady?.(this.localVideoTrack);

        } catch (error: any) {
            console.error('❌ Failed to create local media:', error);

            if (error.message?.includes('NotAllowedError') || error.message?.includes('Permission denied')) {
                throw new Error('Camera/Microphone permission denied');
            } else if (error.message?.includes('NotFoundError')) {
                throw new Error('Camera or microphone not found');
            } else if (error.message?.includes('NotReadableError')) {
                throw new Error('Camera is being used by another app');
            }

            throw error;
        }
    }

    /**
     * Publish local tracks to the channel
     */
    private async publishLocalTracks(): Promise<void> {
        if (!this.localAudioTrack || !this.localVideoTrack) {
            console.error('❌ No local tracks to publish');
            return;
        }

        console.log('🎥 Publishing local tracks...');

        try {
            await this.client!.publish([this.localAudioTrack, this.localVideoTrack]);
            console.log('✅ Local tracks published');
        } catch (error) {
            console.error('❌ Failed to publish local tracks:', error);
            throw error;
        }
    }

    /**
     * Leave the channel and clean up
     */
    async leaveChannel(): Promise<void> {
        console.log('🎥 Leaving channel...');

        try {
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

            // Leave the channel
            if (this.client) {
                await this.client.leave();
                console.log('✅ Left channel');
            }

            // Clear remote users
            this.remoteUsers.clear();

        } catch (error) {
            console.error('❌ Error leaving channel:', error);
        }
    }

    /**
     * Toggle microphone
     */
    async toggleMicrophone(enabled: boolean): Promise<void> {
        if (this.localAudioTrack) {
            await this.localAudioTrack.setEnabled(enabled);
        }
    }

    /**
     * Toggle camera
     */
    async toggleCamera(enabled: boolean): Promise<void> {
        if (this.localVideoTrack) {
            await this.localVideoTrack.setEnabled(enabled);
        }
    }

    /**
     * Get local video track
     */
    getLocalVideoTrack(): ICameraVideoTrack | null {
        return this.localVideoTrack;
    }

    /**
     * Get remote users
     */
    getRemoteUsers(): IAgoraRTCRemoteUser[] {
        return Array.from(this.remoteUsers.values());
    }
}

// Singleton instance
const agoraVideoCallService = new AgoraVideoCallService();

export default agoraVideoCallService;
