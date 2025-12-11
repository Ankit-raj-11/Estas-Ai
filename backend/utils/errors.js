/**
 * Base custom error class
 */
class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error (400)
 */
class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, details);
    this.name = 'ValidationError';
  }
}

/**
 * Unauthorized error (401)
 */
class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details = null) {
    super(message, 401, details);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Not found error (404)
 */
class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details = null) {
    super(message, 404, details);
    this.name = 'NotFoundError';
  }
}

/**
 * Internal server error (500)
 */
class InternalServerError extends AppError {
  constructor(message = 'Internal server error', details = null) {
    super(message, 500, details);
    this.name = 'InternalServerError';
  }
}

/**
 * External service error (503)
 */
class ExternalServiceError extends AppError {
  constructor(message = 'External service unavailable', details = null) {
    super(message, 503, details);
    this.name = 'ExternalServiceError';
  }
}

module.exports = {
  AppError,
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  InternalServerError,
  ExternalServiceError
};
