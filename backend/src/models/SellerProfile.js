const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SellerProfile = sequelize.define('SellerProfile', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
}, { tableName: 'seller_profiles' });

module.exports = SellerProfile;
