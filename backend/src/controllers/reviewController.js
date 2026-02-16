const { body } = require('express-validator');
const ratingService = require('../services/ratingService');

const createReviewValidation = [body('stars').isInt({ min: 1, max: 5 }), body('comment').optional().isString()];
async function createReview(req, res, next) { try { const r = await ratingService.createReview(req.user.id, +req.params.orderId, req.body); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); } }
async function getUserReviews(req, res, next) { try { const r = await ratingService.getUserReviews(+req.params.userId, parseInt(req.query.limit) || 50, parseInt(req.query.offset) || 0); res.json({ success: true, data: { reviews: r.rows, total: r.count } }); } catch (e) { next(e); } }
async function getMyReviews(req, res, next) { try { const r = await ratingService.getUserReviews(req.user.id, parseInt(req.query.limit) || 50, parseInt(req.query.offset) || 0); res.json({ success: true, data: { reviews: r.rows, total: r.count } }); } catch (e) { next(e); } }

module.exports = { createReview, createReviewValidation, getUserReviews, getMyReviews };
