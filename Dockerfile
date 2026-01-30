# 多阶段构建 - 第一阶段：构建应用
FROM node:20-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建应用
RUN npm run build


# 多阶段构建 - 第二阶段：运行应用
FROM node:20-alpine AS production

# 安装 serve 来提供静态文件服务
RUN npm install -g serve

WORKDIR /app

# 从构建阶段复制构建好的文件
COPY --from=builder /app/dist ./dist

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["serve", "-s", "dist", "-l", "3000"]