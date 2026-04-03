/**
 * Database Initialization Script
 * @purpose: Automatically create all collections and build indexes in the MongoDB cluster.
 */

import 'dotenv/config';
import db from '../config/database.js';
import * as Models from '../models/index.js';
import logger from '../utils/logger.js';

async function initializeDatabase() {
  try {
    logger.info('🚀 Starting Database Cluster Initialization...');

    // 1. Connect to Database
    await db.connect();
    
    // 2. Iterate through all models and initialize
    const modelEntries = Object.entries(Models);
    
    logger.info(`🔍 Found ${modelEntries.length} models to initialize.`);

    for (const [name, Model] of modelEntries) {
      if (!Model || typeof Model.createCollection !== 'function') {
        logger.warn(`⚠️ Skipping ${name}: Not a valid Mongoose Model.`);
        continue;
      }

      try {
        logger.info(`📦 Initializing [${name}]...`);
        
        // Ensure collection exists
        await Model.createCollection();
        
        // Build/Sync indexes (e.g. unique phone, email, etc)
        await Model.syncIndexes();
        
        logger.info(`✅ [${name}] collection and indexes ready.`);
      } catch (err) {
        logger.error(`❌ Error initializing [${name}]:`, err.message);
      }
    }

    logger.info('✨ Database cluster initialization completed successfully!');
  } catch (error) {
    logger.error('💥 Critical error during database initialization:', error);
  } finally {
    // 3. Graceful Disconnection
    await db.disconnect();
    process.exit(0);
  }
}

// Execute the script
initializeDatabase();
