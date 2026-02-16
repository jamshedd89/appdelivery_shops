const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const { User } = require('../models');

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) throw ApiError.unauthorized('Token not provided');
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) throw ApiError.unauthorized('User not found');
    if (user.status === 'blocked') throw ApiError.forbidden('Account is blocked');
    req.user = user;
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError')
      return next(ApiError.unauthorized('Invalid or expired token'));
    next(err);
  }
}

function roleCheck(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden('Insufficient role permissions'));
    next();
  };
}

module.exports = { auth, roleCheck };
