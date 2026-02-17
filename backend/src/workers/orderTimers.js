const { Queue, Worker } = require('bullmq');
const { Order, CourierProfile, User } = require('../models');
const balanceService = require('../services/balanceService');
const penaltyService = require('../services/penaltyService');
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
      await penaltyService.handleCourierLateDelivery(order.courier_id);
    }
    console.log(`[Worker] Order #${order.id} expired — courier late`);
  }
}, { connection });

new Worker('confirm-timer', async (job) => {
  const order = await Order.findByPk(job.data.orderId);
  if (!order || order.status !== ORDER_STATUS.DELIVERED) return;
  if (order.confirm_expires_at && new Date() >= new Date(order.confirm_expires_at)) {
    await order.update({ status: ORDER_STATUS.CONFIRMED });
    // Transfer frozen funds to courier
    if (order.courier_id) {
      const seller = await User.findByPk(order.seller_id);
      const courier = await User.findByPk(order.courier_id);
      const deliveryCost = parseFloat(order.delivery_cost);
      const commission = parseFloat(order.commission);
      const totalFrozen = deliveryCost + commission;
      await seller.update({ frozen_balance: Math.max(0, parseFloat(seller.frozen_balance) - totalFrozen) });
      await courier.update({ balance: parseFloat(courier.balance) + deliveryCost });
      await penaltyService.handleCourierDeliverySuccess(order.courier_id);
    }
    console.log(`[Worker] Order #${order.id} auto-confirmed`);
  }
}, { connection });

new Worker('notifications', async (job) => {
  console.log(`[Notification Stub] User: ${job.data.userId}, Type: ${job.data.type}`);
}, { connection });

module.exports = { deliveryTimerQueue, confirmTimerQueue, notificationQueue, scheduleDeliveryTimer, scheduleConfirmTimer, sendNotification };
