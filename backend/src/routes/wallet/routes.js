/**
 * Wallet Routes - Coin Economy API Endpoints
 * @owner: Sujal (Wallet Domain)
 * @purpose: Define routes for coin plans, purchases, withdrawals, and transactions
 */

import express from 'express';
import * as walletController from '../../controllers/wallet/walletController.js';
import { protect, restrictTo } from '../../middleware/auth.js';

const router = express.Router();

// ========================
// PUBLIC ROUTES (for Male users buying coins)
// ========================

// Get active coin plans (public for browsing, but typically used by authenticated males)
router.get('/coin-plans', walletController.getCoinPlans);

// ========================
// PROTECTED ROUTES (require authentication)
// ========================
router.use(protect);

// === User Balance & Transactions ===
router.get('/balance', walletController.getMyBalance);
router.get('/transactions', walletController.getMyTransactions);
router.get('/referrals', walletController.getMyReferrals);
router.get('/earnings-summary', restrictTo('female'), walletController.getEarningsSummary);

// === Withdrawal Routes (Female only) ===
router.post('/withdrawals', restrictTo('female'), walletController.requestWithdrawal);
router.get('/withdrawals', restrictTo('female'), walletController.getMyWithdrawals);
router.patch('/withdrawals/:id/cancel', restrictTo('female'), walletController.cancelWithdrawal);

// ========================
// ADMIN ROUTES
// ========================
router.use(restrictTo('admin'));

// === Coin Plans Management ===
router.get('/admin/coin-plans', walletController.getAllCoinPlans);
router.post('/admin/coin-plans', walletController.createCoinPlan);
router.patch('/admin/coin-plans/:id', walletController.updateCoinPlan);
router.delete('/admin/coin-plans/:id', walletController.deleteCoinPlan);

// === Payout Slabs Management ===
router.get('/admin/payout-slabs', walletController.getPayoutSlabs);
router.post('/admin/payout-slabs', walletController.createPayoutSlab);
router.patch('/admin/payout-slabs/:id', walletController.updatePayoutSlab);
router.delete('/admin/payout-slabs/:id', walletController.deletePayoutSlab);

// === Withdrawal Management ===
router.get('/admin/withdrawals', walletController.getPendingWithdrawals);
router.patch('/admin/withdrawals/:id/approve', walletController.approveWithdrawal);
router.patch('/admin/withdrawals/:id/reject', walletController.rejectWithdrawal);
router.patch('/admin/withdrawals/:id/paid', walletController.markWithdrawalPaid);

// === All Transactions View ===
router.get('/admin/transactions', walletController.getAllTransactions);

export default router;
