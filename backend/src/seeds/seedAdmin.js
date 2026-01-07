/**
 * Seed Admin User
 * Creates the default admin user with phone number 919981331303
 * Run with: node --experimental-modules src/seeds/seedAdmin.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/toki';
const DEFAULT_ADMIN_PHONE = '919981331303';

async function seedAdmin() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ phoneNumber: DEFAULT_ADMIN_PHONE });

        if (existingAdmin) {
            console.log('📧 Admin user already exists:', DEFAULT_ADMIN_PHONE);

            // Update to admin role if not already
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                existingAdmin.isVerified = true;
                await existingAdmin.save();
                console.log('✅ Updated existing user to admin role');
            } else {
                console.log('✅ User already has admin role');
            }
        } else {
            // Create new admin user
            const adminUser = await User.create({
                phoneNumber: DEFAULT_ADMIN_PHONE,
                role: 'admin',
                isVerified: true,
                isActive: true,
                isBlocked: false,
                profile: {
                    name: 'Admin'
                }
            });
            console.log('✅ Admin user created:', adminUser.phoneNumber);
        }

        console.log('\n🎉 Admin seeding complete!');
        console.log('📱 Admin Phone: +91 9981331303');
        console.log('🔐 Default Secret: 123456 (can be changed from Admin Settings)');

    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

seedAdmin();
