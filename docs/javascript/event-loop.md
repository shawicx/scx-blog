## 事件循环

### 1. JavaScript 的单线程特性

JavaScript 是单线程语言，这意味着它一次只能执行一个任务。但这种设计并不会导致性能问题，因为 JavaScript 采用**事件循环（Event Loop）**机制来处理异步操作。

```javascript
console.log('1');

setTimeout(() => {
  console.log('2');
}, 0);

console.log('3');

// 输出顺序：
// 1
// 3
// 2
```

#### 为什么是单线程？

1. **DOM 操作需要线程安全**：如果多线程同时操作 DOM，会产生冲突
2. **简化开发**：不需要考虑复杂的线程同步问题
3. **效率**：大多数 Web 应用中，单线程配合事件循环已经足够

### 2. 浏览器事件循环

#### 2.1 核心组成部分

```
┌─────────────────────────────────────┐
│         JavaScript Engine           │
│  ┌─────────────────────────────┐    │
│  │      Call Stack (调用栈)     │    │
│  │  - 同步代码执行             │    │
│  │  - 函数调用                 │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  Web APIs                   │    │
│  │  - DOM 操作                 │    │
│  │  - fetch/XHR                │    │
│  │  - setTimeout/setInterval   │    │
│  │  - Promise                 │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
             ↓                 ↓
┌─────────────────────────────────────┐
│      Task Queues (任务队列)          │
│  ┌─────────────────────────────┐    │
│  │  Microtask Queue (微任务)   │    │
│  │  - Promise.then/catch/finally │   │
│  │  - MutationObserver         │    │
│  │  - queueMicrotask           │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │  Macrotask Queue (宏任务)   │    │
│  │  - setTimeout/setInterval   │    │
│  │  - I/O                      │    │
│  │  - UI Rendering             │    │
│  │  - postMessage              │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

#### 2.2 事件循环的工作流程

```javascript
// 事件循环的伪代码
while (true) {
  // 1. 执行栈中的任务
  executeStack();
  
  // 2. 执行所有微任务
  while (microtaskQueue.length > 0) {
    executeMicrotask(microtaskQueue.shift());
  }
  
  // 3. 渲染（如果需要）
  if (shouldRender) {
    render();
  }
  
  // 4. 执行一个宏任务
  if (macrotaskQueue.length > 0) {
    executeMacrotask(macrotaskQueue.shift());
  }
}
```

#### 2.3 调用栈示例

```javascript
function first() {
  console.log('first start');
  second();
  console.log('first end');
}

function second() {
  console.log('second');
}

console.log('script start');
first();
console.log('script end');

// 执行过程：
// console.log('script start') 压栈 → 执行 → 出栈
// first() 压栈 → 执行
//   console.log('first start') 压栈 → 执行 → 出栈
//   second() 压栈 → 执行
//     console.log('second') 压栈 → 执行 → 出栈
//   console.log('first end') 压栈 → 执行 → 出栈
// first() 出栈
// console.log('script end') 压栈 → 执行 → 出栈

// 输出：
// script start
// first start
// second
// first end
// script end
```

#### 2.4 宏任务和微任务

##### 宏任务

```javascript
// 常见的宏任务
setTimeout(() => console.log('setTimeout'), 0);
setInterval(() => console.log('setInterval'), 1000);

// UI 渲染
document.body.style.backgroundColor = 'red';

// I/O 操作
fetch('/api/data').then(() => console.log('fetch'));

// postMessage
window.postMessage({ type: 'message' }, '*');

// 输出：
// setTimeout
// setInterval (每秒一次)
// fetch (在请求完成后)
```

##### 微任务

```javascript
// 常见的微任务
Promise.resolve().then(() => console.log('Promise 1'));
Promise.resolve().then(() => console.log('Promise 2'));

// MutationObserver
const observer = new MutationObserver(() => {
  console.log('DOM changed');
});
observer.observe(document.body, { childList: true });

// queueMicrotask
queueMicrotask(() => console.log('queueMicrotask'));

