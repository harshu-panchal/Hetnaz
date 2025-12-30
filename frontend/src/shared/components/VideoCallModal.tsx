/**
 * Video Call Modal - Floating Video Call UI with Agora SDK
 * @purpose: Display video call interface that survives route changes
 * 
 * UPDATED: Uses Agora SDK video tracks for rendering
 */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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

    const localVideoRef = useRef<HTMLDivElement>(null);
    const remoteVideoRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isSwapped, setIsSwapped] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    useEffect(() => {
        console.log('🎥 VideoCallModal MOUNTED. Status:', callState.status, 'isInCall:', isInCall);
    }, [callState.status, isInCall]);

    // Permission checking state
    const [isCheckingPermissions, setIsCheckingPermissions] = useState(false);
    const [permissionError, setPermissionError] = useState<string | null>(null);

    // Request media permissions before accepting call
    const handleAcceptCall = async () => {
        setIsCheckingPermissions(true);
        setPermissionError(null);

        try {
            // Request camera and microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            // Stop the test stream immediately - we just needed to trigger permission
            stream.getTracks().forEach(track => track.stop());

            // Permissions granted, proceed with accepting the call
            await acceptCall();
        } catch (error: any) {
            console.error('Permission error:', error);

            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                setPermissionError('Camera and microphone access is required for video calls. Please allow access and try again.');
            } else if (error.name === 'NotFoundError') {
                setPermissionError('No camera or microphone found on your device.');
            } else {
                setPermissionError('Failed to access camera/microphone. Please check your device settings.');
            }
        } finally {
            setIsCheckingPermissions(false);
        }
    };

    // Attach tracks based on swapped state
    useEffect(() => {
        let isActive = true;
        const playTracks = async () => {
            // Main container logic
            if (remoteVideoRef.current) {
                const mainTrack = isSwapped ? callState.localVideoTrack : callState.remoteVideoTrack;
                remoteVideoRef.current.innerHTML = '';
                if (mainTrack) {
                    try {
                        await mainTrack.play(remoteVideoRef.current);
                    } catch (e) {
                        console.error('Failed to play main track:', e);
                    }
                }
            }

            // PiP container logic
            if (localVideoRef.current) {
                const pipTrack = isSwapped ? callState.remoteVideoTrack : callState.localVideoTrack;
                localVideoRef.current.innerHTML = '';
                if (pipTrack) {
                    try {
                        await pipTrack.play(localVideoRef.current);
                    } catch (e) {
                        console.error('Failed to play PiP track:', e);
                    }
                }
            }
        };

        const timer = setTimeout(() => {
            if (isActive) playTracks();
        }, 300);

        return () => {
            isActive = false;
            clearTimeout(timer);
            if (callState.localVideoTrack) callState.localVideoTrack.stop();
            if (callState.remoteVideoTrack) callState.remoteVideoTrack.stop();
        };
    }, [callState.localVideoTrack, callState.remoteVideoTrack, isFullScreen, isSwapped, callState.status]);

    const handleToggleSwap = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsSwapped(!isSwapped);
    };

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

    const modalContent = (() => {
        // Incoming call UI
        if (callState.status === 'ringing' && callState.isIncoming) {
            return (
                <div className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center backdrop-blur-sm">
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
                        <div className="bg-white/10 rounded-xl px-4 py-2 mb-4 inline-block">
                            <span className="text-white/70 text-sm">
                                💰 This call is worth <span className="font-bold text-yellow-300">{callPrice} coins</span>
                            </span>
                        </div>

                        {/* Permission Error */}
                        {permissionError && (
                            <div className="mb-4 p-3 bg-red-500/20 border border-red-400/50 rounded-lg">
                                <p className="text-sm text-white flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                    </svg>
                                    {permissionError}
                                </p>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex justify-center gap-6">
                            {/* Reject */}
                            <button
                                onClick={rejectCall}
                                disabled={isCheckingPermissions}
                                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" transform="rotate(135 12 12)" />
                                </svg>
                            </button>

                            {/* Accept */}
                            <button
                                onClick={handleAcceptCall}
                                disabled={isCheckingPermissions}
                                className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 animate-bounce disabled:opacity-50 disabled:animate-none"
                                style={{ animationDuration: '0.8s' }}
                            >
                                {isCheckingPermissions ? (
                                    <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        // Outgoing call (waiting) UI
        if (callState.status === 'ringing' && !callState.isIncoming) {
            return (
                <div className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center backdrop-blur-sm">
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
                <div className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-white text-lg">Connecting...</p>
                    </div>
                </div>
            );
        }

        // Connected call UI
        if (callState.status === 'connected') {
            if (isFullScreen) {
                return (
                    <div className="fixed inset-0 z-[10000] bg-black flex flex-col font-sans">
                        <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center">
                            {/* Main Video Container */}
                            <div
                                ref={remoteVideoRef}
                                className="w-full h-full"
                                style={{ transform: isSwapped ? 'scaleX(-1)' : '' }}
                            />

                            {/* Top Bar (Overlaid) */}
                            <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/70 to-transparent flex justify-between items-start z-10">
                                <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl p-2 pr-5 rounded-full border border-white/10 ring-1 ring-white/5">
                                    <div className="w-12 h-12 rounded-full border-2 border-white/30 overflow-hidden shadow-2xl">
                                        {callState.remoteUserAvatar ? (
                                            <img src={callState.remoteUserAvatar} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                                                {callState.remoteUserName?.[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg leading-tight tracking-tight">{callState.remoteUserName}</h3>
                                        <span className="text-green-400 text-xs font-bold flex items-center gap-1.5 uppercase tracking-widest">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                                            Live
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="bg-black/40 backdrop-blur-xl rounded-2xl px-5 py-2.5 border border-white/10 shadow-2xl">
                                        <span className={`font-mono font-black text-xl tracking-tighter ${remainingTime <= 60 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                                            {formatTime(remainingTime)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setIsFullScreen(false)}
                                        className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-2xl text-white backdrop-blur-xl transition-all border border-white/10 flex items-center justify-center group active:scale-90"
                                        title="Minimize"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Floating Local PiP (Fullscreen mode) */}
                            <button
                                onClick={handleToggleSwap}
                                className="absolute bottom-36 right-8 w-36 h-52 rounded-[2rem] overflow-hidden bg-gray-900 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.8)] border-2 border-white/40 z-20 transition-all hover:scale-105 active:scale-95 group ring-0 hover:ring-4 ring-white/10"
                                title="Click to Swap Video"
                            >
                                <div
                                    ref={localVideoRef}
                                    className="w-full h-full pointer-events-none"
                                    style={{ transform: !isSwapped ? 'scaleX(-1)' : '' }}
                                />

                                {((!isSwapped && callState.isCameraOff) || (isSwapped && !callState.remoteVideoTrack)) && (
                                    <div className="absolute inset-0 bg-[#1a1a1a] flex flex-col items-center justify-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider">
                                            {isSwapped ? 'Remote Off' : 'Camera Off'}
                                        </span>
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                    </svg>
                                </div>
                            </button>
                        </div>

                        {/* Immersive Controls Bar */}
                        <div className="h-32 bg-gray-900/95 backdrop-blur-2xl border-t border-white/10 flex items-center justify-center gap-12 pb-safe z-10 px-6">
                            <button
                                onClick={toggleMute}
                                className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-300 ${callState.isMuted ? 'bg-red-500 shadow-[0_0_25px_rgba(239,68,68,0.4)] scale-110' : 'bg-gray-800 hover:bg-gray-700 hover:scale-110 shadow-xl border border-white/5'}`}
                                title={callState.isMuted ? "Unmute" : "Mute"}
                            >
                                {callState.isMuted ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                        <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2.5" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                    </svg>
                                )}
                            </button>

                            <button
                                onClick={endCall}
                                className="w-20 h-20 rounded-[2.5rem] bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-90 shadow-2xl shadow-red-600/40 group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-11 w-11 rotate-[135deg] transition-transform group-hover:scale-110 relative z-10" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1-1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z" />
                                </svg>
                            </button>

                            <button
                                onClick={toggleCamera}
                                className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-300 ${callState.isCameraOff ? 'bg-red-500 shadow-[0_0_25px_rgba(239,68,68,0.4)] scale-110' : 'bg-gray-800 hover:bg-gray-700 hover:scale-110 shadow-xl border border-white/5'}`}
                                title={callState.isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
                            >
                                {callState.isCameraOff ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2.5" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                );
            }

            // MINI FLOATING UI (Default)
            return (
                <div
                    className="fixed z-[10000] bg-gray-900 rounded-[2.5rem] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.8)] overflow-hidden border border-white/10 backdrop-blur-3xl transition-all"
                    style={{
                        left: position.x,
                        top: position.y,
                        width: '340px',
                        cursor: isDragging ? 'grabbing' : 'default',
                    }}
                >
                    {/* Header - draggable */}
                    <div
                        className="bg-gray-800/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between cursor-grab active:cursor-grabbing border-b border-white/5"
                        onMouseDown={handleDragStart}
                        onTouchStart={handleDragStart}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.7)]" />
                            <span className="text-white text-sm font-black truncate max-w-[140px] tracking-tight uppercase">
                                {callState.remoteUserName || 'Video Call'}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-black/40 rounded-xl px-3 py-1.5 border border-white/5">
                                <span className={`text-sm font-mono font-black ${remainingTime <= 60 ? 'text-red-400' : 'text-white'}`}>
                                    {formatTime(remainingTime)}
                                </span>
                            </div>
                            <button
                                onClick={() => setIsFullScreen(true)}
                                className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-xl text-white/70 hover:text-white transition-all active:scale-90"
                                title="Expand to Full Screen"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Video area */}
                    <div className="relative aspect-[3/4] bg-[#0a0a0a]">
                        {/* Main Video in Mini Mode */}
                        <div
                            ref={remoteVideoRef}
                            className="w-full h-full object-cover"
                            style={{ transform: isSwapped ? 'scaleX(-1)' : '' }}
                        />

                        {/* PiP Video in Mini Mode */}
                        <button
                            onClick={handleToggleSwap}
                            className="absolute bottom-4 right-4 w-32 h-44 rounded-3xl overflow-hidden bg-gray-950 shadow-2xl border-2 border-white/30 z-10 transition-transform hover:scale-105 active:scale-95 group cursor-pointer ring-0 hover:ring-2 ring-white/10"
                            title="Click to Swap"
                        >
                            <div
                                ref={localVideoRef}
                                className="w-full h-full pointer-events-none"
                                style={{ transform: !isSwapped ? 'scaleX(-1)' : '' }}
                            />

                            {((!isSwapped && callState.isCameraOff) || (isSwapped && !callState.remoteVideoTrack)) && (
                                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                </svg>
                            </div>
                        </button>

                        {/* Status overlays in mini mode */}
                        {callState.isMuted && (
                            <div className="absolute top-4 right-4 w-10 h-10 bg-red-600/90 rounded-2xl flex items-center justify-center shadow-xl border border-white/20 backdrop-blur-sm z-10 animate-in fade-in zoom-in duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2.5" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Compact Controls Bar */}
                    <div className="bg-gray-800/95 backdrop-blur-2xl px-5 py-6 flex items-center justify-around gap-2 border-t border-white/5">
                        <button
                            onClick={toggleMute}
                            className={`w-13 h-13 rounded-2xl flex items-center justify-center transition-all ${callState.isMuted ? 'bg-red-500 shadow-lg shadow-red-500/20' : 'bg-white/5 hover:bg-white/10 active:scale-90 border border-white/5'}`}
                        >
                            {callState.isMuted ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                            )}
                        </button>

                        <button
                            onClick={endCall}
                            className="w-16 h-16 rounded-3xl bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-2xl shadow-red-600/30 transition-all hover:scale-105 active:scale-90 group"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 rotate-[135deg] transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z" />
                            </svg>
                        </button>

                        <button
                            onClick={toggleCamera}
                            className={`w-13 h-13 rounded-2xl flex items-center justify-center transition-all ${callState.isCameraOff ? 'bg-red-500 shadow-lg shadow-red-500/20' : 'bg-white/5 hover:bg-white/10 active:scale-90 border border-white/5'}`}
                        >
                            {callState.isCameraOff ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            )}
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
    })();

    return createPortal(modalContent, document.body);
};

export default VideoCallModal;
