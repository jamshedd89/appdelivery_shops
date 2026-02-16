const ApiError = require('../utils/ApiError');

function errorHandler(err, req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ success: false, message: err.message, errors: err.errors });
  }
  console.error('[Error]', err);
  return res.status(500).json({ success: false, message: 'Internal server error' });
}

module.exports = errorHandler;
