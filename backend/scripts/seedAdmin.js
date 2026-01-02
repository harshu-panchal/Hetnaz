
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../src/models/User.js';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedAdmin = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const adminPhone = '919999999999';

        const existingAdmin = await User.findOne({ phoneNumber: adminPhone });
        if (existingAdmin) {
            console.log('Admin already exists.');
            if (existingAdmin.role !== 'admin') {
                console.log('Updating role to admin...');
                existingAdmin.role = 'admin';
                await existingAdmin.save();
            }
        } else {
            console.log('Creating new admin...');
            await User.create({
                phoneNumber: adminPhone,
                role: 'admin',
                profile: {
                    name: 'Super Admin',
                    age: 30,
                    location: {
                        city: 'Headquarters',
                        coordinates: [0, 0]
                    },
                    photos: []
                },
                isVerified: true,
                approvalStatus: 'approved'
            });
            console.log('Admin created.');
        }

        console.log(`
        =========================================
        ADMIN CREDENTIALS:
        Phone: ${adminPhone}
        OTP (Dev): Check console logs (usually seeded or dynamic)
        =========================================
        `);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