// 输出顺序（都在当前宏任务执行完后立即执行）：
// Promise 1
// Promise 2
// queueMicrotask
// DOM changed (如果 DOM 发生变化)
```

### 3. 浏览器事件循环完整示例

#### 3.1 基础示例

```javascript
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

console.log('4');

// 执行过程：
// 1. 执行同步代码
//    - console.log('1') → 输出 '1'
//    - setTimeout 注册宏任务
//    - Promise.then 注册微任务
//    - console.log('4') → 输出 '4'
// 2. 执行微任务队列
//    - Promise.then 回调 → 输出 '3'
// 3. 执行宏任务队列
//    - setTimeout 回调 → 输出 '2'

// 输出：
// 1
// 4
// 3
// 2
```

#### 3.2 复杂示例

```javascript
console.log('1');

setTimeout(() => {
  console.log('2');
  Promise.resolve().then(() => console.log('3'));
}, 0);

Promise.resolve().then(() => {
  console.log('4');
  setTimeout(() => console.log('5'), 0);
});

console.log('6');

// 执行过程：
// 第一轮事件循环：
// 1. 同步代码
//    - console.log('1') → '1'
//    - setTimeout 注册宏任务 [Callback1]
//    - Promise.then 注册微任务 [Callback2]
//    - console.log('6') → '6'
// 2. 微任务队列
//    - Callback2: console.log('4') → '4'
//                setTimeout 注册宏任务 [Callback1, Callback3]
// 3. 宏任务队列
//    - Callback1: console.log('2') → '2'
//                Promise.then 注册微任务 [Callback4]

// 第二轮事件循环：
// 1. 同步代码（无）
// 2. 微任务队列
//    - Callback4: console.log('3') → '3'
// 3. 宏任务队列
//    - Callback3: console.log('5') → '5'

// 输出：
// 1
// 6
// 4
// 2
// 3
// 5
```

#### 3.3 渲染时机

```javascript
console.log('1');

document.body.style.backgroundColor = 'red';
console.log('2');

setTimeout(() => {
  document.body.style.backgroundColor = 'blue';
  console.log('3');
}, 0);

Promise.resolve().then(() => {
  document.body.style.backgroundColor = 'green';
  console.log('4');
});

console.log('5');

// 执行顺序：
// 1. 同步代码
//    - console.log('1')
//    - 修改背景色为红色（暂不渲染）
//    - console.log('2')
//    - setTimeout 注册宏任务
//    - Promise.then 注册微任务
//    - console.log('5')
// 2. 微任务队列
//    - console.log('4')
//    - 修改背景色为绿色（暂不渲染）
// 3. 渲染（如果需要）
//    - 渲染绿色背景
// 4. 宏任务队列
//    - console.log('3')
//    - 修改背景色为蓝色
// 5. 下一帧渲染
//    - 渲染蓝色背景

// 输出：
// 1
// 2
// 5
// 4
// 3
```

### 4. Node.js 事件循环

#### 4.1 Node.js 事件循环阶段

```
┌───────────────────────────────┐
│   Timers (setTimeout, etc.)   │  ← 阶段 1
├───────────────────────────────┤
│   Pending Callbacks           │  ← 阶段 2
├───────────────────────────────┤
│   Idle, Prepare               │  ← 阶段 3（内部使用）
├───────────────────────────────┤
│   Poll (I/O 回调)             │  ← 阶段 4
├───────────────────────────────┤
│   Check (setImmediate)        │  ← 阶段 5
├───────────────────────────────┤
│   Close Callbacks              │  ← 阶段 6
└───────────────────────────────┘
         ↑                   ↓
         └───────────────────┘
              每个阶段之间都会执行
              process.nextTick() 和微任务
```

##### 各阶段详解

```javascript
// 阶段 1: Timers
// 执行 setTimeout 和 setInterval 的回调
setTimeout(() => {
  console.log('Timer 1');
}, 0);

