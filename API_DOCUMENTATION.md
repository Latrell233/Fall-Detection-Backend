# 跌倒检测系统 API 文档

## 一、嵌入式设备端 API

### 1. 设备认证与注册
```
POST /api/v1/devices/register
Authorization: Bearer {user_access_token}
Content-Type: application/json

请求体：
{
  "device_id": "DEVICE_001",
  "device_secret": "abcd1234",
  "device_name": "客厅摄像头",
  "model_version": "v1.0",
  "install_location": "老人房间"
}

响应：
{
  "success": true,
  "data": {
    "device_id": "DEVICE_001",
    "device_name": "客厅摄像头",
    "status": "offline",
    "device_token": "eyJhbGci...",  // 设备后续API使用的token
    "install_location": "老人房间",
    "model_version": "v1.0"
  }
}

错误响应：
{
  "error": "Device already registered",
  "details": "This device ID is already registered to another user"
}
```

### 2. 设备心跳
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

### 3. 事件上报
```
POST /api/v1/devices/event
Authorization: Device {device_token}
Content-Type: application/json 或 multipart/form-data

请求体(JSON)：
{
  "device_id": "DEVICE_001",
  "event_type": "fall",  // fall, abnormal, other
  "event_time": "2024-03-20T10:00:00Z",
  "confidence": 0.95,
  "image_path": "test.jpg",  // 可选
  "video_path": "test.mp4",  // 可选
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

错误响应：
{
  "error": "Invalid event data",
  "details": "Event type must be one of: fall, abnormal, other"
}
```

### 4. 设备解绑
```
POST /api/v1/devices/unbind
Authorization: Bearer {access_token}
Content-Type: application/json

请求体：
{
  "device_id": "DEVICE_001"
}

响应：
{
  "success": true,
  "message": "Device unbound successfully"
}

错误响应：
{
  "error": "Device not found",
  "details": "The specified device does not exist or is not bound to your account"
}

### 5. 获取设备详情
```
GET /api/v1/devices/info
Authorization: Bearer {access_token}
Query参数：
- device_id: 设备ID

响应：
{
  "success": true,
  "data": {
    "device_id": "DEVICE_001",
    "device_name": "客厅摄像头",
    "status": "online",
    "install_location": "老人房间",
    "model_version": "v1.0",
    "last_active": "2024-03-20T10:00:00Z",
    "config_json": {}
  }
}

错误响应：
{
  "error": "Device not found",
  "details": "The specified device does not exist"
}
```

### 6. 删除设备
```
DELETE /api/v1/devices/{deviceId}
Authorization: Bearer {access_token}

响应：
{
  "success": true,
  "message": "Device deleted successfully"
}

错误响应：
{
  "error": "Device not found",
  "details": "The specified device does not exist"
}
```

## 二、移动端 API

### 1. 用户认证
```
POST /api/v1/auth/register
Content-Type: application/json

请求体：
{
  "username": "user123",
  "password": "password123",
  "name": "User Name",
  "contact_info": "user@example.com"
}

响应：
{
  "success": true,
  "user_id": 1
}

错误响应：
{
  "error": "Registration failed",
  "details": "Username already exists",
  "code": "23505"  // PostgreSQL唯一约束违反错误码
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
      "username": "user123",
      "name": "User Name",
      "contact_info": "user@example.com"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

错误响应：
{
  "error": "Invalid credentials"
}

POST /api/v1/auth/refresh
Content-Type: application/json

请求体：
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

响应：
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

错误响应：
{
  "error": "Invalid refresh token",
  "details": "Token has expired or is invalid"
}

POST /api/v1/auth/reset-password
Content-Type: application/json

请求体：
{
  "username": "user123"
}

响应：
{
  "success": true,
  "message": "Password reset email sent"
}

错误响应：
{
  "error": "User not found"
}

POST /api/v1/auth/reset-password/:token
Content-Type: application/json

请求体：
{
  "newPassword": "newpassword123"
}

响应：
{
  "success": true,
  "message": "Password reset successful"
}

错误响应：
{
  "error": "Invalid or expired token",
  "details": "Token has expired or is invalid"
}
```

### 2. 设备管理
```
POST /api/v1/devices/register
Authorization: Bearer {user_access_token}
Content-Type: application/json

请求体：
{
  "device_id": "DEVICE_001",
  "device_secret": "abcd1234",  // 必填，6-100字符
  "device_name": "客厅摄像头",  // 必填，2-100字符
  "model_version": "v1.0",     // 必填，最大50字符
  "install_location": "老人房间"
}

响应：
{
  "success": true,
  "data": {
    "device_id": "DEVICE_001",
    "device_name": "客厅摄像头",
    "status": "offline",
    "device_token": "eyJhbGci...",  // 设备后续API使用的token
    "install_location": "老人房间",
    "model_version": "v1.0"
  }
}

PUT /api/v1/devices/{deviceId}/status
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

POST /api/v1/devices/event
Authorization: Device {device_token}
Content-Type: application/json

请求体：
{
  "device_id": "DEVICE_001",    // 必填，最大50字符
  "event_type": "fall",         // 必填，只能是 fall, abnormal, other
  "event_time": "2024-03-20T10:00:00Z",  // 必填，ISO格式
  "confidence": 0.95,           // 必填，0-1之间
  "image_path": "test.jpg",     // 可选，最大255字符
  "video_path": "test.mp4",     // 可选，最大255字符
  "alarm_message": "检测到跌倒"  // 可选，最大255字符
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

### 3. 告警管理
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
        "alarm_id": 1,
        "device_id": "DEVICE_001",
        "event_type": "fall",
        "event_time": "2024-03-20T10:00:00Z",
        "confidence": 0.95,
        "image_path": "test.jpg",
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
    "alarm_id": 1,
    "device_id": "DEVICE_001",
    "event_type": "fall",
    "event_time": "2024-03-20T10:00:00Z",
    "confidence": 0.95,
    "image_path": "test.jpg",
    "video_path": "test.mp4",
    "alarm_message": "检测到跌倒",
    "handled": false,
    "created_at": "2024-03-20T10:00:00Z",
    "device": {
      "device_name": "客厅摄像头",
      "install_location": "老人房间"
    },
    "video": {
      "video_id": 1,
      "file_path": "test.mp4",
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

### 4. 用户管理
```
GET /api/v1/users/me
Authorization: Bearer {access_token}

响应：
{
  "success": true,
  "data": {
    "id": 1,
    "username": "user123",
    "name": "User Name",
    "contact_info": "user@example.com"
  }
}

错误响应：
{
  "error": "User not found",
  "details": "The specified user does not exist"
}
```

## 三、通用说明

### 健康检查
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

### 数据库配置
- 数据库类型：PostgreSQL
- 时区设置：UTC+8
- 连接池配置：
  - 最大连接数：5
  - 最小连接数：0
  - 获取连接超时：30秒
  - 空闲连接超时：10秒

### 认证方式