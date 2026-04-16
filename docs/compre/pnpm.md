# pnpm 完全指南

## 1. 概述

### 1.1 什么是 pnpm

pnpm（Performant npm）是一个高性能的 JavaScript 包管理器，由 npm 和 yarn 的前团队成员开发。它解决了传统包管理器的许多痛点，在现代前端开发中获得广泛使用。

**核心优势**：
- 磁盘空间占用极小
- 安装速度更快
- 严格的依赖隔离
- 优秀的 monorepo 支持

### 1.2 与 npm、yarn 的对比

| 特性 | npm | yarn | pnpm |
|------|-----|------|------|
| 磁盘占用 | 高 | 中 | 低 |
| 安装速度 | 慢 | 快 | 最快 |
| 依赖隔离 | 无 | 无 | 严格 |
| monorepo | 基础 | 完善 | 成熟 |
| lock 文件 | package-lock.json | yarn.lock | pnpm-lock.yaml |

### 1.3 安装

```bash
# 使用 npm 安装
npm install -g pnpm

# 使用 corepack（Node.js 16+）
corepack enable
corepack prepare pnpm@latest --activate

# 使用脚本安装
curl -fsSL https://get.pnpm.io/install.sh | sh -

# macOS
brew install pnpm

# Windows
winget install pnpm
```

### 1.4 升级和卸载

```bash
# 升级 pnpm
pnpm add -g pnpm

# 卸载 pnpm
npm uninstall -g pnpm
```

## 2. 核心原理

### 2.1 node_modules 结构

**npm 的做法**：
```
project/
  node_modules/
    react/
    lodash/
    ...
```

每个项目都会复制一份依赖到 node_modules，如果有 10 个项目用 react，磁盘里就会有 10 份 react。

**pnpm 的做法**：

pnpm 采用"中央仓库"模式，所有包只在全局 store 里存一份，项目通过硬链接/符号链接指向它：

```
~/.pnpm-store/
  v3/
    react@18.2.0/
    lodash@4.17.21/

project/
  node_modules/
    .pnpm/
      react@18.2.0/
        node_modules/
          react/
    react -> ../.pnpm/react@18.2.0/node_modules/react
```

### 2.2 硬链接与符号链接

```bash
# 硬链接（Hard Link）
# 同一个文件系统的多个目录项指向同一个 inode
# 不占用额外磁盘空间

# 符号链接（Symbolic Link）
# 类似快捷方式，指向另一个路径
# pnpm 使用符号链接组织依赖
```

### 2.3 内容寻址存储

```bash
# pnpm 使用 hash 检测文件内容
# 相同内容的包只存储一份

# 查看 store 位置
pnpm store path

# 查看 store 状态
pnpm store status

# 清理未使用的包
pnpm store prune
```

## 3. 依赖隔离机制

### 3.1 幽灵依赖问题

npm 允许"幽灵依赖"（Phantom Dependency）：

```javascript
// package.json
{
  "dependencies": {
    "A": "^1.0.0"
  }
}

// A 的依赖
// A -> B -> C

// 代码可以直接引用 C（未在 package.json 中声明）
const C = require('C');  // npm 可能不会报错
```

原因：npm 的扁平化策略会将依赖的依赖也提升到 node_modules 顶层。

### 3.2 pnpm 的严格模式

pnpm 采用严格的依赖管理：

```javascript
// pnpm 会严格限制：只能使用 package.json 里声明的依赖
const C = require('C');  // pnpm 会直接报错

// 错误信息
// ERR_PNPM_IMPLICIT_​BINARY_​NOT_​FOUND
```

### 3.3 严格模式的优势

- **依赖关系清晰**：所有依赖必须在 package.json 中明确声明
- **避免隐式依赖**：不会出现"某台机器能跑，CI 跑不了"的问题
- **构建稳定性**：确保所有依赖都是显式声明的

### 3.4 允许例外情况

如果确实需要使用未声明的依赖，可以使用配置文件允许：

```bash
# pnpm-workspace.yaml
packages:
  - 'packages/*'

# 在允许的包中使用
public-hoist-pattern:
  - '*eslint*'
  - '*prettier*'
```

## 4. 基本使用

### 4.1 常用命令