setTimeout(() => {
  console.log('Timer 2');
}, 100);

// 阶段 2: Pending Callbacks
// 执行某些系统操作的回调（如 TCP 错误）

// 阶段 3: Idle, Prepare
// 内部使用，开发者通常不直接交互

// 阶段 4: Poll
// 执行 I/O 回调（fs.readFile, 网络请求等）
const fs = require('fs');
fs.readFile('file.txt', () => {
  console.log('File read callback');
});

// 阶段 5: Check
// 执行 setImmediate 的回调
setImmediate(() => {
  console.log('Immediate 1');
});

// 阶段 6: Close Callbacks
// 执行关闭事件的回调（如 socket.on('close')）
```

#### 4.2 process.nextTick()

`process.nextTick()` 不在任何阶段，它在每个阶段之后、下一阶段之前执行。

```javascript
console.log('1');

process.nextTick(() => console.log('nextTick 1'));

setTimeout(() => console.log('timeout'), 0);

process.nextTick(() => console.log('nextTick 2'));

console.log('2');

// 输出：
// 1
// 2
// nextTick 1
// nextTick 2
// timeout
```

```javascript
console.log('Start');

setTimeout(() => {
  console.log('Timeout 1');
  process.nextTick(() => {
    console.log('nextTick in timeout');
  });
}, 0);

process.nextTick(() => {
  console.log('nextTick 1');
  process.nextTick(() => {
    console.log('nextTick in nextTick');
  });
});

console.log('End');

// 执行过程：
// 1. 同步代码
//    - console.log('Start')
//    - setTimeout 注册到 Timers 阶段
//    - process.nextTick() 注册到 nextTickQueue
//    - console.log('End')
// 2. 执行 nextTickQueue
//    - console.log('nextTick 1')
//    - process.nextTick() 注册新的 nextTick
//    - console.log('nextTick in nextTick')
// 3. 进入 Timers 阶段
//    - setTimeout 回调
//    - console.log('Timeout 1')
//    - process.nextTick() 注册到 nextTickQueue
// 4. 执行 nextTickQueue
//    - console.log('nextTick in timeout')

// 输出：
// Start
// End
// nextTick 1
// nextTick in nextTick
// Timeout 1
// nextTick in timeout
```

#### 4.3 setImmediate()

`setImmediate()` 在 Check 阶段执行，它和 `setTimeout(fn, 0)` 的区别取决于执行上下文。

```javascript
// 在主模块中，执行顺序不确定
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));

// 可能的输出：
// timeout
// immediate
// 或
// immediate
// timeout

// 在 I/O 回调中，setImmediate 总是先执行
const fs = require('fs');
fs.readFile(__filename, () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
});

// 输出（在 I/O 回调中）：
// immediate
// timeout
```

### 5. 浏览器 vs Node.js 事件循环对比

#### 5.1 差异总结

| 特性 | 浏览器 | Node.js |
|------|--------|---------|
| 任务类型 | 宏任务、微任务 | 宏任务、微任务、process.nextTick |
| 微任务执行时机 | 每个宏任务之后 | 每个阶段之后 |
| 阶段 | 无明确阶段 | 6 个明确阶段 |
| 渲染 | 在事件循环中 | 无渲染 |
| process.nextTick | 不支持 | 支持 |
| setImmediate | 不支持 | 支持 |
| MutationObserver | 支持 | 不支持 |

#### 5.2 相同代码在不同环境的表现

```javascript
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

console.log('4');

// 浏览器输出：
// 1
// 4
// 3
// 2

// Node.js 输出（相同）：
// 1
// 4
// 3
// 2
```

```javascript
setTimeout(() => console.log('timeout1'), 0);
setImmediate(() => console.log('immediate1'));

// 浏览器：
// 不支持 setImmediate，会报错

// Node.js（主模块）：
// 输出不确定，可能是：
// timeout1
// immediate1
// 或
// immediate1
// timeout1
```

```javascript
const fs = require('fs');

