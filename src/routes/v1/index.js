const express = require('express');
const router = express.Router();

// Import route handlers
const authRoutes = require('./auth');
const deviceRoutes = require('./devices');
const userRoutes = require('./users');
const alarmRoutes = require('./alarms');
const feedbackRoutes = require('./feedback');

// API v1 routes
router.use('/auth', authRoutes);
router.use('/devices', deviceRoutes);
router.use('/users', userRoutes);
router.use('/alarms', alarmRoutes);
router.use('/feedback', feedbackRoutes);

module.exports = router;