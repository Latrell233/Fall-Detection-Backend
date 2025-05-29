const { Op } = require('sequelize');

module.exports = {
  // 获取报警列表
  async getAlarms(req, res) {
    try {
      const userId = req.user.userId;
      const { from, to, status, device_id, minConfidence } = req.query;
      const { AlarmRecord, Device } = req.app.locals.db;

      const whereClause = {
        user_id: userId
      };

      if (status) {
        whereClause.handled = status === 'handled';
      }

      if (from) {
        whereClause.event_time = {
          [Op.gte]: from
        };
      }

      if (to) {
        whereClause.event_time = {
          ...whereClause.event_time,
          [Op.lte]: to
        };
      }

      if (device_id) {
        whereClause.device_id = device_id;
      }

      if (minConfidence) {
        whereClause.confidence = {
          [Op.gte]: parseFloat(minConfidence)
        };
      }

      const alarms = await AlarmRecord.findAndCountAll({
        attributes: [
          'alarm_id',
          'device_id',
          'event_type',
          'event_time',
          'image_path',
          'confidence',
          'handled',
          'alarm_message',
          'created_at'
        ],
        where: whereClause,
        include: [{
          model: Device,
          attributes: ['device_name', 'install_location']
        }],
        order: [['event_time', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          alarms: alarms.rows,
          total: alarms.count
        }
      });
    } catch (err) {
      console.error('Get alarms error:', err);
      res.status(500).json({ error: 'Failed to get alarms' });
    }
  },

  // 获取报警详情
  async getAlarmDetail(req, res) {
    try {
      const userId = req.user.userId;
      const { alarmId } = req.params;

      const alarm = await AlarmRecord.findOne({
        where: {
          alarm_id: alarmId,
          user_id: userId
        },
        include: [
          {
            model: Device,
            attributes: ['device_name', 'install_location']
          },
          {
            model: Video,
            attributes: ['video_id', 'file_path', 'duration', 'format']
          }
        ]
      });

      if (!alarm) {
        return res.status(404).json({ error: 'Alarm not found' });
      }

      res.json({
        success: true,
        data: alarm
      });
    } catch (err) {
      console.error('Get alarm detail error:', err);
      res.status(500).json({ error: 'Failed to get alarm detail' });
    }
  },

  // 确认报警
  async acknowledgeAlarm(req, res) {
    try {
      const userId = req.user.userId;
      const { alarmId } = req.params;
      const { action, message } = req.body;

      if (!['confirm', 'dismiss'].includes(action)) {
        return res.status(400).json({ 
          error: 'Invalid action',
          details: 'Action must be either confirm or dismiss'
        });
      }

      const alarm = await AlarmRecord.findOne({
        where: {
          alarm_id: alarmId,
          user_id: userId
        }
      });

      if (!alarm) {
        return res.status(404).json({ error: 'Alarm not found or not authorized' });
      }

      // 更新报警状态
      await alarm.update({
        handled: true,
        updated_at: new Date()
      });

      res.json({
        success: true,
        message: 'Alarm acknowledged successfully'
      });
    } catch (err) {
      console.error('Acknowledge alarm error:', err);
      res.status(500).json({ error: 'Failed to acknowledge alarm' });
    }
  }
}; 