# 垃圾回收机制

## 什么是垃圾回收

垃圾回收（Garbage Collection，GC）是自动内存管理的一种机制，它自动识别不再使用的内存并释放这些内存，防止内存泄漏。

### 为什么需要垃圾回收

```javascript
// 手动内存管理（C/C++）
char* ptr = (char*)malloc(100);
// 使用内存
free(ptr); // 必须手动释放

// 自动内存管理（JavaScript）
let data = new Array(1000000);
// 使用内存
// 无需手动释放，GC 会自动回收
```

### 垃圾回收的作用

1. **自动释放内存**：无需手动释放不再使用的对象
2. **防止内存泄漏**：自动识别和清理无用内存
3. **提高开发效率**：开发者可以专注于业务逻辑
4. **增强安全性**：避免悬空指针、双重释放等问题

## 内存管理基础

### 栈和堆

```javascript
// 栈存储
function foo() {
  let a = 1;          // 基本类型，存储在栈中
  let b = 2;          // 基本类型，存储在栈中
  let c = 'hello';    // 基本类型，存储在栈中
} // 函数执行完毕，栈内存自动释放

// 堆存储
function bar() {
  let obj = {          // 对象，存储在堆中
    name: '张三',
    age: 25
  };
  let arr = [1, 2, 3]; // 数组，存储在堆中
} // 引用变量在栈中，对象在堆中
```

### 内存分配

```javascript
// 基本类型 - 栈分配
let num = 42;
let str = 'hello';
let bool = true;

// 对象类型 - 堆分配
let obj = { name: '张三' };      // 对象在堆中，引用在栈中
let arr = [1, 2, 3];           // 数组在堆中，引用在栈中
let date = new Date();          // Date 对象在堆中
let fn = function() {};         // 函数对象在堆中
```

### 引用和可访问性

```javascript
// 可访问的对象不会被回收
let obj = { name: '张三' };
let ref = obj; // obj 和 ref 都引用同一个对象

// 删除引用，对象变为不可访问
obj = null;
ref = null; // 对象现在可以被回收了

// 全局对象始终可访问
global.cache = { data: 'important' }; // 不会被回收
```

## 垃圾回收算法

### 1. 引用计数算法

引用计数是最简单的垃圾回收算法，它记录每个对象被引用的次数。

```javascript
// 引用计数示例
let obj = { name: '张三' }; // 引用计数: 1
let ref = obj;               // 引用计数: 2
let ref2 = obj;              // 引用计数: 3

ref = null;                  // 引用计数: 2
ref2 = null;                 // 引用计数: 1

obj = null;                  // 引用计数: 0，对象被回收
```

**循环引用问题**：

```javascript
// 循环引用导致无法回收
function createCircular() {
  let objA = {};
  let objB = {};
  
  objA.ref = objB;  // objA 引用 objB
  objB.ref = objA;  // objB 引用 objA
  
  // 函数执行完毕，objA 和 objB 都在栈中释放
  // 但堆中的对象互相引用，引用计数都不为 0
  // 导致无法回收，内存泄漏
}

createCircular();
```

### 2. 标记-清除算法

标记-清除算法通过从根对象开始，递归标记所有可访问的对象，然后清除未标记的对象。

```javascript
// 标记阶段
function markPhase() {
  // 从全局对象（根）开始
  const root = global;
  
  // 递归标记所有可达对象
  mark(root);
  
  function mark(obj) {
    if (!obj || obj._marked) return;
    
    obj._marked = true; // 标记为可达
    
    // 标记所有引用的对象
    for (let key in obj) {
      if (typeof obj[key] === 'object') {
        mark(obj[key]);
      }
    }
  }
}

// 清除阶段
function sweepPhase() {
  // 遍历堆中的所有对象
  for (let obj in heap) {
    if (!obj._marked) {
      // 未标记的对象，清除
      delete heap[obj];
    } else {
      // 已标记的对象，取消标记
      delete obj._marked;
    }
  }
}

// 完整的 GC 周期
function garbageCollect() {
  markPhase();   // 标记
  sweepPhase();  // 清除
}
```

**优点**：
- 解决循环引用问题
- 算法简单，易于实现

**缺点**：
- 产生内存碎片
- 执行效率不高

### 3. 标记-整理算法

标记-整理算法在标记-清除的基础上，将存活对象移动到一起，消除内存碎片。

