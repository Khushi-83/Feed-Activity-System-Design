const db = require('../db');

// Simple in-memory cache for hot feeds: userId -> { data: [], timestamp: number }
// In a real app, use Redis or a proper LRU cache library.
const feedCache = new Map();
const CACHE_TTL = 60 * 1000; // 1 minute

const addToFeed = async (userId, eventId) => {
    // Invalidate cache for this user
    feedCache.delete(userId);

    const query = `
    INSERT INTO feeds (user_id, event_id)
    VALUES ($1, $2)
  `;
    await db.query(query, [userId, eventId]);
};

const getFeed = async (userId, limit = 20, offset = 0) => {
    // Check cache only for first page (common case)
    if (offset === 0 && feedCache.has(userId)) {
        const cached = feedCache.get(userId);
        if (Date.now() - cached.timestamp < CACHE_TTL) {
            console.log(`Cache hit for user ${userId}`);
            return cached.data;
        }
    }

    const query = `
    SELECT f.created_at as feed_created_at, e.*
    FROM feeds f
    JOIN events e ON f.event_id = e.id
    WHERE f.user_id = $1
    ORDER BY f.created_at DESC
    LIMIT $2 OFFSET $3
  `;

    const result = await db.query(query, [userId, limit, offset]);
    const rows = result.rows;

    // Cache first page
    if (offset === 0) {
        feedCache.set(userId, { data: rows, timestamp: Date.now() });
    }

    return rows;
};

module.exports = {
    addToFeed,
    getFeed
};
