# Hooks 的执行时机

在 React 开发中，理解不同 Hook 的执行时机对于编写高性能、无 bug 的代码至关重要。本文将深入剖析 `useEffect`、`useLayoutEffect` 和 `useInsertionEffect` 的执行时机，以及在真实项目中各自的"不可替代场景"。

## React 的渲染流程

在深入各个 Hook 之前，我们需要先了解 React 的渲染流程：

```
1. 触发渲染（state/props 变化）
   ↓
2. 计算（调用组件函数，返回新的 JSX）
   ↓
3. 提交（将变更应用到 DOM）
   ↓
   - 布局（计算几何信息）
   - 绘制（像素显示）
```

不同的 Side Effect Hook 会在上述流程的不同阶段执行：

```
渲染阶段
  ↓
[useInsertionEffect] 在 DOM 变更前执行
  ↓
[useLayoutEffect] 在 DOM 变更后、浏览器绘制前执行
  ↓
浏览器布局 + 绘制
  ↓
[useEffect] 在浏览器绘制后异步执行
```

## useEffect

### 执行时机

`useEffect` 在**浏览器完成绘制后异步执行**。这意味着它不会阻塞浏览器的绘制过程。

```jsx
function EffectDemo() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('useEffect 执行');
  }, [count]);

  return <div onClick={() => setCount(c => c + 1)}>Count: {count}</div>;
}
```

执行流程：
1. 用户点击
2. 重新渲染组件（计算新的 JSX）
3. React 将变更提交到 DOM
4. **浏览器完成绘制**（用户看到更新）
5. `useEffect` 异步执行

### 特点

- **异步执行**：不阻塞渲染和绘制
- **可中断**：在执行过程中如果组件被卸载或状态再次变化，Effect 可能会被跳过
- **多次执行**：在 Strict Mode 下，开发环境会执行两次以检测问题

### 不可替代场景

#### 1. 数据获取

```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  return <div>{user?.name}</div>;
}
```

**为什么不可替代**：数据获取是异步操作，不需要阻塞渲染，`useEffect` 的异步执行机制完美匹配这种场景。

#### 2. 订阅和事件监听

```jsx
function ScrollListener() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return <div>Scroll position: {scrollY}</div>;
}
```

**为什么不可替代**：事件监听器的注册和清理不需要阻塞渲染，可以在绘制完成后进行。

#### 3. 日志上报和分析

```jsx
function AnalyticsTracker({ pageName }) {
  useEffect(() => {
    analytics.track('page_view', {
      page: pageName,
      timestamp: Date.now()
    });
  }, [pageName]);

  return <div>{pageName}</div>;
}
```

**为什么不可替代**：日志上报不影响页面渲染，可以在用户看到更新后再执行。

#### 4. 定时器

```jsx
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <div>Time: {seconds}s</div>;
}
```

**为什么不可替代**：定时器的设置和清理不需要立即执行，可以在渲染后进行。

#### 5. DOM 操作（非布局相关的）

```jsx
function FocusOnMount({ autoFocus }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  return <input ref={inputRef} placeholder="Focus me" />;
}
```

**为什么不可替代**：设置焦点不会影响布局，可以在绘制后进行。

## useLayoutEffect

### 执行时机

`useLayoutEffect` 在**DOM 变更后、浏览器绘制前同步执行**。这类似于 `componentDidMount` 和 `componentDidUpdate`。

```jsx
function LayoutEffectDemo() {
  const [width, setWidth] = useState(0);
  const divRef = useRef(null);

  useLayoutEffect(() => {
    console.log('useLayoutEffect 执行，但还未绘制');
    setWidth(divRef.current.offsetWidth);
  });

  return (
    <div>
      <div ref={divRef}>Content</div>
      <p>Width: {width}</p>
    </div>
  );
}
```

执行流程：
1. 状态变化触发渲染
2. React 计算新的 JSX
3. React 将变更提交到 DOM
4. **`useLayoutEffect` 同步执行**（阻塞绘制）
5. 浏览器布局和绘制
6. 用户看到更新

### 特点

- **同步执行**：阻塞浏览器绘制
- **可读取最新 DOM**：此时 DOM 已更新但还未绘制
- **优先执行**：优先于所有 `useEffect`

### 不可替代场景

#### 1. 测量 DOM 元素尺寸

```jsx
function MeasureBox() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const boxRef = useRef(null);

  useLayoutEffect(() => {
    const rect = boxRef.current.getBoundingClientRect();
    setDimensions({
      width: rect.width,
      height: rect.height
    });
  }, []);

  return (
    <div>
      <div ref={boxRef} style={{ width: '200px', height: '100px', background: 'lightblue' }}>
        Box
      </div>
      <p>Size: {dimensions.width} x {dimensions.height}</p>
    </div>
  );
}
```

**为什么不可替代**：需要在布局完成后立即测量，避免用户看到闪烁。如果用 `useEffect`，用户会先看到尺寸为 0，然后才更新，造成视觉闪烁。

#### 2. 同步滚动位置

