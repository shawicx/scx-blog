# React 的事件代理

React 的事件代理机制是 React 的核心特性之一，它通过事件委托的方式优化了事件处理的性能。本文将深入解析 React 事件代理的工作原理、实现机制以及它带来的优势。

## 什么是事件代理

事件代理（Event Delegation）是一种利用事件冒泡机制的编程模式。与其给每个元素单独绑定事件处理器，而是将事件处理器绑定到它们的父元素上。当事件触发时，事件会冒泡到父元素，父元素的事件处理器可以根据 `event.target` 判断是哪个子元素触发的事件。

## React 的事件系统

### 合成事件

React 并没有直接使用浏览器的原生事件，而是创建了一个跨浏览器的**合成事件系统**（SyntheticEvent）。合成事件是对原生事件的封装，提供了统一的 API，抹平了不同浏览器之间的差异。

```jsx
function handleClick(e) {
  // e 是合成事件对象，不是原生事件
  console.log(e.type); // 'click'
  e.preventDefault(); // 统一的方法
}
```

### 事件代理的实现原理

React 采用事件代理的核心思想是：**所有事件都委托到 document（React 17 之前）或 React 根节点（React 17+）上**。

#### React 17 之前的实现

```jsx
// React 16 及之前版本
document.addEventListener('click', function(e) {
  // 根据事件目标和 React 的虚拟 DOM 树
  // 找到对应的 React 组件并调用其事件处理器
});
```

#### React 17+ 的改进

React 17 对事件系统进行了重大改进，事件不再委托到 document，而是委托到 React 应用的根节点容器上。

```jsx
// React 17+
const rootElement = document.getElementById('root');
rootElement.addEventListener('click', function(e) {
  // 事件处理逻辑
});
```

这个改进使得 React 可以与同一页面上的其他 React 应用或非 React 代码更好地共存。

## 事件代理的工作流程

当你在 React 组件中绑定事件时：

```jsx
function Button() {
  const handleClick = (e) => {
    console.log('Button clicked!');
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

实际发生的事情是：

1. **React 在虚拟 DOM 中记录**：React 在虚拟 DOM 树中记录 `button` 元素绑定了 `onClick` 事件
2. **绑定到根节点**：React 在根节点（或 document）上绑定一个统一的事件监听器
3. **事件冒泡**：当用户点击 `button` 时，原生事件从 button 向上冒泡到根节点
4. **分发事件**：根节点的事件处理器接收到事件后，根据 `event.target` 和虚拟 DOM 树找到对应的组件
5. **触发回调**：执行绑定的 `handleClick` 函数，并传入合成事件对象

## 事件代理的优势

### 1. 性能优化

**减少事件监听器数量**：如果不使用事件代理，每个需要交互的元素都需要单独绑定事件监听器。一个页面可能有成百上千个可点击元素，这意味着成百上千个事件监听器。使用事件代理后，无论页面有多少元素，只需要一个事件监听器。

```jsx
// 不使用事件代理（传统做法）
document.querySelectorAll('.button').forEach(btn => {
  btn.addEventListener('click', handleClick);
});

