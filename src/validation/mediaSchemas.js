const Joi = require('joi');

const uploadSchema = Joi.object({
  body: Joi.object({
    type: Joi.string().valid('images', 'videos').required().messages({
      'any.only': 'Type must be either images or videos',
      'any.required': 'Type is required'
    }),
    device_id: Joi.string().required().messages({
      'any.required': 'Device ID is required'
    })
  })
});

module.exports = {
  uploadSchema
}; 