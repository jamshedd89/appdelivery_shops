const { User, Transaction, Order } = require('../models');
const sequelize = require('../config/database');
const ApiError = require('../utils/ApiError');
const { TRANSACTION_TYPE, CANCELLATION_PENALTY_PERCENT, MIN_WITHDRAWAL } = require('../utils/constants');

class BalanceService {
  async deposit(userId, amount, description = 'Balance top-up') {
    if (amount <= 0) throw ApiError.badRequest('Amount must be positive');
    const t = await sequelize.transaction();
    try {
      const user = await User.findByPk(userId, { transaction: t, lock: true });
      if (!user) throw ApiError.notFound('User not found');
      const newBalance = parseFloat(user.balance) + parseFloat(amount);
      await user.update({ balance: newBalance }, { transaction: t });
      await Transaction.create({ user_id: userId, type: TRANSACTION_TYPE.DEPOSIT, amount, description }, { transaction: t });
      await t.commit();
      return { balance: newBalance };
    } catch (err) { await t.rollback(); throw err; }
  }

  async withdraw(userId, amount) {
    if (amount < MIN_WITHDRAWAL) throw ApiError.badRequest(`Minimum withdrawal is ${MIN_WITHDRAWAL} somoni`);
    const commission = amount <= 100 ? amount * 0.03 : amount * 0.015;
    const total = parseFloat(amount) + commission;
    const t = await sequelize.transaction();
    try {
      const user = await User.findByPk(userId, { transaction: t, lock: true });
      if (parseFloat(user.balance) - parseFloat(user.frozen_balance) < total) throw ApiError.badRequest('Insufficient balance');
      const newBalance = parseFloat(user.balance) - total;
      await user.update({ balance: newBalance }, { transaction: t });
      await Transaction.create({ user_id: userId, type: TRANSACTION_TYPE.WITHDRAWAL, amount: -total, description: `Withdrawal (commission: ${commission.toFixed(2)})` }, { transaction: t });
      await t.commit();
      return { withdrawn: amount, commission: parseFloat(commission.toFixed(2)), balance: newBalance };
    } catch (err) { await t.rollback(); throw err; }
  }

  async completeOrderPayment(orderId) {
    const order = await Order.findByPk(orderId);
    if (!order) throw ApiError.notFound('Order not found');
    const t = await sequelize.transaction();
    try {
      const seller = await User.findByPk(order.seller_id, { transaction: t, lock: true });
      const courier = await User.findByPk(order.courier_id, { transaction: t, lock: true });
      const cost = parseFloat(order.delivery_cost), comm = parseFloat(order.commission), total = cost + comm;
      await seller.update({ balance: parseFloat(seller.balance) - total, frozen_balance: Math.max(0, parseFloat(seller.frozen_balance) - total) }, { transaction: t });
      await courier.update({ balance: parseFloat(courier.balance) + cost }, { transaction: t });
      await Transaction.create({ user_id: seller.id, order_id: orderId, type: TRANSACTION_TYPE.COMMISSION, amount: -comm, description: `Commission order #${orderId}` }, { transaction: t });
      await Transaction.create({ user_id: seller.id, order_id: orderId, type: TRANSACTION_TYPE.PAYMENT, amount: -cost, description: `Payment order #${orderId}` }, { transaction: t });
      await Transaction.create({ user_id: courier.id, order_id: orderId, type: TRANSACTION_TYPE.PAYMENT, amount: cost, description: `Received order #${orderId}` }, { transaction: t });
      await t.commit();
    } catch (err) { await t.rollback(); throw err; }
  }

  async handleCancellationPenalty(orderId, courierAtShop) {
    const order = await Order.findByPk(orderId);
    if (!order) return;
    const total = parseFloat(order.delivery_cost) + parseFloat(order.commission);
    if (courierAtShop && order.courier_id) {
      const penalty = parseFloat(order.delivery_cost) * (CANCELLATION_PENALTY_PERCENT / 100);
      const t = await sequelize.transaction();
      try {
        const seller = await User.findByPk(order.seller_id, { transaction: t, lock: true });
        const courier = await User.findByPk(order.courier_id, { transaction: t, lock: true });
        await seller.update({ balance: parseFloat(seller.balance) - penalty, frozen_balance: Math.max(0, parseFloat(seller.frozen_balance) - total) }, { transaction: t });
        await courier.update({ balance: parseFloat(courier.balance) + penalty }, { transaction: t });
        await Transaction.create({ user_id: seller.id, order_id: orderId, type: TRANSACTION_TYPE.PAYMENT, amount: -penalty, description: `Cancellation penalty #${orderId}` }, { transaction: t });
        await Transaction.create({ user_id: courier.id, order_id: orderId, type: TRANSACTION_TYPE.PAYMENT, amount: penalty, description: `Cancellation compensation #${orderId}` }, { transaction: t });
        await t.commit();
      } catch (err) { await t.rollback(); throw err; }
    } else {
      const t = await sequelize.transaction();
      try {
        const user = await User.findByPk(order.seller_id, { transaction: t, lock: true });
        await user.update({ frozen_balance: Math.max(0, parseFloat(user.frozen_balance) - total) }, { transaction: t });
        await Transaction.create({ user_id: user.id, order_id: orderId, type: TRANSACTION_TYPE.UNFREEZE, amount: total, description: `Unfrozen order #${orderId}` }, { transaction: t });
        await t.commit();
      } catch (err) { await t.rollback(); throw err; }
    }
  }

  async getTransactions(userId, limit = 50, offset = 0) {
    return Transaction.findAndCountAll({ where: { user_id: userId }, order: [['created_at', 'DESC']], limit, offset });
  }

  async getBalance(userId) {
    const user = await User.findByPk(userId, { attributes: ['id', 'balance', 'frozen_balance'] });
    if (!user) throw ApiError.notFound('User not found');
    return { balance: parseFloat(user.balance), frozen_balance: parseFloat(user.frozen_balance), available: parseFloat(user.balance) - parseFloat(user.frozen_balance) };
  }
}

module.exports = new BalanceService();
