/**
 * Check Revenue Data Script
 * Diagnoses revenue calculation issues
 */

import mongoose from 'mongoose';
import Transaction from './src/models/Transaction.js';
import Withdrawal from './src/models/Withdrawal.js';
import dotenv from 'dotenv';

dotenv.config();

const checkRevenue = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        // Check total transactions
        const totalTransactions = await Transaction.countDocuments();
        console.log(`📊 Total Transactions: ${totalTransactions}`);

        // Check coin purchases (deposits)
        const coinPurchases = await Transaction.find({ type: 'coin_purchase' });
        console.log(`\n💰 Coin Purchases (Deposits):`);
        console.log(`   Count: ${coinPurchases.length}`);

        const totalDeposits = coinPurchases.reduce((sum, t) => sum + (t.amount || 0), 0);
        console.log(`   Total Amount: ₹${totalDeposits}`);

        if (coinPurchases.length > 0) {
            console.log(`\n   Sample transactions:`);
            coinPurchases.slice(0, 3).forEach((t, i) => {
                console.log(`   ${i + 1}. Amount: ₹${t.amount}, Status: ${t.status}, Date: ${t.createdAt}`);
            });
        }

        // Check withdrawals (payouts)
        const withdrawals = await Withdrawal.find();
        console.log(`\n💸 Withdrawals (Payouts):`);
        console.log(`   Count: ${withdrawals.length}`);

        const completedWithdrawals = withdrawals.filter(w => w.status === 'completed');
        const totalPayouts = completedWithdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);
        console.log(`   Completed: ${completedWithdrawals.length}`);
        console.log(`   Total Paid: ₹${totalPayouts}`);

        // Calculate profit
        const profit = totalDeposits - totalPayouts;
        console.log(`\n💵 Revenue Summary:`);
        console.log(`   Deposits: ₹${totalDeposits}`);
        console.log(`   Payouts: ₹${totalPayouts}`);
        console.log(`   Net Profit: ₹${profit}`);

        // Check transaction types
        console.log(`\n📋 Transaction Types Breakdown:`);
        const types = await Transaction.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 }, total: { $sum: '$amount' } } },
            { $sort: { count: -1 } }
        ]);

        types.forEach(t => {
            console.log(`   ${t._id}: ${t.count} transactions, ₹${t.total || 0}`);
        });

        // Check if there are any completed transactions
        const completedTransactions = await Transaction.countDocuments({ status: 'completed' });
        console.log(`\n✅ Completed Transactions: ${completedTransactions}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

checkRevenue();
