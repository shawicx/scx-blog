# ESM、UMD、CJS 的区别

## 1. 模块化系统概述

### 1.1 什么是模块系统

模块系统是一种组织和管理 JavaScript 代码的方式，它允许我们将代码分割成独立的、可重用的单元。不同的模块系统有不同的语法和运行时行为。

```javascript
// 模块化之前：全局命名空间污染
// file1.js
var name = 'Alice';
function greet() {
  console.log('Hello ' + name);
}

// file2.js
var name = 'Bob'; // 覆盖了 file1.js 中的 name
function greet() {
  console.log('Hi ' + name);
}

// 模块化之后：独立的作用域
// file1.js (ESM)
export const name = 'Alice';
export function greet() {
  console.log('Hello ' + name);
}

// file2.js (ESM)
export const name = 'Bob'; // 不会冲突
export function greet() {
  console.log('Hi ' + name);
}

// main.js
import { name as name1, greet as greet1 } from './file1.js';
import { name as name2, greet as greet2 } from './file2.js';

greet1(); // Hello Alice
greet2(); // Hi Bob
```

### 1.2 三种模块系统的对比

| 特性 | CommonJS (CJS) | ES Modules (ESM) | UMD |
|------|----------------|-------------------|-----|
| 出现时间 | 2009 | 2015 | ~2013 |
| 语法 | `require`/`module.exports` | `import`/`export` | 兼容 CJS 和 AMD |
| 运行环境 | Node.js | 现代浏览器 + Node.js | 浏览器 + Node.js |
| 加载方式 | 同步 | 异步 | 根据环境自动 |
| Tree Shaking | 不支持 | 原生支持 | 有限支持 |
| 静态分析 | 有限 | 完全支持 | 有限 |
| 循环依赖 | 处理方式不同 | 处理方式不同 | 依赖实现 |

## 2. CommonJS (CJS)

### 2.1 基本语法

```javascript
// 导出（导出单个值）
// math.js
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

// 方式1：导出多个
module.exports = {
  add,
  subtract
};

// 方式2：分别导出
exports.add = add;
exports.subtract = subtract;

// 方式3：直接导出函数
module.exports = function(a, b) {
  return a + b;
};

// 导出单个值
module.exports.PI = 3.14159;

// 导入
// main.js
const math = require('./math.js');
console.log(math.add(1, 2)); // 3

// 解构导入
const { add, subtract } = require('./math.js');
console.log(add(1, 2)); // 3
console.log(subtract(5, 3)); // 2

// 导入整个模块
const math = require('./math.js');
const result = math.add(1, 2);
```

### 2.2 运行机制

```javascript
// CommonJS 是运行时加载
// 模块在运行时被解析和执行

// lib.js
const value = Math.random();
console.log('lib.js loaded');

module.exports = {
  getValue: () => value
};

// main.js
const lib = require('./lib.js'); // 立即执行 lib.js
console.log(lib.getValue()); // 每次调用返回相同的值
console.log(lib.getValue());

// 运行顺序：
// 1. 扫描 require 语句
// 2. 加载 lib.js 模块
// 3. 执行 lib.js 中的代码
// 4. 返回 module.exports
```

### 2.3 值拷贝 vs 引用

```javascript
// counter.js
let count = 0;

function increment() {
  count++;
  return count;
}

function getCount() {
  return count;
}

module.exports = {
  count,           // 导出的是值拷贝（number）
  increment,       // 导出的是函数引用
  getCount         // 导出的是函数引用
};

// main.js
const counter = require('./counter.js');

console.log(counter.count); // 0
counter.increment();
console.log(counter.count); // 0 - 值没有改变，因为是拷贝

console.log(counter.getCount()); // 1 - 通过函数可以访问闭包中的值
```

### 2.4 循环依赖处理

```javascript
// a.js
console.log('a.js 开始');
const b = require('./b.js');
console.log('a.js 中 b.done:', b.done);
exports.done = true;
console.log('a.js 结束');

// b.js
console.log('b.js 开始');
const a = require('./a.js');
console.log('b.js 中 a.done:', a.done);
exports.done = true;
console.log('b.js 结束');

// main.js
const a = require('./a.js');
const b = require('./b.js');

// 执行顺序：
// 1. a.js 开始
// 2. a.js require b.js
// 3. b.js 开始
// 4. b.js require a.js（a.js 已经在加载中，返回当前的 exports）
// 5. b.js 中 a.done: undefined（因为 a.js 还没执行完）
// 6. b.js 结束，设置 b.done = true
// 7. 返回到 a.js，b.done: true
// 8. a.js 结束，设置 a.done = true
// 9. 返回到 main.js
```

