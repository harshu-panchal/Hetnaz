/**
 * Add Test Coins to Female User
 * Run: node src/seeds/addTestCoins.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const FEMALE_PHONE = '914581331385'; // Female user phone number
const COINS_TO_ADD = 5000; // Amount of test coins to add

async function addTestCoins() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find the female user
        const user = await User.findOne({ phoneNumber: FEMALE_PHONE });

        if (!user) {
            console.log(`❌ User with phone ${FEMALE_PHONE} not found!`);
            process.exit(1);
        }

        console.log(`📱 Found user: ${user.name || 'No name'} (${user.phoneNumber})`);
        console.log(`💰 Current balance: ${user.coinBalance} coins`);

        // Add coins to user balance
        const previousBalance = user.coinBalance || 0;
        user.coinBalance = previousBalance + COINS_TO_ADD;
        await user.save();

        // Create a transaction record
        await Transaction.create({
            userId: user._id,
            type: 'bonus',
            direction: 'credit',
            amountCoins: COINS_TO_ADD,
            status: 'completed',
            balanceBefore: previousBalance,
            balanceAfter: user.coinBalance,
            description: 'Test coins added by admin for testing',
        });

        console.log(`\n✅ Added ${COINS_TO_ADD} coins to ${user.phoneNumber}`);
        console.log(`💰 New balance: ${user.coinBalance} coins`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

addTestCoins();
