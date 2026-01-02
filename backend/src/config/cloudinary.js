/**
 * Cloudinary Configuration
 * @purpose: Configure Cloudinary for image uploads
 */

import { v2 as cloudinary } from 'cloudinary';
import { getEnvConfig } from './env.js';

const { cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret } = getEnvConfig();

cloudinary.config({
    cloud_name: cloudinaryCloudName,
    api_key: cloudinaryApiKey,
    api_secret: cloudinaryApiSecret,
    secure: true,
});

export default cloudinary;
