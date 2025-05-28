FROM node:18-alpine

# 设置工作目录
WORKDIR /usr/src/app

# 安装基础工具
RUN apk add --no-cache curl

# 设置环境变量
ENV NODE_ENV=production

# 首先只复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 创建上传目录
RUN mkdir -p uploads && chown -R node:node uploads

# 切换到非root用户
USER node

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# 启动命令
CMD ["npm", "start"] 