const jwt = require('jsonwebtoken');
const config = require('../../config/config');

const validateDeviceOwnership = async (userId, device_id, db) => {
  try {
    if (!userId || !device_id || !db) {
      throw new Error('Missing required parameters');
    }

    const { Device } = db;
    if (!Device) {
      throw new Error('Device model not found');
    }

    const device = await Device.findOne({
      where: { device_id, user_id: userId }
    });

    if (!device) {
      throw new Error('Device not found or not owned by user');
    }

    return true;
  } catch (err) {
    console.error('Device ownership validation error:', err);
    throw err;
  }
};

module.exports = {
  validateDeviceOwnership,

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