### 2.5 Node.js 中的 CJS

```javascript
// Node.js 特有功能
// __filename：当前文件的绝对路径
console.log(__filename); // /path/to/project/file.js

// __dirname：当前文件所在目录的绝对路径
console.log(__dirname); // /path/to/project

// module：当前模块的引用
console.log(module.id);
console.log(module.exports);
console.log(module.filename);
console.log(module.loaded);

// require.resolve：解析模块路径
const path = require.resolve('./math.js');
console.log(path);

// require.cache：模块缓存
console.log(require.cache);

// 清除模块缓存
delete require.cache[require.resolve('./math.js')];

// 动态加载
function loadModule(moduleName) {
  return require(moduleName);
}

const math = loadModule('./math.js');
```

## 3. ES Modules (ESM)

### 3.1 基本语法

```javascript
// 导出
// utils.js

// 命名导出
export const PI = 3.14159;

export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

// 类导出
export class Calculator {
  add(a, b) {
    return a + b;
  }
}

// 默认导出
export default function(a, b) {
  return a + b;
}

// 或者
const defaultExport = { value: 42 };
export default defaultExport;

// 混合导出
export const name = 'Alice';
export function greet() {
  console.log('Hello');
}
export default class Greeter {
  constructor() {
    console.log('Greeter created');
  }
}
```

```javascript
// 导入
// main.js

// 命名导入
import { PI, add, subtract } from './utils.js';
console.log(PI);
console.log(add(1, 2));

// 导入所有（命名空间）
import * as utils from './utils.js';
console.log(utils.PI);
console.log(utils.add(1, 2));

// 默认导入
import defaultExport from './utils.js';

// 混合导入
import defaultExport, { PI, add } from './utils.js';

// 重命名导入
import { add as sum, subtract as minus } from './utils.js';

// 仅导入副作用（不导入任何值）
import './polyfills.js';

// 动态导入
const module = await import('./utils.js');
console.log(module.add(1, 2));
```

### 3.2 静态分析

```javascript
// ESM 支持静态分析，可以在编译时确定依赖关系

// 模块 A
export const value = 42;

// 模块 B
import { value } from './module-a.js';
console.log(value);

// 构建工具可以在运行前分析依赖关系
// - Tree Shaking：删除未使用的代码
// - 代码分割：按需加载模块
// - 类型检查：在编译时检查导入导出

// 示例：Tree Shaking
// utils.js
export function usedFunction() {
  console.log('This is used');
}

export function unusedFunction() {
  console.log('This is not used');
}

// main.js
import { usedFunction } from './utils.js';
usedFunction();

// 打包后，unusedFunction 会被删除
```

### 3.3 异步加载

```javascript
// 动态 import() 返回 Promise

// 基础使用
const module = await import('./utils.js');
const result = module.add(1, 2);

// 条件加载
async function loadFeature() {
  if (someCondition) {
    const feature = await import('./feature.js');
    feature.init();
  }
}

// 按需加载按钮
document.getElementById('loadButton').addEventListener('click', async () => {
  const module = await import('./heavy-module.js');
  module.doSomething();
});

// 预加载
const preloadModule = import('./preloaded-module.js');

// 稍后使用
const module = await preloadModule;
module.use();

// 并行加载
const [module1, module2] = await Promise.all([
  import('./module1.js'),
  import('./module2.js')
]);
```

### 3.4 ESM 在 Node.js 中使用

```javascript
// package.json 中设置 "type": "module"
{
  "name": "my-project",
  "type": "module",
  "main": "index.js"
}

// 或者使用 .mjs 扩展名
// index.mjs

// 导入 Node.js 内置模块
import fs from 'fs';
import path from 'path';
import http from 'http';

// 导入 JSON 文件
import config from './config.json' assert { type: 'json' };

// 导入 CommonJS 模块
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const cjsModule = require('./cjs-module.cjs');

// __dirname 和 __filename 的替代
const __filename = new URL('', import.meta.url).pathname;
const __dirname = new URL('.', import.meta.url).pathname;

// 动态导入
const module = await import('./some-module.js');
```