fs.readFile(__filename, () => {
  setTimeout(() => console.log('timeout2'), 0);
  setImmediate(() => console.log('immediate2'));
});

// 浏览器：
// 不支持 fs 模块

// Node.js（I/O 回调中）：
// immediate2
// timeout2
```

### 6. 实际应用场景

#### 6.1 异步任务优先级控制

```javascript
// 需求：按特定顺序执行异步任务
console.log('Start');

// 最高优先级：微任务
Promise.resolve().then(() => console.log('Microtask 1'));

// 次高优先级：process.nextTick（仅 Node.js）
if (typeof process !== 'undefined') {
  process.nextTick(() => console.log('nextTick'));
}

// 中等优先级：setImmediate（仅 Node.js）
if (typeof setImmediate !== 'undefined') {
  setImmediate(() => console.log('Immediate'));
}

// 最低优先级：setTimeout
setTimeout(() => console.log('Timeout'), 0);

console.log('End');

// Node.js 输出：
// Start
// End
// Microtask 1
// nextTick
// Immediate
// Timeout

// 浏览器输出：
// Start
// End
// Microtask 1
// Timeout
```

#### 6.2 批处理更新

```javascript
// 使用微任务进行批处理
let updates = [];
let scheduled = false;

function scheduleUpdate(updateFn) {
  updates.push(updateFn);
  
  if (!scheduled) {
    scheduled = true;
    
    // 使用微任务在当前事件循环周期结束后执行所有更新
    Promise.resolve().then(() => {
      updates.forEach(fn => fn());
      updates = [];
      scheduled = false;
    });
  }
}

// 使用示例
scheduleUpdate(() => console.log('Update 1'));
scheduleUpdate(() => console.log('Update 2'));
scheduleUpdate(() => console.log('Update 3'));

// 所有更新会在同一个微任务中执行
```

#### 6.3 节流函数

```javascript
// 使用事件循环实现节流
function throttle(fn, delay) {
  let lastCall = 0;
  
  return function(...args) {
    const now = Date.now();
    
    if (now - lastCall >= delay) {
      lastCall = now;
      fn.apply(this, args);
    } else {
      // 使用 setTimeout 在下一轮事件循环执行
      setTimeout(() => fn.apply(this, args), delay - (now - lastCall));
    }
  };
}

// 使用示例
const throttledLog = throttle(() => console.log('Throttled'), 1000);
setInterval(throttledLog, 100);
```

#### 6.4 异步队列处理

```javascript
// 使用事件循环管理异步任务队列
class AsyncQueue {
  constructor(concurrency = 1) {
    this.queue = [];
    this.running = 0;
    this.concurrency = concurrency;
  }
  
  add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.run();
    });
  }
  
  run() {
    while (this.running < this.concurrency && this.queue.length > 0) {
      const { task, resolve, reject } = this.queue.shift();
      this.running++;
      
      task()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          this.running--;
          // 使用微任务继续处理队列
          Promise.resolve().then(() => this.run());
        });
    }
  }
}

// 使用示例
const queue = new AsyncQueue(3);

for (let i = 1; i <= 10; i++) {
  queue.add(() => {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(`Task ${i} completed`);
        resolve();
      }, Math.random() * 1000);
    });
  });
}
```

### 7. 性能优化

#### 7.1 避免阻塞事件循环

```javascript
// ❌ 不好：阻塞事件循环
function heavyComputation() {
  const sum = 0;
  for (let i = 0; i < 1000000000; i++) {
    sum += i;
  }
  return sum;
}

console.log('Start');
heavyComputation(); // 阻塞
console.log('End'); // 会延迟很久才执行

// ✅ 好：使用分片处理
function heavyComputationChunked(total, chunkSize = 1000000) {
  let current = 0;
  
  return new Promise(resolve => {
    function processChunk() {
      const end = Math.min(current + chunkSize, total);
      
      for (let i = current; i < end; i++) {
        // 处理逻辑
      }
      
      current = end;
      
      if (current < total) {
        // 使用 setTimeout 让出主线程
        setTimeout(processChunk, 0);
      } else {
        resolve();
      }
    }
    
    processChunk();
  });
}

