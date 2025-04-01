# 雅虎军规

### 1. 尽可能减少HTTP请求

### 2. 使用CDN（内容分发网络）

### 3. 添加 expire/cache-control头

- expire: 如果开启 expire，发起请求时，服务器返回资源的同时会返回 expire http
  头，其内容是资源过期时间。当前时间没有超过过期时间时，不发送http请求，直接使用本地缓存的资源。
-
cache-control: [Cache-Control](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Cache-Control "Cache-Control")
\<a name="HxoR0">\</a>

### 4. 启用Gzip压缩

### 5. CSS 顶部加载，JavaScript 底部加载

### 6. 避免在CSS中使用表达式

### 7. 使用外部引用的 JavaScript CSS 文件

### 8. 减少 DNS 查询

### 9. 压缩 JavaScript CSS 文件

### 10. 避免重定向（301/302）

- [301重定向](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status/301 "301重定向") - 永久的
- [302重定向](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status/302 "302重定向") - 临时的

### 11. 避免重复引用

### 12. 配置实体标签（Entity Tag）

使用特殊的字符标识资源版本

### 13. Ajax 缓存
