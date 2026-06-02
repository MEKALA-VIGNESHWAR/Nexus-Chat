/**
 * Validation Middleware Factory
 * Creates Express middleware from Joi schemas.
 * Supports validating body, query, or params.
 */
const ApiError = require('../utils/ApiError');

/**
 * Creates a validation middleware for the given Joi schema.
 * @param {import('joi').ObjectSchema} schema - Joi validation schema
 * @param {'body'|'query'|'params'} [source='body'] - Request property to validate
 * @returns {import('express').RequestHandler}
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false, // Collect all errors, not just the first
      stripUnknown: true, // Remove unknown fields
      errors: {
        wrap: { label: false }, // Don't wrap labels in quotes
      },
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return next(ApiError.badRequest('Validation failed', errors));
    }

    // Replace request data with validated/sanitized values
    req[source] = value;
    next();
  };
}

module.exports = validate;
