const userController = {
  async getCurrentUser(req, res) {
    try {
      const userId = req.user.userId;
      const { User } = req.app.locals.db;

      const user = await User.findOne({
        where: { user_id: userId },
        attributes: ['user_id', 'username', 'name', 'contact_info']
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        success: true,
        data: {
          id: user.user_id,
          username: user.username,
          name: user.name,
          contact_info: user.contact_info
        }
      });
    } catch (err) {
      console.error('Get user info error:', err);
      res.status(500).json({ error: 'Failed to get user info' });
    }
  },

  async deleteCurrentUser(req, res) {
    try {
      const userId = req.user.userId;
      const { User } = req.app.locals.db;
      const result = await User.destroy({ where: { user_id: userId } });
      if (result === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ success: true, message: 'User deleted' });
    } catch (err) {
      console.error('Delete user error:', err);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
};

module.exports = userController; 