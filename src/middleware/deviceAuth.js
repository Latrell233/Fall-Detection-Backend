const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const db = require('../db');

module.exports = {
  async validateDeviceOwnership(userId, device_id) {
    try {
      const device = await db.query(
        'SELECT device_id FROM devices WHERE device_id = $1 AND user_id = $2',
        [device_id, userId]
      );

      if (device.rows.length === 0) {
        throw new Error('Device not found or access denied');
      }
    } catch (err) {
      console.error('Device ownership validation error:', err);
      throw err;
    }
  },

  authenticateDevice(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Device ')) {
        return res.status(401).json({ error: 'Missing or invalid device token' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.server.jwtSecret);

      if (!decoded.device_id) {
        return res.status(401).json({ error: 'Invalid device token' });
      }

      req.device = { device_id: decoded.device_id };
      next();
    } catch (err) {
      console.error('Device authentication error:', err);
      res.status(401).json({ error: 'Invalid device token' });
    }
  }
};