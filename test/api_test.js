const axios = require('axios');

// 配置
const config = {
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000
};

// 测试状态存储
const testState = {
  userId: null,
  accessToken: null,
  deviceId: 'TEST_DEVICE_001',
  deviceSecret: 'test_secret_123',
  alarmId: null
};

// 创建axios实例
const api = axios.create(config);

// 添加请求拦截器
api.interceptors.request.use(
  config => {
    // 添加完整URL
    config.url = `http://localhost:3000/api/v1${config.url}`;
    console.log(`\n请求: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  error => Promise.reject(error)
);

// 添加响应拦截器
api.interceptors.response.use(
  response => {
    console.log(`响应: ${response.status} ${response.statusText}`);
    return response;
  },
  error => {
    if (error.response) {
      console.error(`错误: ${error.response.status} - ${error.response.data.error || error.message}`);
    } else if (error.request) {
      console.error('错误: 无法连接到服务器，请确保后端服务正在运行');
    } else {
      console.error('错误:', error.message);
    }
    return Promise.reject(error);
  }
);

// 测试函数
async function runTests() {
  try {
    console.log('开始移动端API测试...\n');

    // 1. 用户注册
    console.log('1. 测试用户注册');
    try {
      const registerResponse = await api.post('/auth/register', {
        username: 'testuser3',
        password: 'test123456',
        name: 'Test User 3',
        contact_info: 'test3@example.com'
      });
      testState.userId = registerResponse.data.user_id;
      console.log('注册成功，用户ID:', testState.userId);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('用户已存在，继续测试...');
      } else {
        throw error;
      }
    }

    // 2. 用户登录
    console.log('\n2. 测试用户登录');
    try {
      const loginResponse = await api.post('/auth/login', {
        username: 'testuser3',
        password: 'test123456'
      });
      testState.accessToken = loginResponse.data.accessToken;
      api.defaults.headers.common['Authorization'] = `Bearer ${testState.accessToken}`;
      console.log('登录成功');
    } catch (error) {
      throw error;
    }

    // 3. 获取设备信息
    console.log('\n3. 测试获取设备信息');
    try {
      const deviceInfoResponse = await api.get('/device');
      console.log('设备信息:', {
        device_id: deviceInfoResponse.data.device_id,
        device_name: deviceInfoResponse.data.device_name,
        status: deviceInfoResponse.data.status,
        last_active: deviceInfoResponse.data.last_active
      });
    } catch (error) {
      throw error;
    }

    // 4. 获取告警列表
    console.log('\n4. 测试获取告警列表');
    try {
      const alarmsResponse = await api.get('/alarms?limit=10&handled=0');
      console.log('告警列表:', alarmsResponse.data.map(alarm => ({
        alarm_id: alarm.alarm_id,
        event_type: alarm.event_type,
        event_time: alarm.event_time,
        handled: alarm.handled
      })));
      
      if (alarmsResponse.data.length > 0) {
        testState.alarmId = alarmsResponse.data[0].alarm_id;
      }
    } catch (error) {
      throw error;
    }

    // 5. 获取告警详情
    if (testState.alarmId) {
      console.log('\n5. 测试获取告警详情');
      try {
        const alarmDetailResponse = await api.get(`/alarms/${testState.alarmId}`);
        console.log('告警详情:', {
          alarm_id: alarmDetailResponse.data.alarm_id,
          event_type: alarmDetailResponse.data.event_type,
          event_time: alarmDetailResponse.data.event_time,
          confidence: alarmDetailResponse.data.confidence,
          handled: alarmDetailResponse.data.handled,
          alarm_message: alarmDetailResponse.data.alarm_message
        });

        // 6. 确认告警
        console.log('\n6. 测试确认告警');
        const ackResponse = await api.post(`/alarms/${testState.alarmId}/ack`);
        console.log('告警确认成功');
      } catch (error) {
        throw error;
      }
    } else {
      console.log('\n5. 跳过告警详情和确认测试（没有告警记录）');
    }

    console.log('\n所有测试完成！');

  } catch (error) {
    console.error('\n测试失败');
    process.exit(1);
  }
}

// 运行测试
runTests(); 