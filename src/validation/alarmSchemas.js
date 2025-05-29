const Joi = require('joi');

const getAlarmsSchema = Joi.object({
  query: Joi.object({
    from: Joi.date().iso(),
    to: Joi.date().iso().min(Joi.ref('from')),
    status: Joi.string().valid('handled', 'unhandled'),
    device_id: Joi.string(),
    minConfidence: Joi.number().min(0).max(1)
  })
});

const getAlarmDetailSchema = Joi.object({
  params: Joi.object({
    alarmId: Joi.string().required()
  })
});

const acknowledgeAlarmSchema = Joi.object({
  params: Joi.object({
    alarmId: Joi.string().required()
  }),
  body: Joi.object({
    action: Joi.string().valid('confirm', 'dismiss').required().messages({
      'any.only': 'Action must be either confirm or dismiss',
      'any.required': 'Action is required'
    }),
    message: Joi.string().max(255)
  })
});

const getAlarmStatsSchema = Joi.object({
  query: Joi.object({
    from: Joi.date().iso(),
    to: Joi.date().iso().min(Joi.ref('from')),
    device_id: Joi.string()
  })
});

module.exports = {
  getAlarmsSchema,
  getAlarmDetailSchema,
  acknowledgeAlarmSchema,
  getAlarmStatsSchema
}; 