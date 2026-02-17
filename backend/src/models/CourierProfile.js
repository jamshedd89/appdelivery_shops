const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CourierProfile = sequelize.define('CourierProfile', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  inn: { type: DataTypes.STRING(50), allowNull: false },
  passport_front_url: { type: DataTypes.STRING(500), allowNull: false },
  passport_back_url: { type: DataTypes.STRING(500), allowNull: false },
  selfie_with_passport_url: { type: DataTypes.STRING(500), allowNull: false },
  transport_type: { type: DataTypes.ENUM('foot', 'bicycle', 'moto', 'car'), allowNull: false },
  rating_score: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 50 },
  late_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  cancel_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  consecutive_cancels: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  search_radius_km: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 3.0 },
}, { tableName: 'courier_profiles' });

module.exports = CourierProfile;
