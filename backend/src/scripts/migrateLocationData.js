/**
 * Migration Script: Consolidate Location Data
 * 
 * This script migrates users from the old redundant location structure to the new consolidated one:
 * OLD: profile.locationString, profile.latitude, profile.longitude + profile.location.coordinates
 * NEW: profile.location.city + profile.location.coordinates (GeoJSON)
 * 
 * Run: node src/scripts/migrateLocationData.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function migrateLocationData() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const User = mongoose.connection.collection('users');

        // Find all users with old location fields
        const usersToMigrate = await User.find({
            $or: [
                { 'profile.locationString': { $exists: true } },
                { 'profile.latitude': { $exists: true } },
                { 'profile.longitude': { $exists: true } }
            ]
        }).toArray();

        console.log(`📊 Found ${usersToMigrate.length} users to migrate`);

        let migratedCount = 0;
        let skippedCount = 0;

        for (const user of usersToMigrate) {
            const updates = {};
            const unsets = {};

            // If locationString exists, move it to location.city
            if (user.profile?.locationString) {
                // Only update city if it's empty or doesn't exist
                if (!user.profile?.location?.city) {
                    updates['profile.location.city'] = user.profile.locationString;
                }
                unsets['profile.locationString'] = '';
            }

            // If lat/lng exist, ensure coordinates are updated and remove redundant fields
            if (user.profile?.latitude !== undefined && user.profile?.longitude !== undefined) {
                // Only update coordinates if they're not already set or are [0,0]
                const existingCoords = user.profile?.location?.coordinates?.coordinates;
                if (!existingCoords || (existingCoords[0] === 0 && existingCoords[1] === 0)) {
                    updates['profile.location.coordinates'] = {
                        type: 'Point',
                        coordinates: [user.profile.longitude, user.profile.latitude] // [lng, lat]
                    };
                }
                unsets['profile.latitude'] = '';
                unsets['profile.longitude'] = '';
            }

            // Apply updates if any
            if (Object.keys(updates).length > 0 || Object.keys(unsets).length > 0) {
                const updateOp = {};
                if (Object.keys(updates).length > 0) updateOp.$set = updates;
                if (Object.keys(unsets).length > 0) updateOp.$unset = unsets;

                await User.updateOne({ _id: user._id }, updateOp);
                migratedCount++;
                console.log(`  ✓ Migrated user: ${user._id} (${user.profile?.name || user.phoneNumber})`);
            } else {
                skippedCount++;
            }
        }

        console.log('\n📈 Migration Summary:');
        console.log(`   Total processed: ${usersToMigrate.length}`);
        console.log(`   Migrated: ${migratedCount}`);
        console.log(`   Skipped (already clean): ${skippedCount}`);
        console.log('\n✅ Migration complete!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

migrateLocationData();
