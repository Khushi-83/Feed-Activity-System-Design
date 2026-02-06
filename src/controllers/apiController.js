const eventService = require('../services/eventService');
const feedService = require('../services/feedService');
const notificationService = require('../services/notificationService');

const postEvent = async (req, res) => {
    try {
        const event = await eventService.createEvent(req.body);
        res.status(201).json(event);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create event' });
    }
};

const getFeed = async (req, res) => {
    try {
        const { user_id, limit, offset } = req.query;
        if (!user_id) return res.status(400).json({ error: 'user_id is required' });

        const feed = await feedService.getFeed(user_id, parseInt(limit) || 20, parseInt(offset) || 0);
        res.json(feed);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch feed' });
    }
};

const getNotifications = async (req, res) => {
    try {
        const { user_id, limit, offset } = req.query;
        if (!user_id) return res.status(400).json({ error: 'user_id is required' });

        const notifications = await notificationService.getNotifications(user_id, parseInt(limit) || 20, parseInt(offset) || 0);
        res.json(notifications);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

const getNotificationStream = (req, res) => {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'user_id is required' });

    // SSE Setup
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    // Heartbeat to keep connection alive
    const heartbeat = setInterval(() => {
        res.write(': heartbeat\n\n');
    }, 15000);

    res.on('close', () => {
        clearInterval(heartbeat);
    });

    notificationService.addClient(user_id, res);
};

const getTopAnalytics = (req, res) => {
    const analytics = eventService.getAnalytics();
    res.json(analytics);
};

module.exports = {
    postEvent,
    getFeed,
    getNotifications,
    getNotificationStream,
    getTopAnalytics
};
