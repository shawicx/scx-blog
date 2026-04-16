# Nginx 详解

## 1. 基础介绍

### 1.1 什么是 Nginx

Nginx 是一个高性能的 HTTP 和反向代理服务器，也是一个 IMAP/POP3/SMTP 代理服务器。

**特点**:
- 高并发、低内存
- 事件驱动、异步非阻塞
- 热部署（配置修改无需重启）
- 负载均衡
- 反向代理

### 1.2 安装

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx

# macOS
brew install nginx

# 启动
sudo systemctl start nginx

# 停止
sudo systemctl stop nginx

# 重启
sudo systemctl restart nginx

# 重新加载配置
sudo systemctl reload nginx

# 查看状态
sudo systemctl status nginx
```

### 1.3 目录结构

```
/etc/nginx/
├── nginx.conf              # 主配置文件
├── conf.d/                # 子配置目录
├── sites-available/       # 可用站点
├── sites-enabled/         # 启用站点
├── snippets/              # 配置片段
└── modules-enabled/        # 启用模块

/var/log/nginx/
├── access.log             # 访问日志
└── error.log              # 错误日志

/usr/share/nginx/
└── html/                  # 默认网站目录
```

## 2. 核心配置

### 2.1 nginx.conf 主配置

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    include /etc/nginx/conf.d/*.conf;
}
```

### 2.2 基本服务器配置

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    root /var/www/html;
    index index.html index.htm;

    charset utf-8;

    access_log /var/log/nginx/example.access.log;
    error_log /var/log/nginx/example.error.log;

    location / {
        try_files $uri $uri/ =404;
    }

    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;

    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

### 2.3 常用指令

```nginx
# 监听端口
listen 80;
listen 443 ssl;
listen [::]:80;

# 服务器名称
server_name example.com;
server_name *.example.com;
server_name ~^sub\d+\.example\.com$;

# 文档根目录
root /var/www/html;

# 默认文件
index index.html index.htm index.php;

# 字符编码
charset utf-8;

# 访问控制
allow 192.168.1.0/24;
deny all;

# 重定向
return 301 https://$host$request_uri;
```

## 3. 反向代理

### 3.1 基本反向代理

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3.2 upstream 配置

```nginx
upstream backend {
    server 192.168.1.10:3000;
    server 192.168.1.11:3000;
    server 192.168.1.12:3000;
}

server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3.3 负载均衡策略

```nginx
# 轮询（默认）
upstream backend {
    server backend1.example.com;
    server backend2.example.com;
    server backend3.example.com;
}

# 最少连接
upstream backend {
    least_conn;
    server backend1.example.com;
    server backend2.example.com;
}

# IP Hash
upstream backend {
    ip_hash;
    server backend1.example.com;
    server backend2.example.com;
}

# 加权轮询
upstream backend {
    server backend1.example.com weight=3;
    server backend2.example.com weight=2;
    server backend3.example.com weight=1;
}

# 健康检查
upstream backend {
    server backend1.example.com max_fails=3 fail_timeout=30s;
    server backend2.example.com max_fails=3 fail_timeout=30s;
}
```

### 3.4 WebSocket 代理

```nginx
server {
    listen 80;
    server_name ws.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 86400;
    }
}
```

## 4. HTTPS 配置

### 4.1 自签名证书

```bash
# 生成私钥
sudo openssl genrsa -out /etc/ssl/private/nginx-selfsigned.key 2048

# 生成证书签名请求
sudo openssl req -new -key /etc/ssl/private/nginx-selfsigned.key \
    -out /etc/ssl/certs/nginx-selfsigned.csr

# 生成自签名证书
sudo openssl x509 -req -days 365 -in /etc/ssl/certs/nginx-selfsigned.csr \
    -signkey /etc/ssl/private/nginx-selfsigned.key \
    -out /etc/ssl/certs/nginx-selfsigned.crt
