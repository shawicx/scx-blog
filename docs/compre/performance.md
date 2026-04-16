# React 性能优化

## 1. 概述

React 的性能优化，本质上就是一件事：**减少不必要的计算、渲染和网络开销**。

React 性能优化的核心原则：

- **避免不必要渲染**：使用 memo、useMemo、useCallback
- **合理组织状态**：state 靠近使用位置
- **虚拟化长列表**：只渲染可见区域
- **代码分割**：按需加载
- **优化网络请求**：缓存、去重、增量加载

---

## 2. 减少不必要的组件渲染

### 2.1 React.memo

函数组件默认只要父组件 render 就会重新 render。

`React.memo` 相当于给组件加一层 **props 浅比较**：

```jsx
const ListItem = React.memo(({ item }) => {
  console.log("render item");
  return <div>{item.name}</div>;
});
```

如果 `item` 没变，就不会重新渲染。

**典型场景**：

- 列表组件
- 纯展示组件
- props 很少变化

**但别乱用**。如果 props 每次都是新对象（比如 `{}` 或 `[]`），那比较也没意义。

**自定义比较函数**：

```jsx
const ListItem = React.memo(({ item }, prevProps) => {
  return prevProps.item.id === item.id;
});
```

### 2.2 useMemo

缓存**计算结果**：

```jsx
const filteredList = useMemo(() => {
  return list.filter(i => i.visible);
}, [list]);

const expensiveValue = useMemo(() => {
  return data.reduce((acc, item) => {
    return acc + item.value;
  }, 0);
}, [data]);
```

**适合**：

- 大数据计算
- expensive function

**不适合**：

- 简单计算（反而更慢）

记住一句话：
**useMemo 是 CPU 换内存。**

### 2.3 useCallback

缓存函数引用：

```jsx
const handleClick = useCallback(() => {
  console.log("click");
}, []);
```

为什么重要？

因为函数在 React 中 **每次 render 都是新对象**。

如果你有：

```jsx
<ListItem onClick={() => {}} />
```

那 `React.memo` 也救不了，因为 `onClick` 每次都是新的。

**使用场景**：

```jsx
function Parent() {
  const [count, setCount] = useState(0);
  
  const handleClick = useCallback(() => {
    console.log("click");
  }, []);
  
  return (
    <div>
      <Child onClick={handleClick} />
      <button onClick={() => setCount(c => c + 1)}>
        {count}
      </button>
    </div>
  );
}
```

---

## 3. 避免组件层级渲染扩散

很多项目慢的真正原因是：

**state 放错位置**

举个经典错误：

```jsx
function App() {
  const [value, setValue] = useState("");

  return (
    <>
      <Input value={value} onChange={setValue} />
      <HugeTable />
    </>
  );
}
```

每输入一个字：

**HugeTable 也会重新 render。**

正确做法：

```jsx
function SearchBox() {
  const [value, setValue] = useState("");
  return <Input value={value} onChange={setValue} />;
}

function App() {
  return (
    <>
      <SearchBox />
      <HugeTable />
    </>
  );
}
```

把 state **下沉到最小组件范围**。

React 性能优化第一原则：

> **State 越靠近使用它的组件越好**

---

## 4. 列表渲染优化

如果你的列表：

- 1000 条
- 10000 条

那渲染会非常慢。

解决方案是 **虚拟列表（Virtual List）**。

常用库：

- react-window
- react-virtualized
- TanStack Virtual

原理很简单：

屏幕只显示 **20 条**
但数据是 **10000 条**

只渲染可见部分。

效果：

```
DOM: 20 nodes
data: 10000 rows
```

这类优化经常可以 **提升 10 倍性能**。

**react-window 示例**：

```jsx
import { FixedSizeList } from 'react-window';

function List({ items }) {
  return (
    <FixedSizeList
      height={400}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          {items[index].name}
        </div>
      )}
    </FixedSizeList>
  );
}
```

**TanStack Virtual 示例**：

```jsx
import { useVirtualizer } from '@tanstack/react-virtual';

function List({ items }) {
  const parentRef = useRef(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: 400, overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: virtualRow.start,
              height: virtualRow.size,
            }}
          >
            {items[virtualRow.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 5. 代码分割

React 可以按页面加载 JS。

用 **懒加载**：

```jsx
const Dashboard = React.lazy(() => import("./Dashboard"));
const Settings = React.lazy(() => import("./Settings"));
const Profile = React.lazy(() => import("./Profile"));

<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/settings" element={<Settings />} />
    <Route path="/profile" element={<Profile />} />
  </Routes>
</Suspense>
```

这叫 **Code Splitting**。

通常配合：

- 路由拆包
- 组件拆包

如果你在用：

- Vite
- Webpack

都会自动支持。

**组件级别懒加载**：

```jsx
function HeavyComponent() {
  const [shouldLoad, setShouldLoad] = useState(false);
  
  if (!shouldLoad) {
    return <button onClick={() => setShouldLoad(true)}>Load</button>;
  }
  
  const Heavy = React.lazy(() => import('./Heavy'));
  
  return (
    <Suspense fallback={<Loading />}>
      <Heavy />
    </Suspense>
  );
}
```

---

## 6. Context 优化

很多人滥用 Context：

```jsx
<AuthContext.Provider value={{ user }}>
```

每次 user 变化：

**所有 useContext 的组件都会重新渲染。**

**优化方法：**

1. **拆分 Context**：

```
AuthContext      # 用户认证
ThemeContext     # 主题
ConfigContext    # 配置
```

2. **使用 useMemo 优化 Provider**：

```jsx
<AuthContext.Provider value={useMemo(() => ({ user }), [user])}>
```

3. **使用选择器模式**：

```jsx
function useAuth() {
  const { user } = useContext(AuthContext);
  return user;
}

