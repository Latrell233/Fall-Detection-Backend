const { Router } = require('express');
const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// 404 handler
router.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

module.exports = router;