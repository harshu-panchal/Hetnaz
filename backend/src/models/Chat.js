/**
 * Chat Model - Chat Conversations
 * @owner: Harsh (Chat Domain)
 * @purpose: Store chat conversations between users
 */

import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['male', 'female'],
          required: true,
        },
        lastReadAt: {
          type: Date,
          default: Date.now,
        },
        unreadCount: {
          type: Number,
          default: 0,
        },
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Intimacy Level System
    intimacyLevel: {
      type: Number,
      default: 1,
      min: 1,
    },
    messageCountByUser: {
      type: Map,
      of: Number,
      default: {},
    },
    totalMessageCount: {
      type: Number,
      default: 0,
    },
    lastLevelUpAt: {
      type: Date,
      default: null,
    },
    deletedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        deletedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
// chatSchema.index({ 'participants.userId': 1 });
chatSchema.index({ lastMessageAt: -1 });
chatSchema.index({ isActive: 1, lastMessageAt: -1 });

// Compound index for finding chat between two users
chatSchema.index({ 'participants.userId': 1, 'isActive': 1, 'lastMessageAt': -1 });
// chatSchema.index({ 'participants.userId': 1, 'participants.userId': 1 }, { unique: true });

// Instance method: Get other participant
chatSchema.methods.getOtherParticipant = function (currentUserId) {
  return this.participants.find(
    (p) => p.userId.toString() !== currentUserId.toString()
  );
};

// Instance method: Mark as read for a user
chatSchema.methods.markAsRead = function (userId) {
  const participant = this.participants.find(
    (p) => p.userId.toString() === userId.toString()
  );
  if (participant) {
    participant.lastReadAt = Date.now();
    participant.unreadCount = 0;
  }
};

// Instance method: Increment unread count
chatSchema.methods.incrementUnread = function (userId) {
  const participant = this.participants.find(
    (p) => p.userId.toString() !== userId.toString()
  );
  if (participant) {
    participant.unreadCount += 1;
  }
};

// Before save: Validate participants
chatSchema.pre('save', async function (next) {
  // Ensure exactly 2 participants
  if (this.participants.length !== 2) {
    return next(new Error('Chat must have exactly 2 participants'));
  }

  // Ensure participants have different user IDs
  const userIds = this.participants.map(p => p.userId.toString());
  if (new Set(userIds).size !== 2) {
    return next(new Error('Chat participants must be different users'));
  }

  next();
});

// After save: Update lastMessage if needed
chatSchema.post('save', async function (doc) {
  // If lastMessage is set, verify it exists
  if (doc.lastMessage) {
    // Lazy import to avoid circular dependency
    const { default: Message } = await import('./Message.js');
    const { default: logger } = await import('../utils/logger.js');

    const message = await Message.findById(doc.lastMessage);
    if (!message) {
      logger.warn(`⚠️ Chat ${doc._id} has invalid lastMessage reference`);
    }
  }
});

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;