```bash
# 安装依赖
pnpm install
pnpm i

# 添加依赖
pnpm add <package>              # 生产依赖
pnpm add -D <package>           # 开发依赖
pnpm add -g <package>           # 全局安装

# 移除依赖
pnpm remove <package>
pnpm rm <package>

# 更新依赖
pnpm update                     # 更新所有
pnpm update <package>          # 更新指定包
pnpm update --latest            # 更新到最新版本

# 运行脚本
pnpm run <script>
pnpm dev                        # pnpm run dev
pnpm build                     # pnpm run build

# 查看信息
pnpm list                       # 查看依赖树
pnpm list --depth=0            # 查看顶层依赖
pnpm outdated                   # 查看可更新的包

# 其他常用命令
pnpm init                      # 初始化项目
pnpm exec <command>            # 执行二进制命令
pnpm why <package>             # 查看依赖关系
pnpm ping                      # 检查镜像源连接
```

### 4.2 与 `npm` 命令对比

| npm | pnpm |
|-----|------|
| npm install | pnpm install |
| `npm install <pkg>` | `pnpm add <pkg>` |
| `npm uninstall <pkg>` | `pnpm remove <pkg>` |
| npm update | pnpm update |
| npm run | pnpm |
| npm list | pnpm list |
| npm init | pnpm init |

### 4.3 package.json 配置

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  },
  "dependencies": {
    "react": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "typescript": "^5.0.0"
  },
  "pnpm": {
    "overrides": {
      "lodash": "^4.17.21"
    }
  }
}
```

## 5. Monorepo 支持

### 5.1 workspace 配置

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - '!apps/exclude/**'  # 排除某个目录
```

```
monorepo/
├── pnpm-workspace.yaml
├── package.json
├── apps/
│   ├── web/
│   │   └── package.json
│   └── admin/
│       └── package.json
└── packages/
    ├── ui/
    │   └── package.json
    └── utils/
        └── package.json
```

### 5.2 工作区命令

```bash
# 在所有工作区运行命令
pnpm -r run build
pnpm -r run test

# 在指定工作区运行
pnpm --filter web run dev

# 使用 filter 过滤
pnpm --filter "@myorg/ui" build
pnpm --filter "...[的生产依赖]" build
pnpm --filter "!@myorg/excluded" build
```

### 5.3 依赖共享

```bash
# 在工作区之间添加依赖
pnpm add react --filter @myorg/web

# 添加到根目录（所有工作区共享）
pnpm add -w typescript

# 链接本地包
# 假设 packages/utils 和 packages/ui
# 在 packages/ui 中：
pnpm add @myorg/utils
```

### 5.4 filter 语法

```bash
# 过滤特定包
pnpm --filter @myorg/web build

# 过滤多个包
pnpm --filter @myorg/web --filter @myorg/admin build

# 依赖过滤
pnpm --filter "...@myorg/ui" build  # 依赖 @myorg/ui 的包
pnpm --filter "...^@myorg/ui" build  # 直接依赖 @myorg/ui 的包

# 排除过滤
pnpm --filter! @myorg/excluded build
```

## 6. 配置文件

### 6.1 .npmrc

```ini
# 镜像源
registry=https://registry.npmjs.org/

# 包管理器配置
auto-install-peers=true
strict-peer-dependencies=true

# 存储路径
store-dir=~/.pnpm-store

# 其他配置
shamefully-hoist=true
side-effects-cache=true
```

### 6.2 pnpm-workspace.yaml

```yaml
packages:
  - 'packages/*'
  - 'apps/*'

# 公共依赖
onlyBuiltDependencies:
  - esbuild
  - @babel/core

# 覆盖配置
overrides:
  lodash: ^4.17.21
  react: ^18.2.0
```

### 6.3 package.json 中的 pnpm 配置

```json
{
  "pnpm": {
    "overrides": {
      "lodash": "^4.17.21"
    },
    "peerDependencyRules": {
      "ignoreMissing": ["react"],
      "allowAny": ["@babel/*"]
    },
    "packageManager": "pnpm@8.0.0"
  }
}
```

## 7. 高级特性

### 7.1 依赖覆盖

```json
{
  "pnpm": {
    "overrides": {
      "lodash": "^4.17.21",
      "foo": "npm:@foo/other@1.0.0"
    }
  }
}
```

### 7.2 严格依赖检查

