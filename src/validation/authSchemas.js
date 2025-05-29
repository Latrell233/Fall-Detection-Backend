const Joi = require('joi');

const username = Joi.string().min(3).max(30).required().messages({
  'string.min': 'Username must be at least 3 characters long',
  'string.max': 'Username cannot be longer than 30 characters',
  'any.required': 'Username is required'
});

const password = Joi.string().min(8).required().messages({
  'string.min': 'Password must be at least 8 characters long',
  'any.required': 'Password is required'
});

const name = Joi.string().min(2).max(30).required().messages({
  'string.min': 'Name must be at least 2 characters long',
  'string.max': 'Name cannot be longer than 30 characters',
  'any.required': 'Name is required'
});

const contact_info = Joi.string().email().required().messages({
  'string.email': 'Please provide a valid email address',
  'any.required': 'Contact info is required'
});

const registerSchema = Joi.object({
  body: Joi.object({
    username,
    password,
    name,
    contact_info
  })
});

const loginSchema = Joi.object({
  body: Joi.object({
    username,
    password
  })
});

const refreshTokenSchema = Joi.object({
  body: Joi.object({
    refreshToken: Joi.string().required().messages({
      'any.required': 'Refresh token is required'
    })
  })
});

const resetPasswordSchema = Joi.object({
  body: Joi.object({
    username,
    newPassword: password
  })
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  resetPasswordSchema
};