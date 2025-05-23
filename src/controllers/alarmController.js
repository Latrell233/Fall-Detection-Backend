const db = require('../db');

module.exports = {
  // 获取报警列表
  async getAlarms(req, res) {
    try {
      const userId = req.user.userId;
      const { limit = 20, offset = 0, handled, start_time, end_time } = req.query;

      // 构建查询条件
      let query = `
        SELECT 
          ar.alarm_id, ar.device_id, ar.alarm_type, ar.alarm_time,
          ar.confidence, ar.status, ar.video_url, ar.created_at,
          d.device_name
        FROM alarm_records ar
        JOIN devices d ON ar.device_id = d.device_id
        WHERE d.user_id = $1
      `;
      const params = [userId];
      let paramIndex = 2;

      if (handled !== undefined) {
        query += ` AND ar.status = $${paramIndex}`;
        params.push(handled === 'true' ? 'handled' : 'pending');
        paramIndex++;
      }

      if (start_time) {
        query += ` AND ar.alarm_time >= $${paramIndex}`;
        params.push(start_time);
        paramIndex++;
      }

      if (end_time) {
        query += ` AND ar.alarm_time <= $${paramIndex}`;
        params.push(end_time);
        paramIndex++;
      }

      query += ` ORDER BY ar.alarm_time DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(parseInt(limit), parseInt(offset));

      const alarms = await db.query(query, params);

      res.json({
        success: true,
        data: {
          alarms: alarms.rows,
          total: alarms.rowCount,
          limit: parseInt(limit),
          offset: parseInt(offset)
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

      const alarm = await db.query(
        `SELECT 
          ar.alarm_id, ar.device_id, ar.alarm_type, ar.alarm_time,
          ar.confidence, ar.status, ar.video_url, ar.created_at,
          d.device_name, d.install_location
        FROM alarm_records ar
        JOIN devices d ON ar.device_id = d.device_id
        WHERE ar.alarm_id = $1 AND d.user_id = $2`,
        [alarmId, userId]
      );

      if (alarm.rows.length === 0) {
        return res.status(404).json({ error: 'Alarm not found' });
      }

      res.json({
        success: true,
        data: alarm.rows[0]
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

      // 检查报警是否存在且属于当前用户
      const alarm = await db.query(
        `SELECT ar.alarm_id
        FROM alarm_records ar
        JOIN devices d ON ar.device_id = d.device_id
        WHERE ar.alarm_id = $1 AND d.user_id = $2`,
        [alarmId, userId]
      );

      if (alarm.rows.length === 0) {
        return res.status(404).json({ error: 'Alarm not found or not authorized' });
      }

      // 更新报警状态
      const result = await db.query(
        'UPDATE alarm_records SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE alarm_id = $2 RETURNING *',
        ['handled', alarmId]
      );

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (err) {
      console.error('Acknowledge alarm error:', err);
      res.status(500).json({ error: 'Failed to acknowledge alarm' });
    }
  }
}; 