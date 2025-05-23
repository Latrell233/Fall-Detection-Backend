const { Router } = require('express');
const router = Router();
const { authenticate } = require('../../middleware/auth');
const db = require('../../db');

// Get current user info
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await db.query(
      'SELECT user_id, username, name, contact_info FROM users WHERE user_id = $1',
      [req.user.userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.rows[0].user_id,
      username: user.rows[0].username,
      name: user.rows[0].name,
      contact_info: user.rows[0].contact_info
    });
  } catch (err) {
    console.error('Get user info error:', err);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

module.exports = router; 