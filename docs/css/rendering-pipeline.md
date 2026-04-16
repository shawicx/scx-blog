# 渲染管线

## 什么是渲染管线

渲染管线（Rendering Pipeline）是浏览器将 HTML、CSS、JavaScript 转换为用户可见页面的完整过程。理解渲染管线对于优化网页性能至关重要。

## 渲染管线流程

浏览器渲染页面的基本流程如下：

```
1. 解析 HTML → 构建 DOM 树
   ↓
2. 解析 CSS → 构建 CSSOM 树
   ↓
3. 合并 DOM 和 CSSOM → 构建渲染树（Render Tree）
   ↓
4. 布局（Layout）→ 计算元素位置和尺寸
   ↓
5. 绘制（Paint）→ 填充像素
   ↓
6. 合成（Composite）→ 组合图层显示
```

## 详细流程解析

### 1. DOM 树构建

浏览器将 HTML 文档解析为 DOM（Document Object Model）树。

```html
<!DOCTYPE html>
<html>
  <head>
    <title>渲染管线</title>
  </head>
  <body>
    <div>
      <h1>标题</h1>
      <p>段落文本</p>
    </div>
  </body>
</html>
```

```javascript
// 对应的 DOM 树结构
document
├── html
    ├── head
    │   └── title
    │       └── "渲染管线"
    └── body
        └── div
            ├── h1
            │   └── "标题"
            └── p
                └── "段落文本"
```

**关键点**：
- HTML 解析是逐行进行的
- 遇到 `<script>` 标签会暂停 HTML 解析，等待脚本执行
- 可以使用 `async` 和 `defer` 优化脚本加载

```html
<script src="script.js"></script>          <!-- 阻塞解析 -->
<script async src="script.js"></script>     <!-- 异步加载，执行顺序不确定 -->
<script defer src="script.js"></script>     <!-- 异步加载，按顺序执行 -->
```

### 2. CSSOM 树构建

浏览器将 CSS 解析为 CSSOM（CSS Object Model）树。

```css
body {
  font-size: 16px;
  color: #333;
}

h1 {
  font-size: 24px;
  color: #000;
}

p {
  font-size: 14px;
  line-height: 1.6;
}
```

```javascript
// 对应的 CSSOM 树结构
body
├── font-size: 16px
├── color: #333
└── h1
    ├── font-size: 24px (继承 body，覆盖为 24px)
    ├── color: #000 (继承 body，覆盖为 #000)
    └── p
        ├── font-size: 14px (继承 body，覆盖为 14px)
        └── line-height: 1.6
```

**关键点**：
- CSSOM 构建会阻塞渲染
- JavaScript 可以访问和修改 CSSOM
- CSS 解析比 HTML 解析更快，但仍然重要

### 3. 渲染树构建

渲染树是 DOM 和 CSSOM 的组合，只包含需要显示的元素。

```html
<div class="visible">可见内容</div>
<div class="hidden">隐藏内容</div>
<script>document.querySelector('.hidden').style.display = 'none';</script>
```

```javascript
// 渲染树只包含可见元素
Render Tree
└── div.visible
    └── "可见内容"
```

**关键点**：
- 不可见元素（如 `display: none`）不会进入渲染树
- `visibility: hidden` 的元素会进入渲染树
- 渲染树不包含 `<head>`、`<meta>` 等非显示元素

### 4. 布局（Layout）

布局阶段计算每个元素的位置和尺寸。

```css
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.box {
  width: 200px;
  height: 200px;
  margin: 10px;
  padding: 15px;
  border: 2px solid #333;
}
```

布局计算包括：
- 元素的宽度和高度
- 元素的位置（top、left、right、bottom）
- 外边距、内边距、边框
- 溢出处理
- 浮动和定位的影响

**触发布局的操作**：
- 添加/删除 DOM 元素
- 修改元素样式（width、height、margin、padding、position 等）
- 修改浏览器窗口大小
- 激活 CSS 伪类

