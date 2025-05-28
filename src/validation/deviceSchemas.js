const Joi = require('joi');

const registerDeviceSchema = Joi.object({
  device_id: Joi.string().min(6).max(50).required().messages({
    'string.min': 'Device ID must be at least 6 characters long',
    'string.max': 'Device ID cannot be longer than 50 characters',
    'any.required': 'Device ID is required'
  }),
  device_secret: Joi.string().min(6).max(100).required().messages({
    'string.min': 'Device secret must be at least 6 characters long',
    'string.max': 'Device secret cannot be longer than 100 characters',
    'any.required': 'Device secret is required'
  }),
  device_name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Device name must be at least 2 characters long',
    'string.max': 'Device name cannot be longer than 100 characters',
    'any.required': 'Device name is required'
  }),
  model_version: Joi.string().max(50).required().messages({
    'string.max': 'Model version cannot be longer than 50 characters',
    'any.required': 'Model version is required'
  })
});

const updateDeviceSchema = Joi.object({
  status: Joi.string().valid('online', 'offline').required().messages({
    'any.only': 'Status must be one of: online, offline',
    'any.required': 'Status is required'
  })
});

const bindDeviceSchema = Joi.object({
  device_id: Joi.string().required().max(50),
  device_secret: Joi.string().required().max(100),
  device_name: Joi.string().required().max(100),
  model_version: Joi.string().required().max(50)
});

const unbindDeviceSchema = Joi.object({
  device_id: Joi.string().required().max(50)
});

const getDeviceSchema = Joi.object({
  device_id: Joi.string().max(50)
});

const reportEventSchema = Joi.object({
  device_id: Joi.string().required().max(50),
  event_type: Joi.string().valid('fall', 'abnormal', 'other').required(),
  event_time: Joi.date().iso().required(),
  confidence: Joi.number().min(0).max(1).required(),
  image_path: Joi.string().max(255).allow(null),
  video_path: Joi.string().max(255).allow(null),
  alarm_message: Joi.string().max(255).allow(null)
});

module.exports = {
  registerDeviceSchema,
  updateDeviceSchema,
  bindDeviceSchema,
  unbindDeviceSchema,
  getDeviceSchema,
  reportEventSchema
};