/**
 * Chat Routes
 * @owner: Harsh (Chat Domain)
 * @purpose: REST API routes for chat operations
 */

import express from 'express';
import * as chatController from '../../controllers/chat/chatController.js';
import * as messageController from '../../controllers/chat/messageController.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { checkBlockedStatus, checkAdminBlock } from '../../middleware/blockCheck.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// ========================
// CHAT MANAGEMENT
// ========================

// Get user's chat list (no block check - viewing own list)
router.get('/chats', chatController.getMyChatList);

// Get or create chat with a user (check if users can communicate)
router.post('/chats', checkBlockedStatus, chatController.getOrCreateChat);

// Get a specific chat by ID (no block check for viewing existing chat)
router.get('/chats/:chatId', chatController.getChatById);

// Get messages for a chat (no block check for viewing history)
router.get('/chats/:chatId/messages', chatController.getChatMessages);

// Mark chat as read (no block check)
router.patch('/chats/:chatId/read', chatController.markChatAsRead);

// ========================
// MESSAGING
// ========================

// Send text message (with coin deduction for males) - BLOCK CHECK REQUIRED
router.post('/messages', checkBlockedStatus, messageController.sendMessage);

// Send "Hi" message (5 coins - male only) - BLOCK CHECK REQUIRED
router.post('/messages/hi', restrictTo('male'), checkBlockedStatus, messageController.sendHiMessage);

// Send gift (male only) - BLOCK CHECK REQUIRED
router.post('/messages/gift', restrictTo('male'), checkBlockedStatus, messageController.sendGift);

// ========================
// GIFTS
// ========================

// Get available gifts
router.get('/gifts', messageController.getGifts);

// Get gift history
router.get('/history/gifts', restrictTo('male'), messageController.getGiftHistory);

export default router;
