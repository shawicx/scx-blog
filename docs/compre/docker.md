# Docker 详解

## 1. 基础介绍

### 1.1 什么是 Docker

Docker 是一个开源的应用容器引擎，允许开发者打包应用及其依赖到一个可移植的容器中，然后发布到任何流行的 Linux 机器上。

**核心优势**:
- 环境一致性：开发、测试、生产环境完全一致
- 快速部署：秒级启动
- 资源隔离：进程、网络、文件系统隔离
- 轻量级：相比虚拟机更高效

### 1.2 核心概念

```bash
# 镜像 (Image)：只读模板
# 容器 (Container)：镜像的运行实例
# 仓库 (Registry)：存储和分发镜像
# Dockerfile：构建镜像的脚本
# Docker Compose：多容器编排工具
```

### 1.3 安装 Docker

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose

# CentOS/RHEL
sudo yum install docker docker-compose

# macOS
brew install --cask docker

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
docker --version
docker-compose --version

# 允许非 root 用户使用
sudo usermod -aG docker $USER
newgrp docker
```

### 1.4 基本命令

```bash
# 镜像相关
docker images                    # 列出镜像
docker pull <image>            # 拉取镜像
docker search <keyword>         # 搜索镜像
docker rmi <image>             # 删除镜像
docker build -t <name> .       # 构建镜像

# 容器相关
docker ps                      # 列出运行中的容器
docker ps -a                   # 列出所有容器
docker run <image>             # 运行容器
docker stop <container>        # 停止容器
docker start <container>       # 启动容器
docker restart <container>      # 重启容器
docker rm <container>          # 删除容器
docker exec -it <container> bash  # 进入容器

# 日志和查看
docker logs <container>         # 查看日志
docker logs -f <container>     # 实时查看日志
docker inspect <container>     # 查看容器详情
docker stats                   # 查看资源使用
```

## 2. Dockerfile

### 2.1 基本指令

```dockerfile
# 基础镜像
FROM node:18-alpine

# 维护者信息
LABEL maintainer="your-email@example.com"

# 工作目录
WORKDIR /app

# 复制文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 3000

# 环境变量
ENV NODE_ENV=production

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/health || exit 1

# 启动命令
CMD ["npm", "start"]
```

### 2.2 常用指令详解

```dockerfile
# FROM：指定基础镜像
FROM node:18                    # 官方镜像
FROM node:18-alpine             # Alpine 版本（更小）
FROM node:18-slim               # Slim 版本
FROM ubuntu:22.04              # Ubuntu 镜像

# LABEL：添加元数据
LABEL version="1.0"
LABEL description="My Node.js app"
LABEL maintainer="example@example.com"

# WORKDIR：设置工作目录
WORKDIR /app                    # 如果目录不存在会自动创建

# COPY：复制文件到容器
COPY package.json /app/         # 复制单个文件
COPY . /app/                    # 复制所有文件
COPY --from=builder /app/dist .  # 多阶段构建
COPY --chown=node:node . /app   # 设置文件所有者

# ADD：复制并解压
ADD app.tar.gz /app/            # 自动解压 tar.gz
ADD https://example.com/file.txt /app/  # 支持远程 URL

# RUN：执行命令
RUN npm install                 # 安装依赖
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*  # 清理缓存
RUN groupadd -r node && useradd -r -g node node  # 创建用户

# EXPOSE：声明端口
EXPOSE 3000
EXPOSE 8080/udp

# ENV：设置环境变量
ENV NODE_ENV=production
ENV PATH="/app/node_modules/.bin:${PATH}"
ARG VERSION=1.0
ENV APP_VERSION=${VERSION}

# CMD：启动命令
CMD ["node", "index.js"]        # exec form（推荐）
CMD node index.js               # shell form

# ENTRYPOINT：入口点
ENTRYPOINT ["node", "index.js"] # 可以被 CMD 参数覆盖

# VOLUME：声明挂载点
VOLUME /data
VOLUME ["/data", "/logs"]

# USER：切换用户
USER node

# ONBUILD：触发器
ONBUILD COPY package.json ./
ONBUILD RUN npm install
```

### 2.3 多阶段构建

```dockerfile
# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 生产阶段
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

### 2.4 Node.js 项目示例

```dockerfile
# ========== Node.js 应用 ==========

# 开发环境
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# 生产环境
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
```

### 2.5 React 项目示例

```dockerfile
# ========== React 应用 ==========

# 多阶段构建
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 生产环境
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name _;

        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

## 3. Docker Compose

### 3.1 基本配置

```yaml
version: '3.8'

