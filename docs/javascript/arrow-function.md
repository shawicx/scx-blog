# 箭头函数

## 箭头函数简介

箭头函数是 ES6 引入的一种新的函数定义语法，它提供了更简洁的函数写法，并且具有与普通函数不同的 `this` 绑定规则。

## 基本语法

### 语法对比

```javascript
// 传统函数
function add(a, b) {
  return a + b;
}

// 箭头函数
const add = (a, b) => {
  return a + b;
};

// 简化写法（单行返回）
const add = (a, b) => a + b;
```

### 不同形式的箭头函数

```javascript
// 1. 无参数
const fn1 = () => {
  console.log('无参数');
};

// 2. 一个参数（可以省略括号）
const fn2 = x => x * 2;
const fn3 = (x) => x * 2;

// 3. 多个参数
const fn4 = (a, b) => a + b;

// 4. 返回对象字面量（需要用括号包裹）
const fn5 = () => ({ name: '张三', age: 25 });

// 5. 多行语句
const fn6 = (a, b) => {
  const sum = a + b;
  return sum * 2;
};

// 6. 返回数组
const fn7 = n => Array.from({ length: n }, (_, i) => i + 1);
```

## 箭头函数的特点

### 1. 没有 this 绑定

```javascript
// 传统函数 - this 动态绑定
const obj = {
  name: '张三',
  
  traditional: function() {
    console.log(this.name); // '张三'
    
    setTimeout(function() {
      console.log(this.name); // undefined（浏览器中可能为 window.name）
    }, 1000);
  },
  
  arrow: function() {
    console.log(this.name); // '张三'
    
    setTimeout(() => {
      console.log(this.name); // '张三' - 继承外层的 this
    }, 1000);
  }
};

obj.traditional();
obj.arrow();
```

### 2. 没有 arguments 对象

```javascript
// 传统函数 - 有 arguments
function traditional() {
  console.log(arguments);
}
traditional(1, 2, 3); // [1, 2, 3]

// 箭头函数 - 没有 arguments
const arrow = () => {
  console.log(arguments); // ReferenceError: arguments is not defined
};

// 使用剩余参数替代
const arrowRest = (...args) => {
  console.log(args);
};
arrowRest(1, 2, 3); // [1, 2, 3]
```

### 3. 不能用作构造函数

```javascript
// 传统函数 - 可以用作构造函数
function Person(name) {
  this.name = name;
}

const person1 = new Person('张三');
console.log(person1.name); // '张三'

// 箭头函数 - 不能用作构造函数
const PersonArrow = (name) => {
  this.name = name;
};

const person2 = new PersonArrow('李四'); // TypeError: PersonArrow is not a constructor
```

### 4. 没有 prototype 属性

```javascript
function traditional() {}
console.log(traditional.prototype); // {}

const arrow = () => {};
console.log(arrow.prototype); // undefined
```

### 5. 不能使用 yield 命令

```javascript
// 箭头函数不能用作 Generator 函数
const generator = function*() {
  yield 1;
  yield 2;
};

// 错误
const generatorArrow = *() => {
  yield 1;
  yield 2;
}; // SyntaxError
```

## 箭头函数与普通函数的区别

### this 绑定

```javascript
// 普通函数 - this 动态绑定
const obj = {
  name: '张三',
  
  normal: function() {
    console.log('normal:', this.name);
  },
  
  arrow: () => {
    console.log('arrow:', this.name);
  }
};

obj.normal(); // 'normal: 张三'
obj.arrow(); // 'arrow: undefined'（箭头函数继承外层的 this）

// 方法作为回调
const callback = obj.normal;
callback(); // 'normal: undefined'（this 丢失）

const callbackArrow = obj.arrow;
callbackArrow(); // 'arrow: undefined'（始终为外层的 this）
```

### 函数提升

```javascript
// 普通函数 - 可以提升
console.log(traditional()); // 'traditional'

function traditional() {
  return 'traditional';
}

// 箭头函数 - 不能提升
// console.log(arrow()); // ReferenceError: arrow is not defined

const arrow = () => 'arrow';
```