### 3.5 ESM 在浏览器中使用

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    // 直接使用 ESM
    import { add } from './utils.js';
    console.log(add(1, 2));
    
    // 从 CDN 导入
    import React from 'https://esm.sh/react@18';
    import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
    
    // 动态导入
    const module = await import('./heavy-module.js');
    module.init();
  </script>
  
  <script nomodule>
    // 对于不支持 ESM 的浏览器的回退
    console.log('ESM not supported');
  </script>
</head>
<body></body>
</html>
```

```javascript
// utils.js
export function add(a, b) {
  return a + b;
}

export default function multiply(a, b) {
  return a * b;
}
```

### 3.6 循环依赖处理

```javascript
// a.js
import { b } from './b.js';

export function a() {
  console.log('a called');
  b();
}

export const value = 'a';

// b.js
import { a } from './a.js';

export function b() {
  console.log('b called');
  a();
}

export const value = 'b';

// c.js
import { a } from './a.js';
a(); // a called -> b called -> a called -> b called -> ...

// ESM 处理循环依赖的方式：
// 1. 模块被加载时，创建一个空的模块记录
// 2. 执行导入的模块
// 3. 如果遇到循环依赖，返回当前的（可能不完整的）模块
// 4. 等待模块完全执行后，填充导出的值
```

## 4. UMD (Universal Module Definition)

### 4.1 基本结构

```javascript
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD (RequireJS)
    define(['dependency'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS (Node.js)
    module.exports = factory(require('dependency'));
  } else {
    // 浏览器全局变量
    root.MyLibrary = factory(root.dependency);
  }
}(typeof self !== 'undefined' ? self : this, function (dependency) {
  'use strict';
  
  // 模块代码
  function add(a, b) {
    return a + b;
  }
  
  function subtract(a, b) {
    return a - b;
  }
  
  // 返回模块导出
  return {
    add: add,
    subtract: subtract
  };
}));
```

### 4.2 完整的 UMD 示例

```javascript
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports)
    : typeof define === 'function' && define.amd
      ? define(['exports'], factory)
      : (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.MyLib = {}));
}(this, (function (exports) {
  'use strict';
  
  // 模块实现
  const VERSION = '1.0.0';
  
  function add(a, b) {
    return a + b;
  }
  
  function subtract(a, b) {
    return a - b;
  }
  
  class Calculator {
    constructor() {
      this.result = 0;
    }
    
    add(value) {
      this.result += value;
      return this;
    }
    
    subtract(value) {
      this.result -= value;
      return this;
    }
    
    getResult() {
      return this.result;
    }
  }
  
  // 导出
  exports.VERSION = VERSION;
  exports.add = add;
  exports.subtract = subtract;
  exports.Calculator = Calculator;
  exports.default = {
    add,
    subtract,
    Calculator
  };
  
})));
```

### 4.3 使用 UMD 模块

```html
<!-- 浏览器环境 -->
<!DOCTYPE html>
<html>
<head>
  <!-- 直接引用 UMD 文件 -->
  <script src="my-lib.umd.js"></script>
  
  <script>
    // 通过全局变量访问
    console.log(MyLib.VERSION);
    console.log(MyLib.add(1, 2));
    
    const calc = new MyLib.Calculator();
    calc.add(10).subtract(5);
    console.log(calc.getResult());
  </script>
</head>
<body></body>
</html>
```

```javascript
// Node.js 环境 (CommonJS)
const MyLib = require('./my-lib.umd.js');
console.log(MyLib.VERSION);
console.log(MyLib.add(1, 2));

// 或者使用默认导出
const { add, subtract, Calculator } = require('./my-lib.umd.js');
console.log(add(1, 2));
```

```javascript
// AMD 环境 (RequireJS)
require.config({
  paths: {
    'my-lib': './my-lib.umd'
  }
});

