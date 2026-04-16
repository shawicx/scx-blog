# React 面试题

## 基础

### 1. React 的核心概念

React 是一个用于构建用户界面的 JavaScript 库，核心概念包括：

- **组件化**: UI 拆分为独立、可复用的组件
- **虚拟 DOM**: 轻量级的 JavaScript 对象表示 DOM
- **单向数据流**: 数据从父组件流向子组件
- **声明式编程**: 描述 UI 应该是什么样子，而不是如何更新

### 2. JSX 是什么？

JSX 是 JavaScript 的语法扩展，允许在 JS 中写类似 HTML 的代码。

```jsx
const element = <h1>Hello, world!</h1>;

// 编译后
const element = React.createElement('h1', null, 'Hello, world!');
```

### 3. 组件的类型

**函数组件** (推荐):
```jsx
function Welcome({ name }) {
  return <h1>Hello, {name}</h1>;
}

// 或箭头函数
const Welcome = ({ name }) => <h1>Hello, {name}</h1>;
```

**类组件**:
```jsx
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

## State 和 Props

### 4. State 和 Props 的区别？

| 特性 | State | Props |
|------|-------|-------|
| 来源 | 组件内部 | 父组件传递 |
| 可变性 | 可变（使用 setState） | 不可变 |
| 作用 | 组件内部状态 | 组件通信 |

```jsx
function Parent() {
  const [count, setCount] = useState(0); // State
  return <Child count={count} />;        // Props
}

function Child({ count }) {              // Props
  return <div>Count: {count}</div>;
}
```

### 5. setState 是同步还是异步？

在 React 18+ 中，`setState` 在 React 事件处理中是批处理的（异步），但在原生事件、setTimeout、Promise 中是同步的。

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);  // 批处理
    setCount(count + 1);  // 结果: count + 1
  };

  const handleClickAsync = () => {
    setTimeout(() => {
      setCount(count + 1);  // 同步
      setCount(count + 1);  // 结果: count + 2
    }, 0);
  };
}
```

### 6. 如何正确更新数组/对象？

使用不可变操作：

```jsx
// 数组
const [items, setItems] = useState([1, 2, 3]);

// 添加
setItems([...items, 4]);

// 删除
setItems(items.filter(item => item !== 2));

// 更新
setItems(items.map(item =>
  item === 2 ? 20 : item
));

// 对象
const [user, setUser] = useState({ name: 'Alice', age: 30 });

// 更新
setUser({ ...user, age: 31 });
```

## Hooks

### 7. 常用的 Hooks

```jsx
function App() {
  // useState - 状态管理
  const [count, setCount] = useState(0);

  // useEffect - 副作用
  useEffect(() => {
    document.title = `Count: ${count}`;
    return () => {
      // 清理函数
    };
  }, [count]); // 依赖数组

  // useContext - 跨组件状态
  const theme = useContext(ThemeContext);

  // useReducer - 复杂状态
  const [state, dispatch] = useReducer(reducer, initialState);

  // useMemo - 性能优化
  const expensiveValue = useMemo(() => {
    return computeExpensiveValue(a, b);
  }, [a, b]);

  // useCallback - 性能优化
  const handleClick = useCallback(() => {
    doSomething(a, b);
  }, [a, b]);

  // useRef - DOM 引用
  const inputRef = useRef(null);

  return <div>{/* JSX */}</div>;
}
```

### 8. useEffect 的使用

```jsx
// 每次渲染后执行
useEffect(() => {
  console.log('Render');
});

// 仅在挂载时执行（空依赖数组）
useEffect(() => {
  console.log('Mount');
  return () => console.log('Unmount');
}, []);

// 依赖变化时执行
useEffect(() => {
  fetchData(id);
}, [id]);
```

### 9. 自定义 Hooks

```jsx
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

// 使用
function App() {
  const { width, height } = useWindowSize();
  return <div>{width} x {height}</div>;
}
```

## 组件通信

### 10. 父子组件通信

```jsx
// 父传子
function Parent() {
  const data = 'Hello';
  return <Child message={data} />;
}

function Child({ message }) {
  return <div>{message}</div>;
}

// 子传父
function Parent() {
  const [count, setCount] = useState(0);
  return <Child onUpdate={setCount} />;
}

function Child({ onUpdate }) {
  return <button onClick={() => onUpdate(1)}>Update</button>;
}
```

### 11. 跨组件通信（Context）

```jsx
// 创建 Context
const ThemeContext = createContext('light');

// 提供 Context
function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Child />
    </ThemeContext.Provider>
  );
}

// 消费 Context
function Child() {
  const theme = useContext(ThemeContext);
  return <div>Theme: {theme}</div>;
}
```

### 12. Redux vs Context API

| 特性 | Redux | Context API |
|------|-------|-------------|
| 复杂度 | 高 | 低 |
| 适用场景 | 大型应用 | 中小型应用 |
| 工具生态 | 完善 | 基础 |
| 性能 | 需优化 | 默认有优化 |
| DevTools | 强大 | 基础 |

## 性能优化

### 13. React.memo

```jsx
const MemoizedComponent = React.memo(function MyComponent(props) {
  return <div>{props.value}</div>;
});

// 自定义比较
const MyComponent = React.memo(
  function MyComponent(props) {
    return <div>{props.value}</div>;
  },
  function areEqual(prevProps, nextProps) {
    return prevProps.value === nextProps.value;
  }
);
```

### 14. useMemo 和 useCallback

```jsx
function Parent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  // 避免重复计算
  const expensiveValue = useMemo(() => {
    return computeExpensiveValue(count);
  }, [count]);

  // 避免子组件不必要重渲染
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  return <Child onClick={handleClick} value={expensiveValue} />;
}
```

### 15. 代码分割和懒加载

```jsx
// React.lazy + Suspense
const LazyComponent = React.lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}

// 路由懒加载
const Home = React.lazy(() => import('./Home'));
const About = React.lazy(() => import('./About'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Suspense>
  );
}
```

## 虚拟 DOM

### 16. 虚拟 DOM 的优势

- **性能**: 减少真实 DOM 操作
- **批量更新**: React 批量处理状态更新
- **跨浏览器**: 抽象浏览器差异
- **可预测**: 声明式编程更易理解

### 17. Diff 算法

React 使用 Diff 算法比较新旧虚拟 DOM：

1. 同层比较
2. 使用 key 优化列表渲染
3. 组件类型不同则完全替换

```jsx
// 正确: 使用稳定的 key
items.map(item => <li key={item.id}>{item.name}</li>);

// 错误: 使用 index 作为 key
items.map((item, index) => <li key={index}>{item.name}</li>);
```

## 其他

### 18. 受控组件 vs 非受控组件

**受控组件** (推荐):
```jsx
function Form() {
  const [value, setValue] = useState('');

  return (
    <input
      value={value}
      onChange={e => setValue(e.target.value)}
    />
  );
}
```

**非受控组件**:
```jsx
function Form() {
  const inputRef = useRef();

  const handleSubmit = () => {
    console.log(inputRef.current.value);
  };

  return (
    <>
      <input ref={inputRef} />
      <button onClick={handleSubmit}>Submit</button>
    </>
  );
}
```

### 19. 错误边界

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>;
    }
    return this.props.children;
  }
}

// 使用
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

### 20. React 18 新特性

- **并发模式**: 改进渲染性能
- **Suspense**: 更好的加载状态
- **自动批处理**: 所有状态更新自动批处理
- **Transitions**: 区分紧急和非紧急更新
- **useId**: 生成唯一 ID
- **useDeferredValue**: 延迟更新
- **useTransition**: 非紧急更新标记
