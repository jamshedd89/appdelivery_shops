const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, SellerProfile, SellerAddress, CourierProfile } = require('../models');
const ApiError = require('../utils/ApiError');
const { ROLES, USER_STATUS, INITIAL_COURIER_RATING_SCORE } = require('../utils/constants');

class AuthService {
  generateTokens(user) {
    const payload = { id: user.id, role: user.role };
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' });
    return { accessToken, refreshToken };
  }

  async registerSeller({ phone, password, first_name, last_name, birth_date, addresses }) {
    if (await User.findOne({ where: { phone } })) throw ApiError.conflict('Phone already registered');
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ phone, password_hash, role: ROLES.SELLER, first_name, last_name, birth_date, status: USER_STATUS.ACTIVE });
    const profile = await SellerProfile.create({ user_id: user.id });
    if (addresses?.length > 0) {
      await SellerAddress.bulkCreate(addresses.map((a, i) => ({
        seller_id: profile.id, address_text: a.address_text,
        latitude: a.latitude, longitude: a.longitude, is_default: i === 0,
      })));
    }
    const tokens = this.generateTokens(user);
    return { user: { id: user.id, phone: user.phone, role: user.role, first_name: user.first_name, last_name: user.last_name, status: user.status }, ...tokens };
  }

  async registerCourier({ phone, password, first_name, last_name, birth_date, inn, passport_front_url, passport_back_url, selfie_with_passport_url, transport_type }) {
    if (await User.findOne({ where: { phone } })) throw ApiError.conflict('Phone already registered');
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ phone, password_hash, role: ROLES.COURIER, first_name, last_name, birth_date, status: USER_STATUS.PENDING });
    await CourierProfile.create({ user_id: user.id, inn, passport_front_url, passport_back_url, selfie_with_passport_url, transport_type, rating_score: INITIAL_COURIER_RATING_SCORE });
    const tokens = this.generateTokens(user);
    return { user: { id: user.id, phone: user.phone, role: user.role, first_name: user.first_name, last_name: user.last_name, status: user.status }, ...tokens };
  }

  async login(phone, password) {
    const user = await User.findOne({ where: { phone } });
    if (!user) throw ApiError.unauthorized('Invalid credentials');
    if (user.status === 'blocked') throw ApiError.forbidden('Account is blocked');
    if (!(await bcrypt.compare(password, user.password_hash))) throw ApiError.unauthorized('Invalid credentials');
    const tokens = this.generateTokens(user);
    return { user: { id: user.id, phone: user.phone, role: user.role, first_name: user.first_name, last_name: user.last_name, status: user.status, balance: user.balance, rating: user.rating }, ...tokens };
  }

  async refreshToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const user = await User.findByPk(decoded.id);
      if (!user) throw ApiError.unauthorized('User not found');
      return this.generateTokens(user);
    } catch { throw ApiError.unauthorized('Invalid refresh token'); }
  }

  async getProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] },
      include: [
        { model: SellerProfile, as: 'sellerProfile', include: [{ model: SellerAddress, as: 'addresses' }] },
        { model: CourierProfile, as: 'courierProfile' },
      ],
    });
    if (!user) throw ApiError.notFound('User not found');
    return user;
  }
}

module.exports = new AuthService();