require(['my-lib'], function(MyLib) {
  console.log(MyLib.VERSION);
  console.log(MyLib.add(1, 2));
});
```

### 4.4 UMD 的局限性

```javascript
// UMD 的问题：
// 1. 代码冗长，样板代码多
// 2. 不支持 Tree Shaking
// 3. 不支持动态导入
// 4. 运行时解析，性能较差
// 5. 与现代工具链集成复杂

// 例如，以下 UMD 模块无法被 Tree Shaking：
(function (root, factory) {
  // ... UMD 包装器
}(this, function () {
  function used() { console.log('used'); }
  function unused() { console.log('unused'); }
  
  return { used, unused };
}));

// 即使只使用 'used' 函数，'unused' 函数也会被打包进去
```

## 5. 详细对比

### 5.1 导入导出语法对比

```javascript
// ========== CommonJS ==========
// 导出
module.exports = {
  add: function(a, b) { return a + b; },
  subtract: function(a, b) { return a - b; }
};

// 或者
exports.add = function(a, b) { return a + b; };
exports.subtract = function(a, b) { return a - b; };

// 导入
const math = require('./math');
const { add, subtract } = require('./math');

// ========== ES Modules ==========
// 导出
export const add = function(a, b) { return a + b; };
export const subtract = function(a, b) { return a - b; };

// 或者
export default {
  add: function(a, b) { return a + b; },
  subtract: function(a, b) { return a - b; }
};

// 导入
import { add, subtract } from './math';
import math from './math';
import * as math from './math';

// ========== UMD ==========
// 导出（UMD 包装器内部）
return {
  add: function(a, b) { return a + b; },
  subtract: function(a, b) { return a - b; }
};

// 导入（根据环境）
// 浏览器：全局变量
const math = window.MyLib;

// Node.js：require
const math = require('./my-lib.umd');

// AMD：define
define(['my-lib'], function(math) {
  // 使用 math
});
```

### 5.2 加载机制对比

```javascript
// ========== CommonJS - 同步加载 ==========
// 运行时加载，同步阻塞

// main.js
console.log('Start');
const math = require('./math'); // 同步加载
console.log(math.add(1, 2));
console.log('End');

// 输出顺序：
// Start
// [执行 math.js]
// 3
// End

// ========== ES Modules - 异步加载 ==========
// 编译时加载，异步执行

// main.js
console.log('Start');
import { add } from './math.js'; // 异步加载
console.log(add(1, 2));
console.log('End');

// 输出顺序：
// Start
// End
// 3（因为 import 是异步的）

// ========== UMD - 根据环境 ==========
// 浏览器中可能是异步，Node.js 中是同步

// 浏览器（通过 script 标签加载）
<script src="my-lib.umd.js" async></script>
<script>
  // 等待脚本加载完成
  setTimeout(() => {
    console.log(MyLib.add(1, 2));
  }, 100);
</script>
```

### 5.3 值拷贝 vs 引用

```javascript
// ========== CommonJS - 值拷贝 ==========
// counter.js
let count = 0;
function increment() {
  count++;
}
function getCount() {
  return count;
}
module.exports = { count, increment, getCount };

// main.js
const counter = require('./counter');
console.log(counter.count); // 0
counter.increment();
console.log(counter.count); // 0 - 值没有改变
console.log(counter.getCount()); // 1

// ========== ES Modules - 引用 ==========
// counter.js
let count = 0;
export function increment() {
  count++;
}
export function getCount() {
  return count;
}
export const countValue = count; // 导出的是值拷贝

// main.js
import { increment, getCount, countValue } from './counter';
console.log(countValue); // 0
increment();
console.log(countValue); // 0 - 值拷贝
console.log(getCount()); // 1 - 通过函数访问

// ========== 解决方案：导出 getter ==========
// counter.js
let count = 0;
export function increment() {
  count++;
}
export function getCount() {
  return count;
}
export const countValue = { get count() { return count; } };

// main.js
import { increment, countValue } from './counter';
console.log(countValue.count); // 0
increment();
console.log(countValue.count); // 1 - live binding
```

### 5.4 Tree Shaking 支持

```javascript
// ========== CommonJS - 不支持 Tree Shaking ==========
// utils.js
exports.used = function() { console.log('used'); };
exports.unused = function() { console.log('unused'); };

// main.js
const { used } = require('./utils');
used();