```bash
# 启用严格依赖检查
pnpm config set strict-peer-dependencies true

# 或者在 .npmrc 中
strict-peer-dependencies=true
```

### 7.3 构建过滤

```json
{
  "pnpm": {
    "onlyBuiltDependencies": [
      "esbuild",
      "@babel/core"
    ]
  }
}
```

### 7.4 脚本钩子

```json
{
  "scripts": {
    "preinstall": "echo 'Installing...'",
    "postinstall": "echo 'Installed!'",
    "prepublishOnly": "pnpm run build"
  }
}
```

## 8. 常见问题

### 8.1 兼容性问题

```bash
# 使用 npm 的项目
# 删除 node_modules 和 lock 文件
rm -rf node_modules package-lock.json

# 使用 pnpm 安装
pnpm install

# 如果遇到问题，可以尝试
pnpm install --force
pnpm install --shamefully-hoist
```

### 8.2 幽灵依赖问题

```bash
# 如果需要兼容某些工具，可以启用 hoist
shamefully-hoist=true

# 或者只提升特定的包
public-hoist-pattern:
  - '*eslint*'
  - '*prettier*'
```

### 8.3 Node.js 版本管理

```json
{
  "packageManager": "pnpm@8.0.0"
}
```

### 8.4 CI/CD 配置

```yaml
# GitHub Actions
- name: Install pnpm
  uses: pnpm/action-setup@v2
  with:
    version: 8

- name: Setup Node
  uses: actions/setup-node@v3
  with:
    node-version: '18'
    cache: 'pnpm'

- name: Install dependencies
  run: pnpm install --frozen-lockfile

- name: Build
  run: pnpm run build
```

## 9. 性能优化

### 9.1 加速安装

```bash
# 并行安装
pnpm config set prefer-frozen-lockfile true
pnpm config set auto-install-peers true

# 使用 sandbox
pnpm config set sandbox true
```

### 9.2 磁盘空间优化

```bash
# 清理未使用的包
pnpm store prune

# 清理所有
pnpm store rm

# 查看 store 使用情况
pnpm store status
```

### 9.3 CI 优化

```yaml
# GitHub Actions 优化
- name: Cache pnpm
  uses: actions/cache@v3
  with:
    path: ~/.pnpm-store
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-pnpm-
```

## 10. 最佳实践

### 10.1 项目初始化

```bash
# 创建新项目
mkdir my-project
cd my-project
pnpm init

# 添加依赖
pnpm add react react-dom
pnpm add -D vite @vitejs/plugin-react typescript

# 设置 package.json
pnpm pkg set type="module"
```

### 10.2 Monorepo 结构

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

```
my-monorepo/
├── pnpm-workspace.yaml
├── package.json
├── .npmrc
├── apps/
│   ├── web/
│   └── mobile/
└── packages/
    ├── ui/
    ├── utils/
    └── config/
```

### 10.3 CI/CD 配置

```yaml
name: CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
          
      - name: Install
        run: pnpm install --frozen-lockfile
        
      - name: Lint
        run: pnpm run lint
        
      - name: Test
        run: pnpm run test
        
      - name: Build
        run: pnpm run build
```

### 10.4 依赖管理建议

- **显式声明所有依赖**：不要依赖幽灵依赖
- **定期更新**：使用 `pnpm update` 保持依赖最新
- **使用 overrides**：锁定关键依赖版本
- **启用 strict-peer-dependencies**：避免隐式依赖冲突

## 11. 总结

### 为什么选择 pnpm

**优势**：
- 磁盘占用极小（通过硬链接共享依赖）
- 安装速度快（避免重复下载和解压）
- 严格的依赖管理（避免幽灵依赖）
- 优秀的 monorepo 支持
- 活跃的社区和持续的更新

**适用场景**：
- monorepo 项目
- 大型前端项目（Next.js、React）
- 多项目开发环境
- CI/CD 流程
- 对磁盘空间敏感的项目

**唯一劣势**：
- Node.js 不自带（需要额外安装）
- 某些旧项目可能需要调整配置

### 推荐配置

```ini
# .npmrc
registry=https://registry.npmjs.org/
strict-peer-dependencies=true
auto-install-peers=true
shamefully-hoist=false
```

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

pnpm 已成为现代前端项目的首选包管理器，其独特的设计理念和优秀的性能表现值得在项目中广泛采用。