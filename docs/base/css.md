# CSS 面试题

## 基础

### 1. CSS 盒模型

CSS 盒模型有四种：
- **content-box**: width 只包含内容
- **border-box**: width 包含内容、padding、border（推荐）
- **padding-box**: 包含内容和 padding
- **margin-box**: 包含所有（不推荐）

```css
box-sizing: border-box; /* 推荐 */
```

### 2. 选择器优先级

优先级从高到低：
1. `!important`
2. 内联样式 (style="...")
3. ID 选择器 (#id)
4. 类选择器、属性选择器、伪类 (.class, [attr], :hover)
5. 元素选择器、伪元素 (div, ::before)
6. 通配符选择器 (*)

计算权重：
- ID: 100
- 类: 10
- 元素: 1

```css
#nav .item { /* 100 + 10 = 110 */ }
.nav .item { /* 10 + 10 = 20 */ }
div.item { /* 1 + 10 = 11 */ }
```

### 3. BFC (块级格式化上下文)

BFC 是一个独立的渲染区域，内部的元素不会影响外部元素。

**触发 BFC 的条件**:
- `overflow: hidden/auto/scroll`
- `float: left/right`
- `position: absolute/fixed`
- `display: flex/grid/inline-block/table-cell`

**应用场景**:
- 清除浮动
- 防止 margin 重叠
- 阻止元素被浮动元素覆盖

```css
.container {
  overflow: hidden; /* 创建 BFC */
}
```

## 布局

### 4. Flexbox 布局

```css
.container {
  display: flex;
  flex-direction: row;      /* row | row-reverse | column | column-reverse */
  justify-content: center;   /* 主轴对齐 */
  align-items: center;      /* 交叉轴对齐 */
  flex-wrap: wrap;          /* 是否换行 */
}

.item {
  flex: 1;                 /* flex-grow: 1; flex-shrink: 1; flex-basis: 0% */
  flex-grow: 1;            /* 放大比例 */
  flex-shrink: 0;          /* 缩小比例 */
  flex-basis: auto;        /* 基础大小 */
  align-self: flex-start;   /* 单独对齐 */
}
```

### 5. Grid 布局

```css
.container {
  display: grid;
  grid-template-columns: 1fr 2fr;  /* 两列，比例 1:2 */
  grid-template-rows: auto;         /* 行高自动 */
  gap: 20px;                      /* 间距 */
  grid-template-areas:
    "header header"
    "sidebar content"
    "footer footer";
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.content { grid-area: content; }
.footer { grid-area: footer; }
```

### 6. 居中方法

**水平居中**:
```css
/* 1. Flex */
.container { display: flex; justify-content: center; }

/* 2. Margin */
.element { margin: 0 auto; }

/* 3. Absolute */
.container { position: relative; }
.element {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
```

**垂直居中**:
```css
/* 1. Flex */
.container {
  display: flex;
  align-items: center;
}

/* 2. Grid */
.container {
  display: grid;
  place-items: center;
}

/* 3. Absolute */
.container { position: relative; }
.element {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

/* 4. Flex + Margin */
.container { display: flex; }
.element { margin: auto; }
```

### 7. 响应式设计

```css
/* 媒体查询 */
@media (max-width: 768px) {
  .container { width: 100%; }
}

/* 相对单位 */
.container { width: 80vw; }      /* 视口宽度的 80% */
.text { font-size: 1rem; }       /* 根元素字体大小 */
```

### 8. 三栏布局（圣杯/双飞翼）

**Flex 方案**:
```css
.container {
  display: flex;
}
.left { width: 200px; }
.center { flex: 1; }
.right { width: 200px; }
```

## 效果

### 9. 动画

```css
/* Transition 过渡 */
.box {
  transition: all 0.3s ease;
}
.box:hover {
  transform: scale(1.1);
}

/* Keyframes 动画 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.box {
  animation: slideIn 0.5s ease-in-out;
}
```

### 10. 阴影和圆角

```css
.box {
  border-radius: 8px;              /* 圆角 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 阴影 */
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2); /* 文字阴影 */
}
```

## 高级

### 11. CSS 变量

```css
:root {
  --primary-color: #3498db;
  --font-size: 16px;
}

.button {
  background: var(--primary-color);
  font-size: var(--font-size);
}

/* 动态修改 */
document.documentElement.style.setProperty('--primary-color', '#e74c3c');
```

### 12. 浏览器前缀

```css
.box {
  -webkit-transform: rotate(30deg);
  -moz-transform: rotate(30deg);
  -ms-transform: rotate(30deg);
  transform: rotate(30deg);
}

/* 或使用 Autoprefixer 自动添加 */
```

### 13. 性能优化

- **避免使用 `@import`**: 阻塞渲染
- **减少重排和重绘**: 使用 `transform` 和 `opacity`
- **使用 CSS 动画代替 JS 动画**
- **硬件加速**: `transform: translateZ(0)`
- **选择器优化**: 避免过深的嵌套
- **压缩 CSS**: 减小文件大小

```css
/* 推荐 */
.animated {
  transform: translateX(100px);
  transition: transform 0.3s;
}

/* 不推荐 */
.animated {
  left: 100px; /* 触发重排 */
}
```

### 14. CSS 预处理器（Sass/Less）

**Sass 示例**:
```scss
// 变量
$primary: #3498db;

// 嵌套
.nav {
  ul { margin: 0; }
  li { list-style: none; }
}

// 混合
@mixin button($bg) {
  background: $bg;
  border: none;
  padding: 10px;
}

.primary-btn { @include button($primary); }

// 继承
.error {
  color: red;
}
.critical { @extend .error; font-weight: bold; }
```
