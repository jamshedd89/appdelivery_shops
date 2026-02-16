const { Queue, Worker } = require('bullmq');
const { Order, CourierProfile } = require('../models');
const balanceService = require('../services/balanceService');
const { ORDER_STATUS } = require('../utils/constants');

const connection = { host: process.env.REDIS_HOST || 'localhost', port: process.env.REDIS_PORT || 6379, password: process.env.REDIS_PASSWORD || undefined };

const deliveryTimerQueue = new Queue('delivery-timer', { connection });
const confirmTimerQueue = new Queue('confirm-timer', { connection });
const notificationQueue = new Queue('notifications', { connection });

async function scheduleDeliveryTimer(orderId, delayMs) { await deliveryTimerQueue.add('check', { orderId }, { delay: delayMs, removeOnComplete: true }); }
async function scheduleConfirmTimer(orderId, delayMs) { await confirmTimerQueue.add('auto-confirm', { orderId }, { delay: delayMs, removeOnComplete: true }); }
async function sendNotification(userId, type, data) { await notificationQueue.add('push', { userId, type, data }, { removeOnComplete: true }); }

new Worker('delivery-timer', async (job) => {
  const order = await Order.findByPk(job.data.orderId);
  if (!order || order.status !== ORDER_STATUS.ON_WAY_CLIENT) return;
  if (order.timer_expires_at && new Date() >= new Date(order.timer_expires_at)) {
    await order.update({ status: ORDER_STATUS.EXPIRED });
    if (order.courier_id) {
      const p = await CourierProfile.findOne({ where: { user_id: order.courier_id } });
      if (p) { const lc = p.late_count + 1; await p.update({ late_count: lc, ...(lc % 3 === 0 ? { rating_score: Math.max(0, p.rating_score - 5) } : {}) }); }
    }
  }
}, { connection });

new Worker('confirm-timer', async (job) => {
  const order = await Order.findByPk(job.data.orderId);
  if (!order || order.status !== ORDER_STATUS.DELIVERED) return;
  if (order.confirm_expires_at && new Date() >= new Date(order.confirm_expires_at)) {
    await order.update({ status: ORDER_STATUS.CONFIRMED });
    await balanceService.completeOrderPayment(order.id);
    console.log(`[Worker] Order #${order.id} auto-confirmed`);
  }
}, { connection });

new Worker('notifications', async (job) => {
  console.log(`[Notification Stub] User: ${job.data.userId}, Type: ${job.data.type}`);
}, { connection });

module.exports = { deliveryTimerQueue, confirmTimerQueue, notificationQueue, scheduleDeliveryTimer, scheduleConfirmTimer, sendNotification };
