import express from 'express';
import * as userController from '../../controllers/user/userController.js';
import * as statsController from '../../controllers/user/statsController.js';
import * as femaleDashboardController from '../../controllers/user/femaleDashboardController.js';
import * as relationshipController from '../../controllers/user/relationshipController.js';
import autoMessageController from '../../controllers/user/autoMessageController.js';
import { protect, restrictTo } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Me
router.get('/me', userController.getProfile);

// Me Stats
router.get('/me/stats', statsController.getMeStats);

// Female Dashboard
router.get('/female/dashboard', restrictTo('female'), femaleDashboardController.getDashboardData);

// Auto-Message Templates (Female only)
router.get('/female/auto-messages/stats', restrictTo('female'), autoMessageController.getStats);
router.get('/female/auto-messages', restrictTo('female'), autoMessageController.getTemplates);
router.post('/female/auto-messages', restrictTo('female'), autoMessageController.createTemplate);
router.put('/female/auto-messages/:id', restrictTo('female'), autoMessageController.updateTemplate);
router.delete('/female/auto-messages/:id', restrictTo('female'), autoMessageController.deleteTemplate);

// Discovery and User Profiles
router.patch('/me', userController.updateProfile);
router.delete('/me', userController.deleteAccount);
router.post('/resubmit-verification', userController.resubmitVerification);

// Discover approved females (for male users)
router.get('/discover', userController.discoverFemales);

// Get a specific user's profile
router.get('/:userId', userController.getUserById);

// Relationship Management
router.post('/block', relationshipController.blockUser);
router.post('/unblock', relationshipController.unblockUser);
router.get('/block-list', relationshipController.getBlockedUsers);
router.delete('/chats/:chatId', relationshipController.deleteChat);

export default router;
