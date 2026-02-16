const { body } = require('express-validator');
const orderService = require('../services/orderService');

const createOrderValidation = [
  body('seller_address_id').isInt(), body('delivery_cost').isFloat({ min: 10 }),
  body('items').isArray({ min: 1, max: 10 }), body('items.*.description').notEmpty(),
  body('items.*.delivery_address').notEmpty(), body('items.*.latitude').isFloat(), body('items.*.longitude').isFloat(),
];
async function createOrder(req, res, next) { try { const r = await orderService.createOrder(req.user.id, req.body); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); } }
async function getSellerOrders(req, res, next) { try { const r = await orderService.getSellerOrders(req.user.id, req.query.status); res.json({ success: true, data: r }); } catch (e) { next(e); } }
async function getAvailableOrders(req, res, next) { try { const r = await orderService.getAvailableOrders(req.user.id); res.json({ success: true, data: r }); } catch (e) { next(e); } }
async function acceptOrder(req, res, next) { try { const r = await orderService.acceptOrder(+req.params.id, req.user.id); res.json({ success: true, data: r }); } catch (e) { next(e); } }
const updateStatusValidation = [body('status').notEmpty()];
async function updateOrderStatus(req, res, next) { try { const r = await orderService.updateOrderStatus(+req.params.id, req.user.id, req.body.status); res.json({ success: true, data: r }); } catch (e) { next(e); } }
const cancelValidation = [body('reason').notEmpty()];
async function cancelBySeller(req, res, next) { try { const r = await orderService.cancelBySeller(+req.params.id, req.user.id, req.body.reason); res.json({ success: true, data: r }); } catch (e) { next(e); } }
async function cancelByCourier(req, res, next) { try { const r = await orderService.cancelByCourier(+req.params.id, req.user.id, req.body.reason); res.json({ success: true, data: r }); } catch (e) { next(e); } }
async function confirmDelivery(req, res, next) { try { const r = await orderService.confirmDelivery(+req.params.id, req.user.id); res.json({ success: true, data: r }); } catch (e) { next(e); } }
async function getOrderById(req, res, next) { try { const r = await orderService.getOrderById(+req.params.id); if (!r) return res.status(404).json({ success: false, message: 'Not found' }); res.json({ success: true, data: r }); } catch (e) { next(e); } }
async function getCourierOrders(req, res, next) { try { const r = await orderService.getCourierOrders(req.user.id, req.query.status); res.json({ success: true, data: r }); } catch (e) { next(e); } }

module.exports = { createOrder, createOrderValidation, getSellerOrders, getAvailableOrders, acceptOrder, updateOrderStatus, updateStatusValidation, cancelBySeller, cancelByCourier, cancelValidation, confirmDelivery, getOrderById, getCourierOrders };
