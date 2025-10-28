const express = require('express');
const router = express.Router();
const EventTracker = require('../services/event-tracker');
const { AppError } = require('../middleware/error-handler');
const { sendSuccess } = require('../utils/response-formatter');

const tracker = new EventTracker();

router.post('/track', async (req, res, next) => {
  try {
    const { event_name: eventName, user_id: userId, session_id: sessionId, occurred_at: occurredAt, context = {}, metadata = {} } = req.body || {};

    if (!eventName || typeof eventName !== 'string') {
      throw new AppError('EVENT_NAME_REQUIRED', 'event_name is required', 400);
    }

    const payload = {
      event_name: eventName,
      user_id: userId || null,
      session_id: sessionId || req.headers['x-session-id'] || null,
      occurred_at: occurredAt,
      context,
      metadata
    };

    const record = tracker.logEvent(payload);

    sendSuccess(res, { recorded: true }, 201, {
      timestamp: record.recorded_at
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
