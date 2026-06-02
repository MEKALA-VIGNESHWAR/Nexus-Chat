/**
 * Room Validators
 * Joi schemas for room-related request body validation.
 */
const Joi = require('joi');
const { ROOM_TYPES } = require('../utils/constants');

const createGroupSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Room name must be at least 2 characters',
      'string.max': 'Room name cannot exceed 100 characters',
      'any.required': 'Room name is required',
    }),

  members: Joi.array()
    .items(Joi.string().guid())
    .min(1)
    .max(99)
    .required()
    .messages({
      'array.min': 'At least one member must be added',
      'array.max': 'Cannot add more than 99 members at once',
      'any.required': 'Members list is required',
    }),

  isPrivate: Joi.boolean().default(true),
});

const createDirectSchema = Joi.object({
  recipientId: Joi.string()
    .guid()
    .required()
    .messages({
      'string.guid': 'Invalid recipient ID format',
      'any.required': 'Recipient ID is required',
    }),
});

const addMemberSchema = Joi.object({
  userId: Joi.string()
    .guid()
    .required()
    .messages({
      'any.required': 'User ID is required',
    }),
});

module.exports = {
  createGroupSchema,
  createDirectSchema,
  addMemberSchema,
};
