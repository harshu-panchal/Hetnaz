/**
 * FCM Routes
 */

import express from 'express';
import { protect } from '../../middleware/auth.js';
import * as fcmController from '../../controllers/fcm/fcmController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Register FCM token
router.post('/register', fcmController.registerFCMToken);

// Send test notification
router.post('/test', fcmController.sendTestNotification);

// Remove FCM token
router.delete('/token', fcmController.removeFCMToken);

export default router;
