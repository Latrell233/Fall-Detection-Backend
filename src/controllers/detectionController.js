const db = require('../db');
const mqtt = require('../services/mqttService');
const { validateDeviceOwnership } = require('../middleware/deviceAuth');

module.exports = {
  async createDetection(req, res) {
    try {
      const { userId } = req.user;
      const { device_id, timestamp, confidence, location } = req.body;

      // Verify device ownership
      await validateDeviceOwnership(userId, device_id);

      // Create new detection record
      const detection = await db.query(
        `INSERT INTO detections 
         (device_id, timestamp, confidence, location, status) 
         VALUES ($1, $2, $3, $4, 'pending')
         RETURNING id, device_id, timestamp, confidence, location, status`,
        [device_id, timestamp, confidence, location]
      );

      // Publish MQTT alert if confidence is high
      if (confidence > 0.8) {
        await mqtt.publishAlert({
          detection_id: detection.rows[0].id,
          device_id,
          location,
          timestamp
        });
      }

      res.status(201).json(detection.rows[0]);
    } catch (err) {
      console.error('Create detection error:', err);
      res.status(500).json({ error: 'Failed to create detection' });
    }
  },

  async getDetection(req, res) {
    try {
      const { userId } = req.user;
      const { detectionId } = req.params;

      // Get detection with device ownership check
      const detection = await db.query(
        `SELECT d.id, d.device_id, d.timestamp, d.confidence, 
                d.location, d.status, d.verified_at
         FROM detections d
         JOIN devices dev ON d.device_id = dev.id
         WHERE d.id = $1 AND dev.user_id = $2`,
        [detectionId, userId]
      );

      if (detection.rows.length === 0) {
        return res.status(404).json({ error: 'Detection not found' });
      }

      res.json(detection.rows[0]);
    } catch (err) {
      console.error('Get detection error:', err);
      res.status(500).json({ error: 'Failed to get detection' });
    }
  },

  async listDetections(req, res) {
    try {
      const { userId } = req.user;
      const { from, to, minConfidence } = req.query;

      // Build query with filters
      let query = `
        SELECT d.id, d.device_id, d.timestamp, d.confidence, 
               d.location, d.status, dev.name as device_name
        FROM detections d
        JOIN devices dev ON d.device_id = dev.id
        WHERE dev.user_id = $1
      `;
      const params = [userId];
      let paramIndex = 2;

      if (from) {
        query += ` AND d.timestamp >= $${paramIndex++}`;
        params.push(new Date(from));
      }

      if (to) {
        query += ` AND d.timestamp <= $${paramIndex++}`;
        params.push(new Date(to));
      }

      if (minConfidence) {
        query += ` AND d.confidence >= $${paramIndex++}`;
        params.push(parseFloat(minConfidence));
      }

      query += ' ORDER BY d.timestamp DESC';

      const detections = await db.query(query, params);
      res.json(detections.rows);
    } catch (err) {
      console.error('List detections error:', err);
      res.status(500).json({ error: 'Failed to list detections' });
    }
  },

  async getDetectionStats(req, res) {
    try {
      const { userId } = req.user;

      // Get detection statistics
      const stats = await db.query(
        `SELECT 
           COUNT(*) as total,
           SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as verified,
           SUM(CASE WHEN status = 'false_positive' THEN 1 ELSE 0 END) as false_positives,
           AVG(confidence) as avg_confidence,
           MAX(timestamp) as last_detection
         FROM detections d
         JOIN devices dev ON d.device_id = dev.id
         WHERE dev.user_id = $1`,
        [userId]
      );

      res.json(stats.rows[0]);
    } catch (err) {
      console.error('Get detection stats error:', err);
      res.status(500).json({ error: 'Failed to get detection stats' });
    }
  },

  async handleAlert(req, res) {
    try {
      const { userId } = req.user;
      const { detectionId } = req.params;
      const { action } = req.body; // 'confirm' or 'dismiss'

      // Verify detection ownership
      const detection = await db.query(
        `SELECT d.id, d.device_id, d.confidence
         FROM detections d
         JOIN devices dev ON d.device_id = dev.id
         WHERE d.id = $1 AND dev.user_id = $2`,
        [detectionId, userId]
      );

      if (detection.rows.length === 0) {
        return res.status(404).json({ error: 'Detection not found' });
      }

      // Update detection status based on action
      const status = action === 'confirm' ? 'verified' : 'false_positive';
      await db.query(
        `UPDATE detections 
         SET status = $1, verified_at = NOW() 
         WHERE id = $2`,
        [status, detectionId]
      );

      // Notify emergency contacts if confirmed
      if (action === 'confirm') {
        // This would call a notification service in a real implementation
        console.log(`Alert confirmed for detection ${detectionId}`);
      }

      res.json({ message: `Alert ${action}ed successfully` });
    } catch (err) {
      console.error('Handle alert error:', err);
      res.status(500).json({ error: 'Failed to handle alert' });
    }
  }
};