// 打包后：used 和 unused 都会被包含
// 因为 require 是动态的，无法在编译时确定依赖

// ========== ES Modules - 支持 Tree Shaking ==========
// utils.js
export function used() { console.log('used'); }
export function unused() { console.log('unused'); }

// main.js
import { used } from './utils';
used();

// 打包后：只有 used 会被包含
// 因为 import 是静态的，可以在编译时分析依赖

// ========== UMD - 有限支持 ==========
// utils.umd.js
(function(root, factory) {
  // UMD 包装器
}(this, function() {
  function used() { console.log('used'); }
  function unused() { console.log('unused'); }
  return { used, unused };
}));

// 即使只使用 used，unused 也可能被包含
```

### 5.5 顶层 await 支持

```javascript
// ========== CommonJS - 不支持 ==========
// 不能在模块顶层使用 await
// config.js
const config = await fetchConfig(); // SyntaxError

// ========== ES Modules - 支持 ==========
// 可以在模块顶层使用 await
// config.js
const config = await fetchConfig();
export default config;

// main.js
import config from './config.js';
console.log(config);

// ========== UMD - 不支持 ==========
// 也不支持顶层 await
```

## 6. 互操作性

### 6.1 CommonJS 导入 ESM

```javascript
// Node.js 中，CommonJS 可以导入 ESM

// package.json
{
  "type": "commonjs",
  "exports": {
    ".": {
      "import": "./index.mjs",
      "require": "./index.js"
    }
  }
}

// main.js (CJS)
const esmModule = require('./esm-module.mjs');
// 注意：只能导入 default 导出
console.log(esmModule.default);

// 使用 createRequire
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const cjsModule = require('./cjs-module.js');
```

### 6.2 ESM 导入 CommonJS

```javascript
// Node.js 中，ESM 可以导入 CommonJS

// cjs-module.js
module.exports = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b
};

// main.mjs (ESM)
import cjs from './cjs-module.js';
console.log(cjs.default || cjs); // 取决于实现

// 推荐使用 .cjs 扩展名
import cjs from './cjs-module.cjs';
```

### 6.3 构建工具转换

```javascript
// ========== Webpack 配置 ==========

// webpack.config.js
module.exports = {
  output: {
    // 输出格式
    libraryTarget: 'umd', // 'commonjs2', 'amd', 'umd', 'system', 'var'
    library: 'MyLibrary'
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false
        }
      }
    ]
  }
};

// ========== Rollup 配置 ==========

// rollup.config.js
export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/bundle.cjs',
      format: 'cjs'
    },
    {
      file: 'dist/bundle.mjs',
      format: 'esm'
    },
    {
      file: 'dist/bundle.umd.js',
      format: 'umd',
      name: 'MyLibrary'
    }
  ]
};

// ========== Vite 配置 ==========

// vite.config.js
export default {
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'MyLibrary',
      formats: ['es', 'cjs', 'umd']
    }
  }
};
```

### 6.4 类型定义

```typescript
// TypeScript 中的模块声明

// cjs-module.d.ts
declare module 'cjs-module' {
  export function add(a: number, b: number): number;
  export function subtract(a: number, b: number): number;
}

// esm-module.d.ts
export declare function add(a: number, b: number): number;
export declare function subtract(a: number, b: number): number;

// umd-module.d.ts
declare namespace MyLib {
  function add(a: number, b: number): number;
  function subtract(a: number, b: number): number;
}
declare var MyLib: MyLib;
export default MyLib;
export as namespace MyLib;

// package.json 中的 types 字段
{
  "types": "./index.d.ts",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs"
}
```

## 7. 实际应用场景

### 7.1 Node.js 后端开发

```javascript
// ========== 使用 CommonJS ==========
// package.json
{
  "name": "my-node-app",
  "version": "1.0.0",
  "main": "index.js"
}

// config/config.js
module.exports = {
  port: 3000,
  database: {
    host: 'localhost',
    port: 5432
  }
};

// utils/logger.js
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

module.exports = {
  log,
  error: (msg) => log(`ERROR: ${msg}`)
};

// services/user.service.js
const { log, error } = require('../utils/logger');
const config = require('../config/config');

class UserService {
  async findById(id) {
    log(`Finding user with id: ${id}`);
    // 数据库查询
  }
}

