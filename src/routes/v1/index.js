const express = require('express');
const router = express.Router();

// Import route handlers
const authRoutes = require('./auth');
const deviceRoutes = require('./devices');
const detectionRoutes = require('./detections');
const userRoutes = require('./users');
const alarmRoutes = require('./alarms');

// API v1 routes
router.use('/auth', authRoutes);
router.use('/device', deviceRoutes);
router.use('/detections', detectionRoutes);
router.use('/user', userRoutes);
router.use('/alarm', alarmRoutes);

module.exports = router;