```

### 4.2 HTTPS 配置

```nginx
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

### 4.3 Let's Encrypt 免费证书

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d example.com -d www.example.com

# 自动续期
sudo certbot renew --dry-run
```

## 5. 静态资源服务

### 5.1 基本静态服务

```nginx
server {
    listen 80;
    server_name static.example.com;

    root /var/www/static;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/json application/javascript;

    location / {
        try_files $uri $uri/ =404;
    }

    # 缓存配置
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 5.2 文件下载

```nginx
server {
    listen 80;
    server_name download.example.com;

    root /var/www/downloads;

    location / {
        autoindex on;
        autoindex_exact_size off;
        autoindex_localtime on;
    }

    # 限制下载速度
    location /large-files/ {
        limit_rate 1m;
    }
}
```

### 5.3 图片处理

```nginx
server {
    listen 80;
    server_name images.example.com;

    root /var/www/images;

    # 图片缩放
    location ~ ^/resize/(?<width>\d+)x(?<height>\d+)/(?<path>.*)$ {
        alias /var/www/images/$path;
        image_filter resize $width $height;
        image_filter_buffer 10M;
    }

    # 图片裁剪
    location ~ ^/crop/(?<width>\d+)x(?<height>\d+)/(?<path>.*)$ {
        alias /var/www/images/$path;
        image_filter crop $width $height;
        image_filter_buffer 10M;
    }
}
```

## 6. 缓存配置

### 6.1 代理缓存

```nginx
# 定义缓存路径
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m 
                 max_size=1g inactive=60m use_temp_path=off;

server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_cache my_cache;
        proxy_cache_valid 200 60m;
        proxy_cache_valid 404 10m;
        proxy_cache_key "$scheme$request_method$host$request_uri";

        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        add_header X-Cache-Status $upstream_cache_status;
    }
}
```

### 6.2 FastCGI 缓存

```nginx
fastcgi_cache_path /var/cache/nginx/fastcgi levels=1:2 
                  keys_zone=fastcgi_cache:10m max_size=1g inactive=60m;

server {
    listen 80;
    server_name php.example.com;

    root /var/www/html;

    location ~ \.php$ {
        fastcgi_cache fastcgi_cache;
        fastcgi_cache_valid 200 60m;
        fastcgi_cache_key "$scheme$request_method$host$request_uri";

        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;

        add_header X-Cache-Status $upstream_cache_status;
    }
}
```

### 6.3 浏览器缓存

```nginx
server {
    listen 80;
    server_name static.example.com;

    # 永久缓存
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        expires max;
        add_header Cache-Control "public, immutable";
    }

    # 短期缓存
    location ~* \.(css|js)$ {
        expires 7d;
        add_header Cache-Control "public";
    }

    # 不缓存
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }
}
```

## 7. 性能优化

### 7.1 工作进程配置

```nginx
# 根据CPU核心数设置
worker_processes auto;

# 每个进程的最大连接数
events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

# 文件描述符限制
worker_rlimit_nofile 65535;
```

### 7.2 连接优化

```nginx
http {
    # 启用高效传输
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;

    # Keep-Alive
    keepalive_timeout 30;
    keepalive_requests 100;

    # 连接缓冲区
    client_body_buffer_size 128k;
    client_max_body_size 10m;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;
    client_body_timeout 10;
    client_header_timeout 10;
    send_timeout 10;
}
```

### 7.3 Gzip 压缩

```nginx
http {
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/x-javascript
        application/xml+rss
        application/json
        application/javascript
        application/xml
        image/svg+xml;
    gzip_disable "msie6";
}
```

### 7.4 连接限制

```nginx
http {
    # 限制连接数
    limit_conn_zone $binary_remote_addr zone=conn_limit_per_ip:10m;
    limit_conn conn_limit_per_ip 10;

    # 限制请求速率
    limit_req_zone $binary_remote_addr zone=req_limit_per_ip:10m rate=10r/s;
    limit_req zone=req_limit_per_ip burst=20 nodelay;

    # 限制带宽
    limit_rate_after 10m;
    limit_rate 1m;
}
```

## 8. 安全配置

### 8.1 隐藏版本信息

```nginx
http {
    # 隐藏 Nginx 版本
    server_tokens off;
    
    # 隐藏 PHP 版本（如果使用）
    fastcgi_hide_header X-Powered-By;
}
```

### 8.2 访问控制

```nginx
server {
    listen 80;
    server_name admin.example.com;

    # IP 白名单
    allow 192.168.1.0/24;
    allow 10.0.0.0/8;
    deny all;

    # Basic 认证
    auth_basic "Restricted Area";
    auth_basic_user_file /etc/nginx/.htpasswd;

    location / {
        root /var/www/admin;
        index index.html;
    }
}
```

### 8.3 防止攻击

```nginx
server {
    listen 80;
    server_name example.com;

    # 防止点击劫持
    add_header X-Frame-Options "SAMEORIGIN";

    # 防止 XSS
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";

    # 防止 MIME 类型混淆
    add_header X-Frame-Options "DENY";

    # 防止信息泄露
    server_tokens off;

    # 限制请求方法
    if ($request_method !~ ^(GET|HEAD|POST)$ ) {
        return 405;
    }

    # 防止目录遍历
    location ~* \.(htaccess|htpasswd|ini|log|sh|sql|conf)$ {
        deny all;
    }
}
```

### 8.4 安全头部

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # CSP
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;

    # Referrer Policy
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Permissions Policy
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
}
```

## 9. 日志管理

### 9.1 日志格式

```nginx
http {
    # 自定义日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    '$request_time $upstream_response_time';

    log_format json escape=json '{'
        '"time_local":"$time_local",'
        '"remote_addr":"$remote_addr",'
        '"remote_user":"$remote_user",'
        '"request":"$request",'
        '"status": "$status",'
        '"body_bytes_sent":"$body_bytes_sent",'
        '"request_time":"$request_time",'
        '"http_referrer":"$http_referer",'
        '"http_user_agent":"$http_user_agent"'
    '}';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;
}
```

### 9.2 日志轮转

```bash
# 创建日志轮转配置
sudo vi /etc/logrotate.d/nginx