### 5. 绘制（Paint）

绘制阶段将渲染树的每个节点转换为屏幕上的像素。

绘制包括：
- 填充背景色
- 绘制边框
- 渲染文本
- 绘制图片
- 绘制阴影和渐变

**绘制顺序**：
1. 背景色
2. 边框
3. 文本
4. 图片
5. 阴影

**触发绘制的操作**：
- 修改颜色
- 修改背景图
- 修改边框样式
- 修改可见性

### 6. 合成（Composite）

合成阶段将各个图层的像素组合成最终图像。

**图层**：
- 浏览器将页面分为多个图层
- 每个图层独立绘制和合成
- 使用 GPU 加速合成

**触发新建图层的操作**：
- 3D 或透视变换
- 使用 `video` 或 `canvas` 元素
- 使用 `opacity` 和 `transform` 动画
- 使用 `will-change` 提示
- 拥有复合层后代

```css
.layer {
  /* 触发新建图层 */
  transform: translateZ(0);
  /* 或 */
  will-change: transform;
}
```

## 关键渲染路径

关键渲染路径（Critical Rendering Path）是指浏览器首次渲染页面所必须经历的最小路径。

```
1. HTML 解析 → DOM 树
2. CSS 解析 → CSSOM 树
3. 渲染树构建
4. 布局
5. 绘制
6. 合成
```

### 优化关键渲染路径

```html
<!DOCTYPE html>
<html>
<head>
  <!-- 1. 关键 CSS 内联 -->
  <style>
    /* 只包含首屏渲染所需的关键样式 */
    body { margin: 0; font-family: Arial, sans-serif; }
    .hero { height: 100vh; background: #333; color: white; }
  </style>
  
  <!-- 2. 预加载关键资源 -->
  <link rel="preload" href="styles.css" as="style">
  <link rel="preload" href="font.woff2" as="font" crossorigin>
  
  <!-- 3. 异步加载非关键资源 -->
  <link rel="stylesheet" href="styles.css" media="print" onload="this.media='all'">
  
  <!-- 4. 延迟执行 JavaScript -->
  <script src="script.js" defer></script>
</head>
<body>
  <div class="hero">首屏内容</div>
  
  <!-- 非关键内容 -->
  <div class="content">
    <!-- 内容 -->
  </div>
</body>
</html>
```

## 渲染优化技巧

### 1. 减少重排和重绘

**避免强制同步布局**：

```javascript
// 不好的做法 - 多次读取布局属性
function badLayout() {
  const elements = document.querySelectorAll('.item');
  elements.forEach(el => {
    const width = el.offsetWidth; // 强制同步布局
    el.style.height = width + 'px'; // 触发重排
    
    const height = el.offsetHeight; // 强制同步布局
    el.style.width = height + 'px'; // 触发重排
  });
}

// 好的做法 - 批量读写分离
function goodLayout() {
  const elements = document.querySelectorAll('.item');
  const widths = [];
  const heights = [];
  
  // 批量读取
  elements.forEach(el => {
    widths.push(el.offsetWidth);
    heights.push(el.offsetHeight);
  });
  
  // 批量写入
  elements.forEach((el, i) => {
    el.style.height = widths[i] + 'px';
    el.style.width = heights[i] + 'px';
  });
}
```

### 2. 使用 CSS 属性触发 GPU 加速

```css
/* 触发 GPU 加速的属性 */
.gpu-accelerated {
  transform: translateZ(0);
  /* 或 */
  transform: translate3d(0, 0, 0);
  /* 或 */
  will-change: transform;
  /* 或 */
  backface-visibility: hidden;
}
```

### 3. 优化动画性能

```css
/* 不好的动画 - 触发重排 */
.bad-animation {
  position: absolute;
  left: 0;
  transition: left 0.3s;
}

/* 好的动画 - 只触发合成 */
.good-animation {
  transform: translateX(0);
  transition: transform 0.3s;
  will-change: transform;
}
```

