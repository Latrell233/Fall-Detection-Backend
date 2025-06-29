const { User, Device, AlarmRecord, Video } = require('../db').getModels();
const { getSequelize } = require('../db');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

const saltRounds = 10;

const userController = {
  async getCurrentUser(req, res) {
    try {
      const userId = req.user.userId;
      const { User } = req.app.locals.db;

      const user = await User.findOne({
        where: { user_id: userId },
        attributes: ['user_id', 'username']
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        success: true,
        data: {
          id: user.user_id,
          username: user.username
        }
      });
    } catch (err) {
      console.error('Get user info error:', err);
      res.status(500).json({ error: 'Failed to get user info' });
    }
  },

  async updateUsername(req, res) {
    try {
      const userId = req.user.userId;
      const { newUsername } = req.body;
      const { User } = req.app.locals.db;

      // 检查新用户名是否已存在
      const existingUser = await User.findOne({
        where: { username: newUsername }
      });

      if (existingUser) {
        return res.status(400).json({ 
          error: 'Username already exists',
          details: 'The new username is already taken'
        });
      }

      // 更新用户名
      const user = await User.findOne({
        where: { user_id: userId }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await user.update({ username: newUsername });

      res.json({
        success: true,
        message: 'Username updated successfully',
        data: {
          id: user.user_id,
          username: newUsername
        }
      });
    } catch (err) {
      console.error('Update username error:', err);
      res.status(500).json({ error: 'Failed to update username' });
    }
  },

  async updatePassword(req, res) {
    try {
      const userId = req.user.userId;
      const { newPassword } = req.body;
      const { User } = req.app.locals.db;

      // 哈希新密码
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // 更新密码
      const user = await User.findOne({
        where: { user_id: userId }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await user.update({ password_hash: hashedPassword });

      res.json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (err) {
      console.error('Update password error:', err);
      res.status(500).json({ error: 'Failed to update password' });
    }
  },

  async deleteCurrentUser(req, res) {
    const sequelize = getSequelize();
    const transaction = await sequelize.transaction();
    
    try {
      const userId = req.user.userId;

      // 1. 删除用户的所有视频记录
      await Video.destroy({
        where: {
          alarm_id: {
            [Op.in]: sequelize.literal(`(SELECT alarm_id FROM alarm_records WHERE user_id = ${userId})`)
          }
        },
        transaction
      });

      // 2. 删除用户的所有告警记录
      await AlarmRecord.destroy({
        where: { user_id: userId },
        transaction
      });

      // 3. 删除用户的所有设备
      await Device.destroy({
        where: { user_id: userId },
        transaction
      });

      // 4. 最后删除用户
      await User.destroy({
        where: { user_id: userId },
        transaction
      });

      await transaction.commit();
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      await transaction.rollback();
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
};

module.exports = userController; 