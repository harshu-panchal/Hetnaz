/**
 * Image Processing Utility
 * @purpose: Client-side image compression and resizing
 */

export interface ResizeOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
}

/**
 * Compresses an image and returns a base64 string
 * @param base64Str - Original base64 string
 * @param options - Compression options
 */
export const compressImage = (base64Str: string, options: ResizeOptions = {}): Promise<string> => {
    const {
        maxWidth = 800,
        maxHeight = 800,
        quality = 0.7
    } = options;

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Calculate new dimensions while maintaining aspect ratio
            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            // Export as JPEG with quality compression
            const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedBase64);
        };
        img.onerror = (e) => reject(e);
    });
};
