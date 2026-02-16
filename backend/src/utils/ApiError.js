class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
  static badRequest(msg, errors = []) { return new ApiError(400, msg, errors); }
  static unauthorized(msg = 'Not authorized') { return new ApiError(401, msg); }
  static forbidden(msg = 'Access denied') { return new ApiError(403, msg); }
  static notFound(msg = 'Not found') { return new ApiError(404, msg); }
  static conflict(msg) { return new ApiError(409, msg); }
  static internal(msg = 'Internal server error') { return new ApiError(500, msg); }
}
module.exports = ApiError;
