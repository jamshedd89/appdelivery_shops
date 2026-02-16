const { body } = require('express-validator');
const authService = require('../services/authService');
const smsService = require('../services/smsService');

const sendCodeValidation = [body('phone').notEmpty().withMessage('Phone is required')];
async function sendCode(req, res, next) { try { await smsService.sendCode(req.body.phone); res.json({ success: true, message: 'SMS code sent' }); } catch (e) { next(e); } }

const verifyCodeValidation = [body('phone').notEmpty(), body('code').notEmpty()];
async function verifyCode(req, res, next) { try { const v = await smsService.verifyCode(req.body.phone, req.body.code); if (!v) return res.status(400).json({ success: false, message: 'Invalid or expired code' }); res.json({ success: true, verified: true }); } catch (e) { next(e); } }

const registerSellerValidation = [
  body('phone').notEmpty(), body('password').isLength({ min: 6 }), body('first_name').notEmpty(),
  body('last_name').notEmpty(), body('birth_date').notEmpty(),
  body('addresses').isArray({ min: 1 }), body('addresses.*.address_text').notEmpty(),
  body('addresses.*.latitude').isFloat(), body('addresses.*.longitude').isFloat(),
];
async function registerSeller(req, res, next) { try { const r = await authService.registerSeller(req.body); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); } }

const registerCourierValidation = [
  body('phone').notEmpty(), body('password').isLength({ min: 6 }), body('first_name').notEmpty(),
  body('last_name').notEmpty(), body('birth_date').notEmpty(), body('inn').notEmpty(),
  body('transport_type').isIn(['foot', 'bicycle', 'moto', 'car']),
];
async function registerCourier(req, res, next) { try { const r = await authService.registerCourier(req.body); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); } }

const loginValidation = [body('phone').notEmpty(), body('password').notEmpty()];
async function login(req, res, next) { try { const r = await authService.login(req.body.phone, req.body.password); res.json({ success: true, data: r }); } catch (e) { next(e); } }

const refreshValidation = [body('refreshToken').notEmpty()];
async function refresh(req, res, next) { try { const t = await authService.refreshToken(req.body.refreshToken); res.json({ success: true, data: t }); } catch (e) { next(e); } }

async function getProfile(req, res, next) { try { const u = await authService.getProfile(req.user.id); res.json({ success: true, data: u }); } catch (e) { next(e); } }

module.exports = { sendCode, sendCodeValidation, verifyCode, verifyCodeValidation, registerSeller, registerSellerValidation, registerCourier, registerCourierValidation, login, loginValidation, refresh, refreshValidation, getProfile };
