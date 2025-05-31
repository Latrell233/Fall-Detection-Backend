const { User, Device, AlarmRecord, Video } = require('../db').getModels();
const { getSequelize } = require('../db');
const { Op } = require('sequelize');

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