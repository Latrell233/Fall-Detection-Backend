const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const db = require('../db');
const Device = require('../db/models/Device');
const { validateDeviceOwnership } = require('../middleware/deviceAuth');

const deviceController = {
  async getDevice(req, res) {
    try {
      const userId = req.user.userId;
      console.log('Getting device info for user:', userId);

      const device = await Device.findOne({
        where: { user_id: userId }
      });

      if (!device) {
        console.log('No device found for user:', userId);
        return res.status(404).json({ error: 'No device bound to user' });
      }

      res.json({
        device_id: device.device_id,
        device_name: device.device_name || 'Unknown Device',
        install_location: device.install_location || 'Unknown Location',
        status: device.status || 'offline',
        last_active: device.last_active || new Date().toISOString(),
        model_version: device.model_version || 'v1.0',
        config: device.config_json || {}
      });
    } catch (err) {
      console.error('Get device error:', err);
      res.status(500).json({ 
        error: 'Failed to get device info',
        details: err.message
      });
    }
  },

  async updateDeviceStatus(req, res) {
    try {
      const { userId } = req.user;
      const { device_id } = req.params;
      const { status } = req.body;

      // Verify device ownership
      await validateDeviceOwnership(userId, device_id);

      // Update device status
      const updatedDevice = await db.query(
        `UPDATE devices SET status = $1, last_active = NOW() 
         WHERE device_id = $2 AND user_id = $3
         RETURNING device_id, device_name, status, last_active`,
        [status, device_id, userId]
      );

      if (updatedDevice.rows.length === 0) {
        return res.status(404).json({ error: 'Device not found' });
      }

      res.json(updatedDevice.rows[0]);
    } catch (err) {
      console.error('Update device status error:', err);
      res.status(500).json({ error: 'Failed to update device status' });
    }
  },

  async listDevices(req, res) {
    try {
      const { userId } = req.user;

      // Get all user's devices
      const devices = await db.query(
        `SELECT device_id, device_name, install_location, status, last_active, model_version 
         FROM devices WHERE user_id = $1`,
        [userId]
      );

      res.json(devices.rows);
    } catch (err) {
      console.error('List devices error:', err);
      res.status(500).json({ error: 'Failed to list devices' });
    }
  },

  async deleteDevice(req, res) {
    try {
      const { userId } = req.user;
      const { device_id } = req.params;

      // Verify device ownership
      await validateDeviceOwnership(userId, device_id);

      // Delete device
      const result = await db.query(
        'DELETE FROM devices WHERE device_id = $1 AND user_id = $2',
        [device_id, userId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Device not found' });
      }

      res.json({ message: 'Device deleted successfully' });
    } catch (err) {
      console.error('Delete device error:', err);
      res.status(500).json({ error: 'Failed to delete device' });
    }
  },

  async heartbeat(req, res) {
    try {
      const { device_id, timestamp, status, temp } = req.body;
      const device = await Device.findOne({
        where: { device_id }
      });

      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      device.status = status || 'online';
      device.last_active = timestamp || new Date();
      await device.save();

      res.json({ received: true });
    } catch (err) {
      console.error('Heartbeat error:', err);
      res.status(500).json({ error: 'Failed to update device status' });
    }
  },

  // 设备注册和绑定
  async bindDevice(req, res) {
    try {
      const { device_id, device_secret, device_name, model_version } = req.body;
      const userId = req.user.userId;
      
      console.log('Attempting to register/bind device:', { device_id, device_secret, userId });

      let device = await Device.findOne({
        where: { device_id }
      });

      if (!device) {
        console.log('Device not found, creating new device:', device_id);
        try {
          device = await Device.create({
            device_id,
            device_secret,
            device_name,
            model_version,
            status: 'offline',
            user_id: userId,
            install_location: '未设置',
            config_json: {}
          });
        } catch (createError) {
          console.error('Create device error:', createError);
          return res.status(500).json({ 
            error: 'Failed to create device',
            details: createError.message
          });
        }
      } else if (device.user_id) {
        return res.status(400).json({ error: 'Device already bound to another user' });
      } else {
        try {
          device.user_id = userId;
          await device.save();
        } catch (saveError) {
          console.error('Save device error:', saveError);
          return res.status(500).json({ 
            error: 'Failed to bind existing device',
            details: saveError.message
          });
        }
      }

      // 生成设备令牌
      const deviceToken = jwt.sign(
        { device_id: device.device_id },
        config.server.jwtSecret,
        { expiresIn: '30d' }
      );

      res.json({
        device_id: device.device_id,
        device_name: device.device_name,
        status: device.status,
        token: deviceToken
      });
    } catch (err) {
      console.error('Bind device error:', err);
      res.status(500).json({ 
        error: 'Failed to bind device',
        details: err.message
      });
    }
  },

  // 设备解绑
  async unbindDevice(req, res) {
    try {
      const { device_id } = req.body;
      const userId = req.user.userId;

      const device = await Device.findOne({
        where: { device_id, user_id: userId }
      });

      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      device.user_id = null;
      await device.save();

      res.json({ success: true });
    } catch (err) {
      console.error('Unbind device error:', err);
      res.status(500).json({ error: 'Failed to unbind device' });
    }
  },

  async registerDevice(req, res) {
    try {
      const { device_id, device_secret, device_name, model_version } = req.body;
      
      // 检查设备是否已存在
      const existingDevice = await db.query(
        'SELECT * FROM devices WHERE device_id = $1',
        [device_id]
      );

      if (existingDevice.rows.length > 0) {
        return res.status(400).json({ error: 'Device already exists' });
      }

      // 创建新设备
      const newDevice = await db.query(
        `INSERT INTO devices (
          device_id, device_secret, device_name, model_version,
          status, created_at, updated_at, last_active
        ) VALUES ($1, $2, $3, $4, 'offline', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *`,
        [device_id, device_secret, device_name, model_version]
      );

      res.status(201).json({
        device_id: newDevice.rows[0].device_id,
        device_name: newDevice.rows[0].device_name,
        model_version: newDevice.rows[0].model_version,
        status: newDevice.rows[0].status
      });
    } catch (err) {
      console.error('Register device error:', err);
      res.status(500).json({ error: 'Failed to register device' });
    }
  }
};

module.exports = deviceController;