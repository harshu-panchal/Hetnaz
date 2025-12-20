/**
 * User Model - Base User Schema
 * @owner: Sujal (Shared - Both review required for changes)
 * @purpose: User authentication, profile, and role management
 * 
 * NOTE: Chat-related fields (socketId, isOnline, lastSeen) are managed by Harsh
 * NOTE: Wallet fields (coinBalance, memberTier) are managed by Sujal
 */

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    // Authentication Fields (Sujal)
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^\d{10}$/, 'Please provide a valid 10-digit phone number'],
      index: true,
    },
    role: {
      type: String,
      enum: ['male', 'female', 'admin'],
      required: [true, 'Role is required'],
      index: true,
    },
    genderPreference: {
      type: String,
      enum: ['male', 'female', 'both'],
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Chat-Related Fields (Harsh - Chat Domain)
    socketId: {
      type: String,
      default: null,
      index: true,
    },
    isOnline: {
      type: Boolean,
      default: false,
      index: true,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    // Video Call Fields (for paid video calling feature)
    isOnCall: {
      type: Boolean,
      default: false,
      index: true,
    },
    lockedCoins: {
      type: Number,
      default: 0,
      min: [0, 'Locked coins cannot be negative'],
    },

    // Wallet Fields (Sujal - Wallet Domain)
    coinBalance: {
      type: Number,
      default: 0,
      min: [0, 'Coin balance cannot be negative'],
    },
    memberTier: {
      type: String,
      enum: ['basic', 'silver', 'gold', 'platinum'],
      default: 'basic',
    },

    // Profile Fields (Sujal - Profile Domain)
    profile: {
      name: {
        type: String,
        trim: true,
      },
      age: {
        type: Number,
        min: [18, 'Age must be at least 18'],
        max: [100, 'Age must be less than 100'],
      },
      bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters'],
      },
      photos: [
        {
          url: String,
          isPrimary: {
            type: Boolean,
            default: false,
          },
          uploadedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      location: {
        city: String,
        state: String,
        country: String,
        coordinates: {
          type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
          },
          coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0],
          },
        },
      },
      occupation: String,
      interests: [String],
      preferences: {
        ageRange: {
          min: Number,
          max: Number,
        },
        maxDistance: Number,
      },
    },

    // Female-Specific Fields (Sujal)
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'resubmit_requested'],
      default: 'pending',
    },
    approvalReviewedAt: Date,
    approvalReviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectionReason: String,
    // Verification Documents (Aadhaar Card)
    verificationDocuments: {
      aadhaarCard: {
        url: String,
        publicId: String, // Cloudinary public ID
        uploadedAt: Date,
        verified: {
          type: Boolean,
          default: false,
        },
      },
    },

    // Timestamps
    lastLoginAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
// userSchema.index({ phoneNumber: 1 }); // unique:true covers this
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ 'profile.location.coordinates': '2dsphere' }); // For geospatial queries
userSchema.index({ isOnline: 1, lastSeen: -1 });
userSchema.index({ coinBalance: -1 });
// Compound index for discover females query (approved females sorted by lastSeen)
userSchema.index({ role: 1, approvalStatus: 1, isBlocked: 1, lastSeen: -1 });
userSchema.index({ role: 1, approvalStatus: 1, isBlocked: 1, createdAt: -1 });
userSchema.index({ role: 1, approvalStatus: 1, isBlocked: 1, isOnline: 1 });

// Virtual: Full name
userSchema.virtual('fullName').get(function () {
  return this.profile?.name || `User ${this.phoneNumber}`;
});

// Virtual: Primary photo
userSchema.virtual('primaryPhoto').get(function () {
  const primary = this.profile?.photos?.find((p) => p.isPrimary);
  return primary?.url || this.profile?.photos?.[0]?.url || null;
});

// Before save: Validate coin balance is not negative
userSchema.pre('save', async function (next) {
  if (this.isModified('coinBalance') && this.coinBalance < 0) {
    return next(new Error('Coin balance cannot be negative'));
  }
  next();
});

// After save: If balance changed, verify consistency (lazy import to avoid circular dependency)
userSchema.post('save', async function (doc) {
  if (this.isModified('coinBalance')) {
    // Lazy import to avoid circular dependency
    import('../core/consistency/dataConsistency.js').then(({ default: dataConsistency }) => {
      import('../utils/logger.js').then(({ default: logger }) => {
        dataConsistency.verifyUserBalance(doc._id)
          .then(result => {
            if (!result.valid) {
              logger.warn(`⚠️ Balance inconsistency detected for user ${doc._id}`);
            }
          })
          .catch(err => {
            logger.error(`Error verifying balance: ${err.message}`);
          });
      });
    });
  }
});

// Before remove: Handle cascade deletes
userSchema.pre('remove', async function (next) {
  const session = this.$session();

  if (session) {
    // Lazy import to avoid circular dependency
    const { default: relationshipManager } = await import('../core/relationships/relationshipManager.js');
    await relationshipManager.handleCascadeDelete(
      this._id,
      'user',
      session
    );
  }

  next();
});

// Instance method: Check if password changed after token issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  // False means not changed
  return false;
};

const User = mongoose.model('User', userSchema);

export default User;