services:
  # Web 应用
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./app:/app
    depends_on:
      - db

  # 数据库
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  # Redis
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 3.2 常用配置选项

```yaml
version: '3.8'

services:
  app:
    # 镜像配置
    image: node:18-alpine
    build:
      context: .
      dockerfile: Dockerfile
      args:
        NODE_ENV: production

    # 端口映射
    ports:
      - "3000:3000"           # host:container
      - "8080-8090:8080-8090"  # 端口范围
      - "127.0.0.1:3001:3001"  # 绑定到特定接口

    # 环境变量
    environment:
      - NODE_ENV=production
      - API_URL=http://api:3000
    env_file:
      - .env
      - .env.production

    # 命令覆盖
    command: npm start
    entrypoint: ["node", "index.js"]

    # 挂载卷
    volumes:
      - ./app:/app           # 绑定挂载
      - app_data:/data        # 命名卷
      - /etc/localtime:/etc/localtime:ro  # 只读

    # 依赖关系
    depends_on:
      - db
      - redis

    # 网络配置
    networks:
      - app_network

    # 健康检查
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

    # 重启策略
    restart: unless-stopped

    # 资源限制
    deploy:
      resources:
        limits:
          cpus: '0.50'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 128M

networks:
  app_network:
    driver: bridge

volumes:
  app_data:
```

### 3.3 常用命令

```bash
# 启动服务
docker-compose up                     # 前台运行
docker-compose up -d                 # 后台运行
docker-compose up -d --build         # 构建并启动

# 停止服务
docker-compose stop                  # 停止服务
docker-compose down                   # 停止并删除容器
docker-compose down -v                # 同时删除卷

# 查看服务
docker-compose ps                    # 列出服务
docker-compose logs                  # 查看日志
docker-compose logs -f web           # 实时查看特定服务日志
docker-compose top                   # 查看进程

# 构建服务
docker-compose build                 # 构建所有服务
docker-compose build web             # 构建特定服务
docker-compose build --no-cache     # 不使用缓存构建

# 执行命令
docker-compose exec web bash         # 进入容器
docker-compose exec web npm test     # 执行命令
docker-compose run web npm run test  # 运行一次性命令

# 扩展服务
docker-compose up -d --scale web=3  # 扩展 web 服务到 3 个实例
```

### 3.4 多环境配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=${NODE_ENV:-development}
      - DATABASE_URL=${DATABASE_URL}
    env_file:
      - .env.${NODE_ENV:-development}
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${DB_NAME:-myapp}
      POSTGRES_USER: ${DB_USER:-user}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-password}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```bash
# .env.development
NODE_ENV=development
DATABASE_URL=postgres://user:password@db:5432/myapp
DB_NAME=myapp_dev
DB_USER=user
DB_PASSWORD=password

# .env.production
NODE_ENV=production
DATABASE_URL=postgres://produser:prodpass@db:5432/myapp
DB_NAME=myapp_prod
DB_USER=produser
DB_PASSWORD=prodpass
```

```bash
# 使用不同环境
docker-compose --env-file .env.development up -d
docker-compose --env-file .env.production up -d
```

## 4. 网络

### 4.1 网络模式

```bash
# Bridge 模式（默认）
docker network create mynetwork
docker run -d --name app --network mynetwork nginx

# Host 模式
docker run -d --name app --network host nginx

# None 模式
docker run -d --name app --network none nginx

# Container 模式
docker run -d --name app1 nginx
docker run -d --name app2 --network container:app1 nginx
```

### 4.2 自定义网络

```yaml
version: '3.8'

services:
  web:
    build: .
    networks:
      - frontend
      - backend

  api:
    build: ./api
    networks:
      - backend

  db:
    image: postgres:15
    networks:
      - backend

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

```bash
# 创建网络
docker network create --driver bridge mynetwork

# 查看网络
docker network ls
docker network inspect mynetwork

# 连接容器到网络
docker network connect mynetwork mycontainer

# 断开容器
docker network disconnect mynetwork mycontainer

# 删除网络
docker network rm mynetwork
```

### 4.3 网络配置

```bash
# 创建带有子网的网络
docker network create \
  --driver bridge \
  --subnet=192.168.100.0/24 \
  --gateway=192.168.100.1 \
  mynetwork

# 固定 IP 地址
docker run -d \
  --name app \
  --network mynetwork \
  --ip 192.168.100.10 \
  nginx

# DNS 配置
docker run -d \
  --name app \
  --dns 8.8.8.8 \
  --dns 8.8.4.4 \
  nginx
