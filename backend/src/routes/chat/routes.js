/**
 * Chat Routes
 * @owner: Harsh (Chat Domain)
 * @purpose: REST API routes for chat operations
 */

import express from 'express';
import * as chatController from '../../controllers/chat/chatController.js';
import * as messageController from '../../controllers/chat/messageController.js';
import { protect, restrictTo } from '../../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// ========================
// CHAT MANAGEMENT
// ========================

// Get user's chat list
router.get('/chats', chatController.getMyChatList);

// Get or create chat with a user
router.post('/chats', chatController.getOrCreateChat);

// Get a specific chat by ID
router.get('/chats/:chatId', chatController.getChatById);

// Get messages for a chat
router.get('/chats/:chatId/messages', chatController.getChatMessages);

// Mark chat as read
router.patch('/chats/:chatId/read', chatController.markChatAsRead);

// ========================
// MESSAGING
// ========================

// Send text message (with coin deduction for males)
router.post('/messages', messageController.sendMessage);

// Send "Hi" message (5 coins - male only)
router.post('/messages/hi', restrictTo('male'), messageController.sendHiMessage);

// Send gift (male only)
router.post('/messages/gift', restrictTo('male'), messageController.sendGift);

// ========================
// GIFTS
// ========================

// Get available gifts
router.get('/gifts', messageController.getGifts);

export default router;
