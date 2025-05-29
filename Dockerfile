FROM node:18

# 设置工作目录
WORKDIR /usr/src/app

# 安装系统依赖
RUN apt-get update && \
    apt-get install -y \
    python3 \
    make \
    g++ \
    curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 创建上传目录并设置权限
RUN mkdir -p /usr/src/app/uploads/temp \
    /usr/src/app/uploads/images \
    /usr/src/app/uploads/videos \
    /usr/src/app/public/images \
    /usr/src/app/public/videos \
    && chown -R node:node /usr/src/app/uploads \
    && chown -R node:node /usr/src/app/public \
    && chmod -R 755 /usr/src/app/uploads \
    && chmod -R 755 /usr/src/app/public

# 使用非 root 用户运行
USER node

# 健康检查
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"] 