/**
 * Admin Routes
 * @owner: Sujal
 */

import express from 'express';
import * as adminController from '../../controllers/admin/adminController.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import * as reportController from '../../controllers/user/reportController.js';

const router = express.Router();

// Protect all admin routes
router.use(protect);
router.use(restrictTo('admin'));

// Dashboard Stats
router.get('/dashboard/stats', adminController.getDashboardStats);

// Female Approval Routes
router.get('/females/pending', adminController.getPendingFemales);
router.patch('/females/:id/approve', adminController.approveFemale);
router.patch('/females/:id/reject', adminController.rejectFemale);
router.patch('/females/:id/request-resubmit', adminController.requestResubmitFemale);

// User Management
router.get('/users', adminController.listUsers);
router.patch('/users/:id/toggle-block', adminController.toggleBlockUser);
router.patch('/users/:id/toggle-verify', adminController.toggleVerifyUser);
router.delete('/users/:id', adminController.deleteUser);

// Transaction Management
router.get('/transactions', adminController.listTransactions);

// Platform Settings
router.get('/settings', adminController.getAppSettings);
router.patch('/settings', adminController.updateAppSettings);

// Gift Management
router.get('/gifts', adminController.listGifts);
router.post('/gifts', adminController.createGift);
router.patch('/gifts/:id/cost', adminController.updateGiftCost);
router.delete('/gifts/:id', adminController.deleteGift);

// Report Management
router.get('/reports', reportController.getAllReports);
router.patch('/reports/:id', reportController.updateReportStatus);


// Admin Profile Management
router.get('/profile', adminController.getAdminProfile);
router.post('/profile/request-otp', adminController.requestAdminOtp);
router.patch('/profile/update-phone', adminController.updateAdminPhone);
router.patch('/profile/update-secret', adminController.updateAdminSecret);

export default router;
