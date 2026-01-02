import { useEffect } from 'react';
import { MaterialSymbol } from './MaterialSymbol';

interface ImageModalProps {
    isOpen: boolean;
    imageUrl: string;
    onClose: () => void;
}

export const ImageModal = ({ isOpen, imageUrl, onClose }: ImageModalProps) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center animate-in fade-in duration-200"
            onClick={onClose}
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
                aria-label="Close"
            >
                <MaterialSymbol name="close" size={24} className="text-white" />
            </button>

            {/* Image Container */}
            <div
                className="relative max-w-[90vw] max-h-[90vh] animate-in zoom-in duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={imageUrl}
                    alt="Full size"
                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                />
            </div>

            {/* Download Button */}
            <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
                title="Open in new tab"
            >
                <MaterialSymbol name="open_in_new" size={20} className="text-white" />
            </a>
        </div>
    );
};
