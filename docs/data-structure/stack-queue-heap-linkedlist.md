# 堆、栈、队列、链表

## 1. 栈（Stack）

### 1.1 基本概念

栈是一种**后进先出（LIFO）** 的线性数据结构，只允许在栈顶进行插入和删除操作。

```
入栈顺序: A → B → C → D
出栈顺序: D → C → B → A

  栈顶 →  D
          C
          B
  栈底 →  A
```

### 1.2 核心操作

| 操作 | 时间复杂度 | 说明 |
|------|-----------|------|
| push | O(1) | 元素入栈 |
| pop | O(1) | 栈顶元素出栈 |
| peek | O(1) | 查看栈顶元素 |
| isEmpty | O(1) | 判断栈是否为空 |

### 1.3 代码实现

```js
class Stack {
  constructor() {
    this.items = []
  }

  push(item) {
    this.items.push(item)
  }

  pop() {
    return this.items.pop()
  }

  peek() {
    return this.items[this.items.length - 1]
  }

  get size() {
    return this.items.length
  }
}
```

### 1.4 应用场景

- **函数调用栈**：JavaScript 的执行上下文栈
- **括号匹配**：判断括号是否成对闭合
- **浏览器前进后退**：用两个栈实现页面历史
- **撤销操作**：Ctrl+Z 的实现原理

---

## 2. 队列（Queue）

### 2.1 基本概念

队列是一种**先进先出（FIFO）** 的线性数据结构，从队尾入队，从队头出队。

```
入队顺序: A → B → C → D
出队顺序: A → B → C → D

  出队 ←  A  B  C  D  ← 入队
         队头        队尾
```

### 2.2 核心操作

| 操作 | 时间复杂度 | 说明 |
|------|-----------|------|
| enqueue | O(1) | 元素入队 |
| dequeue | O(1) | 队头元素出队 |
| front | O(1) | 查看队头元素 |
| isEmpty | O(1) | 判断队列是否为空 |

### 2.3 代码实现

```js
class Queue {
  constructor() {
    this.items = []
  }

  enqueue(item) {
    this.items.push(item)
  }

  dequeue() {
    return this.items.shift()
  }

  front() {
    return this.items[0]
  }

  get size() {
    return this.items.length
  }
}
```

### 2.4 应用场景

- **消息队列**：任务调度、事件处理
- **广度优先搜索（BFS）**：图的层序遍历
- **请求队列**：并发请求控制

---

## 3. 链表（Linked List）

### 3.1 基本概念

链表是一种通过**指针**将零散内存块串联起来的线性数据结构，每个节点包含数据域和指针域。

```
单链表:
  head → [data|next] → [data|next] → [data|next] → null

双链表:
  null ← [prev|data|next] ⇄ [prev|data|next] → null
```

### 3.2 核心操作

| 操作 | 时间复杂度 | 说明 |
|------|-----------|------|
| 查找 | O(n) | 需从头遍历 |
| 插入（已知位置） | O(1) | 修改指针即可 |
| 删除（已知位置） | O(1) | 修改指针即可 |
| 头插 | O(1) | 在头部插入节点 |

### 3.3 代码实现

```js
class ListNode {
  constructor(val) {
    this.val = val
    this.next = null
  }
}

class LinkedList {
  constructor() {
    this.head = null
    this.size = 0
  }

  // 头插法
  addAtHead(val) {
    const node = new ListNode(val)
    node.next = this.head
    this.head = node
    this.size++
  }

  // 尾插法
  addAtTail(val) {
    const node = new ListNode(val)
    if (!this.head) {
      this.head = node
    } else {
      let cur = this.head
      while (cur.next) cur = cur.next
      cur.next = node
    }
    this.size++
  }

  // 删除指定节点
  remove(node) {
    // 删除头节点
    if (this.head === node) {
      this.head = this.head.next
      return
    }
    let cur = this.head
    while (cur && cur.next !== node) cur = cur.next
    if (cur) cur.next = node.next
    this.size--
  }
}
```

### 3.4 应用场景

- **LRU 缓存**：哈希表 + 双向链表实现
- **React Fiber**：链表树结构实现可中断渲染
- **原型链**：JavaScript 的原型查找本质是链表遍历

---

## 4. 堆（Heap）

### 4.1 基本概念

堆是一种特殊的**完全二叉树**，通常用数组实现。分为最大堆和最小堆。

- **最大堆**：每个节点的值 ≥ 其子节点的值
- **最小堆**：每个节点的值 ≤ 其子节点的值

```
        最小堆:              数组存储:
          1                  [1, 3, 5, 8, 7]
        /   \
       3     5              父节点: Math.floor((i-1)/2)
      / \                   左子节点: 2*i + 1
     8   7                  右子节点: 2*i + 2
```

### 4.2 核心操作

| 操作 | 时间复杂度 | 说明 |
|------|-----------|------|
| 插入 | O(log n) | 上浮调整 |
| 删除堆顶 | O(log n) | 下沉调整 |
| 获取堆顶 | O(1) | 数组首位 |
| 建堆 | O(n) | 从底向上调整 |

### 4.3 代码实现（最小堆）

```js
class MinHeap {
  constructor() {
    this.heap = []
  }

  // 获取父节点索引
  parent(i) { return Math.floor((i - 1) / 2) }
  leftChild(i) { return 2 * i + 1 }
  rightChild(i) { return 2 * i + 2 }

  // 上浮
  siftUp(i) {
    while (i > 0 && this.heap[this.parent(i)] > this.heap[i]) {
      ;[this.heap[this.parent(i)], this.heap[i]] = [this.heap[i], this.heap[this.parent(i)]]
      i = this.parent(i)
    }
  }

  // 下沉
  siftDown(i) {
    const n = this.heap.length
    while (this.leftChild(i) < n) {
      let min = this.leftChild(i)
      const right = this.rightChild(i)
      if (right < n && this.heap[right] < this.heap[min]) min = right
      if (this.heap[i] <= this.heap[min]) break
      ;[this.heap[i], this.heap[min]] = [this.heap[min], this.heap[i]]
      i = min
    }
  }

  insert(val) {
    this.heap.push(val)
    this.siftUp(this.heap.length - 1)
  }

  extractMin() {
    if (!this.heap.length) return null
    const min = this.heap[0]
    const last = this.heap.pop()
    if (this.heap.length) {
      this.heap[0] = last
      this.siftDown(0)
    }
    return min
  }

  peek() {
    return this.heap[0]
  }
}
```

### 4.4 应用场景

- **优先队列**：任务调度、Top K 问题
- **堆排序**：时间复杂度 O(n log n)
- **中位数维护**：一个大顶堆 + 一个小顶堆

---

## 5. 对比总结

| 数据结构 | 存储方式 | 插入 | 删除 | 查找 | 特点 |
|---------|---------|------|------|------|------|
| 栈 | 数组/链表 | O(1) | O(1) | O(n) | LIFO，后进先出 |
| 队列 | 数组/链表 | O(1) | O(1) | O(n) | FIFO，先进先出 |
| 链表 | 节点+指针 | O(1) | O(1) | O(n) | 动态大小，内存不连续 |
| 堆 | 数组 | O(log n) | O(log n) | O(n) | 自动维护极值 |
