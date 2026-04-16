# 函数柯里化

## 什么是柯里化

柯里化（Currying）是一种将接受多个参数的函数转换为一系列接受单个参数的函数的技术。这种转换使函数可以分步骤接收参数，每次只接收一个参数。

**核心要点：**
- 柯里化利用闭包保持参数状态
- 可以通过 `curry` 函数自动实现柯里化
- 在参数复用、函数组合、API 封装等场景中非常有用
- 需要权衡性能开销和代码可读性

```javascript
// 普通函数
function add(a, b, c) {
  return a + b + c;
}

// 柯里化后的函数
function curriedAdd(a) {
  return function(b) {
    return function(c) {
      return a + b + c;
    };
  };
}

// 使用
console.log(add(1, 2, 3));           // 6
console.log(curriedAdd(1)(2)(3));    // 6
```

## 柯里化的核心原理

### 1. 分步参数传递

柯里化将多参数函数拆解为一系列单参数函数的链式调用：

```javascript
const multiply = (a, b) => a * b;

// 手动柯里化
const curriedMultiply = a => b => a * b;

const double = curriedMultiply(2);
const triple = curriedMultiply(3);

console.log(double(5));   // 10
console.log(triple(5));   // 15
```

### 2. 闭包的应用

柯里化本质上利用了闭包的特性来保存每一步的参数：

```javascript
function createGreeter(greeting) {
  return function(name) {
    return function(punctuation) {
      return `${greeting}, ${name}${punctuation}`;
    };
  };
}

const sayHello = createGreeter('Hello');
const sayHelloToJohn = sayHello('John');

console.log(sayHelloToJohn('!'));  // Hello, John!
console.log(sayHelloToJohn('.'));  // Hello, John.
```

## 实现柯里化函数

### 基础实现

```javascript
function curry(fn) {
  return function curried(...args) {
    // 如果参数数量足够，直接执行原函数
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    // 否则返回新函数，继续接收参数
    return function(...more) {
      return curried.apply(this, args.concat(more));
    };
  };
}

// 使用
function sum(a, b, c) {
  return a + b + c;
}

const curriedSum = curry(sum);
console.log(curriedSum(1)(2)(3));    // 6
console.log(curriedSum(1, 2)(3));    // 6
console.log(curriedSum(1)(2, 3));    // 6
console.log(curriedSum(1, 2, 3));    // 6
```

### 支持占位符

```javascript
const _ = Symbol('placeholder');

function curryWithPlaceholder(fn) {
  return function curried(...args) {
    const allArgs = [...args];
    
    function checkAndCall() {
      const validArgs = allArgs.filter(arg => arg !== _);
      const hasPlaceholder = allArgs.includes(_);
      
      if (!hasPlaceholder && validArgs.length >= fn.length) {
        return fn.apply(this, validArgs);
      }
      return function(...more) {
        return curried.apply(this, [...allArgs, ...more]);
      };
    }
    
    return checkAndCall();
  };
}

function add(a, b, c) {
  return a + b + c;
}

const curriedAdd = curryWithPlaceholder(add);

// 使用占位符
console.log(curriedAdd(_, 2, 3)(1));        // 6
console.log(curriedAdd(1, _, 3)(2));        // 6
console.log(curriedAdd(1, 2, _)(3));        // 6
console.log(curriedAdd(_, _, 3)(1)(2));     // 6
```

### 箭头函数版本

```javascript
const curryArrow = fn => {
  const curried = (...args) =>
    args.length >= fn.length
      ? fn(...args)
      : (...more) => curried(...args, ...more);
  
  return curried;
};
```

## 柯里化的实际应用

### 1. 函数复用

```javascript
// 创建特定功能的函数
const multiply = (a, b) => a * b;

const double = curry(multiply)(2);
const triple = curry(multiply)(3);
const quadruple = curry(multiply)(4);

console.log(double(5));      // 10
console.log(triple(5));      // 15
console.log(quadruple(5));   // 20
```

### 2. 参数配置

```javascript
function fetchData(baseUrl, endpoint, params) {
  // 模拟 API 调用
  return `${baseUrl}/${endpoint}?${new URLSearchParams(params)}`;
}

const curriedFetch = curry(fetchData);

// 为特定 API 创建专用函数
const apiV1 = curriedFetch('https://api.example.com/v1');
const getUsers = apiV1('users');
const getUserPosts = apiV1('posts');

console.log(getUsers({ page: 1, limit: 10 }));
// https://api.example.com/v1/users?page=1&limit=10

console.log(getUserPosts({ userId: 123 }));
// https://api.example.com/v1/posts?userId=123
```

### 3. 事件处理

```javascript
function createElement(tag, className, content) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content) element.textContent = content;
  return element;
}

const curriedCreate = curry(createElement);

const createButton = curriedCreate('button')('btn');
const createInput = curriedCreate('input')('form-control');
const createDiv = curriedCreate('div')('container');

// 使用
const submitBtn = createButton('提交');
const usernameInput = createInput('');
const wrapper = createDiv('');
```

### 4. 数据处理管道

```javascript
const filter = (predicate, array) => array.filter(predicate);
const map = (fn, array) => array.map(fn);
const reduce = (fn, initial, array) => array.reduce(fn, initial);

const curriedFilter = curry(filter);
const curriedMap = curry(map);
const curriedReduce = curry(reduce);

const isEven = x => x % 2 === 0;
const double = x => x * 2;
const sum = (acc, x) => acc + x;

const numbers = [1, 2, 3, 4, 5, 6];

// 数据处理链
const result = curriedReduce(sum, 0)(
  curriedMap(double)(
    curriedFilter(isEven)(numbers)
  )
);
console.log(result); // 24 (2*2 + 4*2 + 6*2 = 4 + 8 + 12 = 24)
```

