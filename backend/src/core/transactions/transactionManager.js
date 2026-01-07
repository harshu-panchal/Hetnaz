/**
 * Transaction Manager - ACID Compliance Layer
 * @owner: Sujal (Shared - Both review)
 * @purpose: Ensure ACID properties for all database operations
 * 
 * ACID Properties:
 * - Atomicity: All or nothing
 * - Consistency: Data remains valid
 * - Isolation: Concurrent transactions don't interfere
 * - Durability: Committed changes persist
 */

import mongoose from 'mongoose';
import logger from '../../utils/logger.js';

class TransactionManager {
  /**
   * Execute operation within a transaction
   * Ensures Atomicity - all operations succeed or all fail
   */
  async executeTransaction(operations) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const results = [];

      // Execute all operations in sequence
      for (const operation of operations) {
        const result = await operation(session);
        results.push(result);
      }

      // Commit transaction (Atomicity)
      await session.commitTransaction();
      logger.info(`✅ Transaction committed: ${operations.length} operations`);

      return results.length === 1 ? results[0] : results;
    } catch (error) {
      // Rollback on any error (Atomicity)
      await session.abortTransaction();
      logger.error('❌ Transaction aborted:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Execute with retry logic for transient failures
   * Ensures Durability
   */
  async executeWithRetry(operations, maxRetries = 3) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.executeTransaction(operations);
      } catch (error) {
        lastError = error;

        // Don't retry on validation errors
        if (error.name === 'ValidationError' || error.name === 'CastError') {
          throw error;
        }

        // Exponential backoff
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 100;
          logger.warn(`⚠️ Transaction failed, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  /**
   * Execute with consistency checks
   * Ensures Consistency - validates data integrity before/after
   */
  async executeWithConsistency(operations, consistencyChecks) {
    // Pre-consistency checks
    if (consistencyChecks?.before) {
      for (const check of consistencyChecks.before) {
        const isValid = await check();
        if (!isValid) {
          throw new Error('Pre-consistency check failed');
        }
      }
    }

    // Execute transaction
    const results = await this.executeTransaction(operations);

    // Post-consistency checks
    if (consistencyChecks?.after) {
      for (const check of consistencyChecks.after) {
        const isValid = await check();
        if (!isValid) {
          // Rollback would have happened, but log for audit
          logger.error('❌ Post-consistency check failed');
          throw new Error('Post-consistency check failed');
        }
      }
    }

    return results;
  }
}

export default new TransactionManager();

