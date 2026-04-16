# 重绘与回流

## 什么是重绘和回流

### 重绘（Repaint）

重绘是指当元素的外观发生改变，但布局没有改变时，浏览器会重新绘制元素的过程。重绘不会影响页面的布局，只会改变元素的视觉样式。

常见的重绘操作：
- 修改颜色（`color`、`background-color`）
- 修改边框样式（`border`）
- 修改可见性（`visibility`）
- 修改背景图（`background-image`）
- 修改文本装饰（`text-decoration`）

### 回流（Reflow）

回流（也称为布局）是指当元素的尺寸、位置或布局发生改变时，浏览器需要重新计算页面布局的过程。回流比重绘更耗费性能。

常见的回流操作：
- 添加或删除可见的 DOM 元素
- 修改元素位置（`position`、`top`、`left`）
- 修改元素尺寸（`width`、`height`、`padding`、`margin`）
- 修改元素内容（文本或图片）
- 修改浏览器窗口大小
- 修改字体大小
- 激活 CSS 伪类（如 `:hover`）
- 查询布局信息（`offsetWidth`、`offsetHeight`、`clientWidth` 等）

## 重绘与回流的区别

| 特性 | 重绘 | 回流 |
|------|------|------|
| 影响范围 | 仅元素样式 | 整个页面布局 |
| 性能消耗 | 相对较小 | 较大 |
| 是否影响布局 | 不影响 | 影响 |
| 是否触发重绘 | 不一定 | 必然触发 |
| 执行顺序 | 可能在回流后执行 | 先执行 |

**关键点**：回流必然引起重绘，但重绘不一定会引起回流。

## 浏览器渲染过程

浏览器渲染页面的一般流程：

```
1. 构建 DOM 树
   ↓
2. 构建 CSSOM 树
   ↓
3. 合并 DOM 和 CSSOM，生成渲染树（Render Tree）
   ↓
4. 布局（Layout/Reflow）- 计算元素位置和大小
   ↓
5. 绘制（Paint/Repaint）- 填充像素
   ↓
6. 合成（Composite）- 组合图层
```

当页面发生变化时：
- 如果只有样式变化 → 重绘
- 如果布局变化 → 回流 + 重绘

## 触发重绘和回流的常见场景

### 1. DOM 操作

```javascript
// 触发回流
const element = document.getElementById('box');
element.style.width = '200px';
element.style.height = '200px';

// 触发重绘
element.style.backgroundColor = 'red';
```

### 2. class 切换

```javascript
// 可能触发回流
element.className = 'new-class';
```

### 3. 查询布局信息

```javascript
// 查询布局信息会强制同步回流
const width = element.offsetWidth; // 强制回流
const height = element.offsetHeight; // 强制回流
const rect = element.getBoundingClientRect(); // 强制回流
```

### 4. 浏览器窗口调整

```javascript
window.addEventListener('resize', () => {
  // 窗口大小改变会触发整个页面的回流
});
```

## 性能优化技巧

### 1. 批量修改样式

**不推荐**：

```javascript
const element = document.getElementById('box');

element.style.width = '200px'; // 回流
element.style.height = '200px'; // 回流
element.style.backgroundColor = 'red'; // 重绘
element.style.border = '1px solid #000'; // 重绘
```

**推荐**：

```javascript
const element = document.getElementById('box');

// 使用 class
element.className = 'new-class';

// 或使用 cssText
element.style.cssText = 'width: 200px; height: 200px; background-color: red; border: 1px solid #000;';
```

```css
.new-class {
  width: 200px;
  height: 200px;
  background-color: red;
  border: 1px solid #000;
}
```

### 2. 使用文档片段（DocumentFragment）

```javascript
const fragment = document.createDocumentFragment();

for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  div.textContent = `Item ${i}`;
  fragment.appendChild(div);
}

// 一次性添加到 DOM
document.body.appendChild(fragment);
```

### 3. 避免频繁查询布局信息

**不推荐**：

```javascript
function updateElement() {
  const element = document.getElementById('box');
  
  // 强制同步回流
  const width = element.offsetWidth;
  element.style.width = width + 10 + 'px';
  
  // 强制同步回流
  const height = element.offsetHeight;
  element.style.height = height + 10 + 'px';
}
```

**推荐**：

```javascript
function updateElement() {
  const element = document.getElementById('box');
  
  // 一次性获取所有布局信息
  const width = element.offsetWidth;
  const height = element.offsetHeight;
  
  // 批量修改
  element.style.width = width + 10 + 'px';
  element.style.height = height + 10 + 'px';
}
```