```

## 5. 存储

### 5.1 数据卷

```bash
# 创建卷
docker volume create mydata

# 查看卷
docker volume ls
docker volume inspect mydata

# 使用卷
docker run -d \
  --name app \
  -v mydata:/app/data \
  nginx

# 删除卷
docker volume rm mydata
docker volume prune  # 删除未使用的卷
```

### 5.2 绑定挂载

```bash
# 挂载当前目录
docker run -d \
  --name app \
  -v $(pwd):/app \
  -w /app \
  node:18 npm start

# 挂载特定文件
docker run -d \
  --name app \
  -v /host/path/file.txt:/container/path/file.txt \
  nginx

# 只读挂载
docker run -d \
  --name app \
  -v /host/path:/container/path:ro \
  nginx
```

### 5.3 数据卷容器

```bash
# 创建数据卷容器
docker create -v /data --name datacontainer ubuntu

# 使用数据卷容器
docker run -d --volumes-from datacontainer --name app1 ubuntu
docker run -d --volumes-from datacontainer --name app2 ubuntu

# 备份数据卷
docker run --rm --volumes-from datacontainer \
  -v $(pwd):/backup ubuntu \
  tar cvf /backup/backup.tar /data

# 恢复数据卷
docker run --rm --volumes-from datacontainer \
  -v $(pwd):/backup ubuntu \
  tar xvf /backup/backup.tar -C /
```

## 6. 实战案例

### 6.1 全栈应用部署

```yaml
# docker-compose.yml
version: '3.8'

services:
  # 前端 (React)
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  # 后端 (Node.js)
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://user:password@db:5432/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - ./backend/uploads:/app/uploads

  # 数据库 (PostgreSQL)
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  # Redis
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

  # Nginx 反向代理
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend

volumes:
  postgres_data:
  redis_data:
```

### 6.2 微服务架构

```yaml
version: '3.8'

services:
  # API Gateway
  gateway:
    build: ./gateway
    ports:
      - "80:80"
    depends_on:
      - auth-service
      - user-service
      - order-service

  # 认证服务
  auth-service:
    build: ./services/auth
    ports:
      - "3001:3000"
    environment:
      - DATABASE_URL=postgres://auth:password@auth-db:5432/auth
    depends_on:
      - auth-db
      - redis

  # 用户服务
  user-service:
    build: ./services/user
    ports:
      - "3002:3000"
    environment:
      - DATABASE_URL=postgres://user:password@user-db:5432/user
    depends_on:
      - user-db
      - redis

  # 订单服务
  order-service:
    build: ./services/order
    ports:
      - "3003:3000"
    environment:
      - DATABASE_URL=postgres://order:password@order-db:5432/order
    depends_on:
      - order-db
      - redis
      - kafka

  # 认证数据库
  auth-db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: auth
      POSTGRES_USER: auth
      POSTGRES_PASSWORD: password
    volumes:
      - auth_db_data:/var/lib/postgresql/data

  # 用户数据库
  user-db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: user
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - user_db_data:/var/lib/postgresql/data

  # 订单数据库
  order-db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: order
      POSTGRES_USER: order
      POSTGRES_PASSWORD: password
    volumes:
      - order_db_data:/var/lib/postgresql/data

  # Redis (缓存)
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  # Kafka (消息队列)
  kafka:
    image: confluentinc/cp-kafka:latest
    environment:
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
    depends_on:
      - zookeeper

  # Zookeeper
  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181

volumes:
  auth_db_data:
  user_db_data:
  order_db_data:
  redis_data:
```

### 6.3 开发环境

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

```dockerfile
# Dockerfile.dev
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "dev"]
```

### 6.4 CI/CD 集成

```yaml
# .github/workflows/docker.yml
name: Docker Build and Push

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            username/myapp:latest
            username/myapp:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /app
            docker-compose pull
            docker-compose up -d
```

## 7. 最佳实践

### 7.1 镜像优化

```dockerfile
# ========== 使用 Alpine 基础镜像 ==========
FROM node:18-alpine              # 更小的镜像
FROM nginx:alpine

# ========== 多阶段构建 ==========
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]

# ========== 清理缓存 ==========
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ========== 合并 RUN 指令 ==========
RUN apt-get update && \
    apt-get install -y curl wget git && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# ========== 使用 .dockerignore ==========
# .dockerignore
node_modules
npm-debug.log
.git
.env
dist
coverage
*.md
```

### 7.2 安全最佳实践

```dockerfile
# ========== 使用非 root 用户 ==========
FROM node:18-alpine

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

