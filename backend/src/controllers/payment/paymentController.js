/**
 * Payment Controller - Razorpay Payment Processing
 * @owner: Sujal (Wallet Domain)
 * @purpose: Handle coin purchases via Razorpay payment gateway
 */

import crypto from 'crypto';
import CoinPlan from '../../models/CoinPlan.js';
import Transaction from '../../models/Transaction.js';
import User from '../../models/User.js';
import { getRazorpayInstance } from '../../config/razorpay.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.js';
import transactionManager from '../../core/transactions/transactionManager.js';
import relationshipManager from '../../core/relationships/relationshipManager.js';
import dataValidation from '../../core/validation/dataValidation.js';
import logger from '../../utils/logger.js';

/**
 * Create a Razorpay order for coin purchase
 * Called when user selects a coin plan and clicks "Buy"
 */
export const createOrder = async (req, res, next) => {
    try {
        const { planId } = req.body;
        const userId = req.user.id;

        // Debug logging
        logger.info(`📦 Create order request - userId: ${userId}, planId: ${planId}`);

        // Validate planId exists
        if (!planId) {
            throw new BadRequestError('Plan ID is required');
        }

        // Validate coin plan
        const plan = await dataValidation.validateCoinPlan(planId);

        if (!plan) {
            throw new BadRequestError('Coin plan not found');
        }

        logger.info(`📦 Plan validated: ${plan.name} - ₹${plan.priceInINR}`);

        // Get Razorpay instance
        const razorpay = getRazorpayInstance();

        // Create Razorpay order
        // Receipt max 40 chars - use short format: last 6 chars of userId + timestamp last 8 digits
        const shortUserId = userId.toString().slice(-6);
        const shortTimestamp = Date.now().toString().slice(-8);
        const receipt = `rcpt_${shortUserId}_${shortTimestamp}`;

        const orderOptions = {
            amount: plan.priceInINR * 100, // Razorpay expects amount in paise
            currency: 'INR',
            receipt: receipt,
            notes: {
                userId: userId.toString(),
                planId: planId.toString(),
                planName: plan.name,
                coins: plan.totalCoins.toString(),
            },
        };

        const order = await razorpay.orders.create(orderOptions);

        // Create a pending transaction record
        const pendingTransaction = await Transaction.create({
            userId,
            type: 'purchase',
            direction: 'credit',
            amountCoins: plan.totalCoins,
            amountINR: plan.priceInINR,
            coinPlanId: planId,
            status: 'pending',
            payment: {
                razorpayOrderId: order.id,
                status: 'pending',
            },
            description: `Purchase of ${plan.totalCoins} coins (${plan.name})`,
        });

        logger.info(`📦 Razorpay order created: ${order.id} for user ${userId}`);

        res.status(200).json({
            status: 'success',
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                keyId: process.env.RAZORPAY_KEY_ID,
                transactionId: pendingTransaction._id,
                plan: {
                    id: plan._id,
                    name: plan.name,
                    coins: plan.totalCoins,
                    price: plan.priceInINR,
                },
            },
        });
    } catch (error) {
        logger.error(`❌ Create order error: ${error.message}`, error);
        next(error);
    }
};

/**
 * Verify Razorpay payment signature and credit coins
 * Called after successful payment on frontend
 */
/**
 * Verify Razorpay payment signature and credit coins
 * Called after successful payment on frontend
 */
