# apply、bind、call

## this 关键字

### this 是什么

`this` 是 JavaScript 中的一个关键字，它在函数执行时指向一个对象。`this` 的值取决于函数是如何被调用的。

### this 的绑定规则

```javascript
// 1. 默认绑定 - 严格模式下为 undefined，非严格模式下为全局对象
function foo() {
  console.log(this);
}
foo(); // Window (非严格模式) 或 undefined (严格模式)

// 2. 隐式绑定 - 作为对象的方法调用
const obj = {
  name: '张三',
  foo() {
    console.log(this.name);
  }
};
obj.foo(); // '张三'

// 3. 隐式丢失 - 函数赋值给变量后丢失 this
const bar = obj.foo;
bar(); // undefined

// 4. 显式绑定 - 使用 call、apply、bind
obj.foo.call({ name: '李四' }); // '李四'

// 5. new 绑定 - 使用 new 调用函数
function Person(name) {
  this.name = name;
}
const person = new Person('王五');
console.log(person.name); // '王五'
```

## call 方法

### 基本语法

```javascript
function.call(thisArg, arg1, arg2, ...)
```

### call 的使用

```javascript
// 基本用法
function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`);
}

const person = {
  name: '张三'
};

greet.call(person, '你好', '！'); // '你好, 张三!'

// 改变 this 指向
const person2 = {
  name: '李四'
};

greet.call(person2, '早上好', '！'); // '早上好, 李四!'
```

### call 的实际应用

#### 1. 借用方法

```javascript
// 借用数组方法
const arrayLike = {
  0: 'a',
  1: 'b',
  2: 'c',
  length: 3
};

// 使用 Array.prototype.slice.call 将类数组转换为数组
const array = Array.prototype.slice.call(arrayLike);
console.log(array); // ['a', 'b', 'c']

// 借用 Math.max
const numbers = [1, 5, 3, 2, 4];
const max = Math.max.call(null, ...numbers);
console.log(max); // 5

// 借用 Object.prototype.toString 检测类型
function getType(value) {
  return Object.prototype.toString.call(value);
}

console.log(getType([])); // '[object Array]'
console.log(getType({})); // '[object Object]'
console.log(getType('')); // '[object String]'
console.log(getType(null)); // '[object Null]'
console.log(getType(undefined)); // '[object Undefined]'
```

#### 2. 调用父类构造函数

```javascript
function Animal(name) {
  this.name = name;
}

function Dog(name, breed) {
  Animal.call(this, name); // 调用父类构造函数
  this.breed = breed;
}

const dog = new Dog('旺财', '金毛');
console.log(dog.name); // '旺财'
console.log(dog.breed); // '金毛'
```

#### 3. 函数柯里化

```javascript
function add(a, b) {
  return a + b;
}

function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return (...moreArgs) => curried.apply(this, args.concat(moreArgs));
  };
}

const curriedAdd = curry(add);
console.log(curriedAdd(1)(2)); // 3
console.log(curriedAdd(1, 2)); // 3
```

## apply 方法

### 基本语法

```javascript
function.apply(thisArg, argsArray)
```

### apply 的使用

```javascript
// 基本用法
function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`);
}

const person = {
  name: '张三'
};

greet.apply(person, ['你好', '！']); // '你好, 张三!'

// 使用数组作为参数
function sum(a, b, c) {
  return a + b + c;
}

const numbers = [1, 2, 3];
const result = sum.apply(null, numbers);
console.log(result); // 6
```

### apply 的实际应用

#### 1. 数组最大值/最小值

```javascript
const numbers = [1, 5, 3, 2, 4];

// 使用 apply 获取最大值
const max = Math.max.apply(null, numbers);
console.log(max); // 5

// 使用 apply 获取最小值
const min = Math.min.apply(null, numbers);
console.log(min); // 1

// ES6 扩展运算符更简洁
const maxES6 = Math.max(...numbers);
const minES6 = Math.min(...numbers);
```

#### 2. 数组合并

```javascript
// 使用 apply 合并数组
const array1 = [1, 2, 3];
const array2 = [4, 5, 6];

const merged = [].concat.apply([], array1, array2);
console.log(merged); // [1, 2, 3, 4, 5, 6]

// ES6 更简洁
const mergedES6 = [...array1, ...array2];
```

#### 3. 扁平化数组

```javascript
function flatten(array) {
  return [].concat.apply([], array);
}

const nested = [[1, 2], [3, 4], [5, 6]];
const flattened = flatten(nested);
console.log(flattened); // [1, 2, 3, 4, 5, 6]
```

#### 4. 函数参数转换

```javascript
function multiply(a, b, c) {
  return a * b * c;
}

const factors = [2, 3, 4];
const product = multiply.apply(null, factors);
console.log(product); // 24
```

