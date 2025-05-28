const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'fall_detection',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'db',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    timezone: '+08:00',  // 设置时区为东八区
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      timestamps: true,
      underscored: true
    },
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// 导入模型
const User = require('./models/User');
const Device = require('./models/Device');
const AlarmRecord = require('./models/AlarmRecord');
const Video = require('./models/Video');

// 定义模型关联
User.hasMany(Device, { foreignKey: 'user_id' });
Device.belongsTo(User, { foreignKey: 'user_id' });

Device.hasMany(AlarmRecord, { foreignKey: 'device_id' });
AlarmRecord.belongsTo(Device, { foreignKey: 'device_id' });

User.hasMany(AlarmRecord, { foreignKey: 'user_id' });
AlarmRecord.belongsTo(User, { foreignKey: 'user_id' });

AlarmRecord.hasMany(Video, { foreignKey: 'alarm_id' });
Video.belongsTo(AlarmRecord, { foreignKey: 'alarm_id' });

// 测试数据库连接
sequelize.authenticate()
  .then(() => {
    console.log('数据库连接成功');
  })
  .catch(err => {
    console.error('数据库连接失败:', err);
  });

// 导出模型
module.exports = {
  sequelize,
  User,
  Device,
  AlarmRecord,
  Video
}; 