### 4. 使用 transform 和 opacity

使用 `transform` 和 `opacity` 进行动画可以避免回流，因为它们由合成器线程处理。

```css
.animated {
  /* 不会触发回流 */
  transform: translateX(100px);
  transform: scale(1.5);
  opacity: 0.5;
  
  /* 会触发回流 */
  left: 100px;
  width: 200px;
}
```

```javascript
// 推荐
element.style.transform = 'translateX(100px)';

// 不推荐
element.style.left = '100px';
```

### 5. 虚拟滚动（Virtual Scrolling）

对于大量数据的列表，使用虚拟滚动只渲染可见区域的元素。

```javascript
class VirtualScroll {
  constructor(options) {
    this.itemHeight = options.itemHeight;
    this.visibleCount = Math.ceil(options.containerHeight / this.itemHeight);
    this.scrollTop = 0;
    this.render();
  }

  render() {
    const startIdx = Math.floor(this.scrollTop / this.itemHeight);
    const endIdx = Math.min(startIdx + this.visibleCount, this.data.length);
    
    // 只渲染可见区域的元素
    const visibleData = this.data.slice(startIdx, endIdx);
    this.updateDOM(visibleData, startIdx);
  }
}
```

### 6. 使用 requestAnimationFrame

使用 `requestAnimationFrame` 来优化动画，确保在浏览器的下一次重绘前执行。

```javascript
function animate() {
  const element = document.getElementById('box');
  let currentLeft = 0;
  
  function step() {
    currentLeft += 1;
    element.style.transform = `translateX(${currentLeft}px)`;
    
    if (currentLeft < 100) {
      requestAnimationFrame(step);
    }
  }
  
  requestAnimationFrame(step);
}
```

### 7. 使用 will-change 提示浏览器

```css
.optimized {
  /* 提示浏览器该元素将发生变化，提前做好优化 */
  will-change: transform, opacity;
}
```

**注意**：不要过度使用 `will-change`，只在必要时使用。

### 8. 避免强制同步布局

**不推荐**：

```javascript
function layoutTrashing() {
  const elements = document.querySelectorAll('.item');
  
  elements.forEach(el => {
    // 强制同步布局
    const width = el.offsetWidth;
    
    // 强制同步布局
    el.style.height = width + 'px';
  });
}
```

**推荐**：

```javascript
function optimizedLayout() {
  const elements = document.querySelectorAll('.item');
  const widths = [];
  
  // 第一遍：只读取
  elements.forEach(el => {
    widths.push(el.offsetWidth);
  });
  
  // 第二遍：只写入
  elements.forEach((el, i) => {
    el.style.height = widths[i] + 'px';
  });
}
```

### 9. 使用 CSS Containment

```css
.contained {
  /* 创建独立的渲染子树 */
  contain: strict;
  /* 或 */
  contain: content;
}
```

### 10. 避免表格布局

表格布局会导致多次回流，尽量避免使用。

```html
<!-- 不推荐 -->
<table>
  <tr>
    <td>Cell 1</td>
    <td>Cell 2</td>
  </tr>
</table>

<!-- 推荐 -->
<div class="grid">
  <div class="cell">Cell 1</div>
  <div class="cell">Cell 2</div>
</div>
```

```css
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
```

## 性能检测工具

### 1. Chrome DevTools Performance

1. 打开 Chrome DevTools
2. 切换到 Performance 面板
3. 点击 Record 开始录制
4. 执行操作
5. 点击 Stop 停止录制
6. 分析结果，查找 Layout 和 Paint 事件

### 2. Chrome DevTools Rendering

1. 打开 Chrome DevTools
2. 切换到 More Tools → Rendering
3. 勾选以下选项：
   - **Paint flashing**：高亮重绘区域
   - **Layout Shift Regions**：高亮回流区域
   - **Layer borders**：显示图层边界

### 3. 使用 Performance API

```javascript
// 使用 Performance API 测量性能
function measurePerformance() {
  performance.mark('start');
  
  // 执行操作
  const element = document.getElementById('box');
  element.style.width = '200px';
  
  performance.mark('end');
  performance.measure('operation', 'start', 'end');
  
  const measure = performance.getEntriesByName('operation')[0];
  console.log(`Duration: ${measure.duration}ms`);
}
```

## 实际案例

### 案例 1：优化动态列表渲染

**问题**：每次添加元素都会触发回流

