## React diff 机制

### 1. 为什么需要 diff 算法

在 React 中，当组件的 state 或 props 发生变化时，React 会重新渲染组件，生成新的虚拟 DOM 树。然后 React 会将新树与旧树进行比较，找出需要更新的部分，这个过程称为 diffing。

diff 算法的核心问题是如何高效地找出两棵树之间的最小差异。传统的 tree diff 算法时间复杂度是 O(n³)，这在实际应用中是不可接受的。

### 2. React diff 算法的三个假设

为了将 diff 算法的时间复杂度降低到 O(n)，React 做了三个假设：

1. **不同类型的元素会产生不同的树**
   - 如果元素类型改变（如 div 变成 p），React 会销毁旧树并创建新树
   - 如果组件类型改变，React 会卸载旧组件并挂载新组件

2. **开发者可以通过 key 来暗示哪些子元素可以在不同渲染中保持稳定**
   - key 可以帮助 React 识别哪些元素发生了改变、添加或删除
   - key 应该稳定、可预测且唯一

3. **只会对同一层级的节点进行比较**
   - React 不会跨层级比较节点
   - 这是 O(n) 复杂度的关键

### 3. Diff 算法的实现

#### 3.1 Tree Diff

React 只对同层级的节点进行比较。如果节点在不同层级，React 会认为这是完全不同的结构。

```jsx
// 旧树
<div>
  <p>Paragraph 1</p>
  <p>Paragraph 2</p>
</div>

// 新树 - 移动节点层级
<div>
  <div>
    <p>Paragraph 1</p>
  </div>
  <p>Paragraph 2</p>
</div>

// React 的处理：销毁所有旧节点，创建新节点
```

这种策略虽然可能导致一些不必要的 DOM 操作，但保证了 O(n) 的时间复杂度。

#### 3.2 Component Diff

对于同一层级的组件，React 会比较它们的类型：

- 如果类型相同，React 会保留该组件，更新其 props
- 如果类型不同，React 会卸载旧组件，挂载新组件

```jsx
// 场景 1: 类型相同，更新 props
<MyComponent value="old" /> → <MyComponent value="new" />
// React: 调用 componentWillReceiveProps，更新 props

// 场景 2: 类型不同，替换组件
<MyComponent /> → <OtherComponent />
// React: 卸载 MyComponent，挂载 OtherComponent
```

#### 3.3 Element Diff

对于同层级的子节点，React 采用不同的策略：

##### 情况 1: 子节点类型相同

React 会比较它们的属性和子节点：

```jsx
// 旧
<ul>
  <li>first</li>
  <li>second</li>
</ul>

// 新
<ul>
  <li>first</li>
  <li>second updated</li>
</ul>

// React: 只更新第二个 li 的内容
```

##### 情况 2: 子节点类型不同

React 会销毁旧节点，创建新节点：

```jsx
// 旧
<ul>
  <li>Duke</li>
  <li>Villanova</li>
</ul>

// 新
<ul>
  <li>Connecticut</li>
  <li>Duke</li>
</ul>

// React: 将第一个 li 替换为新的 li，保留第二个 li
```

##### 情况 3: 子节点顺序变化

这是最复杂的情况，React 会根据 key 来识别节点：

```jsx
// 没有 key - 可能出现问题
<ul>
  <li>Duke</li>
  <li>Villanova</li>
</ul>

// 变成
<ul>
  <li>Villanova</li>
  <li>Duke</li>
</ul>

// React 的处理（没有 key）：
// 1. 第一个 li: Duke → Villanova，更新文本
// 2. 第二个 li: Villanova → Duke，更新文本
// 结果：两次文本更新

// 使用 key - 高效处理
<ul>
  <li key="2015">Duke</li>
  <li key="2016">Villanova</li>
</ul>

// 变成
<ul>
  <li key="2016">Villanova</li>
  <li key="2015">Duke</li>
</ul>

// React 的处理（有 key）：
// 1. 识别 key="2015" 的节点移动到第二个位置
// 2. 识别 key="2016" 的节点移动到第一个位置
// 结果：两次 DOM 移动，无内容更新
```

### 4. Key 的作用

Key 是 React diff 算法中的重要概念，它帮助 React 识别哪些元素发生了改变。

#### 4.1 正确使用 Key

```jsx
// ✅ 好：使用稳定的、唯一的 key
{items.map(item => (
  <li key={item.id}>{item.name}</li>
))}

// ❌ 不好：使用 index 作为 key（列表会重新排序时）
{items.map((item, index) => (
  <li key={index}>{item.name}</li>
))}

// ❌ 不好：使用随机数或临时值
{items.map(item => (
  <li key={Math.random()}>{item.name}</li>
))}
```

#### 4.2 Key 的最佳实践

1. **使用数据中的唯一标识符**（如 ID）
2. **在兄弟元素之间保持唯一**
3. **不要使用数组索引作为 key**（除非列表是静态的）
4. **Key 必须稳定**，不能在重新渲染时改变

### 5. React 18 中的改进

React 18 引入了并发模式和自动批处理，虽然 diff 算法的基本原理没有改变，但在调度和优先级处理上有了一些改进：

- **并发渲染**: React 可以中断渲染过程，优先处理高优先级更新
- **自动批处理**: 多个状态更新会被批处理为一次重新渲染
- **Suspense**: 改进了组件加载时的 diff 策略

### 6. 性能优化建议

基于 diff 算法的特性，以下是一些性能优化建议：

1. **使用 PureComponent 或 React.memo** 避免不必要的重新渲染
2. **合理使用 key**，特别是在动态列表中
3. **避免在渲染方法中创建新对象或函数**（使用 useCallback 和 useMemo）
4. **保持组件层级稳定**，避免频繁改变组件结构
5. **使用 shouldComponentUpdate 控制更新范围**