### 4. 使用 requestAnimationFrame

```javascript
// 不好的做法
function badAnimation() {
  const element = document.getElementById('box');
  let position = 0;
  
  setInterval(() => {
    position += 1;
    element.style.transform = `translateX(${position}px)`;
  }, 16);
}

// 好的做法
function goodAnimation() {
  const element = document.getElementById('box');
  let position = 0;
  
  function animate() {
    position += 1;
    element.style.transform = `translateX(${position}px)`;
    
    if (position < 100) {
      requestAnimationFrame(animate);
    }
  }
  
  requestAnimationFrame(animate);
}
```

### 5. 优化字体加载

```html
<!-- 1. 使用 font-display 优化字体加载 -->
<style>
  @font-face {
    font-family: 'CustomFont';
    src: url('font.woff2') format('woff2');
    font-display: swap; /* 使用系统字体替代，直到字体加载完成 */
  }
</style>

<!-- 2. 预加载字体 -->
<link rel="preload" href="font.woff2" as="font" crossorigin>

<!-- 3. 避免闪烁文本 -->
<style>
  body {
    font-family: 'CustomFont', sans-serif;
    font-display: fallback;
  }
</style>
```

### 6. 优化图片加载

```html
<!-- 1. 使用懒加载 -->
<img src="placeholder.jpg" data-src="image.jpg" loading="lazy" alt="图片">

<!-- 2. 使用响应式图片 -->
<img 
  srcset="image-small.jpg 480w, image-medium.jpg 768w, image-large.jpg 1200w"
  sizes="(max-width: 768px) 480px, 1200px"
  src="image-medium.jpg"
  alt="响应式图片"
>

<!-- 3. 使用 WebP 格式 -->
<picture>
  <source srcset="image.webp" type="image/webp">
  <source srcset="image.jpg" type="image/jpeg">
  <img src="image.jpg" alt="图片">
</picture>
```

### 7. 减少图层

```css
/* 不好的做法 - 创建过多图层 */
.bad-layers {
  transform: translateZ(0); /* 每个元素都创建图层 */
}

/* 好的做法 - 只在必要时创建图层 */
.good-layers {
  /* 只为需要动画的元素创建图层 */
  will-change: transform; /* 使用后移除 */
}

/* 使用 contains 减少布局计算 */
.isolated {
  contain: layout; /* 限制布局计算范围 */
}
```

## 性能监控工具

### 1. Chrome DevTools Performance

```javascript
// 使用 Performance API 记录性能
function measurePerformance() {
  // 开始记录
  performance.mark('start');
  
  // 执行操作
  const element = document.getElementById('box');
  element.style.width = '200px';
  
  // 结束记录
  performance.mark('end');
  performance.measure('operation', 'start', 'end');
  
  // 获取结果
  const measure = performance.getEntriesByName('operation')[0];
  console.log(`Duration: ${measure.duration}ms`);
}
```

### 2. Chrome DevTools Rendering

```
1. 打开 Chrome DevTools
2. 切换到 More Tools → Rendering
3. 启用以下选项：
   - Paint flashing: 高亮重绘区域
   - Layout Shift Regions: 高亮布局偏移区域
   - Layer borders: 显示图层边界
   - Frame rendering stats: 显示帧率统计
```

### 3. Chrome DevTools Layers

```
1. 打开 Chrome DevTools
2. 切换到 More Tools → Layers
3. 查看图层信息：
   - 图层数量
   - 图层大小
   - 合成原因
```

## 实际案例分析

### 案例 1：优化长列表渲染

**问题**：渲染 10000 个元素导致性能问题

```javascript
// 不好的做法 - 一次性渲染所有元素
function renderBadList() {
  const container = document.getElementById('list');
  
  for (let i = 0; i < 10000; i++) {
    const item = document.createElement('div');
    item.textContent = `Item ${i}`;
    container.appendChild(item); // 每次添加都触发重排
  }
}
```

**优化方案**：使用虚拟滚动