```javascript
function compactPhase() {
  // 收集所有存活对象
  const liveObjects = [];
  
  for (let obj in heap) {
    if (obj._marked) {
      liveObjects.push(obj);
    }
  }
  
  // 清除旧堆
  heap = [];
  
  // 将存活对象连续存放
  liveObjects.forEach((obj, index) => {
    heap[index] = obj;
    delete obj._marked;
  });
}
```

**优点**：
- 消除内存碎片
- 提高内存利用率

**缺点**：
- 移动对象开销较大

### 4. 分代回收算法

分代回收基于"大部分对象生命周期短"的观察，将堆分为新生代和老生代，分别使用不同的回收策略。

```javascript
// 分代回收结构
const heap = {
  // 新生代：存放新生成的对象
  nursery: {
    fromSpace: [],  // Eden 区
    toSpace: [],    // Survivor 区
  },
  
  // 老生代：存放长期存活的对象
  old: []
};

// 新生代 GC (Scavenge 算法)
function newGenerationGC() {
  const { fromSpace, toSpace } = heap.nursery;
  
  // 标记存活对象
  const survivors = fromSpace.filter(obj => isReachable(obj));
  
  // 将存活对象移动到 Survivor 区
  heap.nursery.toSpace = survivors;
  
  // 清空 Eden 区
  heap.nursery.fromSpace = [];
  
  // 对象晋升到老生代
  const promoted = survivors.filter(obj => obj.age > threshold);
  heap.old.push(...promoted);
  
  // 交换空间
  const temp = heap.nursery.fromSpace;
  heap.nursery.fromSpace = heap.nursery.toSpace;
  heap.nursery.toSpace = temp;
}

// 老生代 GC (标记-清除/整理算法)
function oldGenerationGC() {
  // 标记存活对象
  heap.old.forEach(obj => {
    obj._marked = isReachable(obj);
  });
  
  // 清除未标记对象
  heap.old = heap.old.filter(obj => obj._marked);
  
  // 整理内存，消除碎片
  compactMemory(heap.old);
}
```

## V8 引擎的垃圾回收

### 新生代回收（Scavenge）

```javascript
// V8 新生代结构
const newSpace = {
  eden: [],      // Eden 区：新对象分配在这里
  survivor1: [], // Survivor 区 1
  survivor2: [],  // Survivor 区 2
};

// 分配对象
function allocate(obj) {
  newSpace.eden.push(obj);
}

// Scavenge GC
function scavengeGC() {
  // 标记 Eden 和 Survivor 区中的存活对象
  const survivors = [
    ...newSpace.eden.filter(isAlive),
    ...newSpace.survivor1.filter(isAlive),
  ];
  
  // 将存活对象移动到 Survivor 区 2
  newSpace.survivor2 = survivors;
  
  // 增加存活对象的年龄
  survivors.forEach(obj => obj.age++);
  
  // 晋升到老生代
  const promoted = survivors.filter(obj => obj.age >= 2);
  oldSpace.push(...promoted);
  
  // 清空 Eden 和 Survivor 区 1
  newSpace.eden = [];
  newSpace.survivor1 = [];
  
  // 交换 Survivor 区
  const temp = newSpace.survivor1;
  newSpace.survivor1 = newSpace.survivor2;
  newSpace.survivor2 = temp;
}
```

**特点**：
- 频繁执行（通常在 Eden 区满时）
- 复制算法，效率高
- 只处理少量对象，速度快

### 老生代回收（Mark-Sweep-Compact）

```javascript
// 标记阶段
function mark() {
  const roots = [global, stack];
  const worklist = [...roots];
  
  while (worklist.length > 0) {
    const obj = worklist.pop();
    
    if (obj && !obj._marked) {
      obj._marked = true;
      
      // 将引用的对象加入工作列表
      for (let key in obj) {
        if (typeof obj[key] === 'object') {
          worklist.push(obj[key]);
        }
      }
    }
  }
}

// 清除阶段
function sweep() {
  // 清除未标记对象
  oldSpace = oldSpace.filter(obj => obj._marked);
  
  // 取消标记
  oldSpace.forEach(obj => delete obj._marked);
}

// 整理阶段
function compact() {
  // 将存活对象连续存放
  const liveObjects = oldSpace;
  oldSpace = [];
  liveObjects.forEach(obj => {
    oldSpace.push(obj);
  });
}

// 完整的 Mark-Sweep-Compact GC
function fullGC() {
  mark();     // 标记
  sweep();    // 清除
  compact();  // 整理
}
```