console.log('Start');
heavyComputationChunked(1000000000).then(() => console.log('End'));
console.log('Continue...'); // 可以立即执行
```

#### 7.2 合理使用微任务

```javascript
// ✅ 好：使用微任务进行状态更新
class Reactive {
  constructor() {
    this._value = undefined;
    this._subscribers = [];
  }
  
  set value(newValue) {
    if (this._value !== newValue) {
      this._value = newValue;
      
      // 使用微任务批量通知订阅者
      Promise.resolve().then(() => {
        this._subscribers.forEach(fn => fn(this._value));
      });
    }
  }
  
  subscribe(fn) {
    this._subscribers.push(fn);
  }
}

const reactive = new Reactive();
reactive.subscribe(value => console.log('Value changed:', value));

reactive.value = 'hello';
reactive.value = 'world';
// 订阅者只会被通知一次
```

#### 7.3 Node.js 特定优化

```javascript
// 使用 setImmediate 代替 setTimeout(fn, 0)
// setImmediate 更高效，因为它直接在事件循环的 Check 阶段执行

// ❌ 不好
setTimeout(() => {
  doSomething();
}, 0);

// ✅ 好
setImmediate(() => {
  doSomething();
});

// 使用 process.nextTick 进行紧急回调
// nextTick 在当前阶段之后立即执行

// 场景：确保在事件循环继续之前处理某些任务
function ensureSetup() {
  setupConfig();
  
  process.nextTick(() => {
    // 确保 setup 完成后再执行
    validateConfig();
  });
  
  // setupConfig 已经完成
}
```

### 8. 常见问题与调试

#### 8.1 事件循环饥饿

```javascript
// 问题：微任务队列被持续添加，导致宏任务无法执行
function createMicrotaskInfiniteLoop() {
  let count = 0;
  
  function addMicrotask() {
    count++;
    console.log('Microtask:', count);
    
    if (count < 10000) {
      Promise.resolve().then(addMicrotask);
    }
  }
  
  addMicrotask();
  
  setTimeout(() => {
    console.log('This will never execute!');
  }, 100);
}

// 解决：限制微任务的添加
function createControlledMicrotasks(maxIterations) {
  let count = 0;
  
  function addMicrotask() {
    count++;
    console.log('Microtask:', count);
    
    if (count < maxIterations) {
      Promise.resolve().then(addMicrotask);
    } else {
      // 使用 setTimeout 切换到宏任务
      setTimeout(() => {
        console.log('Switched to macrotask');
      }, 0);
    }
  }
  
  addMicrotask();
}
```

#### 8.2 内存泄漏

```javascript
// 问题：事件循环中的闭包导致内存泄漏
function createMemoryLeak() {
  const data = new Array(1000000).fill('leak');
  
  // 每秒执行的回调一直持有 data 的引用
  setInterval(() => {
    console.log('Leaking:', data.length);
  }, 1000);
}

// 解决：在不需要时清除定时器
function createNoLeak() {
  const data = new Array(1000000).fill('leak');
  const timer = setInterval(() => {
    console.log('Not leaking:', data.length);
  }, 1000);
  
  // 在某个时刻清除定时器
  setTimeout(() => {
    clearInterval(timer);
    console.log('Timer cleared, memory released');
  }, 5000);
}
```

#### 8.3 调试技巧

```javascript
// 使用 console.trace 追踪调用栈
console.log('1');
setTimeout(() => {
  console.log('2');
  console.trace('Where did this come from?');
}, 0);
console.log('3');

// 使用性能分析器
// 浏览器：打开开发者工具 → Performance → Record
// Node.js：使用 --prof 标志
// node --prof script.js
// node --prof-process isolate-0xnnnnnnnnnnnn-v8.log

// 使用 async_hooks（Node.js）
const async_hooks = require('async_hooks');