export const verifyPayment = async (req, res, next) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            transactionId,
        } = req.body;

        const userId = req.user.id;

        // Debug Log 1: Request received
        logger.info(`🔍 Verify Payment Request: User=${userId}, Order=${razorpay_order_id}, Tx=${transactionId}`);
        logger.info(`🔍 Config Check: RAZORPAY_KEY_SECRET is ${process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'MISSING'}`);

        if (!process.env.RAZORPAY_KEY_SECRET) {
            logger.error('❌ CRITICAL: RAZORPAY_KEY_SECRET is missing in environment variables');
            throw new Error('Server configuration error: Missing Payment Secret');
        }

        // Find the pending transaction
        const transaction = await Transaction.findOne({
            _id: transactionId,
            userId,
            'payment.razorpayOrderId': razorpay_order_id,
            status: 'pending',
        });

        if (!transaction) {
            logger.warn(`⚠️ Transaction not found or invalid status for Order ${razorpay_order_id}`);
            throw new BadRequestError('Transaction not found or already processed');
        }

        logger.info(`✅ Transaction found: ${transaction._id}, Type: ${transaction.type}, Amount: ${transaction.amountCoins}`);

        // Verify signature
        try {
            const body = razorpay_order_id + '|' + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest('hex');

            const isValidSignature = expectedSignature === razorpay_signature;

            if (!isValidSignature) {
                // Mark transaction as failed
                transaction.status = 'failed';
                transaction.payment.status = 'failed';
                await transaction.save();

                logger.error(`❌ Signature Mismatch: Expected=${expectedSignature}, Received=${razorpay_signature}`);
                throw new BadRequestError('Payment verification failed: Invalid Signature');
            }
        } catch (sigError) {
            logger.error(`❌ Signature verification error: ${sigError.message}`);
            throw sigError;
        }

        logger.info('✅ Signature verified successfully');

        // Tier ranking for comparison
        const tierRank = { basic: 1, silver: 2, gold: 3, platinum: 4 };
        const tierIcons = {
            silver: 'star',
            gold: 'workspace_premium',
            platinum: 'diamond',
        };

        // Payment verified successfully - credit coins atomically
        let membershipUpgraded = false;
        let previousTier = null;
        let newTier = null;

        logger.info('🔄 Starting Transaction Manager for Credit...');

        try {
            const result = await transactionManager.executeTransaction([
                async (session) => {
                    logger.debug('   > Transaction Session Started');
                    // Get user's current balance and the purchased plan
                    const user = await User.findById(userId).session(session);
                    if (!user) {
                        logger.error(`   > ERROR: User ${userId} not found in session`);
                        throw new Error('User not found');
                    }

                    const plan = await CoinPlan.findById(transaction.coinPlanId).session(session);
                    if (!plan) {
                        logger.error(`   > ERROR: CoinPlan ${transaction.coinPlanId} not found`);
                        throw new Error('CoinPlan not found');
                    }

                    logger.debug(`   > User Balance: ${user.coinBalance}, Plan: ${plan.name}`);

                    const balanceBefore = user.coinBalance;
                    const balanceAfter = balanceBefore + transaction.amountCoins;

                    // Update transaction to completed
                    transaction.status = 'completed';
                    transaction.payment.razorpayPaymentId = razorpay_payment_id;
                    transaction.payment.razorpaySignature = razorpay_signature;
                    transaction.payment.status = 'completed';
                    transaction.balanceBefore = balanceBefore;
                    transaction.balanceAfter = balanceAfter;
                    await transaction.save({ session });

                    // Credit coins to user
                    user.coinBalance = balanceAfter;

                    // Check if membership should be upgraded
                    if (plan && plan.tier) {
                        previousTier = user.memberTier || 'basic';
                        const purchasedTierRank = tierRank[plan.tier] || 1;
                        const currentTierRank = tierRank[previousTier] || 1;

                        if (purchasedTierRank > currentTierRank) {
                            user.memberTier = plan.tier;
                            user.memberTierUpdatedAt = new Date();
                            newTier = plan.tier;
                            membershipUpgraded = true;

                            // Award membership badge (if not already awarded)
                            const badgeId = `${plan.tier}_member`;
                            const existingBadge = user.badges?.find(b => b.id === badgeId);

                            if (!existingBadge) {
                                const tierName = plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1);
                                user.badges = user.badges || [];
                                user.badges.push({
                                    id: badgeId,
                                    name: `${tierName} Member`,
                                    icon: tierIcons[plan.tier] || 'workspace_premium',
                                    category: 'membership',
                                    unlockedAt: new Date(),
                                });
                            }
                        }
                    }

                    // Safety check: Ensure lockedCoins is never negative
                    if (user.lockedCoins < 0) {
                        logger.warn(`⚠️ User ${userId} had negative lockedCoins (${user.lockedCoins}), resetting to 0`);
                        user.lockedCoins = 0;
                    }

                    await user.save({ session });
                    logger.debug('   > User and Transaction saved successfully');

                    return { transaction, user, membershipUpgraded, previousTier, newTier };
                },
            ]);

            logger.info('✅ Transaction Manager Completed Successfully');

            if (!result || !result.user) {
                logger.error('❌ Transaction Result is missing user data');
                throw new Error('Transaction failed unexpectedly');
            }

            res.status(200).json({
                status: 'success',
                data: {
                    message: 'Payment successful! Coins have been credited to your account.',
                    coinsAdded: transaction.amountCoins,
                    newBalance: result.user.coinBalance,
                    transactionId: transaction._id,
                    // Membership upgrade info for frontend celebration
                    membershipUpgraded: result.membershipUpgraded,
                    previousTier: result.previousTier,
                    newTier: result.newTier,
                    newMemberTier: result.user.memberTier,
                },
            });

        } catch (txError) {
            logger.error(`❌ Transaction Manager Logic Error: ${txError.message}`, txError);
            throw txError;
        }

    } catch (error) {
        logger.error(`❌ Verify Payment Critical Error: ${error.message}`, error);
        next(error);
    }
};


