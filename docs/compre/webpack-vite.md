# Webpack 与 Vite 详解

## 1. 基础介绍

### 1.1 什么是 Webpack

Webpack 是一个静态模块打包工具，将 JavaScript 应用中的各种资源（JS、CSS、图片等）视为模块，通过分析依赖关系将其打包成适合浏览器运行的静态文件。

**核心特点**:
- 基于配置的打包流程
- 强大的 Loader 和 Plugin 生态
- 代码分割（Code Splitting）
- Tree Shaking（摇树优化）
- 模块热替换（HMR）

### 1.2 什么是 Vite

Vite 是新一代前端构建工具，由 Vue 作者尤雨溪开发。开发阶段利用浏览器原生 ES Module 实现极速冷启动，生产构建基于 Rollup 进行打包。

**核心特点**:
- 开发环境极速冷启动
- 即时的模块热替换（HMR）
- 开箱即用的配置
- 基于 Rollup 的生产构建
- 丰富的插件生态

### 1.3 核心对比

| 特性 | Webpack | Vite |
|------|---------|------|
| 开发服务器启动 | 全量打包后启动 | 按需编译，毫秒级启动 |
| HMR 速度 | 随项目增大变慢 | 与项目规模无关 |
| 构建工具 | 自身打包 | 开发：esbuild / 生产：Rollup |
| 配置复杂度 | 较高 | 较低，开箱即用 |
| 生态成熟度 | 非常成熟 | 快速成长中 |
| 适用场景 | 复杂企业级项目 | 新项目、中小型项目 |

## 2. Webpack 详解

### 2.1 核心概念

```
入口（Entry）
  → 加载器（Loader）转换文件
    → 插件（Plugin）扩展功能
      → 输出（Output）生成打包文件
```

**五个核心概念**:

| 概念 | 说明 |
|------|------|
| Entry | 打包的入口文件，Webpack 从这里开始分析依赖 |
| Output | 打包后的文件输出位置和命名规则 |
| Loader | 让 Webpack 能够处理非 JS 文件（CSS、图片等） |
| Plugin | 扩展 Webpack 功能（压缩、提取 CSS、注入环境变量等） |
| Mode | `development` 或 `production`，启用对应的内置优化 |

### 2.2 基础配置

```javascript
// webpack.config.js
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: './src/index.js',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash:8].js',
    clean: true,
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|gif)$/,
        type: 'asset/resource',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],

  devServer: {
    static: './dist',
    hot: true,
    port: 3000,
  },
}
```

### 2.3 常用 Loader

| Loader | 用途 |
|--------|------|
| `babel-loader` | 将 ES6+ 转换为 ES5 |
| `css-loader` | 解析 CSS 文件中的 `@import` 和 `url()` |
| `style-loader` | 将 CSS 注入 DOM 的 `<style>` 标签 |
| `sass-loader` | 编译 Sass/SCSS 文件 |
| `postcss-loader` | 使用 PostCSS 处理 CSS（自动添加前缀等） |
| `file-loader` | 处理文件，输出到目录并返回 URL |
| `url-loader` | 小文件转 base64 Data URL |

### 2.4 常用 Plugin

| Plugin | 用途 |
|--------|------|
| `HtmlWebpackPlugin` | 自动生成 HTML 并引入打包文件 |
| `MiniCssExtractPlugin` | 将 CSS 提取为独立文件 |
| `CssMinimizerPlugin` | 压缩 CSS |
| `TerserPlugin` | 压缩 JavaScript |
| `DefinePlugin` | 注入全局常量（环境变量） |
| `CopyPlugin` | 复制静态文件到输出目录 |

### 2.5 代码分割

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // 第三方库单独打包
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
  },
}
```

**动态导入**:
```javascript
// 路由懒加载
const Home = () => import('./pages/Home')
const About = () => import('./pages/About')

// 条件加载
if (featureEnabled) {
  import('./feature').then(module => {
    module.init()
  })
}
```

## 3. Vite 详解

### 3.1 核心原理

**开发环境**:

```
浏览器请求 index.html
  → 发现 <script type="module">
    → 请求 /src/main.js
      → Vite 拦截请求，按需编译并返回
        → import 的依赖继续按需加载
```

Vite 利用浏览器原生 ES Module，只在浏览器请求某个模块时才编译该文件，无需全量打包，因此冷启动极快。

**生产构建**:

使用 Rollup 进行打包，支持 Tree Shaking、懒加载、CSS 代码分割等优化。

### 3.2 基础配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },

  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
```

### 3.3 静态资源处理

```javascript
// 直接引入（返回 URL）
import imgUrl from './logo.png'

// JSON 导入
import data from './data.json'

// Web Worker
import Worker from './worker?worker'

// CSS Modules
import styles from './index.module.css'
```

