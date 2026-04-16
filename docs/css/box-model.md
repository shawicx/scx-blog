# 盒模型

## 什么是盒模型

盒模型（Box Model）是 CSS 中一个核心概念，它描述了元素在页面中如何占用空间。每个 HTML 元素都被看作一个矩形的盒子，这个盒子由四个部分组成：

1. **内容区域（Content）**：元素的实际内容，如文本、图片等
2. **内边距（Padding）**：内容与边框之间的空间
3. **边框（Border）**：包裹内容和内边距的边界
4. **外边距（Margin）**：边框与其他元素之间的空间

```
┌─────────────────────────────┐
│         Margin              │
│  ┌───────────────────────┐  │
│  │      Border           │  │
│  │  ┌─────────────────┐  │  │
│  │  │   Padding       │  │  │
│  │  │  ┌───────────┐  │  │  │
│  │  │  │  Content  │  │  │  │
│  │  │  └───────────┘  │  │  │
│  │  └─────────────────┘  │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

## 两种盒模型

CSS 中存在两种盒模型：

### 1. 标准盒模型（content-box）

在标准盒模型中，`width` 和 `height` 只包含内容区域的尺寸，不包括 padding、border 和 margin。

```css
.box {
  width: 200px;
  padding: 20px;
  border: 5px solid #333;
  margin: 10px;
  /* 使用标准盒模型 */
  box-sizing: content-box;
}
```

在标准盒模型下：
- 内容宽度：200px
- 实际元素宽度：200 + 20×2 + 5×2 = 250px
- 实际占用宽度：250 + 10×2 = 270px

### 2. IE 盒模型（border-box）

在 IE 盒模型中，`width` 和 `height` 包含内容、padding 和 border，但不包括 margin。

```css
.box {
  width: 200px;
  padding: 20px;
  border: 5px solid #333;
  margin: 10px;
  /* 使用 IE 盒模型 */
  box-sizing: border-box;
}
```

在 IE 盒模型下：
- 内容宽度：200 - 20×2 - 5×2 = 150px
- 实际元素宽度：200px
- 实际占用宽度：200 + 10×2 = 220px

## 如何设置盒模型

使用 `box-sizing` 属性来设置盒模型：

```css
/* 标准盒模型（默认） */
box-sizing: content-box;

/* IE 盒模型（推荐） */
box-sizing: border-box;

/* 继承父元素的值 */
box-sizing: inherit;
```

### 推荐做法

在开发中，通常将所有元素设置为 border-box：

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

这样可以避免因 padding 和 border 导致的尺寸计算问题，使布局更加直观。

## Margin 合并

Margin 合并（Margin Collapse）是盒模型中的一个重要概念，当两个垂直方向的外边距相遇时，它们会合并成一个外边距。

### 1. 相邻兄弟元素

```html
<div class="box1">Box 1</div>
<div class="box2">Box 2</div>
```

```css
.box1 {
  margin-bottom: 20px;
}

.box2 {
  margin-top: 30px;
}
```

两个元素之间的实际间距是 30px（取较大值），而不是 50px。

### 2. 父子元素

```html
<div class="parent">
  <div class="child">Child</div>
</div>
```

```css
.parent {
  margin-top: 20px;
}

.child {
  margin-top: 30px;
}
```

父元素的实际 margin-top 是 30px（取较大值）。

### 如何避免 Margin 合并

1. **创建 BFC**（块级格式化上下文）

```css
.parent {
  overflow: hidden;
  /* 或者 */
  display: flow-root;
}
```

2. **使用 padding 代替 margin**

```css
.parent {
  padding-top: 30px;
}
```

3. **添加边框**

```css
.parent {
  border-top: 1px solid transparent;
}
```

## 实际应用

### 居中元素

```css
.container {
  width: 300px;
  height: 300px;
  margin: 0 auto; /* 水平居中 */
}
```

### 固定宽高比

```css
.aspect-ratio-box {
  width: 100%;
  padding-top: 56.25%; /* 16:9 */
  position: relative;
}
```

### 响应式布局

使用 `box-sizing: border-box` 可以更容易地实现响应式布局：

```css
.container {
  display: flex;
  flex-wrap: wrap;
}

.item {
  width: 33.33%;
  padding: 10px;
  border: 1px solid #ddd;
  box-sizing: border-box;
}
```

## 总结

盒模型是 CSS 的基础，掌握它对于布局开发至关重要：

1. 理解盒模型的四个组成部分：Content、Padding、Border、Margin
2. 了解两种盒模型的区别：content-box 和 border-box
3. 推荐使用 `box-sizing: border-box` 简化布局计算
4. 注意 Margin 合并现象，并知道如何处理
5. 利用盒模型特性实现常见的布局效果