const hook = async_hooks.createHook({
  init(asyncId, type, triggerAsyncId) {
    console.log(`Init: ${type} (${asyncId})`);
  },
  destroy(asyncId) {
    console.log(`Destroy: ${asyncId}`);
  }
});

hook.enable();
```

### 9. 最佳实践

#### 9.1 选择合适的异步 API

```javascript
// 根据需求选择合适的 API

// 需要延迟执行：
setTimeout(() => {}, 1000);           // 浏览器和 Node.js
setImmediate(() => {});                // 仅 Node.js

// 需要立即执行（在当前调用栈之后）：
Promise.resolve().then(() => {});     // 浏览器和 Node.js
process.nextTick(() => {});           // 仅 Node.js（优先级更高）

// 需要周期性执行：
setInterval(() => {}, 1000);          // 浏览器和 Node.js
```

#### 9.2 避免事件循环阻塞

```javascript
// ✅ 好的实践

// 1. 使用异步 API
fs.readFile('file.txt', (err, data) => {
  // 使用回调处理
});

// 2. 使用 Promise
fs.promises.readFile('file.txt')
  .then(data => console.log(data))
  .catch(err => console.error(err));

// 3. 使用 async/await
async function readFile() {
  try {
    const data = await fs.promises.readFile('file.txt');
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

// 4. 分片处理大数据
function processLargeArray(array, chunkSize, callback) {
  let index = 0;
  
  function processChunk() {
    const chunk = array.slice(index, index + chunkSize);
    callback(chunk);
    
    index += chunkSize;
    
    if (index < array.length) {
      setTimeout(processChunk, 0);
    }
  }
  
  processChunk();
}
```

#### 9.3 错误处理

```javascript
// 微任务中的错误处理
Promise.resolve()
  .then(() => {
    throw new Error('Error in microtask');
  })
  .catch(err => {
    console.error('Caught:', err);
  });

// 宏任务中的错误处理
setTimeout(() => {
  try {
    throw new Error('Error in macrotask');
  } catch (err) {
    console.error('Caught:', err);
  }
}, 0);

// 全局错误处理
// 浏览器
window.onerror = (message, source, lineno, colno, error) => {
  console.error('Global error:', error);
  return true; // 阻止默认错误处理
};

window.onunhandledrejection = (event) => {
  console.error('Unhandled promise rejection:', event.reason);
};

// Node.js
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});
```

### 10. 总结

#### 关键要点

1. **事件循环是 JavaScript 异步编程的核心机制**
   - 浏览器和 Node.js 都有事件循环，但实现细节不同
   - 理解事件循环有助于编写高效的异步代码

2. **浏览器事件循环**
   - 调用栈 → 微任务队列 → 渲染 → 宏任务队列
   - 微任务优先级高于宏任务
   - 渲染在微任务执行后进行

3. **Node.js 事件循环**
   - 6 个明确阶段：Timers → Pending → Idle/Prepare → Poll → Check → Close
   - process.nextTick 在每个阶段之后执行
   - setImmediate 在 Check 阶段执行

4. **任务优先级**
   - 同步代码 > 微任务 > 宏任务
   - process.nextTick > Promise.then > setImmediate > setTimeout(0)

5. **性能优化**
   - 避免阻塞事件循环
   - 合理使用微任务进行批处理
   - 及时清理定时器和事件监听器

#### 实用建议

- **优先使用 Promise 和 async/await** 而不是回调
- **理解不同异步 API 的执行时机**，根据需求选择合适的 API
- **避免在循环中创建大量定时器**，可以使用节流或防抖
- **合理使用微任务** 进行状态更新和批处理
- **及时清理异步资源**，避免内存泄漏
- **在 Node.js 中优先使用 setImmediate** 而不是 setTimeout(fn, 0)

掌握事件循环机制对于编写高性能、可靠的 JavaScript 应用至关重要。无论是前端开发还是后端开发，深入理解事件循环都能帮助你更好地处理异步操作，优化应用性能。