### 3.4 环境变量

```bash
# .env.development
VITE_API_URL=http://localhost:8080

# .env.production
VITE_API_URL=https://api.example.com
```

```javascript
// 使用环境变量（必须以 VITE_ 开头）
const apiUrl = import.meta.env.VITE_API_URL
const isDev = import.meta.env.DEV
```

### 3.5 插件机制

Vite 插件基于 Rollup 插件接口扩展，增加了 Vite 独有的钩子：

```javascript
// 自定义插件示例
function myPlugin() {
  return {
    name: 'my-plugin',
    // Vite 独有钩子
    configureServer(server) {
      // 配置开发服务器
    },
    transformIndexHtml(html) {
      // 转换 index.html
    },
    // Rollup 钩子（生产构建时生效）
    transform(code, id) {
      // 转换模块代码
    },
  }
}
```

**常用插件**:

| 插件 | 用途 |
|------|------|
| `@vitejs/plugin-react` | React 支持（JSX、Fast Refresh） |
| `@vitejs/plugin-vue` | Vue SFC 支持 |
| `vite-plugin-svgr` | SVG 作为 React 组件导入 |
| `vite-plugin-compression` | Gzip/Brotli 压缩 |

## 4. 性能对比

### 4.1 开发启动速度

```
项目规模: 1000+ 模块

Webpack:
  冷启动: 10s ~ 30s+（需全量打包）
  HMR:   1s ~ 5s（需重新打包变更模块链）

Vite:
  冷启动: 300ms ~ 800ms（按需编译）
  HMR:   < 100ms（精确模块替换）
```

### 4.2 为什么 Vite 更快

**Webpack 的打包流程**:

```
启动 → 从入口递归分析所有依赖 → 打包所有模块 → 启动服务器 → 浏览器加载
（项目越大，分析打包越慢）
```

**Vite 的按需加载**:

```
启动 → 启动服务器（几乎瞬间）→ 浏览器请求模块 → 按需编译返回
（只编译当前页面需要的模块，项目大小不影响启动速度）
```

### 4.3 生产构建对比

| 指标 | Webpack | Vite (Rollup) |
|------|---------|---------------|
| 构建速度 | 中等 | 较快 |
| 输出体积 | 相近 | 相近 |
| Tree Shaking | 支持 | 支持（Rollup 原生更优） |
| 代码分割 | 灵活 | 灵活 |
| CSS 处理 | 依赖 Loader | 内置支持 |

## 5. 迁移指南

### 5.1 从 Webpack 迁移到 Vite

**1. 替换配置文件**:

```javascript
// webpack.config.js → vite.config.js

// Webpack alias
resolve: {
  alias: { '@': path.resolve(__dirname, 'src') }
}

// Vite alias
resolve: {
  alias: { '@': '/src' }
}
```

**2. 替换环境变量**:

```javascript
// Webpack
process.env.NODE_ENV
process.env.API_URL

// Vite
import.meta.env.MODE
import.meta.env.VITE_API_URL  // 必须 VITE_ 前缀
```

**3. 替换静态资源引入**:

```javascript
// Webpack
const url = require('./logo.png')

// Vite
import url from './logo.png'
```

**4. index.html 移到根目录**:

```html
<!-- 添加 module 类型 -->
<script type="module" src="/src/main.js"></script>
```

**5. 替换 Loader**:

| Webpack Loader | Vite 替代方案 |
|----------------|--------------|
| `babel-loader` | 内置 esbuild 转译 |
| `css-loader` + `style-loader` | 内置 CSS 支持 |
| `sass-loader` | 安装 sass 即可，内置支持 |
| `file-loader` / `url-loader` | 内置静态资源处理 |
| `postcss-loader` | 使用 postcss.config.js |

### 5.2 迁移注意事项

- **CommonJS 依赖**：Vite 开发环境基于 ESM，纯 CJS 包可能需要预构建优化
- **全局变量**：Webpack 的 `require` 全局变量需改为 `import`
- **Loader 链**：Vite 不需要复杂的 Loader 链式配置
- **自定义 Plugin**：Webpack Plugin 需要重写为 Vite/Rollup 插件

## 6. 选择建议

| 场景 | 推荐 |
|------|------|
| 新项目 | Vite |
| React/Vue 新项目 | Vite |
| 大型遗留项目（Webpack） | 继续使用 Webpack，按需迁移 |
| 需要高度自定义构建流程 | Webpack |
| 微前端架构 | Webpack（生态更成熟） |
| 库/组件库开发 | Vite（library 模式） |

**总结**：Vite 在开发体验上有明显优势，适合绝大多数新项目。Webpack 生态成熟、插件丰富，在复杂企业级场景中仍然可靠。两者并非完全替代关系，根据项目需求选择即可。
