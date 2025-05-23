const { Router } = require('express');
const router = Router();
const deviceController = require('../../controllers/deviceController');
const { authenticate } = require('../../middleware/auth');
const { validate } = require('../../middleware/validation');
const { authenticateDevice } = require('../../middleware/deviceAuth');
const {
  registerDeviceSchema,
  updateDeviceSchema,
  bindDeviceSchema,
  unbindDeviceSchema
} = require('../../validation/deviceSchemas');

// 设备注册和绑定
router.post('/register',
  authenticate,
  validate(registerDeviceSchema),
  deviceController.bindDevice
);

// 设备心跳
router.post('/heartbeat',
  authenticateDevice,
  deviceController.heartbeat
);

// 设备解绑
router.post('/unbind',
  authenticate,
  validate(unbindDeviceSchema),
  deviceController.unbindDevice
);

// List user's devices
router.get('/', 
  authenticate,
  deviceController.listDevices
);

// Get device details
router.get('/info', 
  authenticate,
  deviceController.getDevice
);

// Update device status
router.put('/:deviceId/status', 
  authenticate,
  validate(updateDeviceSchema),
  deviceController.updateDeviceStatus
);

// Delete device
router.delete('/:deviceId',
  authenticate,
  deviceController.deleteDevice
);

module.exports = router;