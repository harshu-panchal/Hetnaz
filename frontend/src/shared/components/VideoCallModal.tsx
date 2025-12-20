/**
 * Video Call Modal - Floating Video Call UI
 * @purpose: Display video call interface that survives route changes
 */

import { useEffect, useRef, useState } from 'react';
import { useVideoCall } from '../../core/context/VideoCallContext';

// Format time as mm:ss
const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const VideoCallModal = () => {
    const {
        callState,
        isInCall,
        remainingTime,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleCamera,
        callPrice,
    } = useVideoCall();

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const dragOffset = useRef({ x: 0, y: 0 });

    // Attach local video stream
    useEffect(() => {
        if (localVideoRef.current && callState.localStream) {
            localVideoRef.current.srcObject = callState.localStream;
        }
    }, [callState.localStream]);

    // Attach remote video stream
    useEffect(() => {
        if (remoteVideoRef.current && callState.remoteStream) {
            remoteVideoRef.current.srcObject = callState.remoteStream;
        }
    }, [callState.remoteStream]);

    // Handle drag start
    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        dragOffset.current = {
            x: clientX - position.x,
            y: clientY - position.y,
        };
    };

    // Handle drag move
    const handleDragMove = (e: MouseEvent | TouchEvent) => {
        if (!isDragging) return;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        setPosition({
            x: clientX - dragOffset.current.x,
            y: clientY - dragOffset.current.y,
        });
    };

    // Handle drag end
    const handleDragEnd = () => {
        setIsDragging(false);
    };

    // Add global drag listeners
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('mouseup', handleDragEnd);
            window.addEventListener('touchmove', handleDragMove);
            window.addEventListener('touchend', handleDragEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
            window.removeEventListener('touchmove', handleDragMove);
            window.removeEventListener('touchend', handleDragEnd);
        };
    }, [isDragging]);

    // Don't render if not in a call
    if (!isInCall && callState.status !== 'ended') {
        return null;
    }

    // Incoming call UI
    if (callState.status === 'ringing' && callState.isIncoming) {
        return (
            <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
                    {/* Avatar */}
                    <div className="relative mx-auto mb-6">
                        <div className="w-28 h-28 rounded-full bg-white/20 mx-auto overflow-hidden ring-4 ring-white/30 animate-pulse">
                            {callState.remoteUserAvatar ? (
                                <img
                                    src={callState.remoteUserAvatar}
                                    alt={callState.remoteUserName || 'Caller'}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white">
                                    {callState.remoteUserName?.[0]?.toUpperCase() || '?'}
                                </div>
                            )}
                        </div>
                        {/* Pulsing ring animation */}
                        <div className="absolute inset-0 rounded-full border-4 border-white/50 animate-ping" style={{ animationDuration: '1.5s' }} />
                    </div>

                    {/* Caller info */}
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {callState.remoteUserName || 'Unknown'}
                    </h2>
                    <p className="text-white/80 mb-8">Incoming video call...</p>

                    {/* Call cost notice */}
                    <div className="bg-white/10 rounded-xl px-4 py-2 mb-8 inline-block">
                        <span className="text-white/70 text-sm">
                            💰 This call is worth <span className="font-bold text-yellow-300">{callPrice} coins</span>
                        </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-center gap-6">
                        {/* Reject */}
                        <button
                            onClick={rejectCall}
                            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" transform="rotate(135 12 12)" />
                            </svg>
                        </button>

                        {/* Accept */}
                        <button
                            onClick={acceptCall}
                            className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 animate-bounce"
                            style={{ animationDuration: '0.8s' }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Outgoing call (waiting) UI
    if (callState.status === 'ringing' && !callState.isIncoming) {
        return (
            <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
                    {/* Avatar */}
                    <div className="w-28 h-28 rounded-full bg-white/20 mx-auto mb-6 overflow-hidden ring-4 ring-white/30">
                        {callState.remoteUserAvatar ? (
                            <img
                                src={callState.remoteUserAvatar}
                                alt={callState.remoteUserName || 'User'}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white">
                                {callState.remoteUserName?.[0]?.toUpperCase() || '?'}
                            </div>
                        )}
                    </div>

                    {/* Callee info */}
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {callState.remoteUserName || 'Unknown'}
                    </h2>
                    <p className="text-white/80 mb-4">Calling...</p>

                    {/* Ringing animation */}
                    <div className="flex justify-center gap-1 mb-8">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="w-3 h-3 rounded-full bg-white animate-bounce"
                                style={{ animationDelay: `${i * 0.15}s` }}
                            />
                        ))}
                    </div>

                    {/* Cancel button */}
                    <button
                        onClick={endCall}
                        className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg mx-auto transition-transform hover:scale-110 active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" transform="rotate(135 12 12)" />
                        </svg>
                    </button>
                </div>
            </div>
        );
    }

    // Connecting UI
    if (callState.status === 'connecting' || callState.status === 'requesting') {
        return (
            <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white text-lg">Connecting...</p>
                </div>
            </div>
        );
    }

    // Connected call UI (floating window)
    if (callState.status === 'connected') {
        return (
            <div
                className="fixed z-[9999] bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
                style={{
                    left: position.x,
                    top: position.y,
                    width: '320px',
                    cursor: isDragging ? 'grabbing' : 'default',
                }}
            >
                {/* Header - draggable */}
                <div
                    className="bg-gray-800 px-4 py-2 flex items-center justify-between cursor-grab active:cursor-grabbing"
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                >
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-white text-sm font-medium truncate max-w-[150px]">
                            {callState.remoteUserName || 'Video Call'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-mono ${remainingTime <= 60 ? 'text-red-400' : 'text-white'}`}>
                            {formatTime(remainingTime)}
                        </span>
                    </div>
                </div>

                {/* Video area */}
                <div className="relative aspect-[4/3] bg-black">
                    {/* Remote video (main) */}
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />

                    {/* Local video (PiP) */}
                    <div className="absolute bottom-2 right-2 w-24 h-32 rounded-lg overflow-hidden bg-gray-800 shadow-lg border-2 border-white/20">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover mirror"
                            style={{ transform: 'scaleX(-1)' }}
                        />
                        {callState.isCameraOff && (
                            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Muted indicator */}
                    {callState.isMuted && (
                        <div className="absolute top-2 left-2 bg-red-500/80 rounded-full px-2 py-1 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                                <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            <span className="text-xs text-white">Muted</span>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="bg-gray-800 px-4 py-3 flex items-center justify-center gap-4">
                    {/* Mute toggle */}
                    <button
                        onClick={toggleMute}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${callState.isMuted ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
                            }`}
                    >
                        {callState.isMuted ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                            </svg>
                        )}
                    </button>

                    {/* Camera toggle */}
                    <button
                        onClick={toggleCamera}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${callState.isCameraOff ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
                            }`}
                    >
                        {callState.isCameraOff ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                            </svg>
                        )}
                    </button>

                    {/* End call */}
                    <button
                        onClick={endCall}
                        className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" transform="rotate(135 12 12)" />
                        </svg>
                    </button>
                </div>
            </div>
        );
    }

    // Call ended UI
    if (callState.status === 'ended') {
        return (
            <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-gray-800 rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
                    <div className="w-16 h-16 rounded-full bg-gray-700 mx-auto mb-4 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" transform="rotate(135 12 12)" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Call Ended</h2>
                    {callState.error && (
                        <p className="text-gray-400 text-sm">{callState.error}</p>
                    )}
                </div>
            </div>
        );
    }

    return null;
};

export default VideoCallModal;
