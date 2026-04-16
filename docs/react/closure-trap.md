# 闭包陷阱

闭包陷阱是 React 开发中常见的问题，尤其是在使用 Hooks 时。理解闭包陷阱的原理和解决方案，对于编写高质量的 React 代码至关重要。

## 什么是闭包陷阱

闭包陷阱指的是由于 JavaScript 闭包的特性，导致事件处理器或异步函数捕获了旧的 state 或 props 值，而不是最新值的现象。

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setTimeout(() => {
      console.log(count); // 可能是旧值
    }, 3000);
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={handleClick}>Log Count (delayed)</button>
    </div>
  );
}
```

在上面的例子中，如果你先点击几次 Increment，然后点击 Log Count，3 秒后打印的 `count` 值可能是点击时的旧值，而不是最新的值。

## 为什么会出现闭包陷阱

### React 的渲染机制

每次组件重新渲染时，React 都会：
1. 调用组件函数，获取新的 JSX
2. 创建新的函数组件实例
3. 所有局部变量（包括 state、props、函数等）都会被重新创建

这意味着每次渲染都是一次全新的执行，组件内部的函数在每次渲染时都会重新创建。

```jsx
function Component() {
  const [count, setCount] = useState(0);
  
  // 每次渲染，handleClick 都是一个新的函数
  // 捕获的是当前渲染时的 count 值
  const handleClick = () => {
    console.log(count);
  };
  
  return <button onClick={handleClick}>Click</button>;
}
```

### JavaScript 闭包的工作原理

闭包会捕获创建时的变量引用。当函数被创建时，它会保存对外部作用域变量的引用，而不是变量的当前值。

```jsx
function createClosure() {
  let value = 0;
  
  return {
    getValue: () => value,
    increment: () => {
      value++;
      return value;
    }
  };
}

const closure = createClosure();
console.log(closure.getValue()); // 0
console.log(closure.increment()); // 1
console.log(closure.getValue()); // 1
```

## 常见的闭包陷阱场景

### 1. 定时器中的旧值

```jsx
function TimerExample() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      console.log(count); // 永远是 0
      setCount(count + 1); // 永远不会更新
    }, 1000);

    return () => clearInterval(timer);
  }, []); // 依赖数组为空，只在挂载时运行一次

  return <p>Count: {count}</p>;
}
```

**问题**：`setInterval` 的回调函数捕获了初始渲染时的 `count` 值（0），所以每次更新时使用的都是 0。

### 2. 异步操作中的旧值

```jsx
function AsyncExample() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    
    const response = await fetch('/api/data');
    const result = await response.json();
    
    if (loading) {
      // loading 可能是旧值
      console.log('Still loading...');
    }
    
    setData(result);
    setLoading(false);
  };

  return (
    <div>
      <button onClick={fetchData}>Fetch Data</button>
      {loading && <p>Loading...</p>}
      {data && <pre>{JSON.stringify(data)}</pre>}
    </div>
  );
}
```

### 3. 事件处理器中的旧值

```jsx
function FormExample() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    // 可能捕获旧的值
    console.log('Submitting:', { username, email });
  };

  return (
    <form>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="button" onClick={handleSubmit}>
        Submit
      </button>
    </form>
  );
}
```

## 解决方案

### 1. 使用函数式更新

使用函数式更新可以确保使用最新的 state 值：

```jsx
function FunctionalUpdateExample() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      // ✅ 使用函数式更新，总是获取最新的 count
      setCount(prevCount => prevCount + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return <p>Count: {count}</p>;
}
```

函数式更新的优势：
- 不需要依赖外部变量
- React 会确保传入函数的参数是最新的 state 值
- 适合批量更新或基于当前值计算新值的情况

### 2. 使用 ref 保存可变值

ref 的值在组件生命周期中保持不变，适合保存需要在闭包中访问的最新值：

```jsx
function useRefExample() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);

  // 使用 ref 保存最新的 count 值
  useEffect(() => {
    countRef.current = count;
  }, [count]);

  const handleClick = () => {
    setTimeout(() => {
      // ✅ 通过 ref 访问最新值
      console.log(countRef.current);
    }, 3000);
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={handleClick}>Log Count</button>
    </div>
  );
}
```

### 3. 正确设置依赖项

在 `useEffect`、`useMemo`、`useCallback` 等 Hook 中正确设置依赖项：

```jsx
function DependencyExample() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      console.log('Count:', count);
    }, 1000);

    return () => clearInterval(timer);
  }, [count]); // ✅ 添加 count 依赖

  const handleIncrement = useCallback(() => {
    setCount(c => c + 1);
  }, []); // 不依赖 count，使用函数式更新

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleIncrement}>Increment</button>
    </div>
  );
}
```

### 4. 使用 useReducer 管理复杂状态

对于复杂的 state 更新逻辑，`useReducer` 可以更好地管理状态：

```jsx
function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'setValue':
      return { count: action.payload };
    default:
      return state;
  }
}