COPY --chown=nodejs:nodejs package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

COPY --chown=nodejs:nodejs . .

USER nodejs

CMD ["node", "index.js"]

# ========== 最小化层 ==========
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

COPY . .

CMD ["node", "index.js"]

# ========== 固定版本 ==========
FROM node:18.16.0-alpine
FROM nginx:1.24.0-alpine

# ========== 扫描漏洞 ==========
# 使用 Trivy
trivy image myapp:latest

# 使用 Docker Scout
docker scout quickstart
docker scout cves myapp:latest
```

### 7.3 生产环境配置

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  web:
    image: myapp:latest
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      mode: replicated
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
        failure_action: rollback
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 128M

  db:
    image: postgres:15-alpine
    restart: unless-stopped
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

volumes:
  postgres_data:
```

## 8. 故障排查

### 8.1 常见问题

```bash
# 查看容器日志
docker logs <container>
docker logs -f <container>          # 实时查看
docker logs --tail 100 <container>   # 查看最后 100 行

# 查看容器状态
docker ps
docker ps -a
docker inspect <container>

# 进入容器调试
docker exec -it <container> bash
docker exec -it <container> sh       # Alpine 镜像

# 查看资源使用
docker stats
docker stats <container>

# 查看网络
docker network ls
docker network inspect <network>

# 查看卷
docker volume ls
docker volume inspect <volume>
```

### 8.2 性能分析

```bash
# 查看容器资源使用
docker stats --no-stream

# 查看 Docker 系统信息
docker system df
docker system info

# 清理未使用的资源
docker system prune -a --volumes  # 清理所有未使用的资源

# 查看镜像大小
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# 分析镜像层
docker history myapp:latest
```

### 8.3 网络问题

```bash
# 测试容器间连通性
docker exec <container1> ping <container2>

# 查看端口映射
docker port <container>

# 查看容器 IP
docker inspect <container> | grep IPAddress

# 抓包分析
docker exec <container> tcpdump -i eth0
```

## 9. 高级功能

### 9.1 Docker Swarm

```bash
# 初始化 Swarm
docker swarm init

# 加入节点
docker swarm join --token <token> <manager-ip>:2377

# 部署服务
docker service create --name web --replicas 3 -p 80:80 nginx

# 查看服务
docker service ls
docker service ps web
docker service logs web

# 扩展服务
docker service scale web=5

# 更新服务
docker service update --image nginx:latest web

# 删除服务
docker service rm web
```

### 9.2 Docker 私有仓库

```bash
# 运行私有仓库
docker run -d \
  -p 5000:5000 \
  --restart=always \
  --name registry \
  -v /data/registry:/var/lib/registry \
  registry:2

# 推送镜像
docker tag myapp:latest localhost:5000/myapp:latest
docker push localhost:5000/myapp:latest

# 拉取镜像
docker pull localhost:5000/myapp:latest

# 配置 HTTP 仓库
# /etc/docker/daemon.json
{
  "insecure-registries": ["myregistry.example.com:5000"]
}
```

### 9.3 监控和日志

```yaml
version: '3.8'

services:
  app:
    image: myapp:latest
    logging:
      driver: syslog
      options:
        syslog-address: "tcp://192.168.0.42:123"

  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  grafana_data:
```

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'docker'
    static_configs:
      - targets: ['host.docker.internal:9323']
```

## 10. 总结

Docker 是现代应用开发和部署的核心工具，掌握其核心概念和最佳实践对于提升开发效率和部署质量至关重要。

### 核心要点

1. **理解核心概念**：镜像、容器、仓库、Dockerfile
2. **掌握 Dockerfile**：编写高效的构建脚本
3. **使用 Docker Compose**：简化多容器应用部署
4. **网络和存储**：合理配置容器通信和数据持久化
5. **镜像优化**：减小镜像大小，提高构建效率
6. **安全最佳实践**：使用非 root 用户，扫描漏洞
7. **监控和日志**：及时发现和解决问题
8. **CI/CD 集成**：自动化构建和部署流程

### 推荐实践

- 使用 Alpine 基础镜像减小镜像大小
- 采用多阶段构建分离构建和运行环境
- 使用 .dockerignore 排除不必要文件
- 实施安全扫描和漏洞检测
- 配置健康检查和自动重启
- 使用命名卷管理持久化数据
- 合理配置网络和资源限制
- 建立监控和日志收集机制
- 定期清理未使用的资源
- 使用版本控制管理 Dockerfile 和 Compose 文件