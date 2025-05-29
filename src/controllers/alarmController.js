const { Op } = require('sequelize');
const { AlarmRecord, Device, Video } = require('../db').getModels();

module.exports = {
  // 获取报警列表
  async getAlarms(req, res) {
    try {
      const { from, to, status, device_id, minConfidence } = req.query;
      const userId = req.user.userId;

      const where = { user_id: userId };
      if (from && to) {
        where.event_time = {
          [Op.between]: [new Date(from), new Date(to)]
        };
      }
      if (status) {
        where.handled = status === 'handled';
      }
      if (device_id) {
        where.device_id = device_id;
      }
      if (minConfidence) {
        where.confidence = {
          [Op.gte]: parseFloat(minConfidence)
        };
      }

      const { count, rows } = await AlarmRecord.findAndCountAll({
        where,
        include: [{
          model: Device,
          as: 'device',
          attributes: ['device_name', 'install_location']
        }],
        order: [['event_time', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          alarms: rows,
          total: count
        }
      });
    } catch (error) {
      console.error('Get alarms error:', error);
      res.status(500).json({ error: 'Failed to get alarms' });
    }
  },

  // 获取报警详情
  async getAlarmDetail(req, res) {
    try {
      const { alarmId } = req.params;
      const userId = req.user.userId;

      const alarm = await AlarmRecord.findOne({
        where: {
          alarm_id: alarmId,
          user_id: userId
        },
        include: [
          {
            model: Device,
            as: 'device',
            attributes: ['device_name', 'install_location']
          },
          {
            model: Video,
            as: 'video',
            attributes: ['video_id', 'video_path', 'duration', 'format']
          }
        ]
      });

      if (!alarm) {
        return res.status(404).json({ error: 'Alarm not found' });
      }

      // 处理文件路径
      const alarmData = alarm.toJSON();
      if (alarmData.image_path) {
        alarmData.image_path = alarmData.image_path.replace('/uploads', '');
      }
      if (alarmData.video_path) {
        alarmData.video_path = alarmData.video_path.replace('/uploads', '');
      }
      if (alarmData.video && alarmData.video.video_path) {
        alarmData.video.video_path = alarmData.video.video_path.replace('/uploads', '');
      }

      res.json({
        success: true,
        data: alarmData
      });
    } catch (error) {
      console.error('Get alarm detail error:', error);
      res.status(500).json({ error: 'Failed to get alarm detail' });
    }
  },

  // 确认报警
  async acknowledgeAlarm(req, res) {
    try {
      const { alarmId } = req.params;
      const { action, message } = req.body;
      const userId = req.user.userId;
      console.log('acknowledgeAlarm body:', req.body);
      if (!action || !['confirm', 'dismiss'].includes(action)) {
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
        return res.status(404).json({ error: 'Alarm not found' });
      }

      await alarm.update({
        handled: true,
        alarm_message: message || `Alarm ${action}ed by user`
      });

      res.json({
        success: true,
        message: 'Alarm acknowledged successfully'
      });
    } catch (error) {
      console.error('Acknowledge alarm error:', error);
      res.status(500).json({ error: 'Failed to acknowledge alarm' });
    }
  }
}; 