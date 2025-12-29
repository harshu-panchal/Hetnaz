/**
 * Auto Message Service
 * @owner: Sujal (User Domain)
 * @purpose: Handle auto-message template management and execution
 */

import AutoMessageTemplate from '../../models/AutoMessageTemplate.js';
import AutoMessageLog from '../../models/AutoMessageLog.js';
import User from '../../models/User.js';
import Chat from '../../models/Chat.js';
import Message from '../../models/Message.js';
import logger from '../../utils/logger.js';
import { getRandomDefaultTemplate } from '../../config/defaultAutoMessages.js';

const DAILY_AUTO_MESSAGE_LIMIT = 10;
const NEW_USER_THRESHOLD_DAYS = 7; // Consider users registered within last 7 days as "new"
const PROCESSING_DEBOUNCE_MS = 5000; // Debounce processing for 5 seconds

// In-memory lock to prevent race conditions
const processingLocks = new Map(); // maleUserId -> timestamp

class AutoMessageService {

    /**
     * SYSTEM: Create default template for a new female user
     */
    async createDefaultTemplate(userId) {
        try {
            // Check if user already has templates
            const existingCount = await AutoMessageTemplate.countDocuments({ userId });
            if (existingCount > 0) {
                return null; // User already has templates
            }

            const defaultMsg = getRandomDefaultTemplate();
            const template = new AutoMessageTemplate({
                userId,
                name: defaultMsg.name,
                content: defaultMsg.content,
                isEnabled: true, // First template is auto-enabled
                isDefault: true,
            });

            await template.save();
            logger.info(`✅ Default auto-message template created for user ${userId}`);
            return template;
        } catch (error) {
            logger.error(`❌ Error creating default template: ${error.message}`);
            throw error;
        }
    }

    /**
     * FEMALE SIDE: Create a new auto-message template
     */
    async createTemplate(userId, templateData) {
        try {
            // Verify user is female
            const user = await User.findById(userId);
            if (!user || user.role !== 'female') {
                throw new Error('Only female users can create auto-message templates');
            }

            const template = new AutoMessageTemplate({
                userId,
                name: templateData.name,
                content: templateData.content,
                isEnabled: templateData.isEnabled !== undefined ? templateData.isEnabled : false,
                isDefault: false,
            });

            await template.save();
            logger.info(`✅ Auto-message template created: ${template._id} by user ${userId}`);
            return template;
        } catch (error) {
            logger.error(`❌ Error creating auto-message template: ${error.message}`);
            throw error;
        }
    }

    /**
     * FEMALE SIDE: Get all templates for a user
     */
    async getTemplates(userId) {
        try {
            // Ensure user has at least one default template
            const count = await AutoMessageTemplate.countDocuments({ userId });
            if (count === 0) {
                await this.createDefaultTemplate(userId);
            }

            const templates = await AutoMessageTemplate.find({ userId })
                .sort({ isDefault: -1, createdAt: -1 }); // Default templates first
            return templates;
        } catch (error) {
            logger.error(`❌ Error fetching auto-message templates: ${error.message}`);
            throw error;
        }
    }

    /**
     * FEMALE SIDE: Update a template
     */
    async updateTemplate(userId, templateId, updateData) {
        try {
            const template = await AutoMessageTemplate.findOne({
                _id: templateId,
                userId,
            });

            if (!template) {
                throw new Error('Template not found or unauthorized');
            }

            // Update allowed fields
            if (updateData.name !== undefined) template.name = updateData.name;
            if (updateData.content !== undefined) template.content = updateData.content;
            if (updateData.isEnabled !== undefined) template.isEnabled = updateData.isEnabled;

            await template.save();
            logger.info(`✅ Auto-message template updated: ${templateId}`);
            return template;
        } catch (error) {
            logger.error(`❌ Error updating auto-message template: ${error.message}`);
            throw error;
        }
    }

