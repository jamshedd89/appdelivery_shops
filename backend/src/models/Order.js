const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  seller_id: { type: DataTypes.INTEGER, allowNull: false },
  courier_id: { type: DataTypes.INTEGER, allowNull: true },
  seller_address_id: { type: DataTypes.INTEGER, allowNull: false },
  status: {
    type: DataTypes.ENUM(
      'created', 'waiting', 'accepted', 'on_way_shop', 'at_shop',
      'on_way_client', 'delivered', 'confirmed', 'completed',
      'cancelled_seller', 'cancelled_courier', 'expired'
    ),
    allowNull: false, defaultValue: 'created',
  },
  delivery_cost: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  commission: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 5 },
  cancel_reason: { type: DataTypes.TEXT, allowNull: true },
  timer_expires_at: { type: DataTypes.DATE, allowNull: true },
  confirm_expires_at: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'orders' });

module.exports = Order;
