
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        'blood_request',
        'request_closed',
        'stock_appeal',
        'camp_invite',
      ],
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    body: {
      type: String,
      required: true,
      trim: true,
    },

    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    delivery: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'no-token'],
      default: 'pending',
    },

    deliveryError: {
      type: String,
    },

    readAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Retrieve latest notifications for a user
notificationSchema.index({
  userId: 1,
  createdAt: -1,
});

// Prevent duplicate camp invitations
notificationSchema.index(
  { userId: 1, 'data.campId': 1 },
  {
    unique: true,
    partialFilterExpression: {
      type: 'camp_invite',
    },
    name: 'unique_camp_invitation_per_donor',
  }
);

module.exports = mongoose.model(
  'Notification',
  notificationSchema
);
