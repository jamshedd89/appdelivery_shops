const { Message, Order, User } = require('../models');
const ApiError = require('../utils/ApiError');

async function getMessages(req, res, next) {
  try {
    const { orderId } = req.params;
    const order = await Order.findByPk(orderId);
    if (!order) throw ApiError.notFound('Order not found');
    if (order.seller_id !== req.user.id && order.courier_id !== req.user.id) {
      throw ApiError.forbidden('Access denied');
    }
    const messages = await Message.findAll({
      where: { order_id: orderId },
      include: [{ model: User, as: 'sender', attributes: ['id', 'first_name', 'last_name', 'role'] }],
      order: [['created_at', 'ASC']],
    });
    // Mark unread messages as read
    await Message.update(
      { is_read: true },
      { where: { order_id: orderId, is_read: false, sender_id: { [require('sequelize').Op.ne]: req.user.id } } }
    );
    res.json({ success: true, data: messages });
  } catch (e) { next(e); }
}

async function sendMessage(req, res, next) {
  try {
    const { orderId } = req.params;
    const { type = 'text', content, latitude, longitude } = req.body;
    const order = await Order.findByPk(orderId);
    if (!order) throw ApiError.notFound('Order not found');
    if (order.seller_id !== req.user.id && order.courier_id !== req.user.id) {
      throw ApiError.forbidden('Access denied');
    }
    const activeStatuses = ['accepted', 'on_way_shop', 'at_shop', 'on_way_client', 'delivered'];
    if (!activeStatuses.includes(order.status)) {
      throw ApiError.badRequest('Chat is only available during active delivery');
    }
    if (!content || !content.trim()) throw ApiError.badRequest('Content is required');

    const msg = await Message.create({
      order_id: orderId,
      sender_id: req.user.id,
      type,
      content: content.trim(),
      latitude: latitude || null,
      longitude: longitude || null,
    });

    const fullMsg = await Message.findByPk(msg.id, {
      include: [{ model: User, as: 'sender', attributes: ['id', 'first_name', 'last_name', 'role'] }],
    });

    // Emit via socket
    const io = req.app.get('io');
    if (io) {
      io.to(`order:${orderId}`).emit('chat:message', fullMsg);
    }

    res.status(201).json({ success: true, data: fullMsg });
  } catch (e) { next(e); }
}

async function getUnreadCount(req, res, next) {
  try {
    const { orderId } = req.params;
    const count = await Message.count({
      where: {
        order_id: orderId,
        is_read: false,
        sender_id: { [require('sequelize').Op.ne]: req.user.id },
      },
    });
    res.json({ success: true, data: { unread: count } });
  } catch (e) { next(e); }
}

module.exports = { getMessages, sendMessage, getUnreadCount };
