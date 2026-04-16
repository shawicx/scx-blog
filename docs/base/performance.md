# 性能优化 面试题

## 基础

### 1. 性能指标

**核心 Web 指标 (Core Web Vitals)**:

- **LCP (Largest Contentful Paint)**: 最大内容绘制
  - 良好: < 2.5s
  - 需要改进: 2.5s - 4s
  - 差: > 4s

- **FID (First Input Delay)**: 首次输入延迟
  - 良好: < 100ms
  - 需要改进: 100ms - 300ms
  - 差: > 300ms

- **CLS (Cumulative Layout Shift)**: 累积布局偏移
  - 良好: < 0.1
  - 需要改进: 0.1 - 0.25
  - 差: > 0.25

### 2. 性能优化策略

性能优化分为几个方向：
- **加载性能**: 减少资源大小，加快首次渲染
- **运行时性能**: 减少 JS 执行时间，避免长任务
- **渲染性能**: 减少重排重绘，使用 CSS 动画

### 3. 资源优化

**代码分割**:
```javascript
// 动态导入
const LazyComponent = React.lazy(() => import('./Component'));

// 路由级分割
const Home = () => import('./routes/Home');
const About = () => import('./routes/About');
```

**压缩和混淆**:
```javascript
// Webpack/Vite 配置
export default {
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
};
```

**Tree Shaking**:
- 使用 ES Modules
- 只导入需要的部分
```javascript
// 不好
import _ from 'lodash';

// 好
import { debounce } from 'lodash-es';
```

### 4. 图片优化

```html
<!-- 使用现代格式 -->
<picture>
  <source srcset="image.webp" type="image/webp">
  <source srcset="image.jpg" type="image/jpeg">
  <img src="image.jpg" alt="Description">
</picture>

<!-- 懒加载 -->
<img src="placeholder.jpg" loading="lazy" data-src="image.jpg">

<!-- 响应式图片 -->
<img srcset="small.jpg 320w, medium.jpg 640w, large.jpg 1280w"
     sizes="(max-width: 640px) 320px, 640px"
     src="medium.jpg">
```

## 渲染优化

### 5. 减少重排和重绘

```css
/* 推荐：使用 transform 和 opacity */
.animated {
  transform: translateX(100px);
  opacity: 0.5;
  transition: transform 0.3s, opacity 0.3s;
}

/* 不推荐：使用 left/top */
.animated {
  left: 100px; /* 触发重排 */
}
```

```javascript
// 批量 DOM 操作
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  fragment.appendChild(div);
}
document.body.appendChild(fragment);
```

### 6. 避免布局抖动

```javascript
// 不好：强制同步布局
function bad() {
  const width = element.offsetWidth;    // 读取
  element.style.height = width + 'px'; // 写入
  const height = element.offsetHeight;  // 读取
}

// 好：避免读取和写入交替
function good() {
  const width = element.offsetWidth;
  const height = element.offsetHeight;
  element.style.height = height + 'px';
  element.style.width = width + 'px';
}
```

### 7. 使用 CSS 动画代替 JS 动画

```javascript
// JS 动画（性能较差）
element.style.left = '100px';

// CSS 动画（性能更好）
element.style.transform = 'translateX(100px)';
element.style.transition = 'transform 0.3s';
```

### 8. 虚拟滚动

对于长列表，只渲染可见部分：

```javascript
function VirtualList({ items, itemHeight, containerHeight }) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight),
    items.length
  );

  const visibleItems = items.slice(startIndex, endIndex);

  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={e => setScrollTop(e.target.scrollTop)}
    >
      <div style={{ height: items.length * itemHeight }}>
        {visibleItems.map((item, index) => (
          <div
            key={startIndex + index}
            style={{
              height: itemHeight,
              transform: `translateY(${(startIndex + index) * itemHeight}px)`,
              position: 'absolute',
              width: '100%',
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 网络优化

### 9. 缓存策略

```http
# 强缓存
Cache-Control: max-age=3600

# 协商缓存
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
Last-Modified: Wed, 21 Oct 2015 07:28:00 GMT
```

### 10. CDN 使用

- 静态资源使用 CDN 加速
- 减少延迟，提高可用性
- 使用 CDN 提供的常用库（React, Vue 等）

### 11. 预加载和预连接

```html
<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="https://api.example.com">

<!-- 预连接 -->
<link rel="preconnect" href="https://cdn.example.com">

<!-- 预加载 -->
<link rel="preload" href="critical.css" as="style">

<!-- 预获取 -->
<link rel="prefetch" href="next-page.js">
```

### 12. HTTP/2 和 HTTP/3

- **HTTP/2**: 多路复用、头部压缩、服务器推送
- **HTTP/3**: 基于 QUIC，更快、更可靠

```javascript
// 确保服务器支持 HTTP/2
// 使用 nghttp2 检查
```

## 代码优化

### 13. 防抖和节流

```javascript
// 防抖：延迟执行
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 节流：固定频率执行
function throttle(fn, delay) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}

// 使用
window.addEventListener('scroll', throttle(handleScroll, 200));
window.addEventListener('resize', debounce(handleResize, 300));
```

### 14. Web Worker

将计算密集型任务放到 Web Worker：

```javascript
// main.js
const worker = new Worker('worker.js');

worker.postMessage({ data: largeData });

worker.onmessage = function(e) {
  console.log('Result:', e.data);
};

// worker.js
self.onmessage = function(e) {
  const result = heavyComputation(e.data);
  self.postMessage(result);
};
```

### 15. RequestAnimationFrame

使用 `requestAnimationFrame` 代替 `setTimeout` 进行动画：

```javascript
function animate() {
  element.style.transform = `translateX(${pos}px)`;
  pos += 1;
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
```

### 16. Intersection Observer

懒加载和无限滚动：

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadMoreContent();
      observer.unobserve(entry.target);
    }
  });
});

observer.observe(document.querySelector('#load-more'));
```

## 工具

### 17. 性能分析工具

**浏览器开发者工具**:
- Performance 标签页
- Network 标签页
- Lighthouse

**命令行工具**:
```bash
# Lighthouse CI
lighthouse https://example.com --output html

# WebPageTest
wget https://sites.google.com/a/webpagetest.org/companion/Ubuntu_14.04_x64_64/wpt_ubuntu.sh
```

### 18. 监控和告警

- **Real User Monitoring (RUM)**: 真实用户监控
- **Synthetic Monitoring**: 合成监控
- **APM 工具**: Sentry, New Relic, Datadog

```javascript
// 性能监控示例
const perfData = performance.getEntriesByType('navigation')[0];
console.log({
  domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
  loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
});
```

## 最佳实践

### 19. 代码分割策略

- 路由级分割
- 组件级分割
- 第三方库分割

```javascript
// Vite 配置
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'ui': ['antd'],
        },
      },
    },
  },
};
```

### 20. 首屏优化

- 关键 CSS 内联
- 骨架屏
- 渐进式增强
- 优先加载首屏资源

```html
<!-- 内联关键 CSS -->
<style>
  .critical { /* 首屏样式 */ }
</style>

<!-- 延迟加载非关键 JS -->
<script defer src="non-critical.js"></script>
```
