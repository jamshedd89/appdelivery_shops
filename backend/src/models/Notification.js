const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'info' },
  title: { type: DataTypes.STRING(255), allowNull: false },
  body: { type: DataTypes.TEXT, allowNull: true },
  data: { type: DataTypes.JSON, allowNull: true },
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'notifications' });

module.exports = Notification;
