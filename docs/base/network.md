# 网络/HTTP 面试题

## HTTP 基础

### 1. HTTP 状态码

**1xx 信息性**:
- `100 Continue`: 继续请求

**2xx 成功**:
- `200 OK`: 请求成功
- `201 Created`: 资源创建成功
- `204 No Content`: 请求成功，无返回内容

**3xx 重定向**:
- `301 Moved Permanently`: 永久重定向
- `302 Found`: 临时重定向
- `304 Not Modified`: 资源未修改

**4xx 客户端错误**:
- `400 Bad Request`: 请求错误
- `401 Unauthorized`: 未授权
- `403 Forbidden`: 禁止访问
- `404 Not Found`: 资源未找到

**5xx 服务器错误**:
- `500 Internal Server Error`: 服务器内部错误
- `502 Bad Gateway`: 网关错误
- `503 Service Unavailable`: 服务不可用

### 2. HTTP 请求方法

- `GET`: 获取资源
- `POST`: 创建资源
- `PUT`: 更新整个资源
- `PATCH`: 部分更新资源
- `DELETE`: 删除资源
- `HEAD`: 获取响应头
- `OPTIONS`: 获取服务器支持的 HTTP 方法

### 3. HTTP 和 HTTPS 区别

| 特性 | HTTP | HTTPS |
|------|------|-------|
| 加密 | 无 | TLS/SSL 加密 |
| 端口 | 80 | 443 |
| 证书 | 不需要 | 需要 SSL 证书 |
| 性能 | 稍快 | 稍慢（握手开销） |
| SEO | 不利于 | 有利 |

### 4. HTTP 1.0 vs HTTP 1.1 vs HTTP 2.0

**HTTP 1.0**:
- 每次请求需要新连接
- 无持久连接

**HTTP 1.1**:
- 持久连接 (Keep-Alive)
- 管道化（串行请求）
- 分块传输编码

**HTTP 2.0**:
- 多路复用（并行请求）
- 头部压缩 (HPACK)
- 服务器推送
- 二进制协议

```http
# HTTP 1.1
Connection: keep-alive
```

## 缓存

### 5. 强缓存和协商缓存

**强缓存**:
```http
Cache-Control: max-age=3600
Cache-Control: no-cache
Cache-Control: no-store
Expires: Wed, 21 Oct 2015 07:28:00 GMT
```

**协商缓存**:
```http
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
Last-Modified: Wed, 21 Oct 2015 07:28:00 GMT
```

```http
# 请求
If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"
If-Modified-Since: Wed, 21 Oct 2015 07:28:00 GMT
```

### 6. 缓存策略

**Cache-Control 指令**:
- `max-age=<seconds>`: 缓存时间
- `no-cache`: 每次需要验证
- `no-store`: 不缓存
- `public`: 可被 CDN 缓存
- `private`: 只能被浏览器缓存

```javascript
// 设置缓存
fetch('https://api.example.com/data', {
  headers: {
    'Cache-Control': 'max-age=3600',
  },
});
```

## 安全

### 7. HTTPS 加密流程

1. 客户端访问 HTTPS 网站
2. 服务器返回 SSL 证书
3. 客户端验证证书
4. 客户端生成随机密钥
5. 使用服务器公钥加密密钥
6. 服务器解密得到密钥
7. 双方使用对称加密通信

### 8. CORS (跨源资源共享)

**简单请求**:
```javascript
fetch('https://api.example.com/data');
```

**预检请求**:
```javascript
fetch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**服务器设置**:
```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type
Access-Control-Max-Age: 3600
```

### 9. CSRF (跨站请求伪造)

**防范措施**:
- CSRF Token
- SameSite Cookie
- 验证 Referer/Origin

```javascript
// CSRF Token
const token = document.querySelector('meta[name="csrf-token"]').content;

fetch('/api/data', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': token,
  },
});
```

```http
Set-Cookie: sessionId=abc123; SameSite=Strict
```

### 10. XSS (跨站脚本攻击)

**防范措施**:
- 输入验证
- 输出编码
- Content Security Policy
- HttpOnly Cookie

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
Set-Cookie: sessionId=abc123; HttpOnly
```

