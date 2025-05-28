const { Router } = require('express');
const router = Router();
const { authenticate } = require('../../middleware/auth');
const { User } = require('../../db/models');

// Get current user info
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findOne({
      where: { user_id: req.user.userId },
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
});

module.exports = router; 