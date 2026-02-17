const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const geoService = require('../services/geoService');

function initSocket(server) {
  const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });

  const ordersNsp = io.of('/orders');
  ordersNsp.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Auth required'));
    try { const d = jwt.verify(token, process.env.JWT_ACCESS_SECRET); socket.userId = d.id; socket.userRole = d.role; next(); }
    catch { next(new Error('Invalid token')); }
  });

  ordersNsp.on('connection', (socket) => {
    console.log(`[Socket] User ${socket.userId} connected`);
    socket.join(`user:${socket.userId}`);

    socket.on('courier:location', async ({ latitude, longitude }) => {
      if (socket.userRole !== 'courier' || !latitude || !longitude) return;
      await geoService.updateCourierLocation(socket.userId, latitude, longitude);
      socket.broadcast.emit('courier:location:update', { courierId: socket.userId, latitude, longitude, timestamp: new Date().toISOString() });
    });

    socket.on('courier:offline', async () => { if (socket.userRole === 'courier') await geoService.removeCourier(socket.userId); });
    socket.on('order:join', (id) => socket.join(`order:${id}`));
    socket.on('order:leave', (id) => socket.leave(`order:${id}`));

    // Chat events
    socket.on('chat:typing', ({ orderId }) => {
      socket.to(`order:${orderId}`).emit('chat:typing', { userId: socket.userId, orderId });
    });
    socket.on('chat:stop_typing', ({ orderId }) => {
      socket.to(`order:${orderId}`).emit('chat:stop_typing', { userId: socket.userId, orderId });
    });
    socket.on('chat:read', ({ orderId }) => {
      socket.to(`order:${orderId}`).emit('chat:read', { userId: socket.userId, orderId });
    });

    socket.on('disconnect', async () => { if (socket.userRole === 'courier') await geoService.removeCourier(socket.userId); });
  });

  return io;
}

module.exports = initSocket;