### 11. SQL 注入

**防范措施**:
- 参数化查询
- 输入验证
- 使用 ORM

```javascript
// 不好: 直接拼接
const query = `SELECT * FROM users WHERE name = '${name}'`;

// 好: 参数化
const query = 'SELECT * FROM users WHERE name = ?';
db.execute(query, [name]);
```

## 性能

### 12. TCP 三次握手

1. **SYN**: 客户端发送 SYN 包
2. **SYN-ACK**: 服务器回复 SYN+ACK
3. **ACK**: 客户端回复 ACK

```
客户端                    服务器
   |                        |
   |------- SYN ----------->|
   |                        |
   |<---- SYN+ACK --------|
   |                        |
   |------- ACK ----------->|
   |                        |
```

### 13. TCP 四次挥手

1. **FIN**: 客户端发送 FIN
2. **ACK**: 服务器回复 ACK
3. **FIN**: 服务器发送 FIN
4. **ACK**: 客户端回复 ACK

```
客户端                    服务器
   |                        |
   |------- FIN ----------->|
   |                        |
   |<---- ACK -------------|
   |                        |
   |<---- FIN -------------|
   |                        |
   |------- ACK ----------->|
   |                        |
```

### 14. DNS 解析

1. 查询浏览器缓存
2. 查询系统缓存
3. 查询路由器缓存
4. 查询 ISP DNS 服务器
5. 查询根域名服务器
6. 递归查询权威 DNS 服务器

```javascript
// 使用 DNS 预解析
<link rel="dns-prefetch" href="https://example.com">
```

### 15. CDN (内容分发网络)

CDN 将内容缓存到全球各地的服务器，用户从最近的服务器获取内容。

**优势**:
- 减少延迟
- 提高可用性
- 降低服务器负载

```html
<!-- 使用 CDN -->
<script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"></script>
```

### 16. 负载均衡

**算法**:
- 轮询 (Round Robin)
- 最少连接 (Least Connections)
- IP Hash
- 加权轮询

```javascript
// 轮询示例
const servers = ['server1', 'server2', 'server3'];
let currentIndex = 0;

function getServer() {
  const server = servers[currentIndex];
  currentIndex = (currentIndex + 1) % servers.length;
  return server;
}
```

## 其他

### 17. WebSocket

WebSocket 是全双工通信协议，建立后可双向发送消息。

```javascript
// 客户端
const socket = new WebSocket('ws://example.com/socket');

socket.onopen = () => {
  console.log('Connected');
  socket.send('Hello');
};

socket.onmessage = (event) => {
  console.log('Received:', event.data);
};

socket.onclose = () => {
  console.log('Disconnected');
};

socket.onerror = (error) => {
  console.error('Error:', error);
};
```

### 18. SSE (Server-Sent Events)

SSE 是服务器向客户端推送事件的单向协议。

```javascript
const eventSource = new EventSource('/events');

eventSource.onmessage = (event) => {
  console.log('Message:', event.data);
};

eventSource.onerror = (error) => {
  console.error('Error:', error);
};
```

### 19. RESTful API

RESTful API 使用 HTTP 方法表示操作，使用 URL 表示资源。

```javascript
// 获取用户列表
GET /api/users

// 获取单个用户
GET /api/users/1

// 创建用户
POST /api/users
{
  "name": "Alice",
  "email": "alice@example.com"
}

// 更新用户
PUT /api/users/1
{
  "name": "Bob"
}

// 删除用户
DELETE /api/users/1
```

### 20. GraphQL

GraphQL 是查询语言，客户端可以指定需要的数据。

```graphql
# 查询
query {
  user(id: 1) {
    name
    email
    posts {
      title
    }
  }
}

# 变更
mutation {
  createUser(input: { name: "Alice" }) {
    id
    name
  }
}
```

### 21. HTTP/3

HTTP/3 基于 QUIC 协议，提供更好的性能和可靠性。

**优势**:
- 避免队头阻塞
- 更快的连接建立
- 更好的网络切换