/**
 * Handle Razorpay webhook for payment events
 * Called by Razorpay server-to-server (backup verification)
 */
export const handleWebhook = async (req, res, next) => {
    try {
        const webhookSignature = req.headers['x-razorpay-signature'];
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        // If webhook secret is configured, verify signature
        if (webhookSecret && webhookSignature) {
            const body = JSON.stringify(req.body);
            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(body)
                .digest('hex');

            if (expectedSignature !== webhookSignature) {
                logger.warn('⚠️ Invalid webhook signature');
                return res.status(400).json({ error: 'Invalid signature' });
            }
        }

        const { event, payload } = req.body;

        logger.info(`📨 Webhook received: ${event}`);

        switch (event) {
            case 'payment.captured':
                await handlePaymentCaptured(payload.payment.entity);
                break;
            case 'payment.failed':
                await handlePaymentFailed(payload.payment.entity);
                break;
            default:
                logger.debug(`Unhandled webhook event: ${event}`);
        }

        res.status(200).json({ status: 'ok' });
    } catch (error) {
        logger.error('Webhook processing error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};

/**
 * Handle payment.captured webhook event
 */
async function handlePaymentCaptured(payment) {
    const orderId = payment.order_id;
    const paymentId = payment.id;

    // Find transaction by order ID
    const transaction = await Transaction.findOne({
        'payment.razorpayOrderId': orderId,
    });

    if (!transaction) {
        logger.warn(`Transaction not found for order ${orderId}`);
        return;
    }

    // If already completed, skip
    if (transaction.status === 'completed') {
        logger.debug(`Transaction already completed for order ${orderId}`);
        return;
    }

    // Credit coins (this is a backup in case frontend verification failed)
    await transactionManager.executeTransaction([
        async (session) => {
            const user = await User.findById(transaction.userId).session(session);
            if (!user) return;

            const balanceBefore = user.coinBalance;
            const balanceAfter = balanceBefore + transaction.amountCoins;

            transaction.status = 'completed';
            transaction.payment.razorpayPaymentId = paymentId;
            transaction.payment.status = 'completed';
            transaction.balanceBefore = balanceBefore;
            transaction.balanceAfter = balanceAfter;
            await transaction.save({ session });

            user.coinBalance = balanceAfter;
            await user.save({ session });

            logger.info(`✅ Webhook: Coins credited for order ${orderId}`);
        },
    ]);
}

/**
 * Handle payment.failed webhook event
 */
async function handlePaymentFailed(payment) {
    const orderId = payment.order_id;

    const transaction = await Transaction.findOne({
        'payment.razorpayOrderId': orderId,
    });

    if (!transaction) return;

    if (transaction.status !== 'pending') return;

    transaction.status = 'failed';
    transaction.payment.status = 'failed';
    await transaction.save();

    logger.info(`❌ Webhook: Payment failed for order ${orderId}`);
}

/**
 * Get payment history for user
 */
export const getPaymentHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { limit = 20, page = 1 } = req.query;

        const skip = (page - 1) * limit;

        const transactions = await Transaction.find({
            userId,
            type: 'purchase',
        })
            .populate('coinPlanId', 'name tier')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Transaction.countDocuments({
            userId,
            type: 'purchase',
        });

        res.status(200).json({
            status: 'success',
            data: {
                transactions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        next(error);
    }
};
