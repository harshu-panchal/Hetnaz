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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 animate-in fade-in duration-300">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
                <button
                    onClick={onClose}
                    className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                >
                    <MaterialSymbol name="close" size={28} />
                </button>
                <span className="text-white font-medium">Capture Photo</span>
                <div className="w-10" /> {/* Spacer */}
            </div>

            <div className="relative w-full h-full max-w-2xl max-h-[80vh] flex flex-col items-center justify-center p-4">
                {/* Error State */}
                {error && (
                    <div className="text-center p-6 bg-red-500/10 rounded-2xl border border-red-500/20">
                        <MaterialSymbol name="error" className="text-red-500 mb-2" size={48} />
                        <p className="text-white">{error}</p>
                        <button
                            onClick={startCamera}
                            className="mt-4 px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Viewfinder or Captured Preview */}
                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-3xl bg-gray-900 border border-white/10 shadow-2xl">
                    {!capturedImage ? (
                        <>
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center">
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
                    <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-white/30 rounded-tl-lg" />
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white/30 rounded-tr-lg" />
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white/30 rounded-bl-lg" />
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-white/30 rounded-br-lg" />
                </div>

                {/* Hidden canvas for processing */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Controls */}
                <div className="mt-8 flex items-center gap-12">
                    {!capturedImage ? (
                        <button
                            onClick={capturePhoto}
                            disabled={isLoading || !!error}
                            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50"
                        >
                            <div className="w-14 h-14 rounded-full bg-white" />
                        </button>
                    ) : (
                        <div className="flex gap-6">
                            <button
                                onClick={handleRetake}
                                className="flex flex-col items-center gap-2 text-white hover:text-white/80 transition-colors"
                            >
                                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                                    <MaterialSymbol name="refresh" size={32} />
                                </div>
                                <span className="text-xs font-medium">Retake</span>
                            </button>
                            <button
                                onClick={handleSend}
                                className="flex flex-col items-center gap-2 text-white hover:text-white/80 transition-colors"
                            >
                                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                    <MaterialSymbol name="send" size={32} />
                                </div>
                                <span className="text-xs font-medium">Send</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