# 内容
/var/log/nginx/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
```

### 9.3 按域名分离日志

```nginx
http {
    # 定义日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent"';

    server {
        listen 80;
        server_name example.com;

        access_log /var/log/nginx/example.com.access.log main;
        error_log /var/log/nginx/example.com.error.log;

        location / {
            root /var/www/example.com;
        }
    }
}
```

## 10. 实战案例

### 10.1 前端项目部署

```nginx
server {
    listen 80;
    server_name frontend.example.com;

    root /var/www/frontend/dist;
    index index.html;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # 缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 10.2 Node.js 应用部署

```nginx
upstream node_app {
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}

server {
    listen 80;
    server_name node.example.com;

    location / {
        proxy_pass http://node_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 10.3 PHP 应用部署

```nginx
server {
    listen 80;
    server_name php.example.com;

    root /var/www/php-app;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }

    # 禁止访问敏感文件
    location ~ /\. {
        deny all;
    }

    location ~ /(composer\.json|composer\.lock|\.git|\.env) {
        deny all;
    }
}
```

### 10.4 多环境配置

```nginx
# 开发环境
server {
    listen 8080;
    server_name dev.example.com;

    root /var/www/dev/dist;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
}

# 测试环境
server {
    listen 80;
    server_name test.example.com;

    root /var/www/test/dist;

    location / {
        proxy_pass http://test-backend:3000;
        proxy_set_header Host $host;
    }
}

