
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const { sendPush, isExpoToken } = require('../utils/expoPush');
const { matchDonors, getPushTokens } = require('../utils/donorClient');

const DEFAULT_RADIUS_KM = Number(process.env.NOTIFY_RADIUS_KM) || 15;

const fail = (res, err) => {
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ message: err.message });
  }

  console.error('notification-service error:', err);
  return res.status(500).json({ message: 'Server error' });
};

// Save in-app notifications, send Expo pushes,
// and update delivery status.
async function deliver({
  recipients,
  type,
  title,
  body,
  data,
  priority,
}) {
  if (!recipients.length) {
    return { total: 0, sent: 0, failed: 0, noToken: 0 };
  }

  const docs = await Notification.insertMany(
    recipients.map((recipient) => ({
      userId: recipient.userId,
      type,
      title,
      body: recipient.body || body,
      data: {
        ...data,
        ...(recipient.extraData || {}),
      },
    }))
  );

  const pushTargets = [];

  recipients.forEach((recipient, index) => {
    if (isExpoToken(recipient.pushToken)) {
      pushTargets.push({
        index,
        message: {
          to: recipient.pushToken,
          title,
          body: docs[index].body,
          data: docs[index].data,
          ...(priority ? { priority } : {}),
        },
      });
    }
  });

  const tickets = pushTargets.length
    ? await sendPush(pushTargets.map((item) => item.message))
    : [];

  const updates = [];
  const pushedIndexes = new Set();

  pushTargets.forEach((target, index) => {
    pushedIndexes.add(target.index);

    const ticket = tickets[index];
    const success = ticket?.status === 'ok';

    updates.push({
      updateOne: {
        filter: { _id: docs[target.index]._id },
        update: {
          $set: {
            delivery: success ? 'sent' : 'failed',
            ...(success
              ? {}
              : {
                  deliveryError:
                    ticket?.message || 'Push notification failed',
                }),
          },
          ...(success
            ? { $unset: { deliveryError: '' } }
            : {}),
        },
      },
    });
  });

  docs.forEach((doc, index) => {
    if (!pushedIndexes.has(index)) {
      updates.push({
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: { delivery: 'no-token' } },
        },
      });
    }
  });

  if (updates.length) {
    await Notification.bulkWrite(updates);
  }

  const sent = tickets.filter(
    (ticket) => ticket?.status === 'ok'
  ).length;

  return {
    total: docs.length,
    sent,
    failed: pushTargets.length - sent,
    noToken: docs.length - pushTargets.length,
  };
}

// ==========================================
// PUBLIC NOTIFICATIONS
// ==========================================

// GET /api/notifications/mine
exports.listMine = async (req, res) => {
  try {
    const [items, unread] = await Promise.all([
      Notification.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .limit(50),

      Notification.countDocuments({
        userId: req.user.id,
        readAt: { $exists: false },
      }),
    ]);

    return res.json({
      unread,
      notifications: items,
    });
  } catch (err) {
    return fail(res, err);
  }
};

// PATCH /api/notifications/:id/read
exports.markRead = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid notification ID',
      });
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
      },
      { $set: { readAt: new Date() } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found',
      });
    }

    return res.json(notification);
  } catch (err) {
    return fail(res, err);
  }
};

// ==========================================
// EMERGENCY BLOOD REQUEST NOTIFICATIONS
// ==========================================

