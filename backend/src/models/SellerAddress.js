const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SellerAddress = sequelize.define('SellerAddress', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  seller_id: { type: DataTypes.INTEGER, allowNull: false },
  address_text: { type: DataTypes.STRING(500), allowNull: false },
  latitude: { type: DataTypes.DECIMAL(10, 7), allowNull: false },
  longitude: { type: DataTypes.DECIMAL(10, 7), allowNull: false },
  is_default: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, { tableName: 'seller_addresses' });

module.exports = SellerAddress;
