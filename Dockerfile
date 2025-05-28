FROM node:18

# 设置工作目录
WORKDIR /usr/src/app

# 安装 curl 用于健康检查
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 使用 npm install 替代 npm ci
RUN npm install --omit=dev

# 复制源代码
COPY . .

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 创建上传目录
RUN mkdir -p uploads && chown -R node:node uploads

# 切换到非root用户
USER node

# 健康检查
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"] 