const { Router } = require('express');
const router = Router();
const { authenticate } = require('../../middleware/auth');
const { validate } = require('../../middleware/validation');
const alarmController = require('../../controllers/alarmController');
const {
  getAlarmsSchema,
  getAlarmDetailSchema,
  acknowledgeAlarmSchema
} = require('../../validation/alarmSchemas');

// 获取报警列表
router.get('/',
  authenticate,
  validate(getAlarmsSchema),
  alarmController.getAlarms
);

// 获取报警详情
router.get('/:alarmId',
  authenticate,
  validate(getAlarmDetailSchema),
  alarmController.getAlarmDetail
);

// 确认报警
router.post('/:alarmId/ack',
  authenticate,
  validate(acknowledgeAlarmSchema),
  alarmController.acknowledgeAlarm
);

module.exports = router; 