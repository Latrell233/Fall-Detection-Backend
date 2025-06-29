# 跌倒检测系统 API 文档

## 一、嵌入式设备端 API

### 1. 设备认证与注册 [已验证]
```
POST /api/v1/devices/register
Authorization: Bearer {user_access_token}
Content-Type: application/json

请求体：
{
  "device_id": "DEVICE_001",      // 必填
  "device_secret": "abcd1234",    // 必填
  "install_location": "老人房间"   // 可选
}

响应：
{
  "success": true,
  "data": {
    "device_id": "DEVICE_001",
    "status": "offline",
    "device_token": "eyJhbGci...",  // 设备后续API使用的token
    "install_location": "老人房间"
  }
}

错误响应：
{
  "error": "User already has a bound device",
  "details": "User already bound to device: DEVICE_002"
}
```

### 2. 设备心跳 [已验证]
```
POST /api/v1/devices/heartbeat
Authorization: Device {device_token}
Content-Type: application/json

请求体：
{
  "device_id": "DEVICE_001",
  "timestamp": "2024-03-20T10:00:00Z",
  "status": "online",
  "temp": 45.2
}

响应：
{
  "success": true,
  "data": {
    "received": true,
    "last_active": "2024-03-20T10:00:00Z"
  }
}

错误响应：
{
  "error": "Invalid device token",
  "details": "The provided device token is invalid or expired"
}
```

### 3. 事件上报 [已验证]
```
POST /api/v1/devices/event
Authorization: Device {device_token}
Content-Type: application/json

请求体：
{
  "device_id": "DEVICE_001",    // 必填
  "event_type": "fall",         // 必填，只能是 fall, abnormal, other
  "event_time": "2024-03-20T10:00:00Z",  // 必填，ISO格式
  "confidence": 0.95,           // 必填，0-1之间
  "image_path": "/images/DEVICE_001/1234567890.jpg",  // 可选
  "video_path": "/videos/DEVICE_001/1234567890.mp4",  // 可选
  "alarm_message": "检测到跌倒"  // 可选
}

响应：
{
  "success": true,
  "data": {
    "alarm_id": "42",
    "device_id": "DEVICE_001",
    "event_type": "fall",
    "event_time": "2024-03-20T10:00:00.000Z",
    "confidence": 0.95,
    "handled": false,
    "video_path": "/videos/DEVICE_001/1234567890.mp4",
    "created_at": "2024-03-20T10:00:00.000Z"
  }
}

错误响应：
{
  "error": "Invalid event data",
  "details": "Event type must be one of: fall, abnormal, other"
}
```

### 4. 设备解绑 [已验证]
```
POST /api/v1/devices/unbind
Authorization: Bearer {access_token}
Content-Type: application/json

请求体：
{
  // 无需指定device_id，系统会自动解绑用户的设备
}

响应：
{
  "success": true,
  "message": "Device unbound successfully"
}

错误响应：
{
  "error": "No device found for user",
  "details": "The user does not have any bound device"
}
```

### 5. 获取设备详情 [已验证]
```
GET /api/v1/devices/info
Authorization: Bearer {access_token}

响应：
{
  "success": true,
  "data": {
    "device_id": "DEVICE_001",
    "status": "online",
    "install_location": "老人房间",
    "last_active": "2024-03-20T10:00:00Z",
    "config_json": {}
  }
}

错误响应：
{
  "error": "No device bound to user",
  "details": "The user does not have any bound device"
}
```

## 二、移动端 API

### 1. 用户认证 [已验证]
```
POST /api/v1/auth/register
Content-Type: application/json

请求体：
{
  "username": "user123",        // 必填
  "password": "password123"     // 必填
}

响应：
{
  "success": true,
  "user_id": 1
}

错误响应：
{
  "error": "Registration failed",
  "details": "Username already exists"
}

POST /api/v1/auth/login
Content-Type: application/json

请求体：
{
  "username": "user123",
  "password": "password123"
}

响应：
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "user123"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

错误响应：
{
  "error": "Invalid credentials"
}
```