// POST /internal/request-broadcast
exports.broadcastRequest = async (req, res) => {
  try {
    const {
      requestId,
      requesterId,
      bloodType,
      unitsRequired,
      hospitalName,
      location,
      radiusKm,
    } = req.body;

    const [lng, lat] = location?.coordinates || [];

    if (
      !mongoose.isValidObjectId(requestId) ||
      !bloodType ||
      !Number.isFinite(lng) ||
      !Number.isFinite(lat)
    ) {
      return res.status(400).json({
        message: 'Valid requestId, bloodType and location required',
      });
    }

    const matches = await matchDonors({
      bloodType,
      lat,
      lng,
      radiusKm: radiusKm || DEFAULT_RADIUS_KM,
    });

    const recipients = matches
      .filter(
        (donor) =>
          String(donor.userId) !== String(requesterId)
      )
      .map((donor) => ({
        userId: donor.userId,
        pushToken: donor.pushToken,
        body: `${hospitalName || 'A hospital'} needs ${
          unitsRequired || 1
        } unit(s) - ${donor.distanceKm} km away`,
        extraData: {
          distanceKm: donor.distanceKm,
        },
      }));

    const result = await deliver({
      recipients,
      type: 'blood_request',
      title: `Urgent: ${bloodType} blood needed`,
      body: `${hospitalName || 'A hospital'} needs ${bloodType} blood`,
      data: {
        requestId,
        hospitalName,
        bloodType,
      },
    });

    return res.json({
      matched: matches.length,
      ...result,
    });
  } catch (err) {
    return fail(res, err);
  }
};

// ==========================================
// REQUEST CLOSED NOTIFICATIONS
// ==========================================

// POST /internal/request-closed
exports.requestClosed = async (req, res) => {
  try {
    const {
      requestId,
      status,
      hospitalName,
      donorIds,
    } = req.body;

    if (
      !mongoose.isValidObjectId(requestId) ||
      !['fulfilled', 'closed'].includes(status) ||
      !Array.isArray(donorIds) ||
      donorIds.length === 0
    ) {
      return res.status(400).json({
        message: 'Valid requestId, status and donorIds required',
      });
    }

    const tokens = await getPushTokens(donorIds);

    const tokenById = new Map(
      tokens.map((item) => [
        String(item.userId),
        item.pushToken,
      ])
    );

    const fulfilled = status === 'fulfilled';

    const result = await deliver({
      recipients: [...new Set(donorIds.map(String))].map(
        (userId) => ({
          userId,
          pushToken: tokenById.get(userId),
        })
      ),
      type: 'request_closed',
      title: fulfilled
        ? 'Request fulfilled - thank you'
        : 'Request cancelled',
      body: fulfilled
        ? 'Enough blood has been collected. You no longer need to travel.'
        : 'The requester cancelled this blood request. You no longer need to travel.',
      data: {
        requestId,
        hospitalName,
        status,
      },
    });

    return res.json(result);
  } catch (err) {
    return fail(res, err);
  }
};

// ==========================================
// HOSPITAL STOCK APPEALS
// ==========================================

// POST /internal/stock-appeal
exports.stockAppeal = async (req, res) => {
  try {
    const {
      hospitalId,
      hospitalName,
      bloodType,
      location,
      radiusKm,
    } = req.body;

    const [lng, lat] = location?.coordinates || [];

    if (
      !hospitalId ||
      !bloodType ||
      !Number.isFinite(lng) ||
      !Number.isFinite(lat)
    ) {
      return res.status(400).json({
        message: 'Hospital ID, blood type and location required',
      });
    }

    const matches = await matchDonors({
      bloodType,
      lat,
      lng,
      radiusKm: radiusKm || DEFAULT_RADIUS_KM,
      exact: true,
    });

    const name = hospitalName || 'A hospital';

    const result = await deliver({
      recipients: matches.map((donor) => ({
        userId: donor.userId,
        pushToken: donor.pushToken,
        body: `${name} is low on ${bloodType} - ${donor.distanceKm} km away. Could you donate?`,
        extraData: {
          distanceKm: donor.distanceKm,
        },
      })),
      type: 'stock_appeal',
      title: `${bloodType} stock running low`,
      body: `${name} is low on ${bloodType}. Could you donate?`,
      data: {
        hospitalId,
        hospitalName,
        bloodType,
      },
      priority: 'normal',
    });

    return res.json({
      matched: matches.length,
      ...result,
    });
  } catch (err) {
    return fail(res, err);
  }
};

// ==========================================
// CAMP INVITATIONS
// ==========================================

