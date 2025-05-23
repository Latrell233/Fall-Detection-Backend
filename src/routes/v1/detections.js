const { Router } = require('express');
const router = Router();
const detectionController = require('../../controllers/detectionController');
const { authenticate } = require('../../middleware/auth');
const { validate } = require('../../middleware/validation');
const {
  createDetectionSchema,
  getDetectionsSchema
} = require('../../validation/detectionSchemas');

// Create new fall detection record
router.post('/',
  authenticate,
  validate(createDetectionSchema),
  detectionController.createDetection
);

// Get detection details
router.get('/:detectionId',
  authenticate,
  detectionController.getDetection
);

// List detections with filters
router.get('/',
  authenticate,
  validate(getDetectionsSchema),
  detectionController.listDetections
);

// Get detection statistics
router.get('/stats',
  authenticate,
  detectionController.getDetectionStats
);

// Handle emergency alert
router.post('/:detectionId/alert',
  authenticate,
  detectionController.handleAlert
);

module.exports = router;