### 2. 设备管理 [已验证]
```
POST /api/v1/devices/register
Authorization: Bearer {user_access_token}
Content-Type: application/json

请求体：
{
  "device_id": "DEVICE_001",
  "device_secret": "abcd1234",  // 必填
  "install_location": "老人房间"
}

响应：
{
  "success": true,
  "data": {
    "device_id": "DEVICE_001",
    "status": "offline",
    "device_token": "eyJhbGci...",  // 设备后续API使用的token
    "install_location": "老人房间"
  }
}

GET /api/v1/devices
Authorization: Bearer {access_token}

响应：
{
  "code": 1,
  "message": "获取设备列表成功",
  "data": [
    {
      "device_id": "DEVICE_001",
      "install_location": "老人房间",
      "status": "online",
      "last_active": "2024-03-20T10:00:00Z"
    }
  ]
}

无设备时响应：
{
  "code": 0,
  "message": "无已绑定设备",
  "data": null
}

错误响应：
{
  "code": -1,
  "message": "获取设备列表失败",
  "error": "错误详情"
}

PUT /api/v1/devices/status
Authorization: Bearer {access_token}
Content-Type: application/json

请求体：
{
  "status": "online"  // 必填，只能是 online 或 offline
}

响应：
{
  "success": true,
  "message": "Device status updated successfully"
}

DELETE /api/v1/devices
Authorization: Bearer {access_token}

响应：
{
  "success": true,
  "message": "Device deleted successfully"
}

POST /api/v1/devices/event
Authorization: Device {device_token}
Content-Type: application/json

请求体：
{
  "device_id": "DEVICE_001",    // 必填
  "event_type": "fall",         // 必填，只能是 fall, abnormal, other
  "event_time": "2024-03-20T10:00:00Z",  // 必填，ISO格式
  "confidence": 0.95,           // 必填，0-1之间
  "image_path": "/images/DEVICE_001/1234567890.jpg",  // 可选
  "video_path": "/videos/DEVICE_001/1234567890.mp4",  // 可选
  "alarm_message": "检测到跌倒"  // 可选
}

响应：
{
  "success": true,
  "data": {
    "alarm_id": 2,
    "device_id": "DEVICE_001",
    "event_type": "fall",
    "event_time": "2024-03-20T10:00:00.000Z",
    "confidence": 0.95,
    "handled": false,
    "video_path": "test.mp4",
    "created_at": "2024-03-20T10:00:00.000Z"
  }
}
```

### 3. 告警管理 [已验证]
```
GET /api/v1/alarms
Authorization: Bearer {access_token}
Query参数：
- from: 开始时间（ISO格式）
- to: 结束时间（ISO格式，必须大于from）
- status: 告警状态（只能是 handled 或 unhandled）
- device_id: 设备ID
- minConfidence: 最小置信度（0-1之间）

响应：
{
  "success": true,
  "data": {
    "alarms": [
      {
        "alarm_id": "42",
        "device_id": "DEVICE_001",
        "event_type": "fall",
        "event_time": "2024-03-20T10:00:00Z",
        "confidence": 0.95,
        "image_path": "/images/DEVICE_001/1234567890.jpg",
        "video_path": "/videos/DEVICE_001/1234567890.mp4",
        "alarm_message": "检测到跌倒",
        "handled": false,
        "created_at": "2024-03-20T10:00:00Z",
        "device": {
          "device_name": "客厅摄像头",
          "install_location": "老人房间"
        }
      }
    ],
    "total": 1
  }
}

GET /api/v1/alarms/{alarmId}
Authorization: Bearer {access_token}

响应：
{
  "success": true,
  "data": {
    "alarm_id": "42",
    "device_id": "DEVICE_001",
    "event_type": "fall",
    "event_time": "2024-03-20T10:00:00Z",
    "confidence": 0.95,
    "image_path": "/images/DEVICE_001/1234567890.jpg",
    "video_path": "/videos/DEVICE_001/1234567890.mp4",
    "alarm_message": "检测到跌倒",
    "handled": false,
    "created_at": "2024-03-20T10:00:00Z",
    "device": {
      "device_name": "客厅摄像头",
      "install_location": "老人房间"
    },
    "video": {
      "video_id": 1,
      "video_path": "/videos/DEVICE_001/1234567890.mp4",
      "duration": 30,
      "format": "mp4"
    }
  }
}

POST /api/v1/alarms/{alarmId}/ack
Authorization: Bearer {access_token}
Content-Type: application/json

请求体：
{
  "action": "confirm",  // 必填，只能是 confirm 或 dismiss
  "message": "已通知家属"  // 可选，最大255字符
}

响应：
{
  "success": true,
  "message": "Alarm acknowledged successfully"
}
```

