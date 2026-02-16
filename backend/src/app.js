require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { sequelize } = require('./models');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const initSocket = require('./socket');
require('./workers/orderTimers');

const app = express();
const server = http.createServer(app);
const io = initSocket(server);
app.set('io', io);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')));
app.use('/api', routes);
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
async function start() {
  try {
    await sequelize.authenticate();
    console.log('[DB] MySQL connected');
    await sequelize.sync({ alter: true });
    console.log('[DB] Models synchronized');
    server.listen(PORT, () => console.log(`[Server] Running on port ${PORT}`));
  } catch (err) { console.error('[Server] Failed:', err.message); process.exit(1); }
}
start();

module.exports = { app, server, io };
