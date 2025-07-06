# 跌倒检测系统后端服务

## 项目简介
这是一个基于Node.js和Express的跌倒检测系统后端服务，提供完整的IoT设备管理、智能告警处理、用户认证授权、媒体文件管理等功能。系统采用RESTful API设计，支持嵌入式设备和移动端应用的数据交互，具备实时MQTT通信能力。

### 核心特性
- 🏠 **一对一设备绑定**：每个用户只能绑定一个设备，简化管理
- 🔐 **多重认证机制**：用户Token、设备Token、Refresh Token、重置Token
- 📱 **实时通信**：MQTT消息推送，设备状态实时监控
- 📊 **智能告警**：置信度评估，多种事件类型支持
- 📁 **媒体管理**：图片视频上传存储，分类管理
- ⭐ **反馈系统**：用户评分反馈，持续改进
- 🛡️ **安全防护**：数据验证、安全头、CORS控制

## 功能特性
- **用户认证**：用户注册、登录、密码重置、JWT认证、Token刷新
- **设备管理**：设备注册、心跳检测、状态监控、一对一用户绑定
- **告警处理**：跌倒检测、异常行为识别、告警确认、置信度评估
- **媒体管理**：图片和视频上传、存储、访问、文件分类管理
- **反馈系统**：用户评分、反馈内容收集
- **实时通信**：MQTT消息推送、设备状态监控
- **健康检查**：服务状态监控

## 技术栈
- **运行环境**：Node.js >= 18.0.0
- **Web框架**：Express.js
- **数据库**：PostgreSQL
- **ORM**：Sequelize
- **认证**：JWT (jsonwebtoken)
- **密码加密**：bcrypt
- **文件上传**：multer
- **数据验证**：Joi
- **消息通信**：MQTT (mqtt.js)
- **容器化**：Docker & Docker Compose
- **安全**：helmet, cors
- **日志**：morgan
- **工具库**：moment, uuid, validator

## 项目结构
```
backend/
├── src/                    # 源代码目录
│   ├── controllers/        # 控制器层
│   │   ├── authController.js      # 用户认证控制器
│   │   ├── deviceController.js    # 设备管理控制器
│   │   ├── alarmController.js     # 告警处理控制器
│   │   ├── userController.js      # 用户管理控制器
│   │   └── feedbackController.js  # 反馈管理控制器
│   ├── routes/            # 路由层
│   │   ├── v1/           # API v1版本
│   │   │   ├── auth.js           # 认证路由
│   │   │   ├── devices.js        # 设备路由
│   │   │   ├── alarms.js         # 告警路由
│   │   │   ├── users.js          # 用户路由
│   │   │   ├── media.js          # 媒体路由
│   │   │   └── feedback.js       # 反馈路由
│   │   └── index.js      # 路由入口
│   ├── db/                # 数据库层
│   │   ├── models/       # 数据模型
│   │   │   ├── User.js           # 用户模型
│   │   │   ├── Device.js         # 设备模型
│   │   │   ├── AlarmRecord.js    # 告警记录模型
│   │   │   ├── Video.js          # 视频模型
│   │   │   └── Feedback.js       # 反馈模型
│   │   ├── migrations/   # 数据库迁移
│   │   ├── index.js      # 数据库连接
│   │   └── init.js       # 数据库初始化
│   ├── middleware/        # 中间件层
│   │   ├── auth.js       # 用户认证中间件
│   │   ├── deviceAuth.js # 设备认证中间件
│   │   └── validation.js # 数据验证中间件
│   ├── services/          # 服务层
│   │   └── mqttService.js # MQTT通信服务
│   ├── validation/        # 数据验证层
│   │   ├── authSchemas.js     # 认证验证模式
│   │   ├── deviceSchemas.js   # 设备验证模式
│   │   ├── alarmSchemas.js    # 告警验证模式
│   │   ├── feedbackSchemas.js # 反馈验证模式
│   │   └── mediaSchemas.js    # 媒体验证模式
│   ├── app.js            # 应用入口
│   └── db.js             # 数据库配置
├── config/                # 配置文件目录
│   └── config.js         # 应用配置
├── uploads/              # 文件上传目录
│   ├── temp/            # 临时文件目录
│   ├── images/          # 图片存储
│   └── videos/          # 视频存储
├── public/              # 公共访问目录
├── test_downloads/     # 测试下载目录
├── nginx/              # Nginx配置目录
├── livekit/            # LiveKit配置目录
├── API_DOCUMENTATION.md   # API文档
├── 数据库表结构.md         # 数据库设计文档
├── 架构文档.md             # 系统架构文档
├── Dockerfile            # Docker构建文件
├── docker-compose.yml    # Docker编排配置
├── package.json         # 项目依赖配置
├── jest.config.js       # Jest测试配置
├── api_test.sh         # API测试脚本
├── event_test.sh       # 事件测试脚本
└── README.md            # 项目说明文档
```

