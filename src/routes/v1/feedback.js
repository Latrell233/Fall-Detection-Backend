const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const { validate } = require('../../middleware/validation');
const { submitFeedbackSchema } = require('../../validation/feedbackSchemas');
const feedbackController = require('../../controllers/feedbackController');

// 提交反馈
router.post('/', authenticate, validate(submitFeedbackSchema), feedbackController.submitFeedback);

// 获取用户反馈
router.get('/', authenticate, feedbackController.getFeedback);

module.exports = router; 