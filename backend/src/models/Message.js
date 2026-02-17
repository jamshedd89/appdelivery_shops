const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id: { type: DataTypes.INTEGER, allowNull: false },
  sender_id: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.ENUM('text', 'image', 'location'), allowNull: false, defaultValue: 'text' },
  content: { type: DataTypes.TEXT, allowNull: false },
  latitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
  longitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
  is_read: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, { tableName: 'messages' });

module.exports = Message;
