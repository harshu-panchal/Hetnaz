/**
 * Upload Routes
 */

import express from 'express';
import * as uploadController from '../../controllers/upload/uploadController.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// All upload routes require authentication
router.use(protect);

// POST /api/upload/chat-image - Upload chat image
router.post('/chat-image', uploadController.uploadChatImage);

export default router;