# 生产环境
server {
    listen 443 ssl http2;
    server_name prod.example.com;

    ssl_certificate /etc/letsencrypt/live/prod.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/prod.example.com/privkey.pem;

    root /var/www/prod/dist;

    # 缓存
    proxy_cache_path /var/cache/nginx/prod levels=1:2 keys_zone=prod_cache:10m;
    
    location / {
        proxy_cache prod_cache;
        proxy_pass http://backend-cluster;
        proxy_set_header Host $host;
        add_header X-Cache-Status $upstream_cache_status;
    }
}
```

## 11. 故障排查

### 11.1 常见错误

```bash
# 配置测试
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log

# 查看访问日志
sudo tail -f /var/log/nginx/access.log

# 查看进程
ps aux | grep nginx

# 查看端口占用
sudo netstat -tlnp | grep nginx
```

### 11.2 性能分析

```bash
# 安装监控工具
sudo apt install nginx-amplify-agent

# 查看连接数
sudo ss -an | grep :80 | wc -l

# 查看请求速率
sudo tail -f /var/log/nginx/access.log | awk '{print $1}' | sort | uniq -c

# 分析慢请求
sudo awk '($NF > 1){print $7}' /var/log/nginx/access.log | sort -n -r | head -10
```

### 11.3 调试技巧

```nginx
# 开启调试日志
error_log /var/log/nginx/error.log debug;

# 查看请求头
add_header X-Request-ID $request_id;
add_header X-Upstream-Addr $upstream_addr;

# 记录请求信息
log_format detailed '$remote_addr - $remote_user [$time_local] '
                   '"$request" $status $body_bytes_sent '
                   '"$http_referer" "$http_user_agent" '
                   '$request_time $upstream_response_time '
                   '$upstream_addr';

# 条件日志
map $request_time $loggable {
    ~^[0-9\.]+$  1;
    default       0;
}

access_log /var/log/nginx/slow.log detailed if=$loggable;
```

## 12. 最佳实践

### 12.1 配置管理

```bash
# 使用版本控制
cd /etc/nginx
sudo git init
sudo git add .
sudo git commit -m "Initial config"

# 分环境配置
/etc/nginx/
├── nginx.conf
├── common/
│   ├── ssl.conf
│   ├── gzip.conf
│   └── cache.conf
├── sites-available/
│   ├── example.com.conf
│   └── api.example.com.conf
└── sites-enabled/
    ├── example.com.conf -> ../sites-available/example.com.conf
    └── api.example.com.conf -> ../sites-available/api.example.com.conf
```

### 12.2 监控告警

```nginx
# 启用 stub_status
location /nginx_status {
    stub_status on;
    access_log off;
    allow 127.0.0.1;
    deny all;
}
```

```bash
# 使用 Prometheus 监控
curl http://localhost/nginx_status
```

### 12.3 自动化部署

```bash
# 部署脚本
#!/bin/bash

# 测试配置
sudo nginx -t

if [ $? -eq 0 ]; then
    # 重新加载配置
    sudo systemctl reload nginx
    echo "Nginx reloaded successfully"
else
    echo "Nginx configuration test failed"
    exit 1
fi

# 备份配置
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak.$(date +%Y%m%d%H%M%S)
```

## 13. 总结

Nginx 是一个功能强大的 Web 服务器和反向代理，掌握其核心配置和优化技巧对于提升应用性能和可靠性至关重要。

### 核心要点

1. **反向代理和负载均衡**：提高应用可用性和性能
2. **HTTPS 配置**：确保通信安全
3. **缓存策略**：减少服务器负载，加快响应速度
4. **性能优化**：合理配置工作进程和连接参数
5. **安全配置**：防止常见攻击
6. **日志管理**：便于监控和故障排查
7. **监控告警**：及时发现和解决问题

### 推荐实践

- 使用环境分离配置
- 定期备份配置文件
- 开启监控和日志分析
- 实施 CI/CD 自动化部署
- 定期更新和安全加固
- 使用 Let's Encrypt 免费证书
- 合理设置缓存策略
- 限制请求速率防止滥用