```javascript
// 不推荐
function addItems() {
  const container = document.getElementById('container');
  
  for (let i = 0; i < 100; i++) {
    const item = document.createElement('div');
    item.textContent = `Item ${i}`;
    container.appendChild(item); // 每次都触发回流
  }
}
```

**优化**：使用文档片段

```javascript
// 推荐
function addItems() {
  const container = document.getElementById('container');
  const fragment = document.createDocumentFragment();
  
  for (let i = 0; i < 100; i++) {
    const item = document.createElement('div');
    item.textContent = `Item ${i}`;
    fragment.appendChild(item); // 不触发回流
  }
  
  container.appendChild(fragment); // 只触发一次回流
}
```

### 案例 2：优化动画性能

**问题**：使用 left 和 top 属性进行动画

```css
/* 不推荐 */
.box {
  position: absolute;
  left: 0;
  top: 0;
  transition: left 0.3s, top 0.3s;
}

.box:hover {
  left: 100px;
  top: 100px;
}
```

**优化**：使用 transform

```css
/* 推荐 */
.box {
  transform: translate(0, 0);
  transition: transform 0.3s;
  will-change: transform;
}

.box:hover {
  transform: translate(100px, 100px);
}
```

### 案例 3：优化响应式布局

**问题**：频繁监听 resize 事件

```javascript
// 不推荐
window.addEventListener('resize', () => {
  // 每次窗口改变都会执行
  updateLayout();
});
```

**优化**：使用防抖（debounce）

```javascript
// 推荐
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

window.addEventListener('resize', debounce(updateLayout, 200));
```

## 常见问题

### Q: 为什么查询 offsetWidth 会触发回流？

A: 因为浏览器必须先计算最新的布局，才能返回正确的尺寸信息。这被称为"强制同步布局"（Forced Synchronous Layout）。

### Q: transform 为什么不会触发回流？

A: 因为 `transform` 在合成器线程中处理，不会影响文档流，浏览器可以创建一个新的合成图层，由 GPU 加速处理。

### Q: 如何判断某个操作是否触发回流？

A: 可以使用 Chrome DevTools 的 Performance 面板，或者使用 `csstriggers.com` 网站查询 CSS 属性触发的渲染操作。

### Q: 什么时候应该使用 will-change？

A: 当你知道某个元素将要频繁变化时（如动画、过渡等），可以提前使用 `will-change` 提示浏览器。但要避免过度使用。

## 最佳实践总结

### DO（推荐）

1. 使用 `transform` 和 `opacity` 进行动画
2. 批量修改样式，使用 class 或 cssText
3. 使用文档片段进行批量 DOM 操作
4. 使用 `requestAnimationFrame` 优化动画
5. 避免频繁查询布局信息
6. 使用虚拟滚动处理大量数据
7. 合理使用 `will-change` 提示浏览器
8. 使用防抖和节流优化事件处理

### DON'T（不推荐）

1. 避免频繁修改样式
2. 避免在循环中查询布局信息
3. 避免强制同步布局
4. 避免过度使用表格布局
5. 避免在动画中使用 `left`、`top`、`width`、`height`
6. 避免频繁操作 DOM
7. 避免使用复杂的 CSS 选择器

## 性能优化检查清单

- [ ] 是否使用了 `transform` 代替 `left`/`top` 进行动画？
- [ ] 是否批量修改了样式，而不是逐个修改？
- [ ] 是否避免了频繁查询布局信息？
- [ ] 是否使用了文档片段进行批量 DOM 操作？
- [ ] 是否使用了 `requestAnimationFrame` 优化动画？
- [ ] 是否使用了防抖/节流优化事件处理？
- [ ] 是否合理使用了 `will-change`？
- [ ] 是否避免了强制同步布局？
- [ ] 是否使用了虚拟滚动处理大量数据？
- [ ] 是否使用了 Chrome DevTools 性能工具进行分析？

## 总结

重绘和回流是浏览器渲染过程中的重要概念，掌握它们对于性能优化至关重要：

1. **理解区别**：回流比重绘更消耗性能，回流必然引起重绘
2. **识别场景**：了解哪些操作会触发回流，哪些只触发重绘
3. **优化技巧**：使用 transform、批量操作、文档片段等技术减少回流
4. **工具辅助**：使用 Chrome DevTools 等工具检测性能问题
5. **最佳实践**：遵循最佳实践，编写高性能的前端代码

通过合理减少重绘和回流，可以显著提升页面的性能和用户体验。记住：**先测量，后优化**。