## bind 方法

### 基本语法

```javascript
function.bind(thisArg, arg1, arg2, ...)
```

### bind 的使用

```javascript
// 基本用法
function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`);
}

const person = {
  name: '张三'
};

const greetPerson = greet.bind(person);
greetPerson('你好', '！'); // '你好, 张三!'

// 预设参数
const greetHello = greet.bind(person, '你好');
greetHello('！'); // '你好, 张三!'
greetHello('～'); // '你好, 张三~'
```

### bind 的实际应用

#### 1. 绑定回调函数的 this

```javascript
const obj = {
  name: '张三',
  showName() {
    console.log(this.name);
  },
  delayShow() {
    setTimeout(this.showName.bind(this), 1000); // 1 秒后输出 '张三'
  }
};

obj.delayShow();

// 不使用 bind 的情况
const obj2 = {
  name: '李四',
  showName() {
    console.log(this.name);
  },
  delayShow() {
    setTimeout(function() {
      this.showName(); // TypeError: this.showName is not a function
    }, 1000);
  }
};
```

#### 2. 偏函数

```javascript
function multiply(a, b) {
  return a * b;
}

// 创建双倍函数
const double = multiply.bind(null, 2);
console.log(double(5)); // 10
console.log(double(10)); // 20

// 创建三倍函数
const triple = multiply.bind(null, 3);
console.log(triple(5)); // 15
```

#### 3. 事件处理器

```javascript
class Button {
  constructor(text) {
    this.text = text;
    this.element = document.createElement('button');
    this.element.textContent = text;
    
    // 绑定 this
    this.handleClick = this.handleClick.bind(this);
    this.element.addEventListener('click', this.handleClick);
  }
  
  handleClick() {
    console.log(`点击了按钮: ${this.text}`);
  }
  
  render() {
    return this.element;
  }
}

// 或者使用箭头函数
class Button2 {
  constructor(text) {
    this.text = text;
    this.element = document.createElement('button');
    this.element.textContent = text;
    
    // 使用箭头函数
    this.element.addEventListener('click', () => {
      this.handleClick();
    });
  }
  
  handleClick() {
    console.log(`点击了按钮: ${this.text}`);
  }
  
