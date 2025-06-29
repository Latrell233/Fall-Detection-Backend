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

const updateUsernameSchema = Joi.object({
  body: Joi.object({
    newUsername: Joi.string().min(3).max(30).required().messages({
      'any.required': 'New username is required',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username must be at most 30 characters long'
    })
  })
});

const updatePasswordSchema = Joi.object({
  body: Joi.object({
    newPassword: Joi.string().min(6).required().messages({
      'any.required': 'New password is required',
      'string.min': 'Password must be at least 6 characters long'
    })
  })
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  resetPasswordSchema,
  updateUsernameSchema,
  updatePasswordSchema
};