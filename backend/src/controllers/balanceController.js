const { body } = require('express-validator');
const balanceService = require('../services/balanceService');

const depositValidation = [body('amount').isFloat({ min: 1 })];
async function deposit(req, res, next) { try { const r = await balanceService.deposit(req.user.id, req.body.amount); res.json({ success: true, data: r }); } catch (e) { next(e); } }

const withdrawValidation = [body('amount').isFloat({ min: 50 })];
async function withdraw(req, res, next) { try { const r = await balanceService.withdraw(req.user.id, req.body.amount); res.json({ success: true, data: r }); } catch (e) { next(e); } }

async function getBalance(req, res, next) { try { const r = await balanceService.getBalance(req.user.id); res.json({ success: true, data: r }); } catch (e) { next(e); } }

async function getTransactions(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 50, offset = parseInt(req.query.offset) || 0;
    const r = await balanceService.getTransactions(req.user.id, limit, offset);
    res.json({ success: true, data: { transactions: r.rows, total: r.count, limit, offset } });
  } catch (e) { next(e); }
}

module.exports = { deposit, depositValidation, withdraw, withdrawValidation, getBalance, getTransactions };