  render() {
    return this.element;
  }
}
```

#### 4. 柯里化

```javascript
function log(level, message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`);
}

// 创建专用的日志函数
const info = log.bind(null, 'INFO');
const warn = log.bind(null, 'WARN');
const error = log.bind(null, 'ERROR');

info('应用启动');
warn('内存使用率过高');
error('数据库连接失败');
```

#### 5. 函数预设

```javascript
function fetchData(url, options = {}) {
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  return fetch(url, { ...defaultOptions, ...options });
}

// 创建专用的请求函数
const api = {
  get: fetchData.bind(null, 'https://api.example.com/data', { method: 'GET' }),
  post: fetchData.bind(null, 'https://api.example.com/data', { method: 'POST' }),
  put: fetchData.bind(null, 'https://api.example.com/data', { method: 'PUT' }),
  delete: fetchData.bind(null, 'https://api.example.com/data', { method: 'DELETE' }),
};

// 使用
api.get();
api.post({ body: JSON.stringify({ name: '张三' }) });
```

## call、apply、bind 的区别

### 参数传递方式

```javascript
function greet(a, b, c) {
  console.log(this.name, a, b, c);
}

const person = { name: '张三' };

// call - 逐个传递参数
greet.call(person, 1, 2, 3); // 张三 1 2 3

// apply - 使用数组传递参数
greet.apply(person, [1, 2, 3]); // 张三 1 2 3

// bind - 返回新函数，参数可以分批传递
const boundGreet = greet.bind(person, 1);
boundGreet(2, 3); // 张三 1 2 3
```

### 执行时机

```javascript
function greet(name) {
  console.log(`你好, ${name}，我是 ${this.name}`);
}

const person = { name: '张三' };

// call - 立即执行
greet.call(person, '李四'); // 立即执行

// apply - 立即执行
greet.apply(person, ['李四']); // 立即执行

// bind - 返回新函数，不立即执行
const boundGreet = greet.bind(person);
boundGreet('李四'); // 需要手动调用
```

### 返回值

```javascript
function greet(name) {
  console.log(`你好, ${name}`);
  return '问候完成';
}

// call - 返回函数的返回值
const result1 = greet.call({ name: '张三' }, '李四');
console.log(result1); // '问候完成'

// apply - 返回函数的返回值
const result2 = greet.apply({ name: '张三' }, ['李四']);
console.log(result2); // '问候完成'

// bind - 返回新函数
const boundGreet = greet.bind({ name: '张三' });
console.log(typeof boundGreet); // 'function'
const result3 = boundGreet('李四');
console.log(result3); // '问候完成'
```

### 对比表

| 特性 | call | apply | bind |
|------|------|-------|------|
| 参数传递 | 逐个传递 | 数组传递 | 可以预设参数 |
| 执行时机 | 立即执行 | 立即执行 | 返回新函数 |
| 返回值 | 函数返回值 | 函数返回值 | 新函数 |
| 主要用途 | 改变 this 并立即调用 | 改变 this 并立即调用，参数为数组 | 改变 this 并创建新函数 |

## 实际应用案例

### 案例 1：实现数组去重

```javascript
// 使用 apply 实现数组去重
function unique(array) {
  return Array.prototype.filter.call(array, function(element, index) {
    return array.indexOf(element) === index;
  });
}

const arr = [1, 2, 2, 3, 4, 4, 5];
console.log(unique(arr)); // [1, 2, 3, 4, 5]

// ES6 Set 更简洁
const uniqueES6 = (array) => [...new Set(array)];
```

### 案例 2：实现函数节流

```javascript
function throttle(fn, delay) {
  let lastCall = 0;
  
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      fn.apply(this, args);
      lastCall = now;
    }
  };
}

const throttledScroll = throttle(function() {
  console.log('滚动事件');
}, 1000);

window.addEventListener('scroll', throttledScroll);
```

### 案例 3：实现函数防抖

```javascript
function debounce(fn, delay) {
  let timer;
  
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

const debouncedSearch = debounce(function(query) {
  console.log(`搜索: ${query}`);
}, 300);

searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});
```

### 案例 4：实现函数缓存

```javascript
function memoize(fn) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const expensiveCalculation = memoize(function(n) {
  console.log('计算中...');
  let result = 0;
  for (let i = 0; i < n; i++) {
    result += i;
  }
  return result;
});

console.log(expensiveCalculation(100000)); // 计算中... 4999950000
console.log(expensiveCalculation(100000)); // 4999950000 (使用缓存)
```

### 案例 5：实现数组方法

```javascript
// 实现数组 map
function myMap(fn) {
  const result = [];
  
  for (let i = 0; i < this.length; i++) {
    result.push(fn.call(this, this[i], i, this));
  }
  
  return result;
}

Array.prototype.myMap = myMap;

const arr = [1, 2, 3];
const doubled = arr.myMap(item => item * 2);
console.log(doubled); // [2, 4, 6]

// 实现数组 filter
function myFilter(fn) {
  const result = [];
  
  for (let i = 0; i < this.length; i++) {
    if (fn.call(this, this[i], i, this)) {
      result.push(this[i]);
    }
  }
  
  return result;
}

Array.prototype.myFilter = myFilter;

const even = [1, 2, 3, 4, 5].myFilter(item => item % 2 === 0);
console.log(even); // [2, 4]
```

### 案例 6：实现数组方法 reduce

```javascript
function myReduce(fn, initialValue) {
  let accumulator = initialValue;
  let startIndex = 0;
  
  if (accumulator === undefined) {
    accumulator = this[0];
    startIndex = 1;
  }
  
  for (let i = startIndex; i < this.length; i++) {
    accumulator = fn.call(this, accumulator, this[i], i, this);
  }
  
  return accumulator;
}

Array.prototype.myReduce = myReduce;

const sum = [1, 2, 3, 4, 5].myReduce((acc, item) => acc + item, 0);
console.log(sum); // 15

const max = [1, 5, 3, 2, 4].myReduce((acc, item) => Math.max(acc, item), -Infinity);
console.log(max); // 5
```

### 案例 7：实现类继承

```javascript
function Animal(name) {
  this.name = name;
}

Animal.prototype.sayHello = function() {
  console.log(`你好, 我是 ${this.name}`);
};

function Dog(name, breed) {
  Animal.call(this, name); // 调用父类构造函数
  this.breed = breed;
}

// 继承父类原型
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function() {
  console.log('汪汪！');
};

const dog = new Dog('旺财', '金毛');
dog.sayHello(); // 你好, 我是 旺财
dog.bark(); // 汪汪！
```

### 案例 8：实现事件委托

```javascript
class EventDelegate {
  constructor(element) {
    this.element = element;
    this.handlers = new Map();
  }
  
  on(eventName, selector, handler) {
    const wrappedHandler = function(event) {
      const target = event.target.closest(selector);
      
      if (target && this.element.contains(target)) {
        handler.call(target, event);
      }
    }.bind(this);
    
    this.element.addEventListener(eventName, wrappedHandler);
    
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    
    this.handlers.get(eventName).push({ selector, handler, wrappedHandler });
  }
  
  off(eventName, selector, handler) {
    const handlers = this.handlers.get(eventName);
    
    if (!handlers) return;
    
    const index = handlers.findIndex(
      h => h.selector === selector && h.handler === handler
    );
    
    if (index !== -1) {
      const { wrappedHandler } = handlers[index];
      this.element.removeEventListener(eventName, wrappedHandler);
      handlers.splice(index, 1);
    }
  }
}

// 使用
const delegate = new EventDelegate(document.body);

delegate.on('click', '.button', function(event) {
  console.log('按钮被点击:', this.textContent);
});

delegate.on('change', '.input', function(event) {
  console.log('输入框改变:', this.value);
});
```

## 最佳实践

### 1. 使用 call/apply 改变 this

```javascript
// 好的做法 - 明确改变 this
function greet() {
  console.log(`你好, ${this.name}`);
}

const person = { name: '张三' };
greet.call(person); // 明确的 this 绑定
```

### 2. 使用 bind 保持 this

```javascript
// 好的做法 - 保持 this
class Component {
  constructor() {
    this.name = '组件';
    this.handleClick = this.handleClick.bind(this);
  }
  
  handleClick() {
    console.log(this.name);
  }
  
  mount() {
    document.addEventListener('click', this.handleClick);
  }
}
```

### 3. 使用箭头函数简化

```javascript
// 更简洁的做法 - 使用箭头函数
class Component {
  constructor() {
    this.name = '组件';
  }
  
  handleClick = () => {
    console.log(this.name);
  };
  
  mount() {
    document.addEventListener('click', this.handleClick);
  }
}
```

### 4. 避免 this 丢失

```javascript
// 好的做法 - 避免 this 丢失
const obj = {
  name: '张三',
  
  init() {
    // 使用箭头函数
    setTimeout(() => {
      this.logName();
    }, 1000);
    
    // 或使用 bind
    setTimeout(this.logName.bind(this), 1000);
  },
  
  logName() {
    console.log(this.name);
  }
};
```

### 5. 合理使用 call/apply/bind

```javascript
// 根据场景选择合适的方法

// 需要立即执行并逐个传递参数 - 使用 call
Math.max.call(null, 1, 5, 3);

// 需要立即执行且参数为数组 - 使用 apply
Math.max.apply(null, [1, 5, 3]);

// 需要延迟执行或预设参数 - 使用 bind
const greet = function(name) {
  console.log(`你好, ${this.name}，我是 ${name}`);
}.bind({ name: '张三' });
greet('李四');
```

## 常见问题

### Q: call、apply、bind 的返回值有什么区别？

A: `call` 和 `apply` 返回函数执行后的返回值，而 `bind` 返回一个新的函数。

### Q: 如何在严格模式下使用 call、apply、bind？

A: 严格模式下，`this` 的值不会被自动转换为对象，如果 `thisArg` 是 `null` 或 `undefined`，`this` 保持为 `null` 或 `undefined`。

### Q: 箭头函数可以使用 call、apply、bind 吗？

A: 箭头函数的 `this` 在定义时就已经确定，无法通过 `call`、`apply`、`bind` 改变。

### Q: 什么时候使用 call，什么时候使用 apply？

A: 如果参数是逐个传递的，使用 `call`；如果参数是数组，使用 `apply`。

### Q: bind 预设参数的顺序是什么？

A: `bind` 的第二个及之后的参数会作为函数的前几个参数被预设，剩余的参数在调用时传递。

### Q: 如何判断一个函数是否被 bind 过？

A: `bind` 返回的函数有一个 `name` 属性，值为 `"bound " + 原函数名`。

### Q: call、apply、bind 对性能有影响吗？

A: 有一定影响，但通常可以忽略。如果需要极致性能，可以考虑其他优化方式。

## 总结

### call、apply、bind 的核心用途

1. **call**：改变 `this` 并立即执行，参数逐个传递
2. **apply**：改变 `this` 并立即执行，参数以数组形式传递
3. **bind**：改变 `this` 并返回新函数，可以预设参数

### 选择指南

| 场景 | 推荐方法 |
|------|---------|
| 立即执行，参数逐个传递 | `call` |
| 立即执行，参数为数组 | `apply` |
| 延迟执行，需要保持 `this` | `bind` |
| 预设参数 | `bind` |
| ES6+ 环境下 | 箭头函数、扩展运算符 |

### 最佳实践

1. 优先使用箭头函数和扩展运算符（ES6+）
2. 需要改变 `this` 时，根据场景选择 `call`、`apply`、`bind`
3. 在类中使用箭头函数或 `bind` 保持 `this`
4. 避免在循环中频繁创建 `bind` 函数
5. 理解 `this` 的绑定规则，避免 `this` 丢失

掌握 `call`、`apply`、`bind`，可以让你更灵活地控制函数的 `this` 指向，编写更优雅的代码。记住：**根据实际需求选择合适的方法，优先考虑可读性和维护性。**