### 参数默认值处理

```javascript
// 普通函数
function traditional(a = 1, b = 2) {
  return a + b;
}

// 箭头函数
const arrow = (a = 1, b = 2) => a + b;
```

## 使用场景

### 1. 简短的回调函数

```javascript
// 数组方法
const numbers = [1, 2, 3, 4, 5];

// map
const doubled = numbers.map(n => n * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

// filter
const even = numbers.filter(n => n % 2 === 0);
console.log(even); // [2, 4]

// reduce
const sum = numbers.reduce((acc, n) => acc + n, 0);
console.log(sum); // 15

// sort
const sorted = numbers.sort((a, b) => a - b);
console.log(sorted); // [1, 2, 3, 4, 5]

// find
const found = numbers.find(n => n > 3);
console.log(found); // 4

// some
const hasEven = numbers.some(n => n % 2 === 0);
console.log(hasEven); // true

// every
const allPositive = numbers.every(n => n > 0);
console.log(allPositive); // true
```

### 2. 保持 this 指向

```javascript
class Counter {
  constructor() {
    this.count = 0;
  }
  
  // 方法 1：使用箭头函数作为属性
  increment1 = () => {
    this.count++;
    console.log(this.count);
  };
  
  // 方法 2：传统方法（需要在构造函数中绑定）
  increment2() {
    this.count++;
    console.log(this.count);
  }
  
  // 方法 3：传统方法 + bind
  increment3 = function() {
    this.count++;
    console.log(this.count);
  }.bind(this);
}

const counter = new Counter();
const increment = counter.increment1;
increment(); // 1（this 正确）

const increment2 = counter.increment2;
increment2(); // undefined（this 丢失）
```

### 3. Promise 和 async/await

```javascript
// Promise 链
fetch('/api/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));

// async/await
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
```

### 4. 函数式编程

```javascript
// 纯函数
const add = (a, b) => a + b;
const multiply = (a, b) => a * b;
const square = n => n * 2;

// 函数组合
const addThenMultiply = (a, b, c) => multiply(add(a, b), c);
console.log(addThenMultiply(1, 2, 3)); // 9

// 柯里化
const curriedAdd = a => b => a + b;
const add5 = curriedAdd(5);
console.log(add5(3)); // 8

// 高阶函数
const map = fn => arr => arr.map(fn);
const double = n => n * 2;
const mapDouble = map(double);

console.log(mapDouble([1, 2, 3])); // [2, 4, 6]
```

### 5. 事件处理

```javascript
class Button {
  constructor(text) {
    this.text = text;
    this.element = document.createElement('button');
    this.element.textContent = text;
    
    // 使用箭头函数保持 this
    this.handleClick = () => {
      console.log(`点击了: ${this.text}`);
    };
    
    this.element.addEventListener('click', this.handleClick);
  }
  
  render() {
    return this.element;
  }
}

// 或者使用属性初始化器
class Button2 {
  constructor(text) {
    this.text = text;
    this.element = document.createElement('button');
    this.element.textContent = text;
    this.element.addEventListener('click', this.handleClick);
  }
  
  handleClick = () => {
    console.log(`点击了: ${this.text}`);
  };
  
  render() {
    return this.element;
  }
}
```

### 6. 数组操作

```javascript
const users = [
  { id: 1, name: '张三', age: 25 },
  { id: 2, name: '李四', age: 30 },
  { id: 3, name: '王五', age: 28 },
];

// 提取属性
const names = users.map(user => user.name);
console.log(names); // ['张三', '李四', '王五']

// 过滤数据
const adults = users.filter(user => user.age >= 30);
console.log(adults); // [{ id: 2, name: '李四', age: 30 }]

// 转换数据
const formattedUsers = users.map(user => ({
  ...user,
  isAdult: user.age >= 30,
  displayName: `${user.name} (${user.age})`
}));
console.log(formattedUsers);

// 排序
const sortedByAge = [...users].sort((a, b) => a.age - b.age);
console.log(sortedByAge);

// 查找
const user = users.find(u => u.id === 2);
console.log(user); // { id: 2, name: '李四', age: 30 }

// 分组
const groupedByAge = users.reduce((acc, user) => {
  const ageGroup = user.age >= 30 ? 'adult' : 'young';
  if (!acc[ageGroup]) {
    acc[ageGroup] = [];
  }
  acc[ageGroup].push(user);
  return acc;
}, {});
console.log(groupedByAge);
```