**特点**：
- 不频繁执行（通常在老生代满时）
- 标记-清除-整理算法
- 处理大量对象，速度较慢

### 增量标记和并发标记

```javascript
// 增量标记
function incrementalMark() {
  const maxWorkTime = 50; // 每次最多执行 50ms
  
  let worklist = [global, stack];
  
  function step() {
    const startTime = Date.now();
    
    while (worklist.length > 0 && Date.now() - startTime < maxWorkTime) {
      const obj = worklist.pop();
      
      if (obj && !obj._marked) {
        obj._marked = true;
        
        for (let key in obj) {
          if (typeof obj[key] === 'object') {
            worklist.push(obj[key]);
          }
        }
      }
    }
    
    if (worklist.length > 0) {
      // 继续下次增量标记
      setTimeout(step, 0);
    } else {
      // 标记完成，执行清除
      sweep();
    }
  }
  
  step();
}

// 并发标记
function concurrentMark() {
  // 主线程继续执行 JavaScript
  // 后台线程进行标记
  
  const worker = new Worker('gc-worker.js');
  
  worker.postMessage({
    type: 'start-mark',
    roots: [global, stack]
  });
  
  worker.onmessage = (event) => {
    if (event.data.type === 'mark-complete') {
      // 标记完成，在主线程执行清除
      sweep();
    }
  };
}
```

## 常见内存泄漏

### 1. 全局变量

```javascript
// 意外创建全局变量
function foo() {
  bar = '全局变量'; // 忘记使用 var/let/const
}
foo();
console.log(bar); // '全局变量'，无法被回收

// 明确创建全局变量
window.cache = { data: 'important' }; // 无法被回收
```

**解决方案**：

```javascript
// 使用局部变量
function foo() {
  let bar = '局部变量'; // 函数执行完毕，自动释放
}

// 使用命名空间
const MyApp = {
  cache: { data: 'important' }
};

// 不再需要时清除
MyApp.cache = null;
```

### 2. 闭包

```javascript
// 闭包导致内存泄漏
function createClosure() {
  const data = new Array(1000000).fill('data');
  
  return function() {
    console.log('闭包');
    // 虽然没有使用 data，但闭包仍然引用它
  };
}

const closure = createClosure();
// data 无法被回收

// 解决方案 1：显式清除
let closure = function() {
  let data = new Array(1000000).fill('data');
  
  return function() {
    console.log('闭包');
    data = null; // 解除引用
  };
}();

// 解决方案 2：避免闭包引用大对象
function createClosure() {
  return function() {
    console.log('闭包');
  };
}
```

### 3. DOM 引用

```javascript
// DOM 元素引用
const elements = [];

function addElements() {
  for (let i = 0; i < 1000; i++) {
    const element = document.createElement('div');
    elements.push(element); // 保存引用
    document.body.appendChild(element);
  }
}

function removeElements() {
  elements.forEach(element => {
    document.body.removeChild(element);
  });
  // elements 数组仍然引用元素，无法被回收
}

// 解决方案：清除引用
function removeElements() {
  elements.forEach(element => {
    document.body.removeChild(element);
  });
  elements.length = 0; // 清空数组，解除引用
}
```

### 4. 定时器

```javascript
// 定时器导致内存泄漏
function startTimer() {
  const data = new Array(1000000).fill('data');
  
  setInterval(() => {
    console.log(data.length); // 引用 data
  }, 1000);
}

startTimer();
// 定时器一直运行，data 无法被回收

// 解决方案：保存定时器 ID，清除定时器
function startTimer() {
  const data = new Array(1000000).fill('data');
  const timerId = setInterval(() => {
    console.log(data.length);
  }, 1000);
  
  // 清除定时器
  return function cleanup() {
    clearInterval(timerId);
  };
}

const cleanup = startTimer();
cleanup(); // 清除定时器，data 可以被回收
```

### 5. 事件监听器