function UserName() {
  const user = useAuth();  // 只订阅 user
  return <span>{user.name}</span>;
}
```

4. **使用状态管理库**：

- zustand
- Jotai
- Recoil

这种 **按需订阅 state**。

**zustand 示例**：

```jsx
import { create } from 'zustand';

const useStore = create((set) => ({
  user: null,
  theme: 'light',
  setUser: (user) => set({ user }),
  setTheme: (theme) => set({ theme }),
}));

function UserName() {
  const user = useStore((state) => state.user);
  return <span>{user.name}</span>;
}
```

---

## 7. 组件拆分

一个 1000 行的 React 组件：

```
render
  ├── logic
  ├── effects
  ├── handlers
  └── JSX
```

每次 render 都执行一遍。

拆成：

```
Container
  ├── Header
  ├── Toolbar
  ├── Table
  └── Footer
```

不仅性能更好，也更可维护。

**拆分原则**：

1. 逻辑复杂的组件拆分
2. 多个 useEffect 拆分成独立 useHook
3. 大型 JSX 结构拆分子组件
4. 重复使用的部分封装成公共组件

**示例**：

```jsx
// 拆分前
function UserProfile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  
  // 100+ 行逻辑...
  
  return (
    <div>
      {/* 200+ 行 JSX... */}
    </div>
  );
}

// 拆分后
function UserProfile({ userId }) {
  return (
    <div>
      <UserHeader userId={userId} />
      <UserPosts userId={userId} />
      <UserFollowers userId={userId} />
    </div>
  );
}
```

---

## 8. React DevTools 性能分析

真正做优化前要先 **测量**。

工具：

- React DevTools

打开：

```
Profiler
```

它会显示：

- 哪个组件 render
- render 时间
- render 次数

很多时候你会看到：

```
Button render 200 次
```

然后你会露出工程师的经典表情：

> "谁写的这代码？……哦，是我。"

**Profiler 使用技巧**：

1. 记录一次交互（如点击按钮）
2. 查看火焰图
3. 找到红色的 "batched" 事件
4. 识别不必要的渲染

---

## 9. 生产环境优化

确保：

```
NODE_ENV=production
```

因为 React dev mode 会多做很多检查。

构建工具：

- Vite
- Webpack

会自动：

- tree shaking
- minify
- dead code removal

**Vite 配置**：

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
});
```

---

## 10. 网络层优化

前端慢有时不是 React，是网络。

**优化手段**：

- 请求缓存
- 请求合并
- 分页加载
- debounce

常用库：

- TanStack Query
- SWR

它们会自动：

- cache
- dedupe request
- background refresh

**TanStack Query 示例**：

```jsx
import { useQuery } from '@tanstack/react-query';

function UserList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(res => res.json()),
    staleTime: 5000,      // 5 秒内不重新请求
    cacheTime: 300000,    // 缓存 5 分钟
    refetchOnWindowFocus: false,  // 窗口聚焦时不重新请求
  });

  if (isLoading) return <Loading />;
  if (error) return <Error />;
  
  return <List users={data} />;
}
```

**SWR 示例**：

```jsx
import useSWR from 'swr';

function UserList() {
  const { data, error, isLoading } = useSWR('/api/users', fetcher);

  if (isLoading) return <Loading />;
  if (error) return <Error />;
  
  return <List users={data} />;
}
```

---

## 11. 常见性能陷阱

### 11.1 内联对象

```jsx
// ❌ 每次都是新对象
<Component style={{ margin: 10 }} />

// ✅ 使用常量
const styles = { margin: 10 };
<Component style={styles} />
```

### 11.2 内联函数

```jsx
// ❌ 每次 render 都是新函数
<button onClick={() => handleClick(id)} />

// ✅ 使用 useCallback
const handleClick = useCallback((id) => {
  console.log(id);
}, []);
<button onClick={() => handleClick(id)} />
```

### 11.3 数组作为默认 state

```jsx
// ❌ 每次 render 都是新数组
const [items, setItems] = useState([]);

// ✅ 使用 useMemo
const [items, setItems] = useState(() => []);
```

### 11.4 Effect 依赖

```jsx
// ❌ 频繁触发
useEffect(() => {
  fetchData();
}, [data]);

// ✅ 精确依赖
useEffect(() => {
  fetchData();
}, [data.id]);
```

---

## 12. 性能检查清单

### 代码层面

- [ ] 使用 React.memo 包装纯展示组件
- [ ] 使用 useMemo 缓存 expensive 计算
- [ ] 使用 useCallback 稳定回调函数
- [ ] 将 state 下沉到最小作用范围
- [ ] 拆分过大的组件
- [ ] 避免内联对象和函数

### 列表渲染

- [ ] 使用虚拟列表（1000+ 条数据）
- [ ] 使用 key 避免不必要的重排
- [ ] 实现分页加载

### 代码分割

- [ ] 路由级别懒加载
- [ ] 大组件懒加载
- [ ] 第三方库按需加载

### 网络优化

- [ ] 使用 TanStack Query / SWR
- [ ] 实现请求缓存
- [ ] 实现请求去重

### 构建优化

- [ ] 生产环境构建
- [ ] 开启 tree shaking
- [ ] 代码压缩

---