function ReducerExample() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      // ✅ dispatch 函数始终指向同一个引用
      dispatch({ type: 'increment' });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'decrement' })}>
        Decrement
      </button>
    </div>
  );
}
```

### 5. 提取自定义 Hook

将复杂的逻辑提取到自定义 Hook 中：

```jsx
function useInterval(callback, delay) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

function CustomHookExample() {
  const [count, setCount] = useState(0);

  useInterval(() => {
    // ✅ 总是获取最新的 count
    setCount(c => c + 1);
  }, 1000);

  return <p>Count: {count}</p>;
}
```

### 6. 使用 useEffectEvent (React 19+)

React 19 引入了 `useEffectEvent` Hook，专门用于处理事件处理器中的闭包问题：

```jsx
function EffectEventExample() {
  const [count, setCount] = useState(0);

  const logCount = useEffectEvent(() => {
    console.log('Current count:', count);
  });

  useEffect(() => {
    const timer = setInterval(() => {
      logCount(); // ✅ 总是使用最新的 count
      setCount(c => c + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return <p>Count: {count}</p>;
}
```

## 实战案例

### 案例 1：倒计时组件

```jsx
function CountDown() {
  const [seconds, setSeconds] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const secondsRef = useRef(seconds);

  useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);

  useEffect(() => {
    let interval;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(secondsRef.current - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setSeconds(60);
    setIsActive(false);
  };

  return (
    <div>
      <p>{seconds} seconds</p>
      <button onClick={toggle}>
        {isActive ? 'Pause' : 'Start'}
      </button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

### 案例 2：表单验证

```jsx
function FormWithValidation() {
  const [values, setValues] = useState({
    username: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!values.username) {
      newErrors.username = 'Username is required';
    }
    if (!values.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      newErrors.email = 'Email is invalid';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    // 使用 ref 避免闭包陷阱
    const formData = values;
    
    setTimeout(() => {
      console.log('Submitting:', formData);
      setIsSubmitting(false);
    }, 2000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="username"
        value={values.username}
        onChange={handleChange}
        placeholder="Username"
      />
      {errors.username && <span>{errors.username}</span>}
      
      <input
        name="email"
        value={values.email}
        onChange={handleChange}
        placeholder="Email"
      />
      {errors.email && <span>{errors.email}</span>}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

### 案例 3：聊天应用

```jsx
function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');

    // 模拟自动回复
    setTimeout(() => {
      const reply = {
        id: Date.now(),
        text: `收到你的消息: "${input}"`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, reply]);
    }, 1000);
  };

  const simulateIncomingMessage = () => {
    const randomMessage = [
      '你好！',
      '在吗？',
      '最近怎么样？',
      '收到'
    ][Math.floor(Math.random() * 4)];

    setMessages(prev => [...prev, {
      id: Date.now(),
      text: randomMessage,
      timestamp: new Date()
    }]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        simulateIncomingMessage();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div style={{ height: '300px', overflow: 'auto' }}>
        {messages.map(msg => (
          <div key={msg.id}>
            <p>{msg.text}</p>
            <small>{msg.timestamp.toLocaleTimeString()}</small>
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
```

## 最佳实践

### 1. 了解何时使用 ref vs state

- **state**：触发重新渲染，用于 UI 相关的数据
- **ref**：不触发重新渲染，用于存储可变值或 DOM 引用

```jsx
function StateVsRef() {
  const [count, setCount] = useState(0);
  const renderCountRef = useRef(0);

  renderCountRef.current += 1; // 不会触发重新渲染

  return (
    <div>
      <p>Count: {count}</p>
      <p>Render count: {renderCountRef.current}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}
```

### 2. 使用 ESLint 插件检测问题

安装 `react-hooks` ESLint 插件：

```json
{
  "extends": [
    "plugin:react-hooks/recommended"
  ]
}
```

### 3. 编写可预测的代码

避免在闭包中依赖可能过期的值：

```jsx
// ❌ 不好
function BadExample() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(result => {
      if (data) {
        // data 可能是旧值
        console.log(data);
      }
      setData(result);
    });
  }, []);
}

// ✅ 好
function GoodExample() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(result => {
      setData(result);
      // 使用新值
      console.log(result);
    });
  }, []);
}
```

### 4. 使用 TypeScript 增强类型安全

```tsx
interface State {
  count: number;
  name: string;
}

function TypedComponent() {
  const [state, setState] = useState<State>({
    count: 0,
    name: ''
  });

  const updateState = (key: keyof State, value: State[keyof State]) => {
    setState(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return <div>{state.count}</div>;
}
```