```jsx
function ScrollSync({ items }) {
  const containerRef = useRef(null);
  const savedScrollTop = useRef(0);

  useLayoutEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = savedScrollTop.current;
    }
  }, [items]);

  const handleScroll = () => {
    savedScrollTop.current = containerRef.current.scrollTop;
  };

  return (
    <div ref={containerRef} onScroll={handleScroll} style={{ height: '300px', overflow: 'auto' }}>
      {items.map(item => <div key={item.id}>{item.name}</div>)}
    </div>
  );
}
```

**为什么不可替代**：在内容更新后立即恢复滚动位置，避免用户看到滚动位置跳动。如果用 `useEffect`，用户会先看到默认滚动位置，然后才跳到正确位置。

#### 3. 阻止页面闪烁

```jsx
function PreventFlash({ theme }) {
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    setVisible(true);
  }, []);

  return (
    <div className={visible ? theme : ''}>
      {visible ? 'Content' : null}
    </div>
  );
}
```

**为什么不可替代**：确保主题切换时不会出现内容闪烁。如果用 `useEffect`，用户会先看到默认主题，然后才切换到正确主题。

#### 4. 动态调整布局

```jsx
function AutoResizeTextarea() {
  const textareaRef = useRef(null);
  const [value, setValue] = useState('');

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      style={{ resize: 'none', overflow: 'hidden' }}
    />
  );
}
```

**为什么不可替代**：需要在内容变化后立即调整高度，避免高度跳动。如果用 `useEffect`，用户会看到高度的突然变化。

#### 5. 动画开始前的状态准备

```jsx
function FadeIn({ show, children }) {
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    setVisible(show);
  }, [show]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s'
      }}
    >
      {children}
    </div>
  );
}
```

**为什么不可替代**：确保动画开始前元素已经处于正确的初始状态，避免动画跳变。如果用 `useEffect`，元素可能先显示，然后才开始淡入动画。

## useInsertionEffect

### 执行时机

`useInsertionEffect` 在**DOM 变更前同步执行**。这是 React 18 引入的新 Hook，专门为 CSS-in-JS 库设计。

```jsx
function InsertionEffectDemo() {
  useInsertionEffect(() => {
    console.log('useInsertionEffect 执行，DOM 还未更新');
  });

  return <div>Hello</div>;
}
```

执行流程：
1. 状态变化触发渲染
2. React 计算新的 JSX
3. **`useInsertionEffect` 同步执行**
4. React 将变更提交到 DOM
5. `useLayoutEffect` 执行
6. 浏览器布局和绘制

### 特点

- **最早执行**：在所有 DOM 变更之前
- **同步执行**：不阻塞渲染但阻塞 DOM 更新
- **不支持 ref**：无法访问 DOM 元素
- **专用于 CSS**：主要用于样式注入

### 限制

- 不能访问 DOM（ref.current 为 null）
- 不能调度更新（setState 等）
- 主要用于 CSS-in-JS 库

### 不可替代场景

#### 1. CSS-in-JS 样式注入

```jsx
function StyledButton({ variant }) {
  useInsertionEffect(() => {
    // 在 DOM 更新前注入样式规则
    const style = document.createElement('style');
    style.textContent = `
      .button-${variant} {
        background: ${variant === 'primary' ? 'blue' : 'gray'};
        color: white;
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [variant]);

  return <button className={`button-${variant}`}>Click me</button>;
}
```

**为什么不可替代**：需要在 DOM 更新前确保样式规则已经存在，避免样式闪烁。如果用 `useLayoutEffect` 或 `useEffect`，元素会先以默认样式显示，然后才应用正确样式。

#### 2. 第三方 CSS 库集成

```jsx
function ThirdPartyLibWrapper({ theme }) {
  useInsertionEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `/css/${theme}.css`;
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [theme]);

  return <div>Third party styled content</div>;
}
```

**为什么不可替代**：在组件渲染前确保 CSS 文件已加载，避免无样式内容的显示（FOUC - Flash of Unstyled Content）。

#### 3. 动态样式规则管理

```jsx
function DynamicStyles({ activeTab }) {
  useInsertionEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .tab-${activeTab} {
        border-bottom: 2px solid blue;
        color: blue;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [activeTab]);

  return (
    <div>
      {['tab1', 'tab2', 'tab3'].map(tab => (
        <div key={tab} className={`tab-${tab} ${tab === activeTab ? 'active' : ''}`}>
          {tab}
        </div>
      ))}
    </div>
  );
}
```

**为什么不可替代**：动态样式需要在 DOM 更新前就绪，确保标签切换时样式立即生效。

## 对比总结

### 执行顺序

```jsx
function Comparison() {
  console.log('1. 组件渲染');

  useInsertionEffect(() => {
    console.log('2. useInsertionEffect');
  });

  useLayoutEffect(() => {
    console.log('3. useLayoutEffect');
  });

  useEffect(() => {
    console.log('4. useEffect');
  });

  return <div>Content</div>;
}

