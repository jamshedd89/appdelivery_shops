const { User, SellerProfile, CourierProfile, SellerAddress, Order, OrderItem, Transaction } = require('../models');
const { Op } = require('sequelize');
const ApiError = require('../utils/ApiError');

async function getUsers(req, res, next) {
  try {
    const { role, status, search, limit = 50, offset = 0 } = req.query;
    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) where[Op.or] = [{ first_name: { [Op.like]: `%${search}%` } }, { last_name: { [Op.like]: `%${search}%` } }, { phone: { [Op.like]: `%${search}%` } }];
    const r = await User.findAndCountAll({ where, attributes: { exclude: ['password_hash'] }, include: [{ model: SellerProfile, as: 'sellerProfile', include: [{ model: SellerAddress, as: 'addresses' }] }, { model: CourierProfile, as: 'courierProfile' }], order: [['created_at', 'DESC']], limit: +limit, offset: +offset });
    res.json({ success: true, data: { users: r.rows, total: r.count } });
  } catch (e) { next(e); }
}

async function getUserById(req, res, next) {
  try {
    const u = await User.findByPk(req.params.id, { attributes: { exclude: ['password_hash'] }, include: [{ model: SellerProfile, as: 'sellerProfile', include: [{ model: SellerAddress, as: 'addresses' }] }, { model: CourierProfile, as: 'courierProfile' }] });
    if (!u) throw ApiError.notFound('User not found');
    res.json({ success: true, data: u });
  } catch (e) { next(e); }
}

async function updateUserStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!['pending', 'active', 'limited', 'blocked'].includes(status)) throw ApiError.badRequest('Invalid status');
    const u = await User.findByPk(req.params.id);
    if (!u) throw ApiError.notFound('User not found');
    await u.update({ status });
    res.json({ success: true, data: { id: u.id, status } });
  } catch (e) { next(e); }
}

async function getOrders(req, res, next) {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    const where = {};
    if (status) where.status = status;
    const r = await Order.findAndCountAll({ where, include: [{ model: OrderItem, as: 'items' }, { model: SellerAddress, as: 'sellerAddress' }, { model: User, as: 'seller', attributes: ['id', 'first_name', 'last_name', 'phone'] }, { model: User, as: 'courier', attributes: ['id', 'first_name', 'last_name', 'phone'] }], order: [['created_at', 'DESC']], limit: +limit, offset: +offset });
    res.json({ success: true, data: { orders: r.rows, total: r.count } });
  } catch (e) { next(e); }
}

async function getTransactions(req, res, next) {
  try {
    const { user_id, type, limit = 50, offset = 0 } = req.query;
    const where = {};
    if (user_id) where.user_id = user_id;
    if (type) where.type = type;
    const r = await Transaction.findAndCountAll({ where, include: [{ model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'phone'] }], order: [['created_at', 'DESC']], limit: +limit, offset: +offset });
    res.json({ success: true, data: { transactions: r.rows, total: r.count } });
  } catch (e) { next(e); }
}

async function getDashboard(req, res, next) {
  try {
    const [totalUsers, totalSellers, totalCouriers, pendingCouriers, totalOrders, activeOrders, completedOrders] = await Promise.all([
      User.count(), User.count({ where: { role: 'seller' } }), User.count({ where: { role: 'courier' } }),
      User.count({ where: { role: 'courier', status: 'pending' } }), Order.count(),
      Order.count({ where: { status: { [Op.notIn]: ['completed', 'cancelled_seller', 'cancelled_courier', 'expired'] } } }),
      Order.count({ where: { status: 'completed' } }),
    ]);
    res.json({ success: true, data: { totalUsers, totalSellers, totalCouriers, pendingCouriers, totalOrders, activeOrders, completedOrders } });
  } catch (e) { next(e); }
}

module.exports = { getUsers, getUserById, updateUserStatus, getOrders, getTransactions, getDashboard };
