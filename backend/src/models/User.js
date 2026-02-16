const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  phone: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: true },
  role: { type: DataTypes.ENUM('seller', 'courier'), allowNull: false },
  first_name: { type: DataTypes.STRING(100), allowNull: false },
  last_name: { type: DataTypes.STRING(100), allowNull: false },
  birth_date: { type: DataTypes.DATEONLY, allowNull: true },
  status: { type: DataTypes.ENUM('pending', 'active', 'limited', 'blocked'), allowNull: false, defaultValue: 'active' },
  balance: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  frozen_balance: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  rating: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 5.0 },
}, { tableName: 'users' });

module.exports = User;
