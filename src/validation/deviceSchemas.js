const Joi = require('joi');

const registerDeviceSchema = Joi.object({
  body: Joi.object({
    device_id: Joi.string().required().messages({
      'any.required': 'Device ID is required'
    }),
    device_secret: Joi.string().required().messages({
      'any.required': 'Device secret is required'
    })
  })
});

const updateDeviceSchema = Joi.object({
  body: Joi.object({
    status: Joi.string().valid('online', 'offline').required().messages({
      'any.only': 'Status must be one of: online, offline',
      'any.required': 'Status is required'
    })
  })
});

const bindDeviceSchema = Joi.object({
  body: Joi.object({
    device_id: Joi.string().required(),
    device_secret: Joi.string().required()
  })
});

const unbindDeviceSchema = Joi.object({
  body: Joi.object({
    // 移除device_id字段，因为一对一关系下用户只能有一个设备
  })
});

const getDeviceSchema = Joi.object({
  query: Joi.object({
    device_id: Joi.string()
  })
});

const reportEventSchema = Joi.object({
  body: Joi.object({
    device_id: Joi.string().required(),
    event_type: Joi.string().valid('fall', 'abnormal', 'other').required(),
    event_time: Joi.date().iso().required(),
    confidence: Joi.number().min(0).max(1).required(),
    image_path: Joi.string().allow(null),
    video_path: Joi.string().allow(null),
    alarm_message: Joi.string().allow(null)
  })
});

module.exports = {
  registerDeviceSchema,
  updateDeviceSchema,
  bindDeviceSchema,
  unbindDeviceSchema,
  getDeviceSchema,
  reportEventSchema
};