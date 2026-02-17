const { User } = require('../models');

class PushService {
  async sendPush(userId, title, body, data = {}) {
    try {
      const user = await User.findByPk(userId);
      if (!user?.push_token) return;

      const message = {
        to: user.push_token,
        sound: 'default',
        title,
        body,
        data,
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(message),
      });
      const result = await response.json();
      if (result.data?.status === 'error') {
        console.log(`[Push] Error for user ${userId}: ${result.data.message}`);
      }
    } catch (e) {
      console.error('[Push] Failed:', e.message);
    }
  }

  async sendToMultiple(userIds, title, body, data = {}) {
    const users = await User.findAll({ where: { id: userIds }, attributes: ['id', 'push_token'] });
    const messages = users.filter(u => u.push_token).map(u => ({
      to: u.push_token, sound: 'default', title, body, data,
    }));
    if (!messages.length) return;
    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(messages),
      });
    } catch (e) {
      console.error('[Push] Batch failed:', e.message);
    }
  }

  // Convenience methods for each notification type from ТЗ п.15
  async notifyNewOrder(courierId, orderId) {
    await this.sendPush(courierId, 'Новая заявка', 'Доступна новая заявка на доставку', { type: 'new_order', orderId });
  }

  async notifyOrderAccepted(sellerId, orderId, courierName) {
    await this.sendPush(sellerId, 'Заявка принята', `Курьер ${courierName} принял вашу заявку`, { type: 'order_accepted', orderId });
  }

  async notifyOrderRejected(sellerId, orderId) {
    await this.sendPush(sellerId, 'Курьер отказался', 'Курьер отказался от заявки, ищем другого', { type: 'order_rejected', orderId });
  }

  async notifyCourierArrived(sellerId, orderId) {
    await this.sendPush(sellerId, 'Курьер на месте', 'Курьер прибыл в ваш магазин', { type: 'courier_arrived', orderId });
  }

  async notifyOrderDelivered(sellerId, orderId) {
    await this.sendPush(sellerId, 'Заказ доставлен', 'Курьер отметил заказ как доставленный. Подтвердите.', { type: 'order_delivered', orderId });
  }

  async notifyTimerExpired(courierId, orderId) {
    await this.sendPush(courierId, 'Таймер истёк', 'Время доставки вышло', { type: 'timer_expired', orderId });
  }

  async notifyOrderCancelled(userId, orderId, reason) {
    await this.sendPush(userId, 'Заказ отменён', reason || 'Заказ был отменён', { type: 'order_cancelled', orderId });
  }

  async notifyRatingChanged(userId, newRating) {
    await this.sendPush(userId, 'Рейтинг обновлён', `Ваш новый рейтинг: ${newRating.toFixed(1)}`, { type: 'rating_changed' });
  }

  async notifyBalanceChange(userId, amount, type) {
    const title = type === 'deposit' ? 'Баланс пополнен' : 'Средства выведены';
    await this.sendPush(userId, title, `Сумма: ${amount} сом`, { type: 'balance_change' });
  }
}

module.exports = new PushService();
