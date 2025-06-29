const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const config = require('../config/config');
const db = require('./db');
const initDatabase = require('./db/init');
const v1Routes = require('./routes/v1');
const authRoutes = require('./routes/v1/auth');
const deviceRoutes = require('./routes/v1/devices');
const alarmRoutes = require('./routes/v1/alarms');
const userRoutes = require('./routes/v1/users');
const mediaRoutes = require('./routes/v1/media');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(config.cors));
app.use(helmet());
app.use(morgan('dev'));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/public', express.static(path.join(__dirname, '../public')));

// Debug middleware
app.use((req, res, next) => {
  console.log('Request path:', req.path);
  next();
});

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

// 初始化数据库并启动服务器
async function startServer() {
  try {
    // 初始化数据库
    await db.connect();
    const sequelize = db.getSequelize();
    const models = db.getModels();
    
    // 运行数据库初始化脚本
    await initDatabase();
    console.log('The database initialization has been completed');

    // 将数据库对象和模型添加到 app 中，供路由使用
    app.locals.db = models;
    app.locals.sequelize = sequelize;

    // 添加路由
    app.use('/api/v1', v1Routes);
    app.use('/api/v1/auth', authRoutes);
    app.use('/api/v1/devices', deviceRoutes);
    app.use('/api/v1/alarms', alarmRoutes);
    app.use('/api/v1/users', userRoutes);
    app.use('/api/v1/media', mediaRoutes);

    // 启动服务器
    const PORT = config.server.port || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

module.exports = app;