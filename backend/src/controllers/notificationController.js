const { Notification } = require('../models');

async function getAll(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const result = await Notification.findAndCountAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit, offset,
    });
    res.json({ success: true, data: { notifications: result.rows, total: result.count } });
  } catch (e) { next(e); }
}

async function markRead(req, res, next) {
  try {
    const n = await Notification.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!n) return res.status(404).json({ success: false, message: 'Not found' });
    await n.update({ is_read: true });
    res.json({ success: true, data: n });
  } catch (e) { next(e); }
}

async function markAllRead(req, res, next) {
  try {
    await Notification.update({ is_read: true }, { where: { user_id: req.user.id, is_read: false } });
    res.json({ success: true });
  } catch (e) { next(e); }
}

async function getUnreadCount(req, res, next) {
  try {
    const count = await Notification.count({ where: { user_id: req.user.id, is_read: false } });
    res.json({ success: true, data: { count } });
  } catch (e) { next(e); }
}

module.exports = { getAll, markRead, markAllRead, getUnreadCount };
