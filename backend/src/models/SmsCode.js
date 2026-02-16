const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SmsCode = sequelize.define('SmsCode', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  phone: { type: DataTypes.STRING(20), allowNull: false },
  code: { type: DataTypes.STRING(10), allowNull: false },
  expires_at: { type: DataTypes.DATE, allowNull: false },
  is_used: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, { tableName: 'sms_codes' });

module.exports = SmsCode;
