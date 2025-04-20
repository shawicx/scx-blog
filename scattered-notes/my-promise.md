# Promise

## 核心概念

1. Promise 是一个状态机，有三种不可逆的状态：
    - Pending（等待中）：初始状态，未完成或未拒绝。
    - Fulfilled（已成功）：操作成功完成，通过 resolve(value) 触发。
    - Rejected（已失败）：操作失败，通过 reject(reason) 触发。
      状态一旦变化，不可回退。

2. 链式调用 - 每个 Promise 实例的 .then()、.catch() 和 .finally() 方法返回 新的 Promise，支持链式调用。
   这种设计允许将多个异步操作串联起来，形成清晰的代码逻辑。

3. 微任务（Microtask）- Promise 的回调函数（如 .then()）会被放入 微任务队列，在当前主线程任务执行完毕后、下一个宏任务（如
   setTimeout）之前执行。这确保了
   Promise 的高优先级处理。

## HTTPS

### HTTPS 与 HTTP 的区别

1. 安全性：HTTP 以明文传输数据，易被窃听或篡改；HTTPS 通过加密和完整性校验保护数据。
2. 端口：HTTP 默认使用 80 端口，HTTPS 使用 443 端口。
3. 协议栈：HTTPS 在 HTTP 和 TCP 之间加入 SSL/TLS 加密层，实现安全通信。
4. URL 标识：HTTPS 网址以 https:// 开头，浏览器通常显示锁形图标。

### 核心功能

1. 加密传输：使用对称加密算法（如 SSL/TLS 协议）加密数据，防止窃听。
2. 身份验证：通过数字证书验证服务器身份，防止中间人攻击。
3. 数据完整性：使用哈希算法（如 SHA-256）校验数据未被篡改。