module.exports = new UserService();

// ========== 使用 ES Modules ==========
// package.json
{
  "name": "my-node-app",
  "version": "1.0.0",
  "type": "module",
  "main": "index.mjs"
}

// config/config.js
export const config = {
  port: 3000,
  database: {
    host: 'localhost',
    port: 5432
  }
};

// utils/logger.js
export function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

export function error(msg) {
  log(`ERROR: ${msg}`);
}

// services/user.service.js
import { log, error } from '../utils/logger.js';
import { config } from '../config/config.js';

export class UserService {
  async findById(id) {
    log(`Finding user with id: ${id}`);
    // 数据库查询
  }
}

export default new UserService();
```

### 7.2 前端应用开发

```javascript
// ========== 使用 ES Modules ==========
// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

createApp(App)
  .use(router)
  .use(store)
  .mount('#app');

// src/utils/api.js
export const api = {
  async get(url) {
    const response = await fetch(url);
    return response.json();
  },
  
  async post(url, data) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};

export default api;

// src/components/UserList.vue
<script setup>
import { ref, onMounted } from 'vue';
import { api } from '@/utils/api';

const users = ref([]);

onMounted(async () => {
  users.value = await api.get('/api/users');
});
</script>
```

### 7.3 库开发

```javascript
// ========== 同时提供多种格式 ==========

// src/index.js
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

export function multiply(a, b) {
  return a * b;
}

export default {
  add,
  subtract,
  multiply
};

// ========== Rollup 配置 ==========
// rollup.config.js
export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/my-lib.cjs',
      format: 'cjs',
      exports: 'auto'
    },
    {
      file: 'dist/my-lib.mjs',
      format: 'esm'
    },
    {
      file: 'dist/my-lib.umd.js',
      format: 'umd',
      name: 'MyLib',
      globals: {
        vue: 'Vue'
      }
    }
  ],
  external: ['vue']
};

// ========== package.json 配置 ==========
{
  "name": "my-lib",
  "version": "1.0.0",
  "main": "dist/my-lib.cjs",
  "module": "dist/my-lib.mjs",
  "browser": "dist/my-lib.umd.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "require": "./dist/my-lib.cjs",
      "import": "./dist/my-lib.mjs",
      "browser": "./dist/my-lib.umd.js",
      "types": "./dist/index.d.ts"
    }
  }
}

// ========== 使用库 ==========
// CommonJS
const myLib = require('my-lib');
console.log(myLib.add(1, 2));

// ES Modules
import { add } from 'my-lib';
console.log(add(1, 2));

// UMD (浏览器)
<script src="my-lib.umd.js"></script>
<script>
  console.log(MyLib.add(1, 2));
</script>
```

### 7.4 旧项目迁移

```javascript
// ========== 从 CommonJS 迁移到 ESM ==========

// 1. 安装转换工具
npm install --save-dev @babel/core @babel/preset-env

// 2. 配置 Babel
// .babelrc
{
  "presets": ["@babel/preset-env"]
}

// 3. 逐步迁移

// 原始 CommonJS 代码
// utils.js
const _ = require('lodash');

module.exports = {
  isEmpty: _.isEmpty,
  isNumber: _.isNumber
};

// 第一步：使用 import
// utils.js
import _ from 'lodash';

export const isEmpty = _.isEmpty;
export const isNumber = _.isNumber;

// 第二步：使用命名导出
// utils.js
import { isEmpty, isNumber } from 'lodash';

export { isEmpty, isNumber };

// 第三步：更新导入
// main.js
// const utils = require('./utils');
import * as utils from './utils';

// 4. 更新 package.json
{
  "type": "module"
}

// 5. 重命名文件（可选）
// .js -> .mjs 或 .cjs
```

## 8. 性能对比

### 8.1 加载性能

```javascript
// ========== CommonJS - 同步加载 ==========
// 优点：
// - 简单直接
// - 立即可用

// 缺点：
// - 阻塞执行
// - 不适合大型应用
// - 无法并行加载

// ========== ES Modules - 异步加载 ==========
// 优点：
// - 非阻塞
// - 支持并行加载
// - 支持代码分割

// 缺点：
// - 需要等待解析
// - 兼容性问题

// ========== UMD - 兼容模式 ==========
// 优点：
// - 兼容多种环境

