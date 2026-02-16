const { Review, User, CourierProfile, Order } = require('../models');
const ApiError = require('../utils/ApiError');
const { ORDER_STATUS } = require('../utils/constants');

class RatingService {
  async createReview(reviewerId, orderId, { stars, comment }) {
    const order = await Order.findByPk(orderId);
    if (!order) throw ApiError.notFound('Order not found');
    if (!['confirmed', 'completed'].includes(order.status)) throw ApiError.badRequest('Can only review completed orders');
    let targetId;
    if (reviewerId === order.seller_id) targetId = order.courier_id;
    else if (reviewerId === order.courier_id) targetId = order.seller_id;
    else throw ApiError.forbidden('Not part of this order');
    if (!targetId) throw ApiError.badRequest('No counterpart to review');
    if (await Review.findOne({ where: { order_id: orderId, reviewer_id: reviewerId } })) throw ApiError.conflict('Already reviewed');
    const review = await Review.create({ order_id: orderId, reviewer_id: reviewerId, target_id: targetId, stars, comment });
    await this._recalculateRating(targetId);
    const target = await User.findByPk(targetId);
    if (target.role === 'courier') await this._updateCourierScore(targetId);
    if ((await Review.count({ where: { order_id: orderId } })) >= 2) await order.update({ status: ORDER_STATUS.COMPLETED });
    return review;
  }

  async getUserReviews(userId, limit = 50, offset = 0) {
    return Review.findAndCountAll({ where: { target_id: userId }, include: [{ model: User, as: 'reviewer', attributes: ['id', 'first_name', 'last_name', 'role'] }], order: [['created_at', 'DESC']], limit, offset });
  }

  async _recalculateRating(userId) {
    const reviews = await Review.findAll({ where: { target_id: userId }, attributes: ['stars'] });
    if (!reviews.length) return;
    const avg = reviews.reduce((s, r) => s + r.stars, 0) / reviews.length;
    await User.update({ rating: parseFloat(avg.toFixed(2)) }, { where: { id: userId } });
  }

  async _updateCourierScore(userId) {
    const profile = await CourierProfile.findOne({ where: { user_id: userId } });
    if (!profile) return;
    const reviews = await Review.findAll({ where: { target_id: userId }, attributes: ['stars'] });
    if (!reviews.length) return;
    const avg = reviews.reduce((s, r) => s + r.stars, 0) / reviews.length;
    let score = Math.round(50 + (avg - 1) * 12.5);
    score = Math.max(0, Math.min(100, score - Math.floor(profile.late_count / 3) * 5));
    await profile.update({ rating_score: score });
  }
}

module.exports = new RatingService();
