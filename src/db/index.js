const { Sequelize } = require('sequelize');

// 创建 Sequelize 实例
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

// 导入模型定义
const UserModel = require('./models/User');
const DeviceModel = require('./models/Device');
const AlarmRecordModel = require('./models/AlarmRecord');
const VideoModel = require('./models/Video');
const FeedbackModel = require('./models/Feedback');

// 初始化模型
let User, Device, AlarmRecord, Video, Feedback;

// 数据库连接和初始化方法
const initDatabase = async () => {
  try {
    // 连接数据库
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 初始化模型
    User = UserModel(sequelize, Sequelize);
    Device = DeviceModel(sequelize, Sequelize);
    AlarmRecord = AlarmRecordModel(sequelize, Sequelize);
    Video = VideoModel(sequelize, Sequelize);
    Feedback = FeedbackModel(sequelize, Sequelize);

    // 定义模型关联
    User.hasOne(Device, { foreignKey: 'user_id' });
    Device.belongsTo(User, { foreignKey: 'user_id' });

    Device.hasMany(AlarmRecord, { foreignKey: 'device_id' });
    AlarmRecord.belongsTo(Device, { foreignKey: 'device_id' });

    User.hasMany(AlarmRecord, { foreignKey: 'user_id' });
    AlarmRecord.belongsTo(User, { foreignKey: 'user_id' });

    AlarmRecord.hasMany(Video, { foreignKey: 'alarm_id' });
    Video.belongsTo(AlarmRecord, { foreignKey: 'alarm_id' });

    User.hasMany(Feedback, { foreignKey: 'user_id' });
    Feedback.belongsTo(User, { foreignKey: 'user_id' });

    // 同步模型到数据库
    await sequelize.sync();
    console.log('数据库模型同步完成');

    return {
      sequelize,
      Sequelize,
      User,
      Device,
      AlarmRecord,
      Video,
      Feedback
    };
  } catch (err) {
    console.error('数据库初始化失败:', err);
    throw err;
  }
};

// 导出初始化方法
module.exports = initDatabase; 