# CSS 原子化与 CSS Modules

## 什么是 CSS 原子化

CSS 原子化（Atomic CSS）是一种 CSS 架构方法，通过创建单一用途的原子类（utility classes）来构建界面。每个原子类只做一件事情，比如设置一个具体的属性值。

### 基本概念

```html
<!-- 传统 CSS 写法 -->
<div class="card">
  <h2 class="title">标题</h2>
  <p class="content">内容</p>
</div>

<style>
.card {
  padding: 1rem;
  border-radius: 8px;
  background: white;
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.content {
  color: #666;
  line-height: 1.6;
}
</style>

<!-- 原子化 CSS 写法 -->
<div class="p-4 rounded-lg bg-white">
  <h2 class="text-2xl font-bold mb-2">标题</h2>
  <p class="text-gray-600 leading-relaxed">内容</p>
</div>
```

### 原子化 CSS 的特点

1. **单一职责**：每个类只负责一个样式属性
2. **可复用性**：相同的类可以在任何地方使用
3. **可预测性**：类名直观反映其作用
4. **一致性**：全局使用统一的设计系统
5. **可维护性**：减少样式冲突，易于修改

## 什么是 CSS Modules

CSS Modules 是一种 CSS 架构方案，通过将 CSS 样式局部化，自动生成唯一的类名，避免全局样式冲突。

### 基本概念

```css
/* Button.module.css */
.button {
  padding: 10px 20px;
  border-radius: 4px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
}

.button:hover {
  background-color: #45a049;
}
```

```jsx
// Button.jsx
import styles from './Button.module.css';

function Button({ children }) {
  return <button className={styles.button}>{children}</button>;
}

// 编译后生成的类名：Button_button__abc123
```

### CSS Modules 的特点

1. **局部作用域**：每个模块的样式相互独立
2. **避免冲突**：自动生成唯一类名
3. **模块化**：每个组件对应一个样式模块
4. **类型安全**：配合 TypeScript 使用时类型安全
5. **组合性**：可以轻松组合多个样式

## 原子化 CSS 框架对比

### Tailwind CSS

Tailwind CSS 是目前最流行的原子化 CSS 框架。

#### 安装

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### 配置

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,vue}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#10b981',
      },
    },
  },
  plugins: [],
}
```

#### 使用示例

```html
<div class="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <div class="flex items-center space-x-4">
    <img class="w-10 h-10 rounded-full" src="/avatar.jpg" alt="Avatar">
    <div>
      <h3 class="font-bold text-gray-900">张三</h3>
      <p class="text-sm text-gray-500">前端开发工程师</p>
    </div>
  </div>
  <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
    关注
  </button>
</div>
```

#### 优点

- **零运行时**：构建时生成 CSS，无额外 JavaScript 依赖
- **高度可定制**：通过配置文件完全定制设计系统
- **优秀的开发体验**：IDE 智能提示、自动补全
- **生产优化**：自动移除未使用的样式
- **丰富的生态**：官方插件、社区工具、UI 组件库

#### 缺点

- **HTML 冗长**：类名较多，HTML 可读性降低
- **学习曲线**：需要记忆大量工具类
- **团队协作**：需要团队统一使用规范
- **灵活性**：某些复杂样式仍需自定义 CSS

### UnoCSS

UnoCSS 是一个即时的原子化 CSS 引擎，由 Vue/Vite 团队成员 Anthony Fu 开发。

#### 安装

```bash
npm install -D unocss
```

#### 配置

```javascript
// vite.config.js
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    UnoCSS(),
  ],
})
```

```javascript
// uno.config.js
import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),      // 默认预设，类似 Tailwind
    presetAttributify(), // 属性模式
    presetIcons(),    // 图标支持
  ],
  shortcuts: {
    'btn': 'px-4 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition',
  },
})
```

#### 使用示例

```html
<!-- 类名模式 -->
<div class="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <div class="flex items-center space-x-4">
    <img class="w-10 h-10 rounded-full" src="/avatar.jpg">
    <div>
      <h3 class="font-bold text-gray-900">张三</h3>
      <p class="text-sm text-gray-500">前端开发工程师</p>
    </div>
  </div>
  <button class="btn">关注</button>
</div>

<!-- 属性模式 -->
<div 
  flex 
  items-center 
  justify-between 
  p="4" 
  bg="white" 
  rounded="lg" 
  shadow="md"
>
  <div flex items-center space-x="4">
    <img w="10" h="10" rounded="full" src="/avatar.jpg">
    <div>
      <h3 font-bold text-gray-900>张三</h3>
      <p text-sm text-gray-500>前端开发工程师</p>
    </div>
  </div>
  <button btn>关注</button>
