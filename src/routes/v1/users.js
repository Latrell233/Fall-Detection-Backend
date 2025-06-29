const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const { validate } = require('../../middleware/validation');
const { updateUsernameSchema, updatePasswordSchema } = require('../../validation/authSchemas');
const { User } = require('../../db');
const userController = require('../../controllers/userController');

// Get current user info
router.get('/me', authenticate, userController.getCurrentUser);

// Update username
router.put('/me/username', authenticate, validate(updateUsernameSchema), userController.updateUsername);

// Update password
router.put('/me/password', authenticate, validate(updatePasswordSchema), userController.updatePassword);

// Delete current user
router.delete('/me', authenticate, userController.deleteCurrentUser);

module.exports = router; 