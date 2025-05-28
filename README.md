# 跌倒检测系统后端服务

## 项目简介
这是一个基于Node.js和Express的跌倒检测系统后端服务，提供设备管理、告警处理、用户认证等功能。系统采用RESTful API设计，支持嵌入式设备和移动端应用的数据交互。

## 功能特性
- 设备管理：设备注册、心跳检测、状态监控
- 告警处理：跌倒检测、异常行为识别、告警确认
- 用户认证：JWT认证、密码重置、Token刷新
- 视频管理：视频存储、回放、下载
- 健康检查：服务状态监控、容器健康检查

## 技术栈
- 运行环境：Node.js
- Web框架：Express
- 数据库：PostgreSQL
- ORM：Sequelize
- 消息队列：MQTT (EMQX)
- 容器化：Docker
- 认证：JWT
- 文件存储：本地文件系统

## 项目结构
```
backend/
├── src/                    # 源代码目录
│   ├── controllers/        # 控制器
│   ├── routes/            # 路由
│   ├── db/                # 数据库模型和迁移
│   ├── middleware/        # 中间件
│   ├── services/          # 服务
│   ├── validation/        # 数据验证
│   ├── app.js            # 应用入口
│   └── db.js             # 数据库配置
├── config/                # 配置文件目录
├── node_modules/          # 依赖包目录
├── API_DOCUMENTATION.md   # API文档
├── 数据库表结构.md         # 数据库设计文档
├── Dockerfile            # Docker构建文件
├── docker-compose.yml    # Docker编排配置
├── package.json         # 项目依赖配置
├── package-lock.json    # 依赖版本锁定文件
├── jest.config.js       # Jest测试配置
└── README.md            # 项目说明文档
```

## 快速开始

### 环境要求
- Node.js >= 14
- PostgreSQL >= 13
- Docker & Docker Compose

### 安装步骤
1. 克隆项目
```bash
git clone [项目地址]
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

### 数据库初始化
```bash
npm run db:migrate
npm run db:seed
```

## 部署说明

### Docker部署
1. 构建镜像
```bash
docker build -t fall-detection-backend .
```

2. 启动服务
```bash
docker-compose up -d
```

### 环境变量配置
- `DB_HOST`: 数据库主机
- `DB_PORT`: 数据库端口
- `DB_USER`: 数据库用户名
- `DB_PASSWORD`: 数据库密码
- `JWT_SECRET`: JWT密钥
- `MQTT_BROKER`: MQTT服务器地址
- `UPLOAD_DIR`: 文件上传目录

## 监控与维护

### 健康检查
- 端点：`GET /health`
- 用途：服务状态监控、容器健康检查
- 响应：`{ "status": "OK" }`

### 日志管理
- 访问日志：记录API请求
- 错误日志：记录系统错误
- 设备日志：记录设备活动

## 安全说明
- 所有API请求需要认证（除健康检查外）
- 密码使用bcrypt加密存储
- 使用JWT进行身份验证
- 文件上传限制大小和类型
- CORS配置限制跨域请求

## 测试
```bash
# 运行单元测试
npm test

# 运行集成测试
npm run test:integration
```

## 文档
- API文档：`API_DOCUMENTATION.md`
- 数据库结构：`数据库表结构.md`

## 贡献指南
1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证
MIT