</div>
```

#### 优点

- **极快的速度**：即时生成，无需预扫描
- **轻量级**：核心包体积小，按需加载
- **高度可扩展**：自定义规则、预设和插件
- **属性模式**：支持类似 Vue 的属性语法
- **开发体验**：支持任意 CSS 属性值，如 `text-[#123]`
- **灵活配置**：支持动态值，如 `w-[50%]`

#### 缺点

- **生态较小**：相比 Tailwind，社区资源和工具较少
- **文档完善度**：文档和教程相对较少
- **成熟度**：相对较新，生产使用案例较少

## Tailwind CSS vs UnoCSS

### 性能对比

| 特性 | Tailwind CSS | UnoCSS |
|------|-------------|--------|
| 构建速度 | 较快 | 极快 |
| 包体积 | 较大（~3KB gzipped） | 极小（~1KB gzipped） |
| 运行时 | 构建时生成 | 即时生成 |
| 开发体验 | 优秀 | 优秀 |

### 功能对比

| 功能 | Tailwind CSS | UnoCSS |
|------|-------------|--------|
| 默认预设 | 完整 | 完整 |
| 属性模式 | 需插件 | 原生支持 |
| 动态值 | 支持（JIT 模式） | 原生支持 |
| 图标支持 | 需配置 | 内置预设 |
| 快捷方式 | 无 | 原生支持 |
| CSS-in-JS | 无 | 内置支持 |

### 语法对比

```html
<!-- Tailwind CSS -->
<div class="text-lg font-bold text-blue-500 hover:text-blue-600 transition">
  Hello World
</div>

<!-- UnoCSS - 类名模式 -->
<div class="text-lg font-bold text-blue-500 hover:text-blue-600 transition">
  Hello World
</div>

<!-- UnoCSS - 属性模式 -->
<div text="lg" font="bold" text="blue-500" hover:text="blue-600" transition>
  Hello World
</div>

<!-- UnoCSS - 快捷方式 -->
<div class="text-blue">
  Hello World
</div>

<!-- UnoCSS - 动态值 -->
<div class="text-[#ff6b6b] p-[12px]">
  Hello World
</div>
```

### 配置对比

```javascript
// Tailwind CSS
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
      },
      spacing: {
        '128': '32rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

// UnoCSS
import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
  ],
  theme: {
    colors: {
      primary: '#3b82f6',
    },
    spacing: {
      '128': '32rem',
    },
  },
  shortcuts: {
    'btn': 'px-4 py-1 rounded bg-blue-500 text-white hover:bg-blue-600',
  },
})
```

### 生态系统对比

| 生态 | Tailwind CSS | UnoCSS |
|------|-------------|--------|
| 官方文档 | 非常完善 | 逐步完善 |
| 社区插件 | 丰富 | 较少 |
| UI 组件库 | 众多 | 较少 |
| 学习资源 | 大量 | 较少 |
| 生产案例 | 大量 | 增长中 |

## 如何选择

### 选择 Tailwind CSS

- 需要成熟的生态系统和丰富的社区支持
- 团队已有 Tailwind CSS 使用经验
- 需要大量的官方插件和工具
- 追求稳定性和可靠性
- 项目需要长期维护

### 选择 UnoCSS

- 追求极致的构建速度
- 项目使用 Vite
- 需要灵活的定制和扩展
- 喜欢 UnoCSS 的语法特性（属性模式、快捷方式等）
- 项目对包体积敏感

### 选择 CSS Modules

- 项目使用传统 CSS 写法
- 需要模块化和局部作用域
- 团队习惯 BEM 等命名规范
- 项目已有成熟的 CSS 架构
- 不想引入新的学习成本

## 实际应用案例

### 案例 1：React + Tailwind CSS

```jsx
// components/Card.jsx
function Card({ title, description, image }) {
  return (
    <div className="max-w-sm rounded-lg overflow-hidden shadow-lg bg-white">
      {image && (
        <img 
          className="w-full h-48 object-cover" 
          src={image} 
          alt={title}
        />
      )}
      <div className="px-6 py-4">
        <h2 className="font-bold text-xl mb-2 text-gray-800">{title}</h2>
        <p className="text-gray-600 text-base">{description}</p>
      </div>
      <div className="px-6 pt-4 pb-2">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          了解更多
        </button>
      </div>
    </div>
  );
}
```

### 案例 2：React + CSS Modules

```jsx
// components/Card.module.css
.card {
  max-width: 400px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background: white;
}

.image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.content {
  padding: 1.5rem;
}

.title {
  font-weight: 700;
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.description {
  color: #6b7280;
  line-height: 1.6;
}

.footer {
  padding: 1rem 1.5rem;
  padding-top: 0;
}

.button {
  background-color: #3b82f6;
  color: white;
  font-weight: 700;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.button:hover {
  background-color: #2563eb;
}
```

```jsx
// components/Card.jsx
import styles from './Card.module.css';

function Card({ title, description, image }) {
  return (
    <div className={styles.card}>
      {image && (
        <img className={styles.image} src={image} alt={title} />
      )}
      <div className={styles.content}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
      </div>
      <div className={styles.footer}>
        <button className={styles.button}>了解更多</button>
      </div>
    </div>
  );
}
```

### 案例 3：Vue + UnoCSS

```vue
<!-- components/Card.vue -->
<template>
  <div 
    class="max-w-sm rounded-lg overflow-hidden shadow-lg bg-white"
    v-if="image"
  >
    <img 
      class="w-full h-48 object-cover" 
      :src="image" 
      :alt="title"
    >
    <div class="px-6 py-4">
      <h2 class="font-bold text-xl mb-2 text-gray-800">{{ title }}</h2>
      <p class="text-gray-600 text-base">{{ description }}</p>
    </div>
    <div class="px-6 pt-4 pb-2">
      <button class="btn">了解更多</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  description: String,
  image: String,
});
</script>
```

### 案例 4：混合使用

```jsx
// 在某些场景下混合使用原子化和 CSS Modules
import styles from './Card.module.css';

function Card({ title, description }) {
  return (
    <div 
      className={`
        ${styles.card} 
        rounded-lg shadow-lg bg-white p-6
      `}
    >
      <h2 className={`${styles.title} text-2xl font-bold mb-2`}>
        {title}
      </h2>
      <p className={styles.description}>
        {description}
      </p>
      <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        了解更多
      </button>
    </div>
  );
}
```

## 最佳实践

### 1. 组件化

```jsx
// 原子化 CSS 应该封装在组件中
function Button({ children, variant = 'primary' }) {
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
  };

  return (
    <button 
      className={`
        px-4 py-2 rounded transition 
        ${variantClasses[variant]}
      `}
    >
      {children}
    </button>
  );
}
```

### 2. 提取常用组合

```javascript
// uno.config.js
export default defineConfig({
  shortcuts: {
    'btn': 'px-4 py-1 rounded transition cursor-pointer',
    'btn-primary': 'btn bg-blue-500 text-white hover:bg-blue-600',
    'card': 'p-4 bg-white rounded-lg shadow-md',
    'flex-center': 'flex items-center justify-center',
  },
});
```

### 3. 使用 @apply 指令

```css
/* components.css */
.btn {
  @apply px-4 py-2 rounded font-bold cursor-pointer transition;
}

.btn-primary {
  @apply bg-blue-500 text-white hover:bg-blue-600;
}
```

### 4. 组织样式

```jsx
// 统一组件的类名顺序
function Card({ title, description }) {
  return (
    <div className="
      max-w-sm 
      rounded-lg 
      overflow-hidden 
      shadow-lg 
      bg-white
    ">
      <div className="
        px-6 
        py-4
      ">
        <h2 className="
          font-bold 
          text-xl 
          mb-2 
          text-gray-800
        ">
          {title}
        </h2>
        <p className="
          text-gray-600 
          text-base
        ">
          {description}
        </p>
      </div>
    </div>
  );
}
```

## 性能优化

### 1. 启用 JIT 模式

```javascript
// tailwind.config.js
module.exports = {
  mode: 'jit',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
}
```

### 2. 按需加载

```javascript
// 只加载需要的预设
import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    // 避免加载不需要的预设
    // presetAttributify(),
    // presetIcons(),
  ],
})
```

### 3. 生产环境优化

```javascript
// 移除未使用的样式
const purgecss = require('@fullhuman/postcss-purgecss')({
  content: ['./src/**/*.html'],
  defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
})

module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    ...(process.env.NODE_ENV === 'production' ? [purgecss] : []),
  ],
}
```

## 总结

### 选择建议

| 场景 | 推荐方案 |
|------|---------|
| 新项目，追求现代化 | Tailwind CSS / UnoCSS |
| Vite 项目，追求性能 | UnoCSS |
| 大型团队，需要稳定 | Tailwind CSS |
| 传统项目，渐进式 | CSS Modules |
| 需要类型安全 | CSS Modules + TypeScript |
| 小型项目，简单快速 | 原子化 CSS |

### 核心要点

1. **原子化 CSS**：通过工具类快速构建界面，提高开发效率
2. **CSS Modules**：提供局部作用域，避免样式冲突
3. **Tailwind CSS**：成熟的原子化框架，生态丰富
4. **UnoCSS**：轻量快速的原子化引擎，灵活强大
5. **混合使用**：根据项目需求选择合适的技术

### 最佳实践

- 新项目优先考虑原子化 CSS
- 大型团队使用 Tailwind CSS 确保一致性
- 性能敏感项目考虑 UnoCSS
- 复杂组件可以混合使用多种方案
- 始终考虑团队的技术栈和学习成本