// 输出顺序：
// 1. 组件渲染
// 2. useInsertionEffect
// 3. useLayoutEffect
// (浏览器绘制)
// 4. useEffect
```

### 适用场景对比

| Hook | 执行时机 | 阻塞绘制 | 访问 DOM | 主要用途 |
|------|---------|---------|---------|---------|
| `useInsertionEffect` | DOM 变更前 | 否 | ❌ | CSS-in-JS、样式注入 |
| `useLayoutEffect` | DOM 变更后，绘制前 | 是 | ✅ | DOM 测量、同步滚动 |
| `useEffect` | 绘制后 | 否 | ✅ | 数据获取、订阅、日志 |

### 性能影响

```jsx
function PerformanceComparison() {
  // ✅ 好：不阻塞渲染
  useEffect(() => {
    // 执行耗时操作
    heavyCalculation();
  }, []);

  // ⚠️ 谨慎：会阻塞绘制
  useLayoutEffect(() => {
    // 执行耗时操作会导致页面卡顿
    heavyCalculation();
  }, []);

  // ❌ 错误：完全阻塞渲染
  useInsertionEffect(() => {
    // 不应该在这里执行耗时操作
    heavyCalculation();
  }, []);

  return <div>Content</div>;
}
```

## 最佳实践

### 1. 默认使用 useEffect

```jsx
function DefaultApproach() {
  // ✅ 默认选择：99% 的情况下用 useEffect
  useEffect(() => {
    console.log('Side effect');
  }, []);

  return <div>Content</div>;
}
```

### 2. 需要同步 DOM 操作时使用 useLayoutEffect

```jsx
function NeedSyncDOM() {
  const ref = useRef(null);

  // ✅ 需要立即测量或修改 DOM 时使用
  useLayoutEffect(() => {
    const height = ref.current.offsetHeight;
    console.log('Height:', height);
  }, []);

  return <div ref={ref}>Content</div>;
}
```

### 3. 避免 useEffect 中的 setTimeout 被错误使用

```jsx
// ❌ 错误：用 setTimeout 试图避免闪烁
function WrongUseOfTimeout() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setVisible(true);
    }, 0);
  }, []);

  return <div style={{ opacity: visible ? 1 : 0 }}>Content</div>;
}

// ✅ 正确：使用 useLayoutEffect
function CorrectUseOfLayoutEffect() {
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    setVisible(true);
  }, []);

  return <div style={{ opacity: visible ? 1 : 0 }}>Content</div>;
}
```

### 4. 服务器渲染兼容性

```jsx
import { useEffect, useLayoutEffect } from 'react';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function SSRCompatible() {
  // ✅ 服务器渲染时使用 useEffect，客户端使用 useLayoutEffect
  useIsomorphicLayoutEffect(() => {
    console.log('Layout effect');
  }, []);

  return <div>Content</div>;
}
```

## 真实项目案例

### 案例 1：虚拟滚动列表

```jsx
function VirtualList({ items, itemHeight = 50, containerHeight = 400 }) {
  const [scrollTop, setScrollTop] = useState(0);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + 2,
      items.length
    );
    setVisibleRange({ start, end });
  }, [scrollTop, items.length, itemHeight, containerHeight]);

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  const visibleItems = items.slice(visibleRange.start, visibleRange.end);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ height: containerHeight, overflow: 'auto' }}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              top: (visibleRange.start + index) * itemHeight,
              height: itemHeight,
            }}
          >
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

**关键点**：使用 `useLayoutEffect` 同步计算可见项，避免渲染闪烁。

### 案例 2：图表组件

```jsx
function Chart({ data }) {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const { width, height } = canvas.getBoundingClientRect();
      setDimensions({ width, height });

      // 立即绘制图表，避免闪烁
      drawChart(canvas, data, width, height);
    }
  }, [data]);

  useEffect(() => {
    // 异步加载额外的数据或配置
    loadChartConfig();
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
}
```

**关键点**：使用 `useLayoutEffect` 立即测量和绘制，使用 `useEffect` 异步加载配置。

### 案例 3：拖拽组件

```jsx
function Draggable({ children }) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const elementRef = useRef(null);

  useLayoutEffect(() => {
    if (isDragging && elementRef.current) {
      // 同步更新位置，避免拖拽延迟
      elementRef.current.style.transform = `translate(${position.x}px, ${position.y}px)`;
    }
  }, [isDragging, position]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  return (
    <div
      ref={elementRef}
      onMouseDown={handleMouseDown}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {children}
    </div>
  );
}
```

**关键点**：使用 `useLayoutEffect` 同步更新拖拽位置，确保流畅体验；使用 `useEffect` 添加/移除全局事件监听器。

## 总结

理解这三个 Hook 的执行时机和适用场景对于 React 开发至关重要：

- **useEffect**：默认选择，用于大多数副作用（数据获取、订阅、日志等）
- **useLayoutEffect**：用于需要同步操作 DOM 的场景（测量、同步滚动、避免闪烁）
- **useInsertionEffect**：专门用于 CSS-in-JS 和样式注入的场景

遵循"默认 useEffect，需要时才用 useLayoutEffect，样式相关用 useInsertionEffect"的原则，可以让你的 React 应用既高效又稳定。
