const express = require('express');
const router = express.Router();
const notif = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', notif.getNotifications);
router.put('/read-all', notif.markAllRead);
router.put('/:id/read', notif.markRead);
router.delete('/clear-all', notif.clearAll);
router.delete('/:id', notif.deleteNotification);

module.exports = router;
