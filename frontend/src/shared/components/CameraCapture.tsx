import { useState, useRef, useCallback, useEffect } from 'react';
import { MaterialSymbol } from './MaterialSymbol';

interface CameraCaptureProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (base64Image: string) => void;
}

export const CameraCapture = ({ isOpen, onClose, onCapture }: CameraCaptureProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const stopStream = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    const startCamera = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }, // Start with front camera
                audio: false
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error('Failed to start camera:', err);
            setError('Could not access camera. Please check permissions.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopStream();
            setCapturedImage(null);
        }
        return () => stopStream();
    }, [isOpen, startCamera, stopStream]);

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
                // Set canvas dimensions to match video
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                // Draw the current video frame to canvas
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                // Convert to base64
                const base64 = canvas.toDataURL('image/jpeg', 0.8);
                setCapturedImage(base64);
                stopStream();
            }
        }
    };

    const handleSend = () => {
        if (capturedImage) {
            onCapture(capturedImage);
            onClose();
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        startCamera();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center bg-black/95 animate-in fade-in duration-300">
            {/* Header - Stays at top, not absolute */}
            <header className="w-full pt-10 pb-4 px-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent shrink-0">
                <button
                    onClick={onClose}
                    className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                >
                    <MaterialSymbol name="close" size={28} />
                </button>
                <span className="text-white font-medium tracking-wide">{capturedImage ? 'Review Photo' : 'Capture Photo'}</span>
                <div className="w-10" /> {/* Spacer */}
            </header>

            <div className="flex-1 w-full max-w-2xl flex flex-col items-center justify-center p-6 pt-10 gap-8 overflow-y-auto">
                {/* Error State */}
                {error && (
                    <div className="text-center p-8 bg-red-500/10 rounded-3xl border border-red-500/20 max-w-xs animate-in zoom-in duration-300">
                        <div className="size-16 mx-auto mb-4 rounded-2xl bg-red-500/20 flex items-center justify-center">
                           <MaterialSymbol name="error" className="text-red-500" size={40} />
                        </div>
                        <h4 className="text-white font-bold mb-2">Camera Error</h4>
                        <p className="text-white/60 text-sm leading-relaxed mb-6">{error}</p>
                        <button
                            onClick={startCamera}
                            className="w-full py-3 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 active:scale-95 transition-all shadow-lg shadow-red-500/20"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!error && (
                    <>
                        {/* Viewfinder or Captured Preview */}
                        <div className="relative w-full aspect-[3/4] overflow-hidden rounded-[2.5rem] bg-gray-900 border border-white/10 shadow-2xl flex items-center justify-center">
                            {!capturedImage ? (
                                <>
                                    {isLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
                                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                </>
                            ) : (
                                <img
                                    src={capturedImage}
                                    alt="Captured"
                                    className="w-full h-full object-cover"
                                />
                            )}

                            {/* Corner accents for premium feel */}
                            <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-white/30 rounded-tl-lg" />
                            <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-white/30 rounded-tr-lg" />
                            <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-white/30 rounded-bl-lg" />
                            <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-white/30 rounded-br-lg" />
                        </div>

                        {/* Hidden canvas for processing */}
                        <canvas ref={canvasRef} className="hidden" />

                        {/* Controls */}
                        <div className="w-full flex items-center justify-center py-4">
                            {!capturedImage ? (
                                <button
                                    onClick={capturePhoto}
                                    disabled={isLoading || !!error}
                                    className="group relative w-20 h-20 flex items-center justify-center disabled:opacity-50"
                                >
                                    <div className="absolute inset-0 rounded-full border-4 border-white group-active:scale-90 transition-transform" />
                                    <div className="w-14 h-14 rounded-full bg-white group-active:scale-75 transition-transform" />
                                </button>
                            ) : (
                                <div className="flex gap-10">
                                    <button
                                        onClick={handleRetake}
                                        className="flex flex-col items-center gap-3 text-white/60 hover:text-white transition-all active:scale-90"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                                            <MaterialSymbol name="refresh" size={32} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Retake</span>
                                    </button>
                                    <button
                                        onClick={handleSend}
                                        className="flex flex-col items-center gap-3 text-white transition-all active:scale-90"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20">
                                            <MaterialSymbol name="send" size={32} filled />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Send Photo</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
