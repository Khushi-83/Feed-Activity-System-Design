const db = require('../db');

// In-memory store for active SSE connections: userId -> Set<Response>
const clients = new Map();

const addClient = (userId, res) => {
    if (!clients.has(userId)) {
        clients.set(userId, new Set());
    }
    clients.get(userId).add(res);

    // Remove client on close
    res.on('close', () => {
        if (clients.has(userId)) {
            const userClients = clients.get(userId);
            userClients.delete(res);
            if (userClients.size === 0) {
                clients.delete(userId);
            }
        }
    });
};

const sendToUser = (userId, data) => {
    if (clients.has(userId)) {
        const userClients = clients.get(userId);
        userClients.forEach((client) => {
            client.write(`data: ${JSON.stringify(data)}\n\n`);
        });
    }
};

const createNotification = async (userId, eventId) => {
    const query = `
    INSERT INTO notifications (user_id, event_id)
    VALUES ($1, $2)
    RETURNING id, created_at
  `;
    const result = await db.query(query, [userId, eventId]);
    return result.rows[0];
};

const getNotifications = async (userId, limit = 20, offset = 0) => {
    const query = `
        SELECT n.id, n.seen, n.created_at, e.actor_id, e.verb, e.object_type, e.object_id
        FROM notifications n
        JOIN events e ON n.event_id = e.id
        WHERE n.user_id = $1
        ORDER BY n.created_at DESC
        LIMIT $2 OFFSET $3
    `;
    const result = await db.query(query, [userId, limit, offset]);
    return result.rows;
};

module.exports = {
    addClient,
    sendToUser,
    createNotification,
    getNotifications
};
