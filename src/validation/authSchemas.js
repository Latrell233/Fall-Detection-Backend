const Joi = require('joi');

const username = Joi.string().required().messages({
  'any.required': 'Username is required'
});

const password = Joi.string().required().messages({
  'any.required': 'Password is required'
});

const registerSchema = Joi.object({
  body: Joi.object({
    username,
    password
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