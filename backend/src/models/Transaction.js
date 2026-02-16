const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  order_id: { type: DataTypes.INTEGER, allowNull: true },
  type: { type: DataTypes.ENUM('deposit', 'withdrawal', 'freeze', 'unfreeze', 'commission', 'payment'), allowNull: false },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  description: { type: DataTypes.STRING(500), allowNull: true },
}, { tableName: 'transactions' });

module.exports = Transaction;
