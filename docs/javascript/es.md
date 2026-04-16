# JavaScript 面试题

## 基础

### 1. JavaScript 的数据类型有哪些？

JavaScript 有 7 种原始数据类型和 1 种引用类型：

**原始类型**:
- `number` - 数字
- `string` - 字符串
- `boolean` - 布尔值
- `undefined` - 未定义
- `null` - 空值
- `symbol` - 符号（ES6）
- `bigint` - 大整数（ES2020）

**引用类型**:
- `object` - 对象（包括数组、函数、日期等）

### 2. 什么是闭包？

闭包是指一个函数能够访问其外部作用域中的变量，即使外部函数已经执行完毕。

```javascript
function outer() {
  const x = 10;
  return function inner() {
    console.log(x); // 仍然可以访问 x
  };
}

const closure = outer();
closure(); // 输出: 10
```

**应用场景**:
- 数据私有化
- 函数柯里化
- 模块模式

### 3. `==` 和 `===` 的区别？

- `==` (宽松相等)：会进行类型转换
- `===` (严格相等)：不会进行类型转换，类型和值都必须相等

```javascript
5 == '5';   // true (类型转换)
5 === '5';  // false (类型不同)
null == undefined;  // true
null === undefined; // false
```

### 4. 什么是原型链？

JavaScript 使用原型继承，每个对象都有一个原型对象，原型对象也有自己的原型，形成一条链式结构。

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.sayHello = function() {
  console.log(`Hello, I'm ${this.name}`);
};

const person = new Person('Alice');
person.sayHello(); // 访问原型链上的方法
```

## ES6+

### 5. let、const 和 var 的区别？

| 特性 | var | let | const |
|------|-----|-----|-------|
| 作用域 | 函数作用域 | 块级作用域 | 块级作用域 |
| 变量提升 | 是 | 否（TDZ） | 否（TDZ） |
| 重复声明 | 允许 | 不允许 | 不允许 |
| 重新赋值 | 允许 | 允许 | 不允许 |

```javascript
// 块级作用域
{
  var a = 1;
  let b = 2;
  const c = 3;
}
console.log(a); // 1
console.log(b); // ReferenceError

// TDZ (Temporal Dead Zone)
console.log(d); // undefined
var d = 10;

console.log(e); // ReferenceError
let e = 10;
```

### 6. 箭头函数和普通函数的区别？

1. `this` 绑定：箭头函数没有自己的 `this`，继承外层作用域
2. 没有 `arguments` 对象
3. 不能作为构造函数使用（不能用 `new`）
4. 没有 `prototype` 属性

```javascript
const obj = {
  name: 'Alice',
  regular: function() {
    console.log(this.name); // 'Alice'
  },
  arrow: () => {
    console.log(this.name); // undefined (继承全局)
  }
};
```

### 7. 解构赋值

从数组或对象中提取值：

```javascript
// 数组解构
const [a, b, c] = [1, 2, 3];

// 对象解构
const { name, age } = { name: 'Alice', age: 30 };

// 默认值
const { x = 10 } = {};

// 重命名
const { name: userName } = { name: 'Alice' };
```

## 异步编程

### 8. Promise 的使用和状态

Promise 有三种状态：
- `pending` - 进行中
- `fulfilled` - 已成功
- `rejected` - 已失败

状态改变后不可逆。

```javascript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('Success!');
  }, 1000);
});

promise
  .then(result => console.log(result))
  .catch(error => console.error(error))
  .finally(() => console.log('Complete'));
```

### 9. async/await 的原理

`async/await` 是 Promise 的语法糖，使异步代码看起来像同步代码。

```javascript
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}
```

### 10. Event Loop (事件循环)

JavaScript 是单线程的，通过事件循环处理异步操作：

1. 执行同步代码
2. 检查微任务队列（microtask）：Promise.then, queueMicrotask
3. 检查宏任务队列（macrotask）：setTimeout, setInterval, I/O
4. 重复步骤 2-3

```javascript
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

console.log('4');

// 输出: 1, 4, 3, 2
```

## 高级

### 11. 深拷贝和浅拷贝

**浅拷贝**：只复制第一层属性
```javascript
const obj = { a: 1, b: { c: 2 } };
const shallow = { ...obj };
const shallow2 = Object.assign({}, obj);
```

**深拷贝**：递归复制所有层级
```javascript
// 方法 1: JSON
const deep = JSON.parse(JSON.stringify(obj));

// 方法 2: 递归
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  const copy = Array.isArray(obj) ? [] : {};
  for (let key in obj) {
    copy[key] = deepClone(obj[key]);
  }
  return copy;
}
```

### 12. 防抖和节流

**防抖 (Debounce)**: 延迟执行，如果在延迟期间再次触发，则重新计时
```javascript
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
```

**节流 (Throttle)**: 固定时间间隔执行
```javascript
function throttle(fn, interval) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}
```
