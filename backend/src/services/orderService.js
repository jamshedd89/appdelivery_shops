const { Order, OrderItem, User, SellerAddress, CourierProfile } = require('../models');
const geoService = require('./geoService');
const ApiError = require('../utils/ApiError');
const { ORDER_STATUS, MIN_DELIVERY_COST, MAX_ORDER_ITEMS, SERVICE_COMMISSION, COURIER_SEARCH_RADIUS_KM } = require('../utils/constants');

class OrderService {
  async createOrder(sellerId, { seller_address_id, delivery_cost, items }) {
    if (delivery_cost < MIN_DELIVERY_COST) throw ApiError.badRequest(`Minimum delivery cost is ${MIN_DELIVERY_COST} somoni`);
    if (!items || items.length === 0) throw ApiError.badRequest('At least one item required');
    if (items.length > MAX_ORDER_ITEMS) throw ApiError.badRequest(`Maximum ${MAX_ORDER_ITEMS} items per order`);
    const address = await SellerAddress.findByPk(seller_address_id);
    if (!address) throw ApiError.notFound('Seller address not found');
    const seller = await User.findByPk(sellerId);
    const totalNeeded = parseFloat(delivery_cost) + SERVICE_COMMISSION;
    if (parseFloat(seller.balance) - parseFloat(seller.frozen_balance) < totalNeeded) throw ApiError.badRequest('Insufficient balance');
    const order = await Order.create({ seller_id: sellerId, seller_address_id, status: ORDER_STATUS.CREATED, delivery_cost, commission: SERVICE_COMMISSION });
    await OrderItem.bulkCreate(items.map((i) => ({ order_id: order.id, description: i.description, delivery_address: i.delivery_address, latitude: i.latitude, longitude: i.longitude })));
    await seller.update({ frozen_balance: parseFloat(seller.frozen_balance) + totalNeeded });
    await order.update({ status: ORDER_STATUS.WAITING });
    const nearbyCouriers = await geoService.findCouriersNearby(address.latitude, address.longitude, COURIER_SEARCH_RADIUS_KM);
    const fullOrder = await this._getFullOrder(order.id);
    return { order: fullOrder, nearbyCouriers };
  }

  async getSellerOrders(sellerId, status) {
    const where = { seller_id: sellerId };
    if (status) where.status = status;
    return Order.findAll({ where, include: [{ model: OrderItem, as: 'items' }, { model: SellerAddress, as: 'sellerAddress' }, { model: User, as: 'courier', attributes: ['id', 'first_name', 'last_name', 'rating'], include: [{ model: CourierProfile, as: 'courierProfile', attributes: ['transport_type', 'rating_score'] }] }], order: [['created_at', 'DESC']] });
  }

  async getAvailableOrders(courierId) {
    const location = await geoService.getCourierLocation(courierId);
    if (!location) throw ApiError.badRequest('Location not available. Enable GPS.');
    const orders = await Order.findAll({ where: { status: ORDER_STATUS.WAITING }, include: [{ model: OrderItem, as: 'items' }, { model: SellerAddress, as: 'sellerAddress' }, { model: User, as: 'seller', attributes: ['id', 'first_name', 'last_name', 'rating'] }], order: [['created_at', 'ASC']] });
    return orders.filter((o) => {
      const a = o.sellerAddress;
      if (!a) return false;
      return this._haversineKm(location.latitude, location.longitude, parseFloat(a.latitude), parseFloat(a.longitude)) <= COURIER_SEARCH_RADIUS_KM;
    });
  }

  async acceptOrder(orderId, courierId) {
    const order = await Order.findByPk(orderId);
    if (!order) throw ApiError.notFound('Order not found');
    if (order.status !== ORDER_STATUS.WAITING) throw ApiError.badRequest('Order not available');
    const courier = await User.findByPk(courierId);
    if (courier.status !== 'active') throw ApiError.forbidden('Account not active');
    await order.update({ courier_id: courierId, status: ORDER_STATUS.ACCEPTED });
    return this._getFullOrder(orderId);
  }

