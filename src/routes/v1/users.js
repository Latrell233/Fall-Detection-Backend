const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const { User } = require('../../db');
const userController = require('../../controllers/userController');

// Get current user info
router.get('/me', authenticate, userController.getCurrentUser);

// Delete current user
router.delete('/me', authenticate, userController.deleteCurrentUser);

module.exports = router; 