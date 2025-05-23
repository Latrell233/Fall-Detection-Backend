const Joi = require('joi');

const timestamp = Joi.date().iso().required().messages({
  'date.base': 'Timestamp must be a valid date',
  'date.iso': 'Timestamp must be in ISO format',
  'any.required': 'Timestamp is required'
});

const confidence = Joi.number().min(0).max(1).required().messages({
  'number.base': 'Confidence must be a number',
  'number.min': 'Confidence must be between 0 and 1',
  'number.max': 'Confidence must be between 0 and 1',
  'any.required': 'Confidence is required'
});

const location = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required()
}).required().messages({
  'object.base': 'Location must be an object with latitude and longitude',
  'any.required': 'Location is required'
});

const createDetectionSchema = Joi.object({
  deviceId: Joi.string().required(),
  timestamp,
  confidence,
  location
});

const dateFilter = Joi.date().iso().messages({
  'date.base': 'Must be a valid date',
  'date.iso': 'Must be in ISO format'
});

const minConfidence = Joi.number().min(0).max(1).messages({
  'number.base': 'Must be a number',
  'number.min': 'Must be between 0 and 1',
  'number.max': 'Must be between 0 and 1'
});

const getDetectionsSchema = Joi.object({
  from: dateFilter,
  to: dateFilter,
  minConfidence
});

module.exports = {
  createDetectionSchema,
  getDetectionsSchema
};