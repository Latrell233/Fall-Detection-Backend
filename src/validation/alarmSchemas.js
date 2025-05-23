const Joi = require('joi');

const getAlarmsSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0),
  handled: Joi.boolean(),
  start_time: Joi.date().iso(),
  end_time: Joi.date().iso().min(Joi.ref('start_time'))
});

const getAlarmDetailSchema = Joi.object({
  alarmId: Joi.string().required()
});

const acknowledgeAlarmSchema = Joi.object({
  alarmId: Joi.string().required()
});

module.exports = {
  getAlarmsSchema,
  getAlarmDetailSchema,
  acknowledgeAlarmSchema
}; 