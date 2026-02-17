const { Router } = require('express');
const { auth } = require('../middlewares/auth');
const c = require('../controllers/chatController');

const router = Router();
router.use(auth);

router.get('/:orderId/messages', c.getMessages);
router.post('/:orderId/messages', c.sendMessage);
router.get('/:orderId/unread', c.getUnreadCount);

module.exports = router;