### 5. 表单验证

```javascript
function validate(field, rules, value) {
  const errors = rules.reduce((acc, rule) => {
    if (!rule.validator(value)) {
      acc.push(rule.message);
    }
    return acc;
  }, []);
  
  return {
    field,
    valid: errors.length === 0,
    errors
  };
}

const curriedValidate = curry(validate);

// 创建特定字段的验证函数
const validateEmail = curriedValidate('email')([
  { validator: v => /\S+@\S+\.\S+/.test(v), message: '邮箱格式不正确' },
  { validator: v => v.length > 5, message: '邮箱长度必须大于5' }
]);

const validatePassword = curriedValidate('password')([
  { validator: v => v.length >= 8, message: '密码长度至少8位' },
  { validator: v => /[A-Z]/.test(v), message: '密码必须包含大写字母' }
]);

console.log(validateEmail('test@example.com'));
console.log(validatePassword('Weak123'));
```

### 6. 日志记录

```javascript
function log(level, context, message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}`);
}

const curriedLog = curry(log);

// 创建不同级别的日志函数
const infoLog = curriedLog('info');
const errorLog = curriedLog('error');
const debugLog = curriedLog('debug');

// 创建特定上下文的日志函数
const authInfo = infoLog('auth');
const dbError = errorLog('database');

authInfo('用户登录成功');
dbError('数据库连接失败');
```

## 高级柯里化技巧

### 1. 反柯里化（Uncurrying）

```javascript
function uncurry(fn) {
  return function(...args) {
    const context = args[0];
    return fn.apply(context, args.slice(1));
  };
}

// 将柯里化函数转换回普通函数
const uncurriedAdd = uncurry(curriedAdd);
console.log(uncurriedAdd(1, 2, 3)); // 6
```

### 2. 部分应用（Partial Application）

```javascript
function partial(fn, ...presetArgs) {
  return function(...laterArgs) {
    return fn(...presetArgs, ...laterArgs);
  };
}

function greet(greeting, punctuation, name) {
  return `${greeting}, ${name}${punctuation}`;
}

const greetHello = partial(greet, 'Hello', '!');
console.log(greetHello('World')); // Hello, World!
```

### 3. 柯里化与部分应用的结合

```javascript
function curryPartial(fn, ...presetArgs) {
  return function(...newArgs) {
    const args = [...presetArgs, ...newArgs];
    
    if (args.length >= fn.length) {
      return fn(...args);
    }
    
    return curryPartial(fn, ...args);
  };
}

function add(a, b, c) {
  return a + b + c;
}

const partialAdd = curryPartial(add, 1);
console.log(partialAdd(2)(3)); // 6
console.log(partialAdd(2, 3)); // 6
```

## 柯里化的优缺点

### 优点

1. **参数复用**：可以创建具有预设参数的专用函数
2. **代码复用**：通过组合简单的函数构建复杂的功能
3. **延迟计算**：可以在最后一步之前不执行计算
4. **更好的可读性**：函数式编程风格，代码更清晰
5. **易于测试**：每个单参数函数都很容易测试

### 缺点

1. **性能开销**：每次调用都会创建新函数
2. **内存占用**：闭包会保持对外部作用域的引用
3. **调用复杂性**：对于简单的操作可能过于复杂
4. **不熟悉**：不熟悉函数式编程的开发者可能难以理解

## 柯里化 vs 部分应用

| 特性 | 柯里化 | 部分应用 |
|------|--------|----------|
| 参数数量 | 每次接收一个参数 | 可以接收任意数量参数 |
| 函数返回 | 总是返回函数 | 当参数足够时直接返回结果 |
| 目的 | 将多参数函数转换为单参数链 | 预设部分参数 |
| 灵活性 | 更高 | 相对较低 |

```javascript
// 柯里化
const curriedAdd = curry((a, b, c) => a + b + c);
console.log(curriedAdd(1)(2)(3)); // 6

// 部分应用
const partialAdd = partial((a, b, c) => a + b + c, 1, 2);
console.log(partialAdd(3)); // 6
```

## 实际项目中的应用案例

### React 组件中的柯里化

```javascript
// 事件处理函数
const handleClick = (userId) => (event) => {
  console.log(`User ${userId} clicked`, event);
};

function UserList({ users }) {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id} onClick={handleClick(user.id)}>
          {user.name}
        </li>
      ))}
    </ul>
  );
}
```

### Redux 中的柯里化

```javascript
// Redux thunk action creator
const fetchUser = (userId) => (dispatch) => {
  dispatch({ type: 'FETCH_USER_REQUEST' });
  
  fetch(`/api/users/${userId}`)
    .then(response => response.json())
    .then(data => dispatch({ type: 'FETCH_USER_SUCCESS', payload: data }))
    .catch(error => dispatch({ type: 'FETCH_USER_FAILURE', error }));
};

// 使用
dispatch(fetchUser(123));
```

### API 请求封装

```javascript
const createApi = (baseUrl) => (endpoint) => (method) => (data) => {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(data && { body: JSON.stringify(data) })
  };
  
  return fetch(`${baseUrl}${endpoint}`, options)
    .then(res => res.json());
};

const api = createApi('https://api.example.com');
const userApi = api('/users');
const getUser = userApi('GET');
const createUser = userApi('POST');

// 使用
getUser()
  .then(users => console.log(users));

createUser({ name: 'John', email: 'john@example.com' })
  .then(user => console.log(user));
```
