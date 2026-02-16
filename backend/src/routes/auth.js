const { Router } = require('express');
const validate = require('../middlewares/validate');
const { auth } = require('../middlewares/auth');
const c = require('../controllers/authController');
const router = Router();

router.post('/send-code', c.sendCodeValidation, validate, c.sendCode);
router.post('/verify-code', c.verifyCodeValidation, validate, c.verifyCode);
router.post('/register/seller', c.registerSellerValidation, validate, c.registerSeller);
router.post('/register/courier', c.registerCourierValidation, validate, c.registerCourier);
router.post('/login', c.loginValidation, validate, c.login);
router.post('/refresh', c.refreshValidation, validate, c.refresh);
router.get('/profile', auth, c.getProfile);

module.exports = router;