  async updateOrderStatus(orderId, courierId, newStatus) {
    const order = await Order.findByPk(orderId);
    if (!order) throw ApiError.notFound('Order not found');
    if (order.courier_id !== courierId) throw ApiError.forbidden('Not your order');
    const transitions = { [ORDER_STATUS.ACCEPTED]: [ORDER_STATUS.ON_WAY_SHOP, ORDER_STATUS.CANCELLED_COURIER], [ORDER_STATUS.ON_WAY_SHOP]: [ORDER_STATUS.AT_SHOP], [ORDER_STATUS.AT_SHOP]: [ORDER_STATUS.ON_WAY_CLIENT], [ORDER_STATUS.ON_WAY_CLIENT]: [ORDER_STATUS.DELIVERED] };
    if (!transitions[order.status]?.includes(newStatus)) throw ApiError.badRequest(`Cannot transition from ${order.status} to ${newStatus}`);
    const updateData = { status: newStatus };
    if (newStatus === ORDER_STATUS.ON_WAY_CLIENT) updateData.timer_expires_at = new Date(Date.now() + 90 * 60 * 1000);
    if (newStatus === ORDER_STATUS.DELIVERED) updateData.confirm_expires_at = new Date(Date.now() + 20 * 60 * 1000);
    await order.update(updateData);
    return this._getFullOrder(orderId);
  }

  async cancelBySeller(orderId, sellerId, reason) {
    const order = await Order.findByPk(orderId);
    if (!order) throw ApiError.notFound('Order not found');
    if (order.seller_id !== sellerId) throw ApiError.forbidden('Not your order');
    if (!['created', 'waiting', 'accepted', 'on_way_shop', 'at_shop'].includes(order.status)) throw ApiError.badRequest('Cannot cancel in current status');
    await order.update({ status: ORDER_STATUS.CANCELLED_SELLER, cancel_reason: reason });
    return this._getFullOrder(orderId);
  }

  async cancelByCourier(orderId, courierId, reason) {
    const order = await Order.findByPk(orderId);
    if (!order) throw ApiError.notFound('Order not found');
    if (order.courier_id !== courierId) throw ApiError.forbidden('Not your order');
    if (!['accepted', 'on_way_shop'].includes(order.status)) throw ApiError.badRequest('Cannot cancel in current status');
    await order.update({ status: ORDER_STATUS.WAITING, cancel_reason: reason, courier_id: null });
    return this._getFullOrder(orderId);
  }

  async confirmDelivery(orderId, sellerId) {
    const order = await Order.findByPk(orderId);
    if (!order) throw ApiError.notFound('Order not found');
    if (order.seller_id !== sellerId) throw ApiError.forbidden('Not your order');
    if (order.status !== ORDER_STATUS.DELIVERED) throw ApiError.badRequest('Not delivered yet');
    await order.update({ status: ORDER_STATUS.CONFIRMED });
    return this._getFullOrder(orderId);
  }

  async getOrderById(orderId) { return this._getFullOrder(orderId); }

  async getCourierOrders(courierId, status) {
    const where = { courier_id: courierId };
    if (status) where.status = status;
    return Order.findAll({ where, include: [{ model: OrderItem, as: 'items' }, { model: SellerAddress, as: 'sellerAddress' }, { model: User, as: 'seller', attributes: ['id', 'first_name', 'last_name', 'rating'] }], order: [['created_at', 'DESC']] });
  }

  async _getFullOrder(orderId) {
    return Order.findByPk(orderId, { include: [{ model: OrderItem, as: 'items' }, { model: SellerAddress, as: 'sellerAddress' }, { model: User, as: 'seller', attributes: ['id', 'first_name', 'last_name', 'rating'] }, { model: User, as: 'courier', attributes: ['id', 'first_name', 'last_name', 'rating'], include: [{ model: CourierProfile, as: 'courierProfile', attributes: ['transport_type', 'rating_score'] }] }] });
  }

  _haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}

module.exports = new OrderService();
