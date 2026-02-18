const sequelize = require('../config/database');
const User = require('./User');
const SellerProfile = require('./SellerProfile');
const SellerAddress = require('./SellerAddress');
const CourierProfile = require('./CourierProfile');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Review = require('./Review');
const Transaction = require('./Transaction');
const SmsCode = require('./SmsCode');
const Message = require('./Message');
const Notification = require('./Notification');

// User <-> Profiles
User.hasOne(SellerProfile, { foreignKey: 'user_id', as: 'sellerProfile' });
SellerProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(CourierProfile, { foreignKey: 'user_id', as: 'courierProfile' });
CourierProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// SellerProfile <-> Addresses
SellerProfile.hasMany(SellerAddress, { foreignKey: 'seller_id', as: 'addresses' });
SellerAddress.belongsTo(SellerProfile, { foreignKey: 'seller_id', as: 'seller' });

// Orders
User.hasMany(Order, { foreignKey: 'seller_id', as: 'sellerOrders' });
Order.belongsTo(User, { foreignKey: 'seller_id', as: 'seller' });
User.hasMany(Order, { foreignKey: 'courier_id', as: 'courierOrders' });
Order.belongsTo(User, { foreignKey: 'courier_id', as: 'courier' });
Order.belongsTo(SellerAddress, { foreignKey: 'seller_address_id', as: 'sellerAddress' });
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// Reviews
Order.hasMany(Review, { foreignKey: 'order_id', as: 'reviews' });
Review.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
User.hasMany(Review, { foreignKey: 'reviewer_id', as: 'givenReviews' });
Review.belongsTo(User, { foreignKey: 'reviewer_id', as: 'reviewer' });
User.hasMany(Review, { foreignKey: 'target_id', as: 'receivedReviews' });
Review.belongsTo(User, { foreignKey: 'target_id', as: 'target' });

// Transactions
User.hasMany(Transaction, { foreignKey: 'user_id', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Order.hasMany(Transaction, { foreignKey: 'order_id', as: 'transactions' });
Transaction.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// Messages (Chat)
Order.hasMany(Message, { foreignKey: 'order_id', as: 'messages' });
Message.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

// Notifications
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize, User, SellerProfile, SellerAddress, CourierProfile,
  Order, OrderItem, Review, Transaction, SmsCode, Message, Notification,
};
