# 工程化 面试题

## 构建工具

### 1. Webpack vs Vite

| 特性 | Webpack | Vite |
|------|---------|------|
| 启动速度 | 慢（打包所有） | 快（ESM 按需编译） |
| 热更新 | 慢 | 快 |
| 配置复杂度 | 高 | 低 |
| 插件生态 | 丰富 | 增长中 |
| 生产构建 | 成熟 | 成熟 |

**Vite 配置**:
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
});
```

### 2. 模块化

**CommonJS** (Node.js):
```javascript
const module = require('./module');
exports.value = 'Hello';
module.exports = { value: 'Hello' };
```

**ES Modules**:
```javascript
import module from './module';
export const value = 'Hello';
export default { value: 'Hello' };
export { value };
```

**AMD**:
```javascript
define(['./module'], function(module) {
  return { value: 'Hello' };
});
```

### 3. 代码分割

```javascript
// 动态导入
const LazyComponent = React.lazy(() => import('./Component'));

// 路由级分割
const routes = [
  {
    path: '/',
    component: () => import('./Home'),
  },
];

// 条件加载
if (condition) {
  const module = await import('./module');
  module.default();
}
```

## 包管理

### 4. npm vs yarn vs pnpm

**npm**:
```bash
npm install
npm run dev
```

**yarn**:
```bash
yarn install
yarn dev
```

**pnpm** (推荐):
```bash
pnpm install
pnpm run dev
pnpm add <package>
pnpm add -D <package>
```

**pnpm 优势**:
- 节省磁盘空间
- 安装速度快
- 严格的依赖管理

### 5. package.json 配置

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.0.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "typescript": "^5.0.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

## 版本管理

### 6. 语义化版本 (SemVer)

格式: `MAJOR.MINOR.PATCH`

- `MAJOR`: 不兼容的 API 修改
- `MINOR`: 向下兼容的功能性新增
- `PATCH`: 向下兼容的问题修正

```json
{
  "dependencies": {
    "react": "^18.0.0",  // >=18.0.0 <19.0.0
    "react": "~18.0.0",  // >=18.0.0 <18.1.0
    "react": "18.0.0",    // 精确版本
    "react": "*",         // 任意版本
    "react": "latest",    // 最新版本
    "react": "next",      // 下一个版本
    "react": "beta"       // beta 版本
  }
}
```

### 7. 依赖管理

**依赖类型**:
- `dependencies`: 运行时依赖
- `devDependencies`: 开发时依赖
- `peerDependencies`: 同伴依赖
- `optionalDependencies`: 可选依赖

```bash
# 安装依赖
pnpm add react

# 安装开发依赖
pnpm add -D typescript

# 安装同伴依赖
pnpm add -P react-dom

# 安装可选依赖
pnpm add -O lodash
```

## CI/CD

### 8. GitHub Actions

创建 `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm run lint
      - run: pnpm run test
      - run: pnpm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### 9. Git 工作流

**Git Flow**:
```
main (production)
  |
  ├── develop
  |     |
  |     ├── feature/* (新功能)
  |     ├── hotfix/* (紧急修复)
  |     └── release/* (发布)
```

**Trunk Based Development**:
- 直接提交到 main 分支
- 使用功能开关
- 持续集成和部署

**提交规范**:
```bash
# Conventional Commits
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
test: add test
chore: update build
```

## 测试

### 10. 单元测试

**Vitest**:
```javascript
import { describe, it, expect } from 'vitest';
import { add } from './math';

describe('add', () => {
  it('should add two numbers', () => {
    expect(add(1, 2)).toBe(3);
  });

  it('should handle negative numbers', () => {
    expect(add(-1, -2)).toBe(-3);
  });
});
```

**Jest**:
```javascript
describe('add', () => {
  test('should add two numbers', () => {
    expect(add(1, 2)).toBe(3);
  });
});
```

### 11. 集成测试

```javascript
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders welcome message', () => {
  render(<App />);
  const element = screen.getByText(/Welcome/i);
  expect(element).toBeInTheDocument();
});
```

### 12. E2E 测试

**Cypress**:
```javascript
describe('Login', () => {
  it('should login successfully', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('user@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

**Playwright**:
```javascript
test('login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'user@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);
});
```

## 代码质量

### 13. ESLint

配置 `.eslintrc.js`:

```javascript
module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'no-console': 'warn',
    'no-debugger': 'error',
    'react/react-in-jsx-scope': 'off',
  },
};
```

### 14. Prettier

配置 `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "arrowParens": "always"
}
```

### 15. Husky + lint-staged

```bash
# 安装
pnpm add -D husky lint-staged
pnpm pkg set scripts.prepare "husky install"
pnpm run prepare

# 配置
echo "npx lint-staged" > .husky/pre-commit
```

配置 `package.json`:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss}": [
      "prettier --write"
    ]
  }
}
```

## 监控

### 16. 前端监控

**Sentry**:
```javascript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'https://xxx@sentry.io/xxx',
  environment: process.env.NODE_ENV,
});

// 捕获错误
try {
  doSomething();
} catch (error) {
  Sentry.captureException(error);
}
```

**性能监控**:
```javascript
import { onCLS, onFID, onLCP } from 'web-vitals';

onCLS(console.log);
onFID(console.log);
onLCP(console.log);
```

### 17. 日志

```javascript
// 开发环境
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info');
}

// 生产环境发送日志
if (process.env.NODE_ENV === 'production') {
  sendLogToServer({
    level: 'error',
    message: 'Something went wrong',
    stack: error.stack,
  });
}
```

## 最佳实践

### 18. 项目结构

```
src/
├── components/     # 公共组件
├── views/         # 页面组件
├── hooks/         # 自定义 Hooks
├── utils/         # 工具函数
├── services/      # API 服务
├── types/         # TypeScript 类型
├── styles/        # 全局样式
├── assets/        # 静态资源
└── main.tsx       # 入口文件
```

### 19. 配置管理

```javascript
// config/index.ts
export const config = {
  apiUrl: process.env.VITE_API_URL,
  isProduction: process.env.NODE_ENV === 'production',
  version: process.env.VITE_APP_VERSION,
};

// 使用
import { config } from '@/config';
console.log(config.apiUrl);
```

```bash
# .env 文件
VITE_API_URL=https://api.example.com
VITE_APP_VERSION=1.0.0
```

### 20. 文档

**README.md**:
```markdown
# Project Name

## 安装
\`\`\`bash
pnpm install
\`\`\`

## 开发
\`\`\`bash
pnpm run dev
\`\`\`

## 构建
\`\`\`bash
pnpm run build
\`\`\`
```

**JSDoc**:
```javascript
/**
 * 计算两个数的和
 * @param {number} a - 第一个数
 * @param {number} b - 第二个数
 * @returns {number} 两数之和
 */
function add(a, b) {
  return a + b;
}
```
