const { User, CourierProfile, SellerProfile } = require('../models');

class PenaltyService {
  /**
   * Called when a courier delivery is late (timer expired)
   */
  async handleCourierLateDelivery(courierId) {
    const profile = await CourierProfile.findOne({ where: { user_id: courierId } });
    if (!profile) return;
    const newLateCount = profile.late_count + 1;
    const updates = { late_count: newLateCount };

    // Every 3 late deliveries → -5 rating_score
    if (newLateCount % 3 === 0) {
      updates.rating_score = Math.max(0, profile.rating_score - 5);
    }

    await profile.update(updates);
    return profile;
  }

  /**
   * Called when a courier cancels an order
   */
  async handleCourierCancel(courierId) {
    const profile = await CourierProfile.findOne({ where: { user_id: courierId } });
    if (!profile) return;

    const newCancelCount = profile.cancel_count + 1;
    const newConsecutive = profile.consecutive_cancels + 1;
    const updates = { cancel_count: newCancelCount, consecutive_cancels: newConsecutive };

    // 5 consecutive cancels → block for 24 hours
    if (newConsecutive >= 5) {
      const user = await User.findByPk(courierId);
      const blockedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.update({ status: 'limited', blocked_until: blockedUntil });
      updates.consecutive_cancels = 0;
    }

    // Frequent cancels → reduce search radius
    if (newCancelCount >= 10 && profile.search_radius_km > 1.0) {
      updates.search_radius_km = Math.max(1.0, profile.search_radius_km - 0.5);
    }

    await profile.update(updates);
    return profile;
  }

  /**
   * Called when a courier successfully delivers → reset consecutive cancels
   */
  async handleCourierDeliverySuccess(courierId) {
    const profile = await CourierProfile.findOne({ where: { user_id: courierId } });
    if (!profile) return;
    if (profile.consecutive_cancels > 0) {
      await profile.update({ consecutive_cancels: 0 });
    }

    // If courier was limited and block expired, restore
    const user = await User.findByPk(courierId);
    if (user.status === 'limited' && user.blocked_until && new Date() > new Date(user.blocked_until)) {
      await user.update({ status: 'active', blocked_until: null });
    }
  }

  /**
   * Called when a seller cancels after courier accepted and arrived
   * Seller pays 50% penalty
   */
  async handleSellerCancelAfterArrival(order) {
    const seller = await User.findByPk(order.seller_id);
    const penaltyAmount = parseFloat(order.delivery_cost) * 0.5;

    // Transfer 50% to courier
    if (order.courier_id) {
      const courier = await User.findByPk(order.courier_id);
      await courier.update({ balance: parseFloat(courier.balance) + penaltyAmount });
      await seller.update({ balance: parseFloat(seller.balance) - penaltyAmount });
    }
    return penaltyAmount;
  }

  /**
   * Handle frequent seller cancellations → increase commission rate
   */
  async handleSellerCancelPenalty(sellerId) {
    const { Order } = require('../models');
    const { Op } = require('sequelize');
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const cancelCount = await Order.count({
      where: {
        seller_id: sellerId,
        status: 'cancelled_seller',
        updated_at: { [Op.gte]: thirtyDaysAgo },
      },
    });
    const seller = await User.findByPk(sellerId);
    if (cancelCount >= 10) {
      await seller.update({ extra_commission_rate: 0.05 });
    } else if (cancelCount >= 5) {
      await seller.update({ extra_commission_rate: 0.02 });
    } else {
      await seller.update({ extra_commission_rate: 0 });
    }
  }

  /**
   * Check if courier is currently blocked
   */
  async isCourierBlocked(courierId) {
    const user = await User.findByPk(courierId);
    if (!user) return true;
    if (user.status === 'blocked') return true;
    if (user.status === 'limited' && user.blocked_until) {
      if (new Date() < new Date(user.blocked_until)) return true;
      await user.update({ status: 'active', blocked_until: null });
    }
    return false;
  }
}

module.exports = new PenaltyService();
