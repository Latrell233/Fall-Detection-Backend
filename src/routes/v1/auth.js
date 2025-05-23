const { Router } = require('express');
const router = Router();
const authController = require('../../controllers/authController');
const { validate } = require('../../middleware/validation');
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  resetPasswordSchema
} = require('../../validation/authSchemas');

// User registration
router.post('/register', validate(registerSchema), authController.register);

// User login
router.post('/login', validate(loginSchema), authController.login);

// Refresh token
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);

// Password reset request
router.post('/reset-password', validate(resetPasswordSchema), authController.requestPasswordReset);

// Password reset confirmation
router.post('/reset-password/:token', validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;