## 快速开始

### 本地开发
```bash
# 克隆项目
git clone https://github.com/Latrell233/Fall-Detection-Backend.git
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑.env文件，配置必要的环境变量

# 启动开发服务器
npm run dev
```

### 环境要求
- Node.js >= 18.0.0
- PostgreSQL >= 12
- Docker >= 20.0
- Docker Compose >= 2.0
- 至少 2GB 可用内存
- 至少 10GB 可用磁盘空间

### 安装步骤
1. 克隆项目
```bash
git clone https://github.com/Latrell233/Fall-Detection-Backend.git
cd backend
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑.env文件，配置必要的环境变量
```

4. 启动服务
```bash
# 开发环境
npm run dev

# 生产环境
docker-compose up -d
```

5. 初始化数据库
```bash
# 初始化数据库（包含表结构和测试数据）
node src/db/init.js

# 如果需要强制重建表（会删除所有现有数据）
node src/db/init.js --force
```

### 数据库初始化
```bash
# 初始化数据库（包含表结构和测试数据）
node src/db/init.js

# 如果需要强制重建表（会删除所有现有数据）
node src/db/init.js --force
```

## 快速部署指南

### 1. 克隆仓库
```bash
git clone https://github.com/Latrell233/Fall-Detection-Backend.git
cd backend
```

### 2. 环境准备
```bash
# 创建必要的目录
mkdir -p uploads/temp uploads/images uploads/videos public test_downloads

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置必要的环境变量
```

### 3. 使用 Docker Compose 部署
```bash
# 启动所有服务
docker-compose up -d

# 等待服务启动完成（约30秒）
# 检查服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f
```

### 4. 初始化数据库
```bash
# 进入后端容器
docker-compose exec backend sh

# 运行数据库初始化脚本
node src/db/init.js
```

### 5. 验证部署
- 访问健康检查接口：http://localhost:3000/health
- 运行测试脚本：
  ```bash
  # API测试
  ./api_test.sh
  
  # 事件测试
  ./event_test.sh
  
  # 性能测试
  ./performance_test.sh
  ```

### 6. 常见问题处理
1. 如果遇到权限问题：
```bash
# 检查目录权限
ls -la uploads public test_downloads

# 如果需要，修改权限
chmod -R 755 uploads public test_downloads
```

2. 如果需要重新部署：
```bash
# 停止并删除所有容器和数据
docker-compose down -v

# 重新构建并启动
docker-compose up -d --build
```

3. 如果需要查看日志：
```bash
# 查看所有服务的日志
docker-compose logs -f

# 只查看后端服务的日志
docker-compose logs -f backend
```

## 部署说明

### Docker部署
1. 准备环境
```bash
# 创建必要的目录
mkdir -p uploads/temp uploads/images uploads/videos public test_downloads

# 复制环境变量文件
cp .env.example .env
# 编辑 .env 文件，配置必要的环境变量
```

2. 启动服务
```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f
```

3. 初始化数据库
```bash
# 进入后端容器
docker-compose exec backend sh

# 运行数据库初始化脚本
node src/db/init.js
```

4. 访问服务
- 后端API: http://localhost:3000
- 健康检查: http://localhost:3000/health

5. 停止服务
```bash
# 停止所有服务
docker-compose down

# 停止并删除所有数据（包括数据库数据）
docker-compose down -v
```

### 部署注意事项
1. 系统要求
   - Docker 版本 >= 20.0
   - Docker Compose 版本 >= 2.0
   - Node.js >= 18.0.0
   - PostgreSQL >= 12
   - 至少 2GB 可用内存
   - 至少 10GB 可用磁盘空间

2. 性能优化
   - 调整 Docker 守护进程配置
   - 配置适当的日志轮转
   - 设置合理的资源限制
   - 数据库连接池优化
   - 文件上传大小限制（50MB）

