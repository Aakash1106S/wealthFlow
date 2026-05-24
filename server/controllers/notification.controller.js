const Notification = require('../models/Notification.model');

// ─── GET NOTIFICATIONS ────────────────────────────────────────────────────
exports.getNotifications = async (req, res, next) => {
  try {
    const { limit = 20, page = 1, unreadOnly } = req.query;
    const filter = { userId: req.user._id };
    if (unreadOnly === 'true') filter.read = false;

    const skip = (Number(page) - 1) * Number(limit);
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId: req.user._id, read: false }),
    ]);

    res.json({ success: true, data: notifications, total, unreadCount });
  } catch (error) {
    next(error);
  }
};

// ─── MARK READ ────────────────────────────────────────────────────────────
exports.markRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true }
    );
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    next(error);
  }
};

// ─── MARK ALL READ ────────────────────────────────────────────────────────
exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE NOTIFICATION ──────────────────────────────────────────────────
exports.deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true, message: 'Notification deleted.' });
  } catch (error) {
    next(error);
  }
};

// ─── CLEAR ALL ────────────────────────────────────────────────────────────
exports.clearAll = async (req, res, next) => {
  try {
    await Notification.deleteMany({ userId: req.user._id });
    res.json({ success: true, message: 'All notifications cleared.' });
  } catch (error) {
    next(error);
  }
};
