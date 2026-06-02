/**
 * Message Validators
 * Joi schemas for message-related request body validation.
 */
const Joi = require('joi');
const { MESSAGE_TYPES } = require('../utils/constants');

const sendMessageSchema = Joi.object({
  content: Joi.string()
    .max(5000)
    .when('type', {
      is: MESSAGE_TYPES.TEXT,
      then: Joi.required(),
      otherwise: Joi.optional().allow(''),
    })
    .messages({
      'string.max': 'Message cannot exceed 5000 characters',
    }),

  type: Joi.string()
    .valid(...Object.values(MESSAGE_TYPES))
    .default(MESSAGE_TYPES.TEXT),

  replyTo: Joi.string()
    .guid()
    .optional()
    .allow(null)
    .messages({
      'string.guid': 'Invalid reply message ID format',
    }),
});

const getMessagesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
});

module.exports = {
  sendMessageSchema,
  getMessagesSchema,
};
