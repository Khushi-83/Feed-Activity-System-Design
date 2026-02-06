const db = require('../db');
const feedService = require('./feedService');
const notificationService = require('./notificationService');

// Sliding window for analytics (last minute/hour)
// Storing simple timestamps for simplicity. For high scale, use HyperLogLog or windowed counters.
const eventTimestamps = [];

const cleanOldAnalytics = () => {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    // Remove old events strictly efficiently (shift from start)
    while (eventTimestamps.length > 0 && eventTimestamps[0] < oneHourAgo) {
        eventTimestamps.shift();
    }
};
// Run cleanup every minute
setInterval(cleanOldAnalytics, 60 * 1000);

const createEvent = async (eventData) => {
    const { actor_id, verb, object_type, object_id, target_users } = eventData;

    // 1. Insert Event
    const insertQuery = `
    INSERT INTO events (actor_id, verb, object_type, object_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
    const result = await db.query(insertQuery, [actor_id, verb, object_type, object_id]);
    const event = result.rows[0];

    // Analytics tracking
    eventTimestamps.push(Date.now());

    // 2. Fan-out
    if (target_users && Array.isArray(target_users)) {
        const promises = target_users.map(async (userId) => {
            // Add to Feed
            await feedService.addToFeed(userId, event.id);

            // Create Notification
            const notif = await notificationService.createNotification(userId, event.id);

            // Push specific Real-time notification
            notificationService.sendToUser(userId, { type: 'NEW_EVENT', event, notification_id: notif.id });
        });

        // Process in background or await depending on requirement. 
        // Creating feed/notif is critical so we await.
        await Promise.all(promises);
    }

    return event;
};

const getAnalytics = () => {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;

    // This simple array filter is O(N) where N is events in last hour.
    // For production with massive events, this needs Redis or better structure.
    const lastMinute = eventTimestamps.filter(t => t > oneMinuteAgo).length;
    const lastHour = eventTimestamps.filter(t => t > oneHourAgo).length;

    return { events_last_minute: lastMinute, events_last_hour: lastHour };
};

module.exports = {
    createEvent,
    getAnalytics
};
