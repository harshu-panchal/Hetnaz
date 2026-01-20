/**
 * List Blocked Users Script
 * Shows all currently blocked users
 */

import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const listBlockedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        const blockedUsers = await User.find({ isBlocked: true })
            .select('phoneNumber profile role isBlocked blockReason blockedAt blockedByAdmin')
            .lean();

        if (blockedUsers.length === 0) {
            console.log('✅ No blocked users found.');
            process.exit(0);
        }

        console.log(`Found ${blockedUsers.length} blocked user(s):\n`);
        console.log('═'.repeat(80));

        blockedUsers.forEach((user, index) => {
            console.log(`\n${index + 1}. ${user.profile?.name || 'Unknown'}`);
            console.log(`   Phone: ${user.phoneNumber}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Reason: ${user.blockReason || 'No reason provided'}`);
            console.log(`   Blocked At: ${user.blockedAt ? new Date(user.blockedAt).toLocaleString() : 'Unknown'}`);
            console.log(`   Blocked By Admin: ${user.blockedByAdmin || 'Auto-blocked'}`);
            console.log('─'.repeat(80));
        });

        console.log(`\n📝 To unblock a user, run:`);
        console.log(`   node unblock-user.js <phone_number>`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

listBlockedUsers();
