const { Router } = require('express');
const { auth, roleCheck } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const c = require('../controllers/orderController');
const { ROLES } = require('../utils/constants');
const router = Router();
router.use(auth);

router.post('/', roleCheck(ROLES.SELLER), c.createOrderValidation, validate, c.createOrder);
router.get('/seller', roleCheck(ROLES.SELLER), c.getSellerOrders);
router.post('/:id/cancel-seller', roleCheck(ROLES.SELLER), c.cancelValidation, validate, c.cancelBySeller);
router.post('/:id/confirm', roleCheck(ROLES.SELLER), c.confirmDelivery);
router.get('/available', roleCheck(ROLES.COURIER), c.getAvailableOrders);
router.get('/courier', roleCheck(ROLES.COURIER), c.getCourierOrders);
router.post('/:id/accept', roleCheck(ROLES.COURIER), c.acceptOrder);
router.put('/:id/status', roleCheck(ROLES.COURIER), c.updateStatusValidation, validate, c.updateOrderStatus);
router.post('/:id/cancel-courier', roleCheck(ROLES.COURIER), c.cancelValidation, validate, c.cancelByCourier);
router.get('/:id', c.getOrderById);

module.exports = router;