## 实际应用案例

### 案例 1：数组工具函数

```javascript
// 数组去重
const unique = arr => [...new Set(arr)];
console.log(unique([1, 2, 2, 3, 3, 4])); // [1, 2, 3, 4]

// 数组求和
const sum = arr => arr.reduce((acc, n) => acc + n, 0);
console.log(sum([1, 2, 3, 4, 5])); // 15

// 数组平均值
const average = arr => sum(arr) / arr.length;
console.log(average([1, 2, 3, 4, 5])); // 3

// 数组最大值
const max = arr => Math.max(...arr);
console.log(max([1, 5, 3, 2, 4])); // 5

// 数组最小值
const min = arr => Math.min(...arr);
console.log(min([1, 5, 3, 2, 4])); // 1

// 数组扁平化
const flatten = arr => arr.reduce((acc, val) => 
  Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), []
);
console.log(flatten([1, [2, [3, [4, 5]]]])); // [1, 2, 3, 4, 5]

// 数组分块
const chunk = (arr, size) => 
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
console.log(chunk([1, 2, 3, 4, 5, 6], 2)); // [[1, 2], [3, 4], [5, 6]]
```

### 案例 2：对象工具函数

```javascript
// 深拷贝
const deepClone = obj => JSON.parse(JSON.stringify(obj));
const original = { a: 1, b: { c: 2 } };
const cloned = deepClone(original);
console.log(cloned); // { a: 1, b: { c: 2 } }

// 对象合并
const merge = (...objs) => Object.assign({}, ...objs);
console.log(merge({ a: 1 }, { b: 2 }, { c: 3 })); // { a: 1, b: 2, c: 3 }

// 对象键值转换
const invert = obj => 
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]));
console.log(invert({ a: 1, b: 2, c: 3 })); // { 1: 'a', 2: 'b', 3: 'c' }

// 获取嵌套属性
const get = (obj, path, defaultValue = undefined) =>
  path.split('.').reduce((acc, key) => acc?.[key], obj) ?? defaultValue;
const data = { user: { profile: { name: '张三' } } };
console.log(get(data, 'user.profile.name')); // '张三'
console.log(get(data, 'user.profile.age', '未知')); // '未知'

// 设置嵌套属性
const set = (obj, path, value) => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((acc, key) => acc[key] = acc[key] || {}, obj);
  target[lastKey] = value;
  return obj;
};
console.log(set({}, 'user.profile.name', '李四')); // { user: { profile: { name: '李四' } } }
```

### 案例 3：字符串工具函数

```javascript
// 首字母大写
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);
console.log(capitalize('hello')); // 'Hello'

// 驼峰命名转换
const toCamelCase = str => 
  str.replace(/[-_\s](.)/g, (_, c) => c.toUpperCase());
console.log(toCamelCase('hello-world')); // 'helloWorld'
console.log(toCamelCase('hello_world')); // 'helloWorld'

// 短横线命名转换
const toKebabCase = str => 
  str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
console.log(toKebabCase('helloWorld')); // 'hello-world'

// 下划线命名转换
const toSnakeCase = str => 
  str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
console.log(toSnakeCase('helloWorld')); // 'hello_world'

// 字符串截断
const truncate = (str, length, suffix = '...') => 
  str.length > length ? str.slice(0, length) + suffix : str;
console.log(truncate('Hello, world!', 5)); // 'Hello...'

// 移除 HTML 标签
const stripHtml = html => html.replace(/<[^>]*>/g, '');
console.log(stripHtml('<p>Hello <strong>world</strong></p>')); // 'Hello world'
```

