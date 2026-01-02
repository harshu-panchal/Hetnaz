import { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { MaterialSymbol } from './MaterialSymbol';

interface ImagePickerProps {
    onImageSelect: (base64Image: string) => void;
    disabled?: boolean;
    hidden?: boolean; // New prop to hide the default button
}

export interface ImagePickerRef {
    pickImage: () => void;
}

export const ImagePicker = forwardRef<ImagePickerRef, ImagePickerProps>(({ onImageSelect, disabled, hidden = false }, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useImperativeHandle(ref, () => ({
        pickImage: () => {
            fileInputRef.current?.click();
        }
    }));

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        setIsProcessing(true);

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            onImageSelect(base64);
            setIsProcessing(false);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        };
        reader.onerror = () => {
            alert('Failed to read image');
            setIsProcessing(false);
        };
        reader.readAsDataURL(file);
    };

    if (hidden) {
        return (
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled || isProcessing}
            />
        );
    }

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled || isProcessing}
            />
            <button
                onClick={handleClick}
                disabled={disabled || isProcessing}
                className="flex items-center justify-center size-10 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Send image"
            >
                {isProcessing ? (
                    <MaterialSymbol name="sync" className="animate-spin" size={24} />
                ) : (
                    <MaterialSymbol name="image" size={24} />
                )}
            </button>
        </>
    );
});
