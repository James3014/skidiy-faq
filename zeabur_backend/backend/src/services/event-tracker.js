/**
 * Event Tracker Service
 *
 * Appends user interaction events to a JSONL file for later aggregation.
 */
const fs = require('fs');
const path = require('path');

class EventTracker {
  constructor(options = {}) {
    this.logPath =
      options.logPath ||
      process.env.EVENT_LOG_PATH ||
      path.join(__dirname, '../../../data/events.jsonl');

    const dir = path.dirname(this.logPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(this.logPath)) {
      fs.writeFileSync(this.logPath, '', 'utf-8');
    }
  }

  logEvent(event) {
    const {
      event_name: eventName,
      user_id: userId = null,
      session_id: sessionId = null,
      occurred_at: occurredAt = new Date().toISOString(),
      context = {},
      metadata = {},
    } = event;

    if (!eventName) {
      throw new Error('event_name is required');
    }

    const record = {
      event_name: eventName,
      user_id: userId,
      session_id: sessionId,
      occurred_at: occurredAt,
      context,
      metadata,
      recorded_at: new Date().toISOString(),
    };

    fs.appendFileSync(this.logPath, `${JSON.stringify(record)}\n`, 'utf-8');
    return record;
  }
}

module.exports = EventTracker;
