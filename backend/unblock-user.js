/**
 * Emergency Unblock Script
 * Run this to unblock a user account
 */

import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const unblockUser = async (phoneNumber) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ phoneNumber });

        if (!user) {
            console.log(`❌ User with phone ${phoneNumber} not found`);
            process.exit(1);
        }

        console.log(`Found user: ${user.profile?.name || 'Unknown'} (${user.role})`);
        console.log(`Current blocked status: ${user.isBlocked}`);

        if (!user.isBlocked) {
            console.log('✅ User is not blocked. No action needed.');
            process.exit(0);
        }

        // Unblock the user
        user.isBlocked = false;
        user.blockReason = null;
        user.blockedAt = null;
        user.blockedByAdmin = null;
        await user.save();

        console.log('✅ User unblocked successfully!');
        console.log(`User: ${user.profile?.name} (${phoneNumber})`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

// Get phone number from command line argument
const phoneNumber = process.argv[2];

if (!phoneNumber) {
    console.log('Usage: node unblock-user.js <phone_number>');
    console.log('Example: node unblock-user.js 9876543210');
    process.exit(1);
}

unblockUser(phoneNumber);