    /**
     * FEMALE SIDE: Delete a template (cannot delete if it's the only one)
     */
    async deleteTemplate(userId, templateId) {
        try {
            // Check total count
            const totalCount = await AutoMessageTemplate.countDocuments({ userId });
            if (totalCount <= 1) {
                throw new Error('Cannot delete the last template. You must have at least one template.');
            }

            const template = await AutoMessageTemplate.findOne({
                _id: templateId,
                userId,
            });

            if (!template) {
                throw new Error('Template not found or unauthorized');
            }

            // If deleting the active template, enable another one
            if (template.isEnabled) {
                const anotherTemplate = await AutoMessageTemplate.findOne({
                    userId,
                    _id: { $ne: templateId },
                });
                if (anotherTemplate) {
                    anotherTemplate.isEnabled = true;
                    await anotherTemplate.save();
                }
            }

            await AutoMessageTemplate.findByIdAndDelete(templateId);

            logger.info(`✅ Auto-message template deleted: ${templateId}`);
            return { success: true };
        } catch (error) {
            logger.error(`❌ Error deleting auto-message template: ${error.message}`);
            throw error;
        }
    }

    /**
     * MALE SIDE: Process auto-messages for a male user
     * This is triggered when male loads dashboard or chat list
     */
    async processAutoMessagesForMale(maleUserId) {
        try {
            const maleIdStr = maleUserId.toString();

            // Check for debounce lock to prevent duplicate processing
            const lastProcessed = processingLocks.get(maleIdStr);
            if (lastProcessed && (Date.now() - lastProcessed) < PROCESSING_DEBOUNCE_MS) {
                logger.info(`⏳ Auto-message processing debounced for male ${maleUserId} (last processed ${Date.now() - lastProcessed}ms ago)`);
                return { success: true, sent: 0, reason: 'Debounced - already processed recently' };
            }

            // Set processing lock immediately to prevent race conditions
            processingLocks.set(maleIdStr, Date.now());

            // Verify user is male
            const maleUser = await User.findById(maleUserId);
            if (!maleUser || maleUser.role !== 'male') {
                processingLocks.delete(maleIdStr); // Release lock
                return { success: false, reason: 'User is not male' };
            }

            // Check if user is new (registered within threshold)
            const isNewUser = this._isNewUser(maleUser);

            // Determine how many auto-messages to send (prioritize new users)
            const targetCount = isNewUser ? 3 : 1; // Send 3 to new users, 1 to existing

            // Find eligible females who can send auto-messages to this male
            const eligibleFemales = await this._findEligibleFemales(maleUserId);

            if (eligibleFemales.length === 0) {
                logger.info(`ℹ️ No eligible females found for auto-messages to male ${maleUserId}`);
                return { success: true, sent: 0, reason: 'No eligible females' };
            }

            // Randomly select females (prioritize active ones)
            const selectedFemales = this._selectFemales(eligibleFemales, targetCount);

            // Send auto-messages
            let sentCount = 0;
            for (const femaleData of selectedFemales) {
                try {
                    await this._sendAutoMessage(femaleData.userId, maleUserId, femaleData.template);
                    sentCount++;
                } catch (error) {
                    logger.error(`❌ Failed to send auto-message from ${femaleData.userId} to ${maleUserId}: ${error.message}`);
                    // Continue with next female even if one fails
                }
            }

            logger.info(`✅ Sent ${sentCount} auto-messages to male ${maleUserId}`);
            return { success: true, sent: sentCount };
        } catch (error) {
            logger.error(`❌ Error processing auto-messages for male ${maleUserId}: ${error.message}`);
            return { success: false, error: error.message };
        }
    }