// POST /internal/notifications/camp-invite
exports.sendCampInvitations = async (req, res) => {
  try {
    const {
      campId,
      title,
      district,
      venueName: venue,
      startsAt: startDate,
      bloodTypesNeeded: targetBloodTypes,
      location,
    } = req.body;

    const [lng, lat] = location?.coordinates || [];

    const validBloodTypes = [
      'A+', 'A-',
      'B+', 'B-',
      'AB+', 'AB-',
      'O+', 'O-',
    ];

    if (
      !mongoose.isValidObjectId(campId) ||
      !title ||
      !venue ||
      !Number.isFinite(Date.parse(startDate)) ||
      !Array.isArray(targetBloodTypes) ||
      targetBloodTypes.length === 0 ||
      targetBloodTypes.some(
        (type) => !validBloodTypes.includes(type)
      ) ||
      !Number.isFinite(lng) ||
      !Number.isFinite(lat)
    ) {
      return res.status(400).json({
        message: 'Invalid camp invitation information',
      });
    }

    // Match donors by exact blood type and location
    const matchesByType = await Promise.all(
      [...new Set(targetBloodTypes)].map((bloodType) =>
        matchDonors({
          bloodType,
          lat,
          lng,
          radiusKm: DEFAULT_RADIUS_KM,
          exact: true,
        })
      )
    );

    // Remove duplicate donors
    const donorMap = new Map();

    for (const matches of matchesByType) {
      if (!Array.isArray(matches)) {
        throw new Error('Unexpected donor matching response');
      }

      for (const donor of matches) {
        if (mongoose.isValidObjectId(donor.userId)) {
          donorMap.set(String(donor.userId), donor);
        }
      }
    }

    const donors = [...donorMap.values()];

    const notificationTitle = `Blood donation camp: ${title}`;

    const notificationBody =
      `${venue}${district ? `, ${district}` : ''}. ` +
      `Join us on ${new Date(startDate).toLocaleDateString('en-LK')}.`;

    let created = 0;
    let alreadyInvited = 0;
    let sent = 0;
    let failed = 0;
    let noToken = 0;

    // Atomically create each invitation.
    // The Notification model's unique index must exist.
    for (const donor of donors) {
      let notification;

      try {
        const result = await Notification.updateOne(
          {
            userId: donor.userId,
            type: 'camp_invite',
            'data.campId': String(campId),
          },
          {
            $setOnInsert: {
              userId: donor.userId,
              type: 'camp_invite',
              title: notificationTitle,
              body: notificationBody,
              data: {
                campId: String(campId),
                district,
                venue,
                startDate,
              },
              delivery: 'pending',
            },
          },
          { upsert: true }
        );

        if (result.upsertedCount === 0) {
          alreadyInvited++;
          continue;
        }

        created++;

        notification = await Notification.findById(
          result.upsertedId
        );
      } catch (error) {
        if (error.code === 11000) {
          alreadyInvited++;
          continue;
        }
        throw error;
      }

      if (!notification) {
        failed++;
        continue;
      }

      if (!isExpoToken(donor.pushToken)) {
        await Notification.updateOne(
          { _id: notification._id },
          { $set: { delivery: 'no-token' } }
        );

        noToken++;
        continue;
      }

      try {
        const tickets = await sendPush([
          {
            to: donor.pushToken,
            title: notificationTitle,
            body: notificationBody,
            data: notification.data,
            priority: 'normal',
          },
        ]);

        const ticket = tickets[0];
        const success = ticket?.status === 'ok';

        await Notification.updateOne(
          { _id: notification._id },
          {
            $set: {
              delivery: success ? 'sent' : 'failed',
              ...(success
                ? {}
                : {
                    deliveryError:
                      ticket?.message || 'Push failed',
                  }),
            },
            ...(success
              ? { $unset: { deliveryError: '' } }
              : {}),
          }
        );

        if (success) {
          sent++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;

        await Notification.updateOne(
          { _id: notification._id },
          {
            $set: {
              delivery: 'failed',
              deliveryError: error.message,
            },
          }
        );
      }
    }

    return res.json({
      message: 'Camp invitations processed',
      campId: String(campId),
      matched: donors.length,
      created,
      alreadyInvited,
      sent,
      failed,
      noToken,
    });
  } catch (err) {
    return fail(res, err);
  }
};
