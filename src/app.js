const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('../config/config');
const db = require('./db');
const v1Routes = require('./routes/v1');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(config.cors));
app.use(helmet());
app.use(morgan('dev'));

// Debug middleware
app.use((req, res, next) => {
  console.log('Request path:', req.path);
  next();
});

// Database connection
db.connect()
  .then(() => console.log('Connected to database'))
  .catch(err => console.error('Database connection error:', err));

// Routes
app.use('/api/v1', v1Routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    details: err.message
  });
});

const PORT = config.server.port || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;