### 4. 用户管理 [已验证]
```
GET /api/v1/users/me
Authorization: Bearer {access_token}

响应：
{
  "success": true,
  "data": {
    "id": 1,
    "username": "user123"
  }
}

错误响应：
{
  "error": "User not found",
  "details": "The specified user does not exist"
}

PUT /api/v1/users/me/username
Authorization: Bearer {access_token}
Content-Type: application/json

请求体：
{
  "newUsername": "newuser123"  // 必填，3-30个字符
}

响应：
{
  "success": true,
  "message": "Username updated successfully",
  "data": {
    "id": 1,
    "username": "newuser123"
  }
}

错误响应：
{
  "error": "Username already exists",
  "details": "The new username is already taken"
}

验证错误响应：
{
  "errors": [
    {
      "field": "body.newUsername",
      "message": "Username must be at least 3 characters long"
    }
  ]
}

PUT /api/v1/users/me/password
Authorization: Bearer {access_token}
Content-Type: application/json

请求体：
{
  "newPassword": "newpassword123"  // 必填，最少6个字符
}

响应：
{
  "success": true,
  "message": "Password updated successfully"
}

验证错误响应：
{
  "errors": [
    {
      "field": "body.newPassword",
      "message": "Password must be at least 6 characters long"
    }
  ]
}

DELETE /api/v1/users/me
Authorization: Bearer {access_token}

响应：
{
  "success": true,
  "message": "User deleted successfully"
}

错误响应：
{
  "error": "Failed to delete user",
  "details": "错误详情"
}
```

### 5. 反馈管理 [已验证]
```
POST /api/v1/feedback
Authorization: Bearer {access_token}
Content-Type: application/json

请求体：
{
  "rating": 4,                    // 必填，0-5的整数
  "content": "应用很好用，界面简洁"  // 可选，最大1000字符
}

响应：
{
  "success": true,
  "message": "Feedback submitted successfully",
  "data": {
    "feedback_id": 1,
    "rating": 4,
    "content": "应用很好用，界面简洁",
    "created_at": "2024-03-20T10:00:00.000Z"
  }
}

验证错误响应：
{
  "errors": [
    {
      "field": "body.rating",
      "message": "Rating must be at least 0"
    }
  ]
}

GET /api/v1/feedback
Authorization: Bearer {access_token}

响应：
{
  "success": true,
  "data": {
    "feedback_id": 1,
    "rating": 4,
    "content": "应用很好用，界面简洁",
    "created_at": "2024-03-20T10:00:00.000Z"
  }
}

无反馈时响应：
{
  "error": "No feedback found",
  "details": "User has not submitted any feedback yet"
}
```

## 三、通用说明

### 健康检查 [已验证]
```
GET /health

响应：
{
  "status": "OK"
}

错误响应：
{
  "error": "Internal Server Error",
  "details": "错误详情"
}
```

### 认证方式
- 用户认证：Bearer Token
  - 格式：`Authorization: Bearer {token}`
  - 有效期：15分钟
- 设备认证：Device Token
  - 格式：`Authorization: Device {token}`
  - 有效期：30天

### 重要变更说明
**用户与设备关系已更新为一对一关系：**
- 每个用户只能绑定一个设备
- 设备注册时会检查用户是否已有绑定设备
- 设备解绑和删除操作不再需要指定设备ID
- API路由已简化，移除设备ID参数

### 文件存储说明
1. 基础目录结构：
   - 上传目录：`/uploads/`
     - 图片上传：`/uploads/images/{device_id}/{timestamp}.jpg`
     - 视频上传：`/uploads/videos/{device_id}/{timestamp}.mp4`
   - 公共目录：`/public/`
     - 图片访问：`/public/images/{device_id}/{timestamp}.jpg`
     - 视频访问：`/public/videos/{device_id}/{timestamp}.mp4`

2. 文件命名规则：
   - 图片：`{device_id}_{timestamp}.jpg`
   - 视频：`{device_id}_{timestamp}.mp4`

3. 访问URL：
   - 图片：`http://{domain}/api/v1/media/images/{device_id}/{timestamp}.jpg`
   - 视频：`http://{domain}/api/v1/media/videos/{device_id}/{timestamp}.mp4`