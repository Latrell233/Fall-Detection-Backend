const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const { validateDeviceOwnership } = require('../middleware/deviceAuth');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

const deviceController = {
  async getDevice(req, res) {
    try {
      const userId = req.user.userId;
      const { Device } = req.app.locals.db;
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
        device_name: device.device_name,
        install_location: device.install_location,
        status: device.status,
        last_active: device.last_active,
        model_version: device.model_version,
        config: device.config_json
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
      const { Device } = req.app.locals.db;

      // Verify device ownership
      await validateDeviceOwnership(userId, device_id);

      // Update device status
      const device = await Device.findOne({
        where: {
          device_id,
          user_id: userId
        }
      });

      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      await device.update({
        status,
        last_active: new Date()
      });

      res.json({
        device_id: device.device_id,
        device_name: device.device_name,
        status: device.status,
        last_active: device.last_active
      });
    } catch (err) {
      console.error('Update device status error:', err);
      res.status(500).json({ error: 'Failed to update device status' });
    }
  },

  async listDevices(req, res) {
    try {
      const { userId } = req.user;
      const { Device } = req.app.locals.db;

      const devices = await Device.findAll({
        where: { user_id: userId },
        attributes: [
          'device_id',
          'device_name',
          'install_location',
          'status',
          'last_active',
          'model_version'
        ]
      });

      res.json(devices);
    } catch (err) {
      console.error('List devices error:', err);
      res.status(500).json({ error: 'Failed to list devices' });
    }
  },

  async deleteDevice(req, res) {
    try {
      const userId = req.user.userId;
      const device_id = req.params.deviceId;
      const { Device } = req.app.locals.db;

      if (!userId || !device_id) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      // Verify device ownership
      await validateDeviceOwnership(userId, device_id, req.app.locals.db);

      const result = await Device.destroy({
        where: {
          device_id,
          user_id: userId
        }
      });

      if (result === 0) {
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
      const { Device } = req.app.locals.db;
      
      const device = await Device.findOne({
        where: { device_id }
      });

      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      await device.update({
        status: status || 'online',
        last_active: timestamp || new Date()
      });

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
      const { Device } = req.app.locals.db;
      
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
          await device.update({
            user_id: userId
          });
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
        success: true,
        data: {
          device_id: device.device_id,
          device_name: device.device_name,
          status: device.status,
          device_token: deviceToken,
          install_location: device.install_location,
          model_version: device.model_version
        }
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
    const transaction = await sequelize.transaction();
    
    try {
      const { device_id } = req.body;
      const userId = req.user.userId;
      const { Device, AlarmRecord, Video } = req.app.locals.db;

      if (!device_id || !userId) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      // 检查设备是否属于当前用户
      const device = await Device.findOne({
        where: {
          device_id,
          user_id: userId
        }
      });

      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      // 1. 先删除设备相关的所有视频记录
      await Video.destroy({
        where: {
          alarm_id: {
            [Op.in]: sequelize.literal(`(SELECT alarm_id FROM alarm_records WHERE device_id = '${device_id}' AND user_id = ${userId})`)
          }
        },
        transaction
      });

      // 2. 删除设备相关的所有报警记录
      await AlarmRecord.destroy({
        where: {
          device_id,
          user_id: userId
        },
        transaction
      });

      // 3. 最后删除设备
      await device.destroy({ transaction });

      await transaction.commit();
      res.json({
        success: true,
        message: 'Device unbound successfully'
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Unbind device error:', error);
      res.status(500).json({ error: 'Failed to unbind device' });
    }
  },

  async registerDevice(req, res) {
    try {
      const { device_id, device_secret, device_name, model_version } = req.body;
      
      // 检查设备是否已存在
      const existingDevice = await Device.findOne({
        where: { device_id }
      });

      if (existingDevice) {
        return res.status(400).json({ error: 'Device already exists' });
      }

      // 创建新设备
      const newDevice = await Device.create({
        device_id,
        device_secret,
        device_name,
        model_version,
        status: 'offline',
        user_id: null,
        install_location: '未设置',
        config_json: {}
      });

      res.status(201).json({
        device_id: newDevice.device_id,
        device_name: newDevice.device_name,
        model_version: newDevice.model_version,
        status: newDevice.status
      });
    } catch (err) {
      console.error('Register device error:', err);
      res.status(500).json({ error: 'Failed to register device' });
    }
  },

  // 设备事件上报
  async reportEvent(req, res) {
    try {
      const { device_id, event_type, event_time, confidence, image_path, video_path, alarm_message } = req.body;
      const { Device, AlarmRecord } = req.app.locals.db;

      const device = await Device.findOne({
        where: { device_id }
      });

      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      const alarm = await AlarmRecord.create({
        device_id,
        user_id: device.user_id,
        event_type,
        event_time: event_time || new Date(),
        confidence,
        image_path,
        video_path,
        alarm_message,
        handled: false
      });

      res.json({
        success: true,
        data: {
          alarm_id: alarm.alarm_id,
          device_id: alarm.device_id,
          event_type: alarm.event_type,
          event_time: alarm.event_time,
          confidence: alarm.confidence,
          handled: alarm.handled,
          video_path: alarm.video_path,
          created_at: alarm.created_at
        }
      });
    } catch (err) {
      console.error('Report event error:', err);
      res.status(500).json({ error: 'Failed to report event' });
    }
  }
};

module.exports = deviceController;