```javascript
// 事件监听器导致内存泄漏
function addEventListeners() {
  const elements = document.querySelectorAll('.item');
  
  elements.forEach(element => {
    element.addEventListener('click', () => {
      console.log('点击');
    });
  });
  
  // 元素被移除，但事件监听器仍然存在
}

// 解决方案：移除事件监听器
function addEventListeners() {
  const elements = document.querySelectorAll('.item');
  const handlers = [];
  
  elements.forEach(element => {
    const handler = () => {
      console.log('点击');
    };
    element.addEventListener('click', handler);
    handlers.push({ element, handler });
  });
  
  return function cleanup() {
    handlers.forEach(({ element, handler }) => {
      element.removeEventListener('click', handler);
    });
  };
}

const cleanup = addEventListeners();
cleanup(); // 移除所有事件监听器
```

### 6. 循环引用

```javascript
// 循环引用
function createCircularReference() {
  const objA = {};
  const objB = {};
  
  objA.ref = objB;
  objB.ref = objA;
  
  return { objA, objB };
}

const circular = createCircularReference();
// 虽然 V8 使用标记-清除算法可以处理循环引用
// 但在其他使用引用计数算法的环境中会导致内存泄漏

// 解决方案：显式解除引用
function cleanupCircular(circular) {
  circular.objA.ref = null;
  circular.objB.ref = null;
}

cleanupCircular(circular);
```

## 性能优化

### 1. 减少对象创建

```javascript
// 不好的做法 - 频繁创建对象
function processItems(items) {
  items.forEach(item => {
    const result = {
      id: item.id,
      name: item.name,
      processed: true
    };
    process(result);
  });
}

// 好的做法 - 复用对象
function processItems(items) {
  const result = {};
  
  items.forEach(item => {
    result.id = item.id;
    result.name = item.name;
    result.processed = true;
    process(result);
  });
}
```

### 2. 及时释放引用

```javascript
// 及时释放大对象
function processData(data) {
  // 处理数据
  const result = transform(data);
  
  // 立即释放大对象
  data = null;
  
  return result;
}

// 及时释放事件监听器
class Component {
  constructor() {
    this.handleClick = this.handleClick.bind(this);
  }
  
  mount() {
    document.addEventListener('click', this.handleClick);
  }
  
  unmount() {
    document.removeEventListener('click', this.handleClick);
  }
}

// 及时释放定时器
class Timer {
  constructor(callback, interval) {
    this.timerId = setInterval(callback, interval);
  }
  
  stop() {
    clearInterval(this.timerId);
    this.timerId = null;
  }
}
```

### 3. 使用 WeakMap 和 WeakSet

```javascript
// WeakMap - 键是弱引用
const weakMap = new WeakMap();
const obj = { data: 'important' };

weakMap.set(obj, 'metadata');
// 当 obj 不再被引用时，可以自动回收

// WeakSet - 元素是弱引用
const weakSet = new WeakSet();
const set = [obj1, obj2, obj3];

set.forEach(obj => weakSet.add(obj));
// 当对象不再被引用时，可以自动回收

// 使用场景：缓存
function memoize(fn) {
  const cache = new WeakMap();
  
  return function(arg) {
    if (cache.has(arg)) {
      return cache.get(arg);
    }
    
    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };
}
```

### 4. 避免长生命周期的对象

```javascript
// 不好的做法 - 长生命周期对象
class DataCache {
  constructor() {
    this.cache = {}; // 缓存会无限增长
  }
  
  add(key, value) {
    this.cache[key] = value;
  }
}

// 好的做法 - 限制缓存大小
class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }
  
  add(key, value) {
    if (this.cache.size >= this.maxSize) {
      // 删除最旧的项
      const oldest = this.cache.keys().next().value;
      this.cache.delete(oldest);
    }
    
    this.cache.set(key, value);
  }
}

// 或使用 WeakMap
class WeakCache {
  constructor() {
    this.cache = new WeakMap();
  }
  
  add(key, value) {
    this.cache.set(key, value);
  }
}
```

### 5. 使用对象池

```javascript
// 对象池 - 复用对象
class ObjectPool {
  constructor(createFn, resetFn, maxSize = 100) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
    this.maxSize = maxSize;
  }
  
  acquire() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return this.createFn();
  }
  
  release(obj) {
    this.resetFn(obj);
    
    if (this.pool.length < this.maxSize) {
      this.pool.push(obj);
    }
  }
}

// 使用
const vectorPool = new ObjectPool(
  () => ({ x: 0, y: 0, z: 0 }),
  (vec) => { vec.x = 0; vec.y = 0; vec.z = 0; }
);

function processVectors() {
  const vec1 = vectorPool.acquire();
  const vec2 = vectorPool.acquire();
  
  // 使用向量
  vec1.x = 1;
  vec1.y = 2;
  
  // 归还到池中
  vectorPool.release(vec1);
  vectorPool.release(vec2);
}
```

## 开发工具

### Chrome DevTools Memory 面板

```javascript
// 1. 获取堆快照
// DevTools → Memory → Take Heap Snapshot

// 2. 分析内存泄漏
// DevTools → Memory → Allocation sampling

// 3. 监控内存分配
// DevTools → Memory → Allocation instrumentation on timeline

// 4. 比较快照
// DevTools → Memory → Comparison View
```

### Performance API

```javascript
// 监控内存使用
function monitorMemory() {
  if (performance.memory) {
    console.log('内存使用:', {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit,
    });
  } else {
    console.log('当前浏览器不支持 memory API');
  }
}

// 定期监控
setInterval(monitorMemory, 5000);

// 监控性能
function measurePerformance(fn) {
  const start = performance.now();
  const startMemory = performance.memory?.usedJSHeapSize;
  
  fn();
  
  const end = performance.now();
  const endMemory = performance.memory?.usedJSHeapSize;
  
  console.log('执行时间:', end - start, 'ms');
  console.log('内存变化:', endMemory - startMemory, 'bytes');
}
```

### Node.js 内存分析

```javascript
// Node.js 内存快照
const v8 = require('v8');
const fs = require('fs');

// 获取堆快照
const snapshot = v8.getHeapSnapshot();
const fileName = `heap-snapshot-${Date.now()}.heapsnapshot`;
fs.writeFileSync(fileName, snapshot);

console.log(`堆快照已保存到: ${fileName}`);

// 内存统计
function printMemoryStats() {
  const stats = v8.getHeapStatistics();
  
  console.log('堆统计:', {
    total: stats.total_heap_size,
    used: stats.used_heap_size,
    external: stats.external_memory,
    limit: stats.heap_size_limit,
  });
}

printMemoryStats();
```

## 实际应用案例

### 案例 1：优化列表渲染

```javascript
// 不好的做法 - 创建大量 DOM 元素
function renderList(items) {
  items.forEach(item => {
    const element = document.createElement('div');
    element.textContent = item.name;
    document.body.appendChild(element);
  });
}

// 好的做法 - 虚拟滚动
class VirtualList {
  constructor(options) {
    this.itemHeight = options.itemHeight;
    this.visibleCount = Math.ceil(options.viewportHeight / this.itemHeight);
    this.scrollTop = 0;
    
    this.render(options.items);
  }
  
  render(items) {
    const startIdx = Math.floor(this.scrollTop / this.itemHeight);
    const endIdx = Math.min(startIdx + this.visibleCount, items.length);
    
    // 只渲染可见元素
    const visibleItems = items.slice(startIdx, endIdx);
    this.updateDOM(visibleItems);
  }
  
  updateDOM(items) {
    // 更新 DOM
    // ...
  }
}
```

### 案例 2：优化事件处理

```javascript
// 不好的做法 - 为每个元素添加事件监听器
function addEventListeners(elements) {
  elements.forEach(element => {
    element.addEventListener('click', handler);
  });
}

// 好的做法 - 事件委托
function addEventDelegate(container) {
  container.addEventListener('click', (event) => {
    const target = event.target.closest('.item');
    
    if (target && container.contains(target)) {
      handler.call(target, event);
    }
  });
}
```

### 案例 3：优化数据处理

```javascript
// 不好的做法 - 一次性处理大数据
function processData(data) {
  const results = data.map(item => {
    return transform(item);
  });
  
  return results;
}

// 好的做法 - 分批处理
async function processDataBatch(data, batchSize = 100) {
  const results = [];
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const batchResults = batch.map(item => transform(item));
    results.push(...batchResults);
    
    // 让出主线程
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  
  return results;
}
```

## 最佳实践

### 1. 及时释放资源

```javascript
// 创建清理函数
function createResource() {
  const data = new Array(1000000).fill('data');
  const timerId = setInterval(() => {}, 1000);
  
  // 返回清理函数
  return {
    getData: () => data,
    cleanup: () => {
      clearInterval(timerId);
      data.length = 0;
    }
  };
}

const resource = createResource();
// 使用资源
// ...
// 不再需要时
resource.cleanup();
```

### 2. 使用 WeakMap/WeakSet

```javascript
// 缓存装饰器
function memoize(fn) {
  const cache = new WeakMap();
  
  return function(arg) {
    if (cache.has(arg)) {
      return cache.get(arg);
    }
    
    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };
}
```

### 3. 避免内存泄漏

```javascript
// 组件生命周期管理
class Component {
  constructor() {
    this.eventListeners = [];
    this.timers = [];
  }
  
  addEventListener(element, event, handler) {
    element.addEventListener(event, handler);
    this.eventListeners.push({ element, event, handler });
  }
  
  addTimer(callback, interval) {
    const timerId = setInterval(callback, interval);
    this.timers.push(timerId);
  }
  
  destroy() {
    // 清理事件监听器
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
    
    // 清理定时器
    this.timers.forEach(timerId => clearInterval(timerId));
    this.timers = [];
  }
}
```

### 4. 监控内存使用

```javascript
// 内存监控工具
class MemoryMonitor {
  constructor() {
    this.snapshots = [];
  }
  
  takeSnapshot() {
    const snapshot = {
      timestamp: Date.now(),
      memory: performance.memory
        ? performance.memory.usedJSHeapSize
        : null
    };
    
    this.snapshots.push(snapshot);
    return snapshot;
  }
  
  printReport() {
    if (this.snapshots.length < 2) {
      console.log('需要至少两个快照');
      return;
    }
    
    const [first, last] = [this.snapshots[0], this.snapshots[this.snapshots.length - 1]];
    const diff = last.memory - first.memory;
    
    console.log('内存变化报告:', {
      startTime: new Date(first.timestamp),
      endTime: new Date(last.timestamp),
      startMemory: first.memory,
      endMemory: last.memory,
      change: diff,
      trend: diff > 0 ? '增加' : '减少'
    });
  }
}
```

## 常见问题

### Q: 如何检测内存泄漏？

A: 使用 Chrome DevTools 的 Memory 面板，获取多个堆快照进行对比分析。也可以使用 Performance API 监控内存使用情况。

### Q: WeakMap 和 Map 有什么区别？

A: WeakMap 的键是弱引用，当键不再被引用时，可以自动回收；Map 的键是强引用，会阻止垃圾回收。

### Q: 垃圾回收什么时候执行？

A: 垃圾回收的执行时机由浏览器引擎决定，通常在内存使用达到阈值或 CPU 空闲时执行。

### Q: 如何避免内存泄漏？

A: 及时释放引用、避免全局变量、正确处理事件监听器和定时器、使用 WeakMap/WeakSet、定期监控内存使用。

### Q: 分代回收为什么能提高性能？

A: 因为大部分对象生命周期短，只需频繁回收新生代；少数对象生命周期长，偶尔回收老生代即可，整体效率更高。

### Q: 如何优化大列表的性能？

A: 使用虚拟滚动技术，只渲染可见区域的元素；使用分页或无限滚动，按需加载数据；使用对象池复用对象。

## 总结

### 垃圾回收机制

1. **引用计数**：简单但无法处理循环引用
2. **标记-清除**：可以处理循环引用，但有内存碎片
3. **标记-整理**：消除内存碎片，提高利用率
4. **分代回收**：根据对象生命周期分别处理，提高效率

### V8 垃圾回收

1. **新生代**：使用 Scavenge 算法，频繁快速回收
2. **老生代**：使用 Mark-Sweep-Compact，不频繁但彻底回收
3. **增量标记**：将 GC 分段执行，减少停顿
4. **并发标记**：在后台线程执行 GC，不影响主线程

### 常见内存泄漏

1. 全局变量
2. 闭包
3. DOM 引用
4. 定时器
5. 事件监听器
6. 循环引用

### 最佳实践

1. 及时释放资源
2. 使用 WeakMap/WeakSet
3. 避免长生命周期对象
4. 监控内存使用
5. 使用对象池复用对象

掌握垃圾回收机制，可以帮助你更好地理解 JavaScript 的内存管理，编写高性能、无内存泄漏的代码。记住：**垃圾回收是自动的，但内存管理仍然是开发者的责任。**