```javascript
// 好的做法 - 虚拟滚动
class VirtualList {
  constructor(options) {
    this.container = options.container;
    this.itemHeight = options.itemHeight;
    this.itemCount = options.itemCount;
    this.viewportHeight = options.viewportHeight;
    
    this.visibleCount = Math.ceil(this.viewportHeight / this.itemHeight);
    this.scrollTop = 0;
    
    this.init();
  }
  
  init() {
    this.render();
    this.bindEvents();
  }
  
  render() {
    const startIdx = Math.floor(this.scrollTop / this.itemHeight);
    const endIdx = Math.min(startIdx + this.visibleCount, this.itemCount);
    
    const html = [];
    for (let i = startIdx; i < endIdx; i++) {
      html.push(`<div style="height:${this.itemHeight}px">Item ${i}</div>`);
    }
    
    this.container.innerHTML = html.join('');
  }
  
  bindEvents() {
    this.container.addEventListener('scroll', () => {
      this.scrollTop = this.container.scrollTop;
      requestAnimationFrame(() => this.render());
    });
  }
}

// 使用
const virtualList = new VirtualList({
  container: document.getElementById('list'),
  itemHeight: 50,
  itemCount: 10000,
  viewportHeight: 600,
});
```

### 案例 2：优化动画性能

**问题**：使用 left/top 动画导致性能问题

```javascript
// 不好的做法
function animateBad() {
  const box = document.getElementById('box');
  let position = 0;
  
  setInterval(() => {
    position += 1;
    box.style.left = position + 'px'; // 触发重排
  }, 16);
}
```

**优化方案**：使用 transform

```javascript
// 好的做法
function animateGood() {
  const box = document.getElementById('box');
  let position = 0;
  
  function animate() {
    position += 1;
    box.style.transform = `translateX(${position}px)`; // 只触发合成
    
    if (position < 100) {
      requestAnimationFrame(animate);
    }
  }
  
  requestAnimationFrame(animate);
}
```

### 案例 3：优化首屏渲染

**问题**：首屏渲染时间过长

```html
<!DOCTYPE html>
<html>
<head>
  <!-- 不好的做法 - 阻塞渲染 -->
  <link rel="stylesheet" href="large-style.css">
  <script src="large-script.js"></script>
</head>
<body>
  <div class="hero">首屏内容</div>
</body>
</html>
```

**优化方案**：内联关键 CSS，延迟加载非关键资源

```html
<!DOCTYPE html>
<html>
<head>
  <!-- 内联关键 CSS -->
  <style>
    /* 只包含首屏渲染所需的关键样式 */
    body { margin: 0; }
    .hero { 
      height: 100vh; 
      display: flex; 
      align-items: center; 
      justify-content: center;
    }
  </style>
  
  <!-- 预加载关键资源 -->
  <link rel="preload" href="critical-font.woff2" as="font" crossorigin>
  
  <!-- 异步加载完整样式 -->
  <link rel="preload" href="full-style.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="full-style.css"></noscript>
  
  <!-- 延迟执行 JavaScript -->
  <script src="large-script.js" defer></script>
</head>
<body>
  <div class="hero">首屏内容</div>
  
  <!-- 非关键内容 -->
  <script>
    // 延迟加载非关键组件
    window.addEventListener('load', () => {
      import('./non-critical.js');
    });
  </script>
</body>
</html>
```

## 常见问题

### Q: 为什么 CSS 会阻塞渲染？

A: 浏览器需要构建 CSSOM 树才能知道如何渲染页面。如果 CSS 尚未加载完成，浏览器会等待，以避免闪烁或布局偏移。

### Q: 什么是 CLS（Cumulative Layout Shift）？

A: CLS 是累积布局偏移，衡量页面视觉稳定性的指标。低 CLS 意味着页面加载过程中布局稳定，用户体验好。

### Q: 如何减少 CLS？

A: 
1. 为图片和视频设置尺寸
2. 预留动态内容空间
3. 避免在现有内容上方插入内容
4. 使用 CSS contain 属性

