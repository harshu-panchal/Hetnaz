/**
 * Upload Controller
 * @purpose: Handle file upload requests
 */

import * as imageUploadService from '../../services/upload/imageUploadService.js';

/**
 * Upload chat image
 * @route POST /api/upload/chat-image
 */
export const uploadChatImage = async (req, res, next) => {
    try {
        const { image } = req.body;

        // Validate image
        imageUploadService.validateImage(image);

        // Upload to Cloudinary
        const result = await imageUploadService.uploadImageToCloudinary(image, 'chat-images');

        res.status(200).json({
            status: 'success',
            data: {
                url: result.url,
                width: result.width,
                height: result.height
            }
        });
    } catch (error) {
        next(error);
    }
};