// 使用事件代理
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('button')) {
    handleClick(e);
  }
});
```

### 2. 内存节省

更少的事件监听器意味着更少的内存占用。对于大型应用，这个优势非常明显。

### 3. 动态元素支持

动态添加到 DOM 中的元素无需单独绑定事件监听器，因为事件委托在父元素上，新子元素会自动继承事件处理能力。

```jsx
function List() {
  const [items, setItems] = useState([1, 2, 3]);

  const addItem = () => {
    setItems([...items, items.length + 1]);
  };

  return (
    <div>
      <button onClick={addItem}>Add Item</button>
      <ul>
        {items.map(item => (
          <li key={item} onClick={() => console.log(item)}>
            Item {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
// 新添加的 li 元素自动具有点击事件处理能力
```

### 4. 统一的 API

合成事件提供了跨浏览器的统一接口，开发者无需处理不同浏览器之间的差异。

## 合成事件 vs 原生事件

### 合成事件的特性

```jsx
function EventDemo() {
  const handleClick = (e) => {
    console.log('Synthetic Event:', e);
    console.log('Native Event:', e.nativeEvent);
    console.log('Current Target:', e.currentTarget);
    console.log('Target:', e.target);
  };

  return <button onClick={handleClick}>Click</button>;
}
```

### 合成事件的生命周期

合成事件在事件处理函数执行完后会被**回收**（pooled），这是为了性能优化。如果需要异步使用事件对象，需要先调用 `e.persist()` 或保存需要的属性。

```jsx
function AsyncEventDemo() {
  const handleClick = (e) => {
    // ✅ 正确：保存需要的属性
    const eventType = e.type;
    const target = e.target;

    setTimeout(() => {
      console.log(eventType, target);
    }, 1000);

    // ✅ 正确：调用 persist() 阻止事件回收
    // e.persist();
    // setTimeout(() => {
    //   console.log(e.type);
    // }, 1000);

    // ❌ 错误：事件对象已被回收，可能为 null
    // setTimeout(() => {
    //   console.log(e.type); // 可能报错
    // }, 1000);
  };

  return <button onClick={handleClick}>Click</button>;
}
```

## 事件冒泡和捕获

React 支持事件冒泡和捕获两种阶段：

```jsx
function BubblingDemo() {
  return (
    <div onClickCapture={() => console.log('Parent Capture')}>
      <div onClick={() => console.log('Child Bubble')}>
        Click me
      </div>
    </div>
  );
}

// 执行顺序：
// 1. Parent Capture
// 2. Child Bubble
```

- **捕获阶段**：使用 `on[EventName]Capture`（如 `onClickCapture`）
- **冒泡阶段**：使用 `on[EventName]`（如 `onClick`）

## 阻止事件传播

React 提供了与原生事件相同的方法来阻止事件传播：

```jsx
function StopPropagationDemo() {
  const handleParentClick = () => {
    console.log('Parent clicked');
  };

  const handleChildClick = (e) => {
    e.stopPropagation(); // 阻止事件冒泡
    console.log('Child clicked');
  };

  return (
    <div onClick={handleParentClick}>
      <button onClick={handleChildClick}>Click me</button>
    </div>
  );
}
// 只会输出 "Child clicked"
```

`e.stopPropagation()` 只阻止合成事件的传播，**不会阻止原生事件的传播**。如果需要同时阻止两者，可以访问 `e.nativeEvent.stopImmediatePropagation()`。

## React 事件系统中的特殊情况

### 1. focus 和 blur 事件

`focus` 和 `blur` 事件**不支持冒泡**，但 React 为它们提供了 `onFocus` 和 `onBlur`，实际上是通过 `focusin` 和 `focusout` 实现的，这些事件支持冒泡。

```jsx
function FocusDemo() {
  return (
    <div onFocus={() => console.log('Focused')}>
      <input placeholder="Focus me" />
    </div>
  );
}
```

### 2. scroll 事件

`scroll` 事件只能在捕获阶段监听：

```jsx
function ScrollDemo() {
  return (
    <div
      style={{ height: '100px', overflow: 'auto' }}
      onScrollCapture={() => console.log('Scrolled')}
    >
      <div style={{ height: '500px' }}>Scroll content</div>
    </div>
  );
}
```

### 3. onChange 事件

React 的 `onChange` 事件与原生不同，它在输入时就会触发（类似于 `input` 事件），而不是只在失去焦点时触发。

```jsx
function InputDemo() {
  const [value, setValue] = useState('');

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Type something"
    />
  );
}
// 每次输入都会触发 onChange
```

## 性能优化建议

### 1. 避免在 render 中创建函数

```jsx
// ❌ 不好：每次渲染都创建新函数
function BadExample() {
  return <button onClick={() => console.log('clicked')}>Click</button>;
}

// ✅ 好：使用 useCallback 缓存函数
function GoodExample() {
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  return <button onClick={handleClick}>Click</button>;
}
```

### 2. 使用事件委托处理列表

```jsx
function ListWithDelegation() {
  const handleListClick = (e) => {
    const target = e.target;
    if (target.tagName === 'LI') {
      console.log('Clicked item:', target.dataset.id);
    }
  };

  return (
    <ul onClick={handleListClick}>
      <li data-id="1">Item 1</li>
      <li data-id="2">Item 2</li>
      <li data-id="3">Item 3</li>
    </ul>
  );
}
```

### 3. 使用 passive 事件监听器

对于滚动和触摸事件，可以使用 passive 事件监听器来提高滚动性能：

```jsx
// React 17+ 支持在事件处理函数上添加 passive 属性
function PassiveScroll() {
  const handleScroll = () => {
    console.log('Scrolling...');
  };

  return (
    <div
      style={{ height: '100px', overflow: 'auto' }}
      onScroll={handleScroll}
      onScrollPassive={handleScroll}
    >
      <div style={{ height: '500px' }}>Content</div>
    </div>
  );
}
```