### 案例 4：函数工具函数

```javascript
// 函数节流
const throttle = (fn, delay) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      fn.apply(this, args);
      lastCall = now;
    }
  };
};

const throttledScroll = throttle(() => {
  console.log('滚动事件');
}, 1000);

window.addEventListener('scroll', throttledScroll);

// 函数防抖
const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
};

const debouncedSearch = debounce(query => {
  console.log(`搜索: ${query}`);
}, 300);

searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});

// 函数记忆化
const memoize = fn => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
};

const fibonacci = memoize(n => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

console.log(fibonacci(40)); // 102334155

// 函数组合
const compose = (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x);

const toUpper = str => str.toUpperCase();
const toReverse = str => str.split('').reverse().join('');
const toExclaim = str => str + '!';

const pipeline = compose(toExclaim, toReverse, toUpper);
console.log(pipeline('hello')); // '!OLLEH'

// 函数管道
const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x);

const pipeline2 = pipe(toUpper, toReverse, toExclaim);
console.log(pipeline2('hello')); // '!OLLEH'
```

### 案例 5：React 组件

```jsx
// 函数组件
const Button = ({ text, onClick }) => {
  return (
    <button onClick={onClick}>
      {text}
    </button>
  );
};

// 使用 Hooks
const Counter = () => {
  const [count, setCount] = useState(0);
  
  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  
  return (
    <div>
      <button onClick={decrement}>-</button>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </div>
  );
};

// 使用 useCallback
const ParentComponent = () => {
  const [count, setCount] = useState(0);
  
  const handleClick = useCallback(() => {
    console.log('点击了', count);
  }, [count]);
  
  return <ChildComponent onClick={handleClick} />;
};

// 自定义 Hook
const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });
  
  const setStoredValue = newValue => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };
  
  return [value, setStoredValue];
};
```

## 限制和注意事项

### 1. 不能用作构造函数

```javascript
// 错误
const Person = (name) => {
  this.name = name;
};

const person = new Person('张三'); // TypeError
```

### 2. 没有 prototype

```javascript
// 错误
const Person = (name) => {
  this.name = name;
};

Person.prototype.sayHello = function() {
  console.log(`你好, 我是 ${this.name}`);
}; // TypeError
```

### 3. 不能用于定义方法

```javascript
const obj = {
  // 不推荐 - 作为方法时 this 继承外层
  arrow: () => {
    console.log(this); // 不是 obj
  },
  
  // 推荐 - 使用传统方法
  traditional() {
    console.log(this); // obj
  }
};
```

### 4. 不适合需要动态 this 的场景

```javascript
const obj = {
  name: '张三',
  
  // 不适合
  arrow: () => {
    console.log(this.name); // undefined
  },
  
  // 适合
  traditional() {
    console.log(this.name); // '张三'
  }
};
```

### 5. 不能使用 yield

```javascript
// 错误
const generator = *() => {
  yield 1;
  yield 2;
}; // SyntaxError

// 正确
function* generator() {
  yield 1;
  yield 2;
}
```

## 最佳实践

### 1. 简洁的回调

```javascript
// 好的做法
const doubled = numbers.map(n => n * 2);
const even = numbers.filter(n => n % 2 === 0);

// 避免过于复杂
const complex = numbers.map(n => {
  // 多行逻辑，建议使用传统函数
  if (n > 10) {
    return n * 2;
  } else if (n > 5) {
    return n * 1.5;
  } else {
    return n;
  }
});
```

### 2. 保持 this

```javascript
class Component {
  constructor() {
    this.name = '组件';
    
    // 好的做法 - 使用箭头函数保持 this
    this.handleClick = () => {
      console.log(this.name);
    };
    
    // 或使用属性初始化器
    this.handleClick = () => {
      console.log(this.name);
    };
  }
}
```

