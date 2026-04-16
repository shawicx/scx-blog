# 浏览器 面试题

## 渲染机制

### 1. 浏览器渲染流程

1. **解析 HTML**: 构建 DOM 树
2. **解析 CSS**: 构建 CSSOM 树
3. **合并**: 生成渲染树
4. **布局**: 计算元素位置和大小
5. **绘制**: 绘制到图层
6. **合成**: 组合图层显示

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div>
    <p>Hello</p>
  </div>
  <script src="script.js"></script>
</body>
</html>
```

### 2. 重排和重绘

**重排 (Reflow)**: 元素位置或大小变化
- 修改 width、height、margin 等
- 添加/删除 DOM 元素
- 修改元素 display 属性

**重绘 (Repaint)**: 元素外观变化但不影响布局
- 修改 color、background 等

```javascript
// 重排
element.style.width = '100px';
element.offsetHeight; // 强制重排

// 重绘
element.style.color = 'red';
```

### 3. 浏览器缓存

**强制缓存**:
```http
Cache-Control: max-age=3600
Cache-Control: no-cache
Cache-Control: no-store
```

**协商缓存**:
```http
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
Last-Modified: Wed, 21 Oct 2015 07:28:00 GMT

If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"
If-Modified-Since: Wed, 21 Oct 2015 07:28:00 GMT
```

## 事件循环

### 4. 宏任务和微任务

**宏任务 (Macrotask)**:
- setTimeout、setInterval
- I/O 操作
- UI 渲染
- setImmediate (Node.js)

**微任务 (Microtask)**:
- Promise.then/catch/finally
- MutationObserver
- queueMicrotask

```javascript
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

console.log('4');

// 输出: 1, 4, 3, 2
```

### 5. 事件循环流程

1. 执行同步代码
2. 执行所有微任务
3. 执行一个宏任务
4. 重复步骤 2-3

```javascript
setTimeout(() => console.log('setTimeout1'), 0);
setTimeout(() => console.log('setTimeout2'), 0);

Promise.resolve().then(() => {
  console.log('Promise1');
  setTimeout(() => console.log('setTimeout3'), 0);
});

Promise.resolve().then(() => console.log('Promise2'));

// 输出:
// Promise1
// Promise2
// setTimeout1
// setTimeout2
// setTimeout3
```

### 6. requestIdleCallback 和 requestAnimationFrame

**requestAnimationFrame**: 在下一次重绘之前执行
```javascript
function animate() {
  element.style.transform = `translateX(${x}px)`;
  x += 1;
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
```

**requestIdleCallback**: 在浏览器空闲时执行
```javascript
requestIdleCallback((deadline) => {
  while (deadline.timeRemaining() > 0 && tasks.length > 0) {
    const task = tasks.shift();
    task();
  }
});
```

## 存储

### 7. Cookie、LocalStorage 和 SessionStorage

| 特性 | Cookie | LocalStorage | SessionStorage |
|------|--------|--------------|----------------|
| 容量 | ~4KB | ~5MB | ~5MB |
| 过期时间 | 可设置 | 永久 | 会话结束 |
| 作用域 | 同源 | 同源 | 同源/同标签页 |
| 请求发送 | 自动 | 不 | 不 |

```javascript
// Cookie
document.cookie = 'name=Alice; expires=Fri, 31 Dec 2024 23:59:59 GMT';

// LocalStorage
localStorage.setItem('name', 'Alice');
const name = localStorage.getItem('name');
localStorage.removeItem('name');
localStorage.clear();

// SessionStorage
sessionStorage.setItem('name', 'Alice');
const name = sessionStorage.getItem('name');
```

### 8. IndexedDB

IndexedDB 是浏览器提供的数据库，存储大量结构化数据：

```javascript
// 打开数据库
const request = indexedDB.open('myDatabase', 1);

request.onupgradeneeded = (event) => {
  const db = event.target.result;
  const objectStore = db.createObjectStore('users', { keyPath: 'id' });
  objectStore.createIndex('name', 'name', { unique: false });
};

request.onsuccess = (event) => {
  const db = event.target.result;

  // 添加数据
  const transaction = db.transaction(['users'], 'readwrite');
  const objectStore = transaction.objectStore('users');
  objectStore.add({ id: 1, name: 'Alice' });
};
```

## 安全

### 9. XSS (跨站脚本攻击)

**防范措施**:
- 输入验证
- 输出编码
- 使用 CSP (Content Security Policy)
- HttpOnly Cookie

```javascript
// 不好: 直接插入 HTML
element.innerHTML = userInput;

// 好: 使用 textContent
element.textContent = userInput;

// 或使用 DOMPurify 清理
const clean = DOMPurify.sanitize(userInput);
element.innerHTML = clean;
```

### 10. CSP (Content Security Policy)

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.example.com
```

```javascript
// 设置 CSP
meta.setAttribute('http-equiv', 'Content-Security-Policy');
meta.setAttribute('content', "default-src 'self'");
```

### 11. CORS (跨源资源共享)

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
```

## 其他

### 12. 浏览器兼容性

```css
/* CSS 前缀 */
.element {
  -webkit-transform: rotate(30deg);
  -moz-transform: rotate(30deg);
  -ms-transform: rotate(30deg);
  transform: rotate(30deg);
}
```

```javascript
// 特性检测
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(...);
}

// 使用 Polyfill
import 'core-js/stable';
import 'regenerator-runtime/runtime';
```

### 13. PWA (渐进式 Web 应用)

**Service Worker**:
```javascript
// 注册 Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

**Manifest**:
```json
{
  "name": "My App",
  "short_name": "App",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#ffffff",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### 14. 浏览器 API

**Geolocation**:
```javascript
navigator.geolocation.getCurrentPosition(
  (position) => {
    console.log(position.coords.latitude, position.coords.longitude);
  },
  (error) => {
    console.error(error);
  }
);
```

**Notification**:
```javascript
Notification.requestPermission().then(permission => {
  if (permission === 'granted') {
    new Notification('Hello!');
  }
});
```

**Clipboard**:
```javascript
navigator.clipboard.writeText('Hello World!');

const text = await navigator.clipboard.readText();
```

### 15. Web Components

**Custom Elements**:
```javascript
class MyElement extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<p>Hello!</p>';
  }
}

customElements.define('my-element', MyElement);
```

**Shadow DOM**:
```javascript
const shadow = element.attachShadow({ mode: 'open' });
shadow.innerHTML = '<p>Shadow DOM</p>';
```

**HTML Templates**:
```html
<template id="my-template">
  <p>Template content</p>
</template>

<script>
  const template = document.getElementById('my-template');
  const clone = template.content.cloneNode(true);
  document.body.appendChild(clone);
</script>
```
