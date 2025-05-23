# 跌倒检测系统API文档

## 目录
1. [基础信息](#基础信息)
2. [认证方式](#认证方式)
3. [设备端API](#设备端api)
   - [设备心跳](#设备心跳)
   - [事件上报](#事件上报)
4. [移动端API](#移动端api)
   - [用户认证](#用户认证)
   - [设备管理](#设备管理)
   - [告警管理](#告警管理)
5. [错误处理](#错误处理)
6. [示例代码](#示例代码)

## 基础信息
- 基础URL: `http://localhost:3000/api/v1`
- 数据格式: JSON
- 版本: v1

## 认证方式

### 设备认证
设备相关API需要在Header中添加:
```
Authorization: Device {device_token}
```

### 用户认证
移动端API(除登录/注册外)需要在Header中添加:
```
Authorization: Bearer {access_token}
```

## 设备端API

### 设备心跳

#### POST /device/heartbeat
设备定期发送心跳包，更新在线状态。

**请求参数：**
```json
{
  "device_id": "DEVICE_001",
  "timestamp": "2024-03-20T10:00:00Z",
  "status": "online",
  "temp": 45.2
}
```

**响应：**
```json
{
  "received": true
}
```

**使用示例：**
```bash
curl -X POST http://localhost:3000/api/v1/device/heartbeat \
  -H "Authorization: Device eyJhbGci..." \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "DEVICE_001",
    "timestamp": "2024-03-20T10:00:00Z",
    "status": "online",
    "temp": 45.2
  }'
```

### 事件上报

#### POST /device/event
设备检测到跌倒事件时上报。

**请求参数：** (multipart/form-data)
```
device_id: DEVICE_001
event_type: fall
timestamp: 2024-03-20T10:00:00Z
confidence: 0.95
image_file: <二进制图片文件>
video_file: <二进制视频文件>
```

**响应：**
```json
{
  "saved": true,
  "alarm_id": 1001,
  "message": "Event recorded"
}
```

**使用示例：**
```bash
curl -X POST http://localhost:3000/api/v1/device/event \
  -H "Authorization: Device eyJhbGci..." \
  -F "device_id=DEVICE_001" \
  -F "event_type=fall" \
  -F "timestamp=2024-03-20T10:00:00Z" \
  -F "confidence=0.95" \
  -F "image_file=@/path/to/image.jpg" \
  -F "video_file=@/path/to/video.mp4"
```

## 移动端API

### 用户认证

#### POST /auth/register
用户注册新账号。

**请求参数：**
```json
{
  "username": "user123",
  "password": "password123",
  "name": "User Name",
  "contact_info": "user@example.com"
}
```

**响应：**
```json
{
  "success": true,
  "user_id": 1
}
```

#### POST /auth/login
用户登录。

**请求参数：**
```json
{
  "username": "user123",
  "password": "password123"
}
```

**响应：**
```json
{
  "user": {
    "id": 1,
    "username": "user123",
    "name": "User Name",
    "contact_info": "user@example.com"
  },
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci..."
}
```

### 设备管理

#### POST /device/register
将设备注册并绑定到当前用户。这是一个原子操作，同时完成设备注册和用户绑定。

**完整路径：** `http://localhost:3000/api/v1/device/register`

**请求参数：**
```json
{
  "device_id": "DEVICE_001",
  "device_secret": "abcd1234",
  "device_name": "客厅摄像头",
  "model_version": "v1.0"
}
```

**请求头：**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**响应：**
```json
{
  "device_id": "DEVICE_001",
  "device_name": "客厅摄像头",
  "status": "offline",
  "token": "eyJhbGci..."
}
```

**错误响应：**
```json
{
  "error": "Device already bound to another user"
}
```
或
```json
{
  "error": "Failed to bind device"
}
```

**使用示例：**
```bash
curl -X POST http://localhost:3000/api/v1/device/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGci..." \
  -d '{
    "device_id": "DEVICE_001",
    "device_secret": "abcd1234",
    "device_name": "客厅摄像头",
    "model_version": "v1.0"
  }'
```

**说明：**
- 此接口需要用户认证（Bearer Token）
- 如果设备不存在，会创建新设备并绑定到当前用户
- 如果设备已存在但未绑定，会将其绑定到当前用户
- 如果设备已绑定到其他用户，会返回错误
- 成功后会返回设备令牌，用于后续设备认证

#### GET /device/info
获取当前用户绑定的设备详细信息。

**请求参数：**
- 需要在Header中携带用户token

**响应：**
```json
{
  "device_id": "DEVICE_001",
  "device_name": "客厅摄像头",
  "install_location": "老人房间",
  "status": "online",
  "last_active": "2024-03-20T10:00:00Z",
  "model_version": "v1.0",
  "config": {
    "threshold": 0.8,
    "record_video": true
  }
}
```

**错误响应：**
```json
{
  "error": "No device bound to user"
}
```

#### GET /device
获取当前用户的所有设备列表。

**请求参数：**
- 需要在Header中携带用户token

**响应：**
```json
[
  {
    "device_id": "DEVICE_001",
    "device_name": "客厅摄像头",
    "install_location": "老人房间",
    "status": "online",
    "last_active": "2024-03-20T10:00:00Z",
    "model_version": "v1.0"
  }
]
```

### 告警管理

#### GET /alarms
获取告警列表。

**请求参数：**
- `limit`: 返回记录数量限制
- `handled`: 是否已处理 (0/1)

**响应：**
```json
[
  {
    "alarm_id": 1001,
    "device_id": "DEVICE_001",
    "event_type": "fall",
    "event_time": "2024-03-20T10:00:00Z",
    "handled": false
  }
]
```

#### GET /alarms/{alarm_id}
获取告警详情。

**响应：**
```json
{
  "alarm_id": 1001,
  "device_id": "DEVICE_001",
  "event_type": "fall",
  "event_time": "2024-03-20T10:00:00Z",
  "confidence": 0.95,
  "image_url": "https://example.com/media/DEVICE_001_1001.jpg",
  "video_url": "https://example.com/media/DEVICE_001_1001.mp4",
  "handled": false,
  "alarm_message": "Detected a fall in living room"
}
```

#### POST /alarms/{alarm_id}/ack
标记告警为已处理。

**响应：**
```json
{
  "success": true
}
```

## 错误处理

### HTTP 错误代码
| 代码 | 描述 | 解决方案 |
|------|------|------|
| 400 | 请求参数错误 | 检查请求体格式和必填字段 |
| 401 | 未授权 | 检查认证token是否有效 |
| 403 | 禁止访问 | 检查用户权限 |
| 404 | 资源未找到 | 检查资源ID是否存在 |
| 500 | 服务器错误 | 联系管理员 |

### 常见错误响应
```json
{
  "error": "错误描述",
  "details": "详细错误信息",
  "code": "错误代码"
}
```

## 示例代码

### 设备端示例
```javascript
// 设备注册
const registerDevice = async () => {
  const response = await fetch('/api/v1/device/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      device_id: 'DEVICE_001',
      device_secret: 'abcd1234'
    })
  });
  const data = await response.json();
  // 保存设备token
  localStorage.setItem('deviceToken', data.device_token);
  return data;
};

// 发送心跳
const sendHeartbeat = async () => {
  const response = await fetch('/api/v1/device/heartbeat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Device ${localStorage.getItem('deviceToken')}`
    },
    body: JSON.stringify({
      device_id: 'DEVICE_001',
      timestamp: new Date().toISOString(),
      status: 'online',
      temp: 45.2
    })
  });
  return await response.json();
};
```

### 移动端示例
```javascript
// 用户登录
const login = async () => {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: 'user123',
      password: 'password123'
    })
  });
  const data = await response.json();
  // 保存token
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  return data;
};

// 获取告警列表
const getAlarms = async () => {
  const response = await fetch('/api/v1/alarms?limit=20', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
  return await response.json();
};
```

## 数据库结构

### 用户表 (users)
| 字段名 | 类型 | 描述 | 约束 |
|--------|------|------|------|
| user_id | INTEGER | 用户ID | 主键，自增 |
| username | VARCHAR(50) | 用户名 | 非空，唯一 |
| password_hash | VARCHAR(100) | 密码哈希 | 非空 |
| name | VARCHAR(100) | 用户姓名 | 非空 |
| contact_info | VARCHAR(100) | 联系方式 | 非空，邮箱格式 |
| created_at | TIMESTAMP | 创建时间 | 默认当前时间 |
| updated_at | TIMESTAMP | 更新时间 | 默认当前时间 |

### 设备表 (devices)
| 字段名 | 类型 | 描述 | 约束 |
|--------|------|------|------|
| device_id | VARCHAR(50) | 设备ID | 主键 |
| device_name | VARCHAR(100) | 设备名称 | 非空 |
| user_id | INTEGER | 用户ID | 外键关联users表 |
| install_location | VARCHAR(100) | 安装位置 | 非空 |
| device_secret | VARCHAR(100) | 设备密钥 | 非空 |
| status | VARCHAR(20) | 设备状态 | 非空 |
| model_version | VARCHAR(50) | 模型版本 | 非空 |
| last_active | TIMESTAMP | 最后活动时间 | 默认当前时间 |
| config_json | JSONB | 设备配置信息 | 默认空对象 |
| created_at | TIMESTAMP | 创建时间 | 默认当前时间 |
| updated_at | TIMESTAMP | 更新时间 | 默认当前时间 |

### 报警记录表 (alarm_records)
| 字段名 | 类型 | 描述 | 约束 |
|--------|------|------|------|
| alarm_id | BIGINT | 报警ID | 主键，自增 |
| device_id | VARCHAR(50) | 设备ID | 外键关联devices表 |
| user_id | INTEGER | 用户ID | 外键关联users表 |
| event_type | VARCHAR(20) | 事件类型 | 非空 |
| event_time | TIMESTAMP | 事件时间 | 非空 |
| image_path | VARCHAR(255) | 图片路径 | 可为空 |
| video_path | VARCHAR(255) | 视频路径 | 可为空 |
| confidence | FLOAT | 置信度 | 可为空 |
| handled | BOOLEAN | 处理状态 | 默认false |
| alarm_message | VARCHAR(255) | 报警信息 | 可为空 |
| created_at | TIMESTAMP | 创建时间 | 默认当前时间 |
| updated_at | TIMESTAMP | 更新时间 | 默认当前时间 |

### 视频表 (videos)
| 字段名 | 类型 | 描述 | 约束 |
|--------|------|------|------|
| video_id | BIGINT | 视频ID | 主键，自增 |
| alarm_id | BIGINT | 报警ID | 外键关联alarm_records表 |
| device_id | VARCHAR(50) | 设备ID | 外键关联devices表 |
| start_time | TIMESTAMP | 开始时间 | 非空 |
| duration | INTEGER | 时长(秒) | 非空 |
| file_path | VARCHAR(255) | 文件路径 | 非空 |
| file_size | INTEGER | 文件大小 | 可为空 |
| format | VARCHAR(50) | 视频格式 | 可为空 |
| created_at | TIMESTAMP | 创建时间 | 默认当前时间 |
| updated_at | TIMESTAMP | 更新时间 | 默认当前时间 |
</rewritten_file>