### 环境变量配置
- `DB_HOST`: 数据库主机（Docker环境使用 'db'）
- `DB_PORT`: 数据库端口（默认 5432）
- `DB_USER`: 数据库用户名（默认 postgres）
- `DB_PASSWORD`: 数据库密码
- `DB_NAME`: 数据库名称（默认 fall_detection）
- `DB_SSL`: 数据库SSL连接（默认 false）
- `JWT_SECRET`: JWT密钥
- `PORT`: 服务器端口（默认 3000）
- `NODE_ENV`: 运行环境（development/production）
- `MQTT_BROKER`: MQTT代理地址（默认 mqtt://localhost:1883）
- `UPLOAD_DIR`: 文件上传目录（默认 uploads）

## 监控与维护

### 健康检查
- 端点：`GET /health`
- 用途：服务状态监控、容器健康检查
- 响应：`{ "status": "OK" }`

### 日志管理
- **访问日志**：Morgan中间件记录API请求
- **错误日志**：统一异常处理记录系统错误
- **调试日志**：请求路径记录
- **业务日志**：关键操作记录
- **MQTT日志**：连接状态监控

## 安全说明
- **认证机制**：所有API请求需要认证（除健康检查外）
- **密码安全**：使用bcrypt加密存储（10轮盐值）
- **Token管理**：JWT认证、Refresh Token、Device Token
- **文件安全**：文件上传限制大小（50MB）和类型
- **数据验证**：Joi数据验证中间件
- **安全头**：Helmet安全防护
- **CORS配置**：跨域请求控制

## 测试
```bash
# 运行API测试
./api_test.sh

# 运行事件测试
./event_test.sh

# 运行性能测试
./performance_test.sh

# 运行单元测试
npm test

# 运行测试覆盖率
npm run test:coverage
```

## API使用示例

### 用户认证
```bash
# 用户注册
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'

# 用户登录
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```

### 设备管理
```bash
# 设备注册（需要用户Token）
curl -X POST http://localhost:3000/api/v1/devices/register \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"device_id": "DEVICE_001", "device_secret": "secret123", "install_location": "客厅"}'

# 设备心跳
curl -X POST http://localhost:3000/api/v1/devices/heartbeat \
  -H "Authorization: Device DEVICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"device_id": "DEVICE_001", "status": "online"}'
```

### 告警处理
```bash
# 事件上报
curl -X POST http://localhost:3000/api/v1/devices/event \
  -H "Authorization: Device DEVICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"device_id": "DEVICE_001", "event_type": "fall", "confidence": 0.95}'

# 获取告警列表
curl -X GET http://localhost:3000/api/v1/alarms \
  -H "Authorization: Bearer USER_TOKEN"
```

## 文档
- **API文档**：`API_DOCUMENTATION.md` - 完整的API接口文档
- **数据库结构**：`数据库表结构.md` - 数据库表结构设计
- **系统架构**：`架构文档.md` - 系统架构设计文档

## 开发指南

### 代码规范
- 使用ESLint进行代码检查
- 使用Prettier进行代码格式化
- 遵循RESTful API设计规范
- 使用Joi进行数据验证

### 测试策略
- 单元测试：测试单个函数和模块
- 集成测试：测试API接口
- API测试：端到端功能测试
- 性能测试：负载和压力测试

### 贡献指南
1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

### 提交规范
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

## 部署架构

### 容器化部署
系统采用Docker容器化部署，包含以下服务：
- **Nginx**: 反向代理和负载均衡
- **Backend**: Node.js应用服务
- **PostgreSQL**: 主数据库
- **EMQX**: MQTT消息代理（可选）

### 扩展服务
- **LiveKit**: 实时音视频通信（预留）
- **AI Agent**: 智能语音助手（预留）

## 故障排除

### 常见问题
1. **数据库连接失败**
   - 检查数据库服务是否启动
   - 验证环境变量配置
   - 确认网络连接

2. **文件上传失败**
   - 检查目录权限
   - 验证文件大小限制
   - 确认文件类型

3. **MQTT连接失败**
   - 检查MQTT代理服务
   - 验证网络连接
   - 确认主题配置

### 日志查看
```bash
# 查看应用日志
docker-compose logs -f backend

# 查看数据库日志
docker-compose logs -f db

# 查看Nginx日志
docker-compose logs -f nginx
```

## 许可证
MIT