    /**
     * INTERNAL: Check if user is new
     */
    _isNewUser(user) {
        const daysSinceRegistration = (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceRegistration <= NEW_USER_THRESHOLD_DAYS;
    }

    /**
     * INTERNAL: Find eligible females who can send auto-messages
     */
    async _findEligibleFemales(maleUserId) {
        try {
            // Get today's date range for quota check
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            // Find all females who:
            // 1. Are approved and not blocked
            // 2. Have enabled templates
            // 3. Haven't already sent auto-message to this male
            // 4. Haven't exceeded daily quota

            // First, get females who already sent to this male
            const alreadySentFemales = await AutoMessageLog.find({
                receiverId: maleUserId,
            }).distinct('senderId');

            // Get females who exceeded daily quota
            const quotaExceededFemales = await AutoMessageLog.aggregate([
                {
                    $match: {
                        sentAt: { $gte: todayStart },
                    },
                },
                {
                    $group: {
                        _id: '$senderId',
                        count: { $sum: 1 },
                    },
                },
                {
                    $match: {
                        count: { $gte: DAILY_AUTO_MESSAGE_LIMIT },
                    },
                },
            ]);

            const quotaExceededIds = quotaExceededFemales.map(f => f._id);

            // Combine exclusion lists
            const excludedFemaleIds = [...alreadySentFemales, ...quotaExceededIds];

            // Find eligible females with enabled templates
            const eligibleTemplates = await AutoMessageTemplate.find({
                isEnabled: true,
                userId: { $nin: excludedFemaleIds },
            }).populate('userId');

            // Filter by user criteria
            const eligibleFemales = [];
            for (const template of eligibleTemplates) {
                const female = template.userId;
                if (
                    female &&
                    female.role === 'female' &&
                    female.approvalStatus === 'approved' &&
                    !female.isBlocked &&
                    female.isActive
                ) {
                    eligibleFemales.push({
                        userId: female._id,
                        template: template,
                        lastSeen: female.lastSeen,
                        isOnline: female.isOnline,
                    });
                }
            }

            return eligibleFemales;
        } catch (error) {
            logger.error(`❌ Error finding eligible females: ${error.message}`);
            throw error;
        }
    }

    /**
     * INTERNAL: Select females from eligible pool
     */
    _selectFemales(eligibleFemales, count) {
        // Prioritize recently active females
        const sorted = eligibleFemales.sort((a, b) => {
            // Online users first
            if (a.isOnline && !b.isOnline) return -1;
            if (!a.isOnline && b.isOnline) return 1;

            // Then by last seen (most recent first)
            return new Date(b.lastSeen) - new Date(a.lastSeen);
        });

        // Add some randomness while keeping priority
        const topCandidates = sorted.slice(0, Math.min(count * 3, sorted.length));

        // Shuffle top candidates
        for (let i = topCandidates.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [topCandidates[i], topCandidates[j]] = [topCandidates[j], topCandidates[i]];
        }

        return topCandidates.slice(0, count);
    }

    /**
     * INTERNAL: Send an auto-message
     */
    async _sendAutoMessage(femaleId, maleId, template) {
        try {
            // Find or create chat
            let chat = await Chat.findOne({
                'participants.userId': { $all: [femaleId, maleId] },
            });

            if (!chat) {
                // Create new chat
                chat = new Chat({
                    participants: [
                        { userId: femaleId, role: 'female' },
                        { userId: maleId, role: 'male' },
                    ],
                });
                await chat.save();
                logger.info(`✅ Created new chat ${chat._id} for auto-message`);
            }

            // Create message
            const message = new Message({
                chatId: chat._id,
                senderId: femaleId,
                receiverId: maleId,
                content: template.content,
                messageType: 'text',
                status: 'sent',
            });

            await message.save();

            // Update chat's last message
            chat.lastMessage = message._id;
            chat.lastMessageAt = message.createdAt;
            chat.totalMessageCount += 1;

            // Increment unread for male
            const maleParticipant = chat.participants.find(
                p => p.userId.toString() === maleId.toString()
            );
            if (maleParticipant) {
                maleParticipant.unreadCount += 1;
            }

            await chat.save();

            // Log the auto-message
            const log = new AutoMessageLog({
                senderId: femaleId,
                receiverId: maleId,
                templateId: template._id,
                chatId: chat._id,
                messageId: message._id,
            });

            await log.save();

            // Update template stats
            template.incrementSentCount();
            await template.save();

            logger.info(`✅ Auto-message sent from ${femaleId} to ${maleId} via template ${template._id}`);
            return { success: true, messageId: message._id };
        } catch (error) {
            logger.error(`❌ Error sending auto-message: ${error.message}`);
            throw error;
        }
    }

    /**
     * ANALYTICS: Get auto-message statistics for a female
     */
    async getStats(userId) {
        try {
            const templates = await AutoMessageTemplate.find({ userId });

            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            const todaySent = await AutoMessageLog.countDocuments({
                senderId: userId,
                sentAt: { $gte: todayStart },
            });

            const totalSent = await AutoMessageLog.countDocuments({
                senderId: userId,
            });

            return {
                templates: templates.length,
                enabledTemplates: templates.filter(t => t.isEnabled).length,
                todaySent,
                remainingToday: Math.max(0, DAILY_AUTO_MESSAGE_LIMIT - todaySent),
                totalSent,
            };
        } catch (error) {
            logger.error(`❌ Error fetching auto-message stats: ${error.message}`);
            throw error;
        }
    }
}

export default new AutoMessageService();