// 缺点：
// - 包含所有环境的代码
// - 体积较大
```

### 8.2 构建性能

```javascript
// ========== Tree Shaking 对比 ==========

// 场景：大型工具库

// CommonJS 版本
// 打包后大小：150KB（包含未使用的代码）

// ES Modules 版本
// 打包后大小：50KB（移除了未使用的代码）

// UMD 版本
// 打包后大小：160KB（包含适配器代码）

// ========== 代码分割对比 ==========

// CommonJS
// 无法在构建时进行代码分割
// 需要运行时动态 require

// ES Modules
// 支持静态代码分割
// import() 动态导入

// UMD
// 有限的代码分割支持
```

### 8.3 运行时性能

```javascript
// ========== 性能测试 ==========

// CommonJS
const start1 = performance.now();
const math1 = require('./math.js');
const result1 = math1.add(1, 2);
const end1 = performance.now();
console.log(`CommonJS: ${end1 - start1}ms`);

// ES Modules
const start2 = performance.now();
import { add } from './math.js';
const result2 = add(1, 2);
const end2 = performance.now();
console.log(`ESM: ${end2 - start2}ms`);

// 结果：
// - 首次加载：CommonJS 稍快（同步）
// - 多次加载：ESM 更快（缓存）
// - 树摇后：ESM 更小更快
```

## 9. 最佳实践

### 9.1 选择合适的模块系统

```javascript
// ========== Node.js 应用 ==========
// 使用 CommonJS（传统）
// package.json
{
  "main": "index.js"
}

// 或使用 ES Modules（现代）
// package.json
{
  "type": "module",
  "main": "index.mjs"
}

// ========== 浏览器应用 ==========
// 使用 ES Modules
<script type="module" src="main.js"></script>

// ========== 库开发 ==========
// 同时提供多种格式
{
  "main": "dist/index.cjs",
  "module": "dist/index.mjs",
  "browser": "dist/index.umd.js"
}

// ========== 旧项目维护 ==========
// 继续使用 CommonJS，逐步迁移到 ESM
```

### 9.2 项目结构建议

```javascript
// ========== 推荐的项目结构 ==========

my-project/
├── src/
│   ├── index.js          // 主入口
│   ├── utils/
│   │   └── helper.js
│   └── components/
│       └── Button.js
├── dist/                // 构建输出
│   ├── index.cjs        // CommonJS
│   ├── index.mjs        // ES Modules
│   └── index.umd.js     // UMD
├── package.json
└── rollup.config.js

// ========== package.json 配置 ==========

{
  "name": "my-library",
  "version": "1.0.0",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "browser": "./dist/index.umd.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "require": "./dist/index.cjs",
      "import": "./dist/index.mjs",
      "browser": "./dist/index.umd.js",
      "types": "./dist/index.d.ts"
    },
    "./package.json": "./package.json"
  },
  "files": [
    "dist"
  ],
  "sideEffects": false
}
```

### 9.3 编码规范

```javascript
// ========== 统一使用一种模块系统 ==========

// 好的做法：整个项目使用 ESM
// src/index.js
import { add } from './utils/math.js';
import { Button } from './components/Button.js';

// 避免：混用不同的模块系统
// ❌ 不推荐
const cjsModule = require('./cjs-module.cjs');
import { esmModule } from './esm-module.mjs';

// ========== 清晰的导入导出 ==========

// 好的做法：命名导出
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

// 或：默认导出
export default {
  add,
  subtract
};

// 避免：混合使用
export function add() {}
export default function subtract() {}

// ========== 相对路径的使用 ==========

// 好的做法：清晰的相对路径
import utils from '../utils/helper.js';

// 避免：过深的相对路径
import utils from '../../../utils/helper.js';

// 考虑使用路径别名（需要配置构建工具）
import utils from '@/utils/helper.js';
```

### 9.4 依赖管理

```javascript
// ========== 明确依赖类型 ==========

{
  "dependencies": {
    // 运行时依赖
    "lodash-es": "^4.17.21",
    "axios": "^1.0.0"
  },
  "devDependencies": {
    // 开发工具
    "rollup": "^3.0.0",
    "webpack": "^5.0.0",
    "vite": "^4.0.0",
    "typescript": "^5.0.0"
  },
  "peerDependencies": {
    // 对等依赖
    "react": ">=16.0.0",
    "vue": "^3.0.0"
  }
}