### 3. 数组方法

```javascript
// 好的做法
const names = users.map(user => user.name);
const adults = users.filter(user => user.age >= 18);
const sorted = users.sort((a, b) => a.age - b.age);
```

### 4. 避免 this 混淆

```javascript
const obj = {
  name: '张三',
  
  // 避免 - 作为方法使用箭头函数
  badMethod: () => {
    console.log(this.name); // undefined
  },
  
  // 推荐 - 使用传统方法
  goodMethod() {
    console.log(this.name); // '张三'
  },
  
  // 推荐 - 需要回调时使用箭头函数
  callbackMethod() {
    setTimeout(() => {
      console.log(this.name); // '张三'
    }, 1000);
  }
};
```

### 5. 函数式编程

```javascript
// 好的做法 - 链式调用
const result = numbers
  .filter(n => n > 0)
  .map(n => n * 2)
  .reduce((acc, n) => acc + n, 0);

// 好的做法 - 函数组合
const pipeline = compose(toUpper, toReverse, toExclaim);
console.log(pipeline('hello'));
```

## 性能考虑

### 1. 创建新函数

```javascript
// 每次循环都创建新的函数
for (let i = 0; i < 1000; i++) {
  buttons[i].addEventListener('click', () => {
    console.log(i);
  });
}

// 更好的做法 - 使用事件委托
container.addEventListener('click', (e) => {
  if (e.target.classList.contains('button')) {
    console.log(e.target.dataset.index);
  }
});
```

### 2. 使用 useCallback（React）

```jsx
// 避免不必要的重新渲染
const ParentComponent = () => {
  const [count, setCount] = useState(0);
  
  const handleClick = useCallback(() => {
    setCount(prev => prev + 1);
  }, []); // 空依赖数组
  
  return <ChildComponent onClick={handleClick} />;
};
```

## 常见问题

### Q: 箭头函数和普通函数的主要区别是什么？

A: 主要区别是 `this` 绑定方式不同。箭头函数没有自己的 `this`，继承外层作用域的 `this`。

### Q: 什么时候使用箭头函数，什么时候使用普通函数？

A: 回调函数、需要保持 `this` 时使用箭头函数；定义方法、需要动态 `this` 时使用普通函数。

### Q: 箭头函数可以继承吗？

A: 不能。箭头函数没有 `prototype`，不能用作构造函数。

### Q: 箭头函数的性能如何？

A: 箭头函数和普通函数的性能差异很小，可以忽略。但要注意不要过度创建新函数。

### Q: 如何在类中使用箭头函数？

A: 可以使用属性初始化器语法，在构造函数中绑定 `this`，或使用箭头函数定义属性。

### Q: 箭头函数可以使用默认参数吗？

A: 可以。箭头函数和普通函数一样支持默认参数。

## 总结

### 箭头函数的核心特点

1. **更简洁的语法**：提供了更简洁的函数定义方式
2. **没有 this**：继承外层作用域的 `this`
3. **没有 arguments**：使用剩余参数替代
4. **不能用作构造函数**：没有 `prototype` 属性
5. **不能使用 yield**：不能用作 Generator 函数

### 使用场景

1. **回调函数**：数组方法、Promise、事件处理
2. **保持 this**：避免 `this` 丢失
3. **函数式编程**：纯函数、函数组合
4. **简洁逻辑**：单行表达式

### 避免使用

1. **定义方法**：使用传统方法定义对象方法
2. **需要构造函数**：需要 `new` 调用时
3. **动态 this**：需要动态改变 `this` 时

### 最佳实践

1. 优先在回调函数中使用箭头函数
2. 需要保持 `this` 时使用箭头函数
3. 定义方法时使用传统函数
4. 避免在循环中创建大量箭头函数
5. 保持代码简洁和可读性

掌握箭头函数，可以让你编写更简洁、更优雅的 JavaScript 代码。记住：**根据实际需求选择合适的函数类型，优先考虑代码的可读性和维护性。**