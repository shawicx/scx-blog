## React Fiber 机制

### 1. 背景

React Fiber 是 React 16 中引入的核心架构重构，是对 React 协调算法的完全重写。它解决了 React 15 及之前版本中的一些根本性限制，特别是：

- **同步渲染阻塞**: 旧的协调算法是同步且不可中断的，复杂的更新会阻塞主线程，导致用户交互卡顿
- **优先级缺失**: 无法区分更新的优先级，所有更新按顺序执行
- **无法暂停和恢复**: 渲染过程一旦开始就必须完成

### 2. Fiber 的核心概念

Fiber 是 React 中对每个组件、DOM 节点等元素的抽象表示。每个 Fiber 节点都是一个 JavaScript 对象，包含了组件的**状态、props、以及与渲染相关的信息**。

#### 2.1 Fiber 节点的特性

- **可中断**: Fiber 允许渲染过程在中途暂停和恢复
- **可恢复**: 可以从上次暂停的地方继续执行
- **可优先级调度**: 不同类型的更新可以有不同的优先级
- **可并行**: 支持在后台进行工作准备

### 3. Fiber 节点的数据结构

一个典型的 Fiber 节点包含以下关键字段：

```javascript
{
  // 节点类型
  tag: FunctionComponent | ClassComponent | HostComponent | ...,
  
  // 节点唯一标识
  key: null | string,
  
  // 元素类型（组件函数、class、DOM 标签等）
  type: any,
  
  // 当前关联的 DOM 节点
  stateNode: any,
  
  // Fiber 树结构
  return: Fiber | null,     // 父节点
  child: Fiber | null,      // 第一个子节点
  sibling: Fiber | null,    // 下一个兄弟节点
  index: number,            // 在兄弟节点中的索引
  
  // 工作状态
  pendingProps: any,        // 新的 props
  memoizedProps: any,       // 上次渲染使用的 props
  updateQueue: mixed,       // 更新队列
  memoizedState: any,       // 上次渲染后的 state
  
  // 副作用
  flags: Flags,             // 副作用标记
  subtreeFlags: Flags,      // 子树是否有副作用
  
  // 调度相关
  lanes: Lanes,             // 优先级车道
  alternate: Fiber | null,  // 当前树的克隆（用于双缓存）
}
```

### 4. 双缓存机制

React Fiber 使用双缓存技术来管理 Fiber 树：

- **current 树**: 当前屏幕上显示的 Fiber 树
- **workInProgress 树**: 正在构建中的 Fiber 树

每次更新时，React 会在 workInProgress 树上进行工作。当 workInProgress 树构建完成后，它会替换 current 树成为新的当前树，而旧的 current 树则成为新的 workInProgress 树。

```javascript
// 双缓存切换示例
function commitRoot() {
  const rootFiber = workInProgressRoot;
  
  // 将 workInProgress 树标记为当前树
  rootFiber.alternate.current = rootFiber;
  
  // 更新根节点的 current 指针
  current = workInProgress;
  workInProgress = null;
}
```

### 5. Fiber 的工作循环

Fiber 架构的核心是工作循环，分为两个阶段：

#### 5.1 Render 阶段（可中断）

这个阶段负责计算出 Fiber 树的变化，可以被中断：

```javascript
function workLoop() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(unitOfWork) {
  const next = beginWork(unitOfWork);
  
  if (next === null) {
    completeUnitOfWork(unitOfWork);
  } else {
    workInProgress = next;
  }
}
```

**beginWork**: 处理 Fiber 节点，创建或更新子节点
**completeUnitOfWork**: 完成 Fiber 节点，处理副作用

#### 5.2 Commit 阶段（不可中断）

这个阶段将 Render 阶段计算出的变化应用到 DOM：

```javascript
function commitRoot() {
  // 1. 执行 DOM 操作
  commitMutationEffects();
  
  // 2. 重置布局
  commitLayoutEffects();
  
  // 3. 清理工作
  resetAfterCommit();
}
```

Commit 阶段分为三个子阶段：
1. **Before Mutation**: DOM 变更前（getSnapshotBeforeUpdate）
2. **Mutation**: 实际 DOM 操作（增删改）
3. **Layout**: DOM 变更后（useEffect, componentDidMount 等）

### 6. 调度机制

#### 6.1 时间分片

Fiber 将渲染工作分解为多个小单元，每个单元完成后检查是否需要让出主线程：

```javascript
function shouldYield() {
  // 检查是否超时
  return (
    getCurrentTime() >= deadline ||
    hasHigherPriorityWork()
  );
}
```

#### 6.2 优先级

React 使用优先级来调度不同类型的更新：

```javascript
// 优先级示例
const ImmediatePriority = 1;  // 同步任务，如用户点击
const UserBlockingPriority = 2;  // 用户交互相关
const NormalPriority = 3;  // 普通更新
const LowPriority = 4;  // 低优先级
const IdlePriority = 5;  // 空闲时执行
```

React 18 引入了"车道"（Lanes）模型来更精确地管理优先级：

```javascript
// 使用 lanes 表示优先级
const lanes = {
  NoLanes: 0b0000000000000000000000000000000,
  SyncLane: 0b0000000000000000000000000000001,
  SyncBatchedLane: 0b0000000000000000000000000000010,
  InputDiscreteHydrationLane: 0b0000000000000000000000000000100,
  InputDiscreteLane: 0b0000000000000000000000000001000,
  DefaultHydrationLane: 0b0000000000000000000000000010000,
  DefaultLane: 0b0000000000000000000000000100000,
  // ...
};
```

### 7. 调度器（Scheduler）

React 18 引入了独立的调度器来管理任务执行：

```javascript
// 调度器的工作原理
function scheduleCallback(priorityLevel, callback) {
  const currentTime = getCurrentTime();
  
  const newTask = {
    id: taskIdCounter++,
    callback,
    priorityLevel,
    startTime,
    expirationTime,
    sortIndex: -1,
  };
  
  // 将任务加入优先级队列
  push(taskQueue, newTask);
  
  // 如果需要，请求调度
  requestHostCallback(flushWork);
}
```

调度器使用 MessageChannel 或 setTimeout 来实现时间分片，确保高优先级任务可以中断低优先级任务。

### 8. 并发模式（Concurrent Mode）

并发模式是 Fiber 架构的重要特性，它允许 React：

- **中断渲染**: 当有更高优先级的更新到来时，中断当前渲染
- **恢复渲染**: 高优先级任务完成后，继续之前的渲染
- **可取消渲染**: 如果组件已经卸载或 props 已改变，可以取消正在进行的渲染

#### 8.1 过渡更新

```javascript
import { startTransition } from 'react';

// 标记为过渡更新（低优先级）
startTransition(() => {
  setSearchQuery(input);
});

// 紧急更新（高优先级）
setInputValue(input);
```

#### 8.2 Suspense

Suspense 利用 Fiber 的可中断特性实现：

```javascript
<Suspense fallback={<Loading />}>
  <AsyncComponent />
</Suspense>
```

当组件等待数据时，React 可以中断渲染并显示 fallback，数据加载完成后恢复渲染。

### 9. 副作用管理

Fiber 通过副作用标记来跟踪需要执行的操作：

```javascript
// 副作用标记
const NoFlags = 0b0000000000000000000000000000000;
const Placement = 0b0000000000000000000000000000010;  // 插入
const Update = 0b0000000000000000000000000000100;     // 更新
const Deletion = 0b0000000000000000000000000001000;   // 删除
const Passive = 0b0000000000000000000000000010000;    // useEffect
const Ref = 0b0000000000000000000000000100000;        // ref
```

副作用会在 Commit 阶段按照特定顺序执行。

### 10. 与 Stack Reconciler 的对比

| 特性 | Stack Reconciler | Fiber Reconciler |
|------|------------------|------------------|
| 执行方式 | 同步、不可中断 | 可中断、可恢复 |
| 优先级 | 无 | 支持优先级调度 |
| 并发 | 不支持 | 支持并发模式 |
| 调度 | 递归调用 | 迭代 + 调度器 |
| 复杂度 | O(n) | O(n) 但更灵活 |
| 错误恢复 | 困难 | 支持错误边界 |

### 11. 实际影响

#### 11.1 性能提升

- **更流畅的用户体验**: 高优先级更新（如用户输入）可以打断低优先级渲染
- **更好的时间利用**: 利用浏览器的空闲时间进行渲染
- **减少布局抖动**: 批处理 DOM 操作

#### 11.2 新的 API

Fiber 架构使得以下 API 成为可能：

- **并发特性**: startTransition, useDeferredValue, useTransition
- **Suspense**: 数据获取的声明式处理
- **useEffect**: 更好的副作用管理
- **useLayoutEffect**: 同步执行副作用

### 12. 最佳实践

基于 Fiber 架构，以下是一些最佳实践：

#### 12.1 利用并发特性

```javascript
// 使用过渡更新优化大数据渲染
function SearchResults({ query }) {
  const [deferredQuery] = useDeferredValue(query);
  
  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <Results query={deferredQuery} />
    </div>
  );
}
```

#### 12.2 避免阻塞渲染

```javascript
// ❌ 不好：长时间运行的任务阻塞渲染
function HeavyComponent() {
  const data = heavyCalculation();  // 阻塞渲染
  
  return <div>{data}</div>;
}

// ✅ 好：使用过渡更新
function HeavyComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    startTransition(() => {
      const result = heavyCalculation();
      setData(result);
    });
  }, []);
  
  return data ? <div>{data}</div> : <Loading />;
}
```

#### 12.3 合理使用 Suspense

```javascript
// 使用 Suspense 实现优雅的加载状态
function UserProfile({ userId }) {
  return (
    <Suspense fallback={<Skeleton />}>
      <UserData userId={userId} />
      <Suspense fallback={<Skeleton />}>
        <UserPosts userId={userId} />
      </Suspense>
    </Suspense>
  );
}
```

### 13. 总结

React Fiber 是一次彻底的架构重构，它通过以下方式改进了 React：

1. **可中断的渲染**: 通过时间分片避免主线程阻塞
2. **优先级调度**: 区分不同更新的重要性
3. **并发模式**: 支持更复杂的交互场景
4. **更好的错误处理**: 通过错误边界隔离错误
