## 项目结构优化方案

### 方案：按内容类型重构

```
src/content/
├── posts/
│   ├── tutorials/              # 教程类文章
│   │   ├── frontend/          # 前端教程
│   │   │   ├── array-dedup.md
│   │   │   ├── debounce-throttle.md
│   │   │   └── js-clone.md
│   │   ├── backend/           # 后端教程
│   │   └── tools/             # 工具使用教程
│   ├── projects/              # 项目实践
│   │   ├── uniubi/           # 完整项目记录
│   │   │   ├── TPLink.md
│   │   │   ├── encapsulated-axios.md
│   │   │   └── index.md
│   │   └── viewshine/
│   ├── notes/                 # 快速笔记和思考
│   │   ├── concepts/         # 概念理解
│   │   └── snippets/         # 代码片段
│   └── miscellaneous/         # 其他内容
```

## 用户体验优化建议

### 头部导航优化

```astro
<!-- 在 Header 中添加更清晰的分类导航 -->
<nav>
  <a href="/tutorials/">技术教程</a>
  <a href="/projects/">项目实战</a>
  <a href="/notes/">学习笔记</a>
  <a href="/tags/">标签分类</a>
  <a href="/about/">关于我</a>
</nav>
```

## 具体实施计划

### 第一阶段：基础优化

#### 1. 重命名和重组现有内容

```bash
# 文件夹重命名
mv scattered-notes/ tutorials/
mv work-docs/ projects/

# 移动文件到合适位置
mv tutorials/array-dedup.md tutorials/frontend/
mv tutorials/debounce-throttle.md tutorials/frontend/
mv tutorials/js-clone.md tutorials/frontend/
```

#### 2. 更新导航文案

- Header 组件中的导航文案更新
- 面包屑导航更新
- 页面标题更新

#### 3. 添加内容元信息

- 为现有文章添加难度等级
- 标准化标签系统
- 添加预计阅读时间

## 技术实现要点

#### 搜索索引优化

- 使用 Lunr.js 或 Fuse.js 实现全文搜索
- 建立标签索引和分类索引
- 实现搜索结果高亮

## 实施优先级

### 高优先级（立即实施）

1. 重命名现有分类
2. 更新导航文案
3. 标准化文章元信息

### 中优先级（1-2周内）

1. 添加筛选功能
2. 优化搜索体验