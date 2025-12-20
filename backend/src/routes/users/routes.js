import express from 'express';
import * as userController from '../../controllers/user/userController.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect); // Protect all routes

router.get('/me', userController.getProfile);
router.patch('/me', userController.updateProfile);
router.post('/resubmit-verification', userController.resubmitVerification);

// Discover approved females (for male users)
router.get('/discover', userController.discoverFemales);

// Get a specific user's profile
router.get('/:userId', userController.getUserById);

export default router;