// ========== 优先使用 ES Modules 版本 ==========

// 好的做法：使用 ESM 版本的库
import { debounce } from 'lodash-es';

// 而不是 CommonJS 版本
const { debounce } = require('lodash');

// 检查库是否支持 ESM
// 查看 package.json 的 "module" 字段
```

## 10. 常见问题

### 10.1 "require is not defined" 错误

```javascript
// ========== 问题 ==========

// 浏览器环境中使用 CommonJS
// main.js
const fs = require('fs'); // Error: require is not defined

// ========== 解决方案 ==========

// 方案1：使用 ES Modules
import { readFile } from 'fs';

// 方案2：使用打包工具（Webpack、Rollup、Vite）

// 方案3：使用 UMD 格式的库
<script src="library.umd.js"></script>
```

### 10.2 "This expression is not callable" 错误

```javascript
// ========== 问题 ==========

// 混合使用 CommonJS 和 ESM
// utils.js
module.exports = function() {
  console.log('Hello');
};

// main.js
import utils from './utils.js';
utils(); // Error: utils.default is not a function

// ========== 解决方案 ==========

// 方案1：使用 .default
utils.default();

// 方案2：统一使用 ESM
// utils.js
export default function() {
  console.log('Hello');
};

// 方案3：使用命名导出
// utils.js
export function utils() {
  console.log('Hello');
}

// main.js
import { utils } from './utils.js';
utils();
```

### 10.3 循环依赖问题

```javascript
// ========== 问题 ==========

// a.js
import { b } from './b.js';
export function a() {
  b();
}

// b.js
import { a } from './a.js';
export function b() {
  a();
}

// 可能导致栈溢出或未定义错误

// ========== 解决方案 ==========

// 方案1：重新设计，避免循环依赖
// 将共享代码提取到第三个模块

// shared.js
export function sharedLogic() {
  console.log('Shared logic');
}

// a.js
import { sharedLogic } from './shared.js';
export function a() {
  sharedLogic();
}

// b.js
import { sharedLogic } from './shared.js';
export function b() {
  sharedLogic();
}

// 方案2：延迟加载
// a.js
export function a() {
  import('./b.js').then(module => {
    module.b();
  });
}
```

### 10.4 构建配置问题

```javascript
// ========== 问题 ==========

// 混合使用 CommonJS 和 ESM 导致构建错误

// ========== 解决方案 ==========

// 配置构建工具正确处理混合模块

// Webpack
module.exports = {
  resolve: {
    extensions: ['.js', '.mjs', '.cjs'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
};

// Rollup
export default {
  input: 'src/index.js',
  output: {
    format: 'esm'
  },
  plugins: [
    commonjs(),
    nodeResolve()
  ]
};

// Vite
export default {
  resolve: {
    alias: {
      '@': '/src'
    }
  }
};
```

## 11. 总结

### 关键对比

| 特性 | CommonJS | ES Modules | UMD |
|------|----------|------------|-----|
| 语法 | `require`/`exports` | `import`/`export` | 兼容 CJS/AMD |
| 加载 | 同步 | 异步 | 根据环境 |
| 环境 | Node.js | 浏览器 + Node.js | 浏览器 + Node.js |
| Tree Shaking | 不支持 | 支持 | 有限支持 |
| 静态分析 | 有限 | 完全支持 | 有限 |
| 顶层 await | 不支持 | 支持 | 不支持 |

### 使用建议

1. **Node.js 新项目**：使用 ES Modules
2. **浏览器应用**：使用 ES Modules
3. **库开发**：同时提供 CJS、ESM、UMD
4. **旧项目维护**：继续使用 CommonJS，逐步迁移
5. **混合项目**：使用构建工具统一处理

### 最佳实践

1. 统一使用一种模块系统
2. 优先使用 ES Modules
3. 清晰的导入导出规范
4. 合理的项目结构
5. 正确的依赖管理
6. 使用现代构建工具

掌握这三种模块系统的区别和使用场景，能够帮助我们更好地组织和管理 JavaScript 代码，构建可维护、高性能的应用程序。
