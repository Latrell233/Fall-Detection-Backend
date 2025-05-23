const sequelize = require('./index');
const User = require('./models/User');
const Device = require('./models/Device');
const AlarmRecord = require('./models/AlarmRecord');
const Video = require('./models/Video');

async function initDatabase() {
  try {
    // 同步所有模型到数据库
    await sequelize.sync({ force: true });
    console.log('数据库表创建成功');

    // 创建测试用户
    const testUser = await User.create({
      username: 'testuser',
      password_hash: '$2a$10$X7UrH5YxX5YxX5YxX5YxX.5YxX5YxX5YxX5YxX5YxX5YxX5YxX', // 密码: test123
      name: 'Test User',
      contact_info: 'test@example.com'
    });
    console.log('测试用户创建成功:', testUser.username);

    // 创建测试设备
    const testDevice = await Device.create({
      device_id: 'TEST_DEVICE_001',
      device_name: 'Test Camera',
      user_id: testUser.user_id,
      install_location: 'Living Room',
      device_secret: 'test_secret_123',
      status: 'online',
      model_version: '1.0.0',
      last_active: new Date(),
      config_json: {
        threshold: 0.8,
        record_video: true,
        video_length_sec: 10
      }
    });
    console.log('测试设备创建成功:', testDevice.device_id);

    console.log('数据库初始化完成');
    process.exit(0);
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
}

initDatabase(); 