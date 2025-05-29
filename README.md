# 跌倒检测系统后端服务

## 项目简介
这是一个基于Node.js和Express的跌倒检测系统后端服务，提供设备管理、告警处理、用户认证等功能。系统采用RESTful API设计，支持嵌入式设备和移动端应用的数据交互。

## 功能特性
- 设备管理：设备注册、心跳检测、状态监控
- 告警处理：跌倒检测、异常行为识别、告警确认
- 用户认证：JWT认证、Token刷新
- 媒体管理：图片和视频存储、访问
- 健康检查：服务状态监控

## 技术栈
- 运行环境：Node.js
- Web框架：Express
- 数据库：PostgreSQL
- ORM：Sequelize
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
├── uploads/              # 文件上传目录
│   ├── images/          # 图片存储
│   └── videos/          # 视频存储
├── public/              # 公共访问目录
│   ├── images/         # 图片访问
│   └── videos/         # 视频访问
├── test_downloads/     # 测试下载目录
├── API_DOCUMENTATION.md   # API文档
├── 数据库表结构.md         # 数据库设计文档
├── Dockerfile            # Docker构建文件
├── docker-compose.yml    # Docker编排配置
├── package.json         # 项目依赖配置
├── api_test.sh         # API测试脚本
├── event_test.sh       # 事件测试脚本
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
mkdir -p uploads/images uploads/videos public/images public/videos test_downloads

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
mkdir -p uploads/images uploads/videos public/images public/videos test_downloads

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
   - Docker 版本 >= 20.10
   - Docker Compose 版本 >= 2.0
   - 至少 2GB 可用内存
   - 至少 10GB 可用磁盘空间

2. 性能优化
   - 调整 Docker 守护进程配置
   - 配置适当的日志轮转
   - 设置合理的资源限制

### 环境变量配置
- `DB_HOST`: 数据库主机（Docker环境使用 'db'）
- `DB_PORT`: 数据库端口（默认 5432）
- `DB_USER`: 数据库用户名（默认 postgres）
- `DB_PASSWORD`: 数据库密码
- `JWT_SECRET`: JWT密钥
- `JWT_REFRESH_SECRET`: JWT刷新密钥
- `UPLOAD_DIR`: 文件上传目录（默认 uploads）
- `NODE_ENV`: 运行环境（development/production）
- `CORS_ORIGIN`: 跨域设置（默认 "*"）

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
# 运行API测试
./api_test.sh

# 运行事件测试
./event_test.sh
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