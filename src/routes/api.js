const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

router.post('/events', apiController.postEvent);
router.get('/feed', apiController.getFeed);
router.get('/notifications', apiController.getNotifications);
router.get('/notifications/stream', apiController.getNotificationStream);
router.get('/top', apiController.getTopAnalytics);

module.exports = router;