### Q: 什么是 LCP（Largest Contentful Paint）？

A: LCP 是最大内容绘制，衡量页面主要内容加载速度的指标。LCP 反映了用户看到主要内容的时间。

### Q: 如何优化 LCP？

A: 
1. 优化关键 CSS
2. 预加载关键资源
3. 优化图片加载
4. 使用 CDN
5. 减少服务器响应时间

### Q: 什么是 FID（First Input Delay）？

A: FID 是首次输入延迟，衡量页面交互响应速度的指标。FID 反映了用户首次与页面交互时页面的响应速度。

### Q: 如何优化 FID？

A: 
1. 减少 JavaScript 执行时间
2. 拆分 JavaScript 代码
3. 使用 Web Workers
4. 优化事件处理器
5. 使用 requestIdleCallback

## 性能指标

### 核心性能指标

| 指标 | 定义 | 目标值 |
|------|------|--------|
| FCP（First Contentful Paint） | 首次内容绘制 | < 1.8s |
| LCP（Largest Contentful Paint） | 最大内容绘制 | < 2.5s |
| FID（First Input Delay） | 首次输入延迟 | < 100ms |
| CLS（Cumulative Layout Shift） | 累积布局偏移 | < 0.1 |
| TTI（Time to Interactive） | 可交互时间 | < 3.8s |

### 监控性能指标

```javascript
// 使用 Performance API 监控性能
function monitorPerformance() {
  // 监控 FCP
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach(entry => {
      console.log('FCP:', entry.startTime);
    });
  }).observe({ entryTypes: ['paint'] });
  
  // 监控 LCP
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach(entry => {
      console.log('LCP:', entry.startTime);
    });
  }).observe({ entryTypes: ['largest-contentful-paint'] });
  
  // 监控 FID
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach(entry => {
      console.log('FID:', entry.processingStart - entry.startTime);
    });
  }).observe({ entryTypes: ['first-input'] });
  
  // 监控 CLS
  let clsValue = 0;
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach(entry => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
        console.log('CLS:', clsValue);
      }
    });
  }).observe({ entryTypes: ['layout-shift'] });
}

monitorPerformance();
```

## 最佳实践总结

### DO（推荐）

1. **内联关键 CSS**：将首屏渲染所需的 CSS 内联到 HTML 中
2. **异步加载资源**：使用 `async`、`defer`、`preload` 等优化资源加载
3. **使用 GPU 加速**：通过 `transform`、`will-change` 触发 GPU 加速
4. **优化动画**：使用 `requestAnimationFrame` 优化动画性能
5. **虚拟滚动**：对长列表使用虚拟滚动技术
6. **图片优化**：使用懒加载、响应式图片、WebP 格式
7. **减少重排重绘**：批量修改样式，避免强制同步布局
8. **监控性能**：使用 Chrome DevTools 和 Performance API 监控性能

### DON'T（不推荐）

1. 避免阻塞渲染的 JavaScript
2. 避免在循环中读取布局属性
3. 避免频繁修改 DOM
4. 避免使用 `left`/`top` 进行动画
5. 避免创建过多的图层
6. 避免加载未使用的 CSS
7. 避免使用 CSS `@import`
8. 避免在首屏加载非关键资源

## 总结

渲染管线是浏览器将 HTML、CSS、JavaScript 转换为用户可见页面的完整过程。理解渲染管线对于优化网页性能至关重要。

### 关键要点

1. **理解流程**：DOM 树 → CSSOM 树 → 渲染树 → 布局 → 绘制 → 合成
2. **优化关键路径**：内联关键 CSS，异步加载非关键资源
3. **减少重排重绘**：批量修改样式，使用 GPU 加速
4. **优化动画**：使用 `transform` 和 `requestAnimationFrame`
5. **监控性能**：使用 Chrome DevTools 和 Performance API
6. **关注核心指标**：FCP、LCP、FID、CLS
