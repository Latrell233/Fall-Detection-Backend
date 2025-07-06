const db = require('../db');
const bcrypt = require('bcrypt');

async function initDatabase() {
  try {
    // 检查是否需要强制重建表
    const force = process.argv.includes('--force');
    if (force) {
      console.log('警告: 将删除所有现有数据并重建表');
    }

    const sequelize = db.getSequelize();
    const models = db.getModels();

    // 同步所有模型到数据库
    await sequelize.sync({ force });
    console.log('数据库表创建成功');

    // 只有在强制重建表时才创建测试数据
    if (force) {
      // 创建测试用户
      const testUser = await models.User.create({
        username: 'testuser',
        password_hash: await bcrypt.hash('test123', 10)
      });
      console.log('测试用户创建成功:', testUser.username);

      // 创建测试设备
      const testDevice = await models.Device.create({
        device_id: 'TEST_DEVICE_001',
        user_id: testUser.user_id,
        install_location: 'Living Room',
        device_secret: 'test_secret_123',
        status: 'online',
        last_active: new Date(),
        config_json: {
          threshold: 0.8,
          record_video: true,
          video_length_sec: 10
        }
      });
      console.log('测试设备创建成功:', testDevice.device_id);

      // 创建测试告警记录
      const testAlarm = await models.AlarmRecord.create({
        device_id: testDevice.device_id,
        user_id: testUser.user_id,
        event_type: 'fall',
        event_time: new Date(),
        confidence: 0.95,
        handled: false,
        alarm_message: '检测到跌倒事件'
      });
      console.log('测试告警记录创建成功:', testAlarm.alarm_id);

      // 创建测试视频记录
      const testVideo = await models.Video.create({
        device_id: testDevice.device_id,
        alarm_id: testAlarm.alarm_id,
        start_time: new Date(),
        duration: 30,
        video_path: '/videos/test.mp4',
        file_size: 1024000,
        format: 'mp4'
      });
      console.log('测试视频记录创建成功:', testVideo.video_id);

      // 创建测试反馈记录
      const testFeedback = await models.Feedback.create({
        user_id: testUser.user_id,
        rating: 5,
        content: '系统很好用，检测准确率高'
      });
      console.log('测试反馈记录创建成功:', testFeedback.feedback_id);
    }

    console.log('数据库初始化完成');
    return true;
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
}

// 检查是否直接运行此脚本
if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} else {
  module.exports = initDatabase;
} 