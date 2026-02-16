const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id: { type: DataTypes.INTEGER, allowNull: false },
  description: { type: DataTypes.STRING(500), allowNull: false },
  delivery_address: { type: DataTypes.STRING(500), allowNull: false },
  latitude: { type: DataTypes.DECIMAL(10, 7), allowNull: false },
  longitude: { type: DataTypes.DECIMAL(10, 7), allowNull: false },
  is_delivered: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, { tableName: 'order_items' });

module.exports = OrderItem;
