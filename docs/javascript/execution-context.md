# 执行上下文与执行栈

## 什么是执行上下文

执行上下文（Execution Context）是 JavaScript 中一个核心概念,它是代码执行时的环境。每当 JavaScript 代码运行时,它都会在一个执行上下文中执行。

执行上下文包含了代码执行所需的所有信息:
- 变量对象（Variable Object）
- 作用域链（Scope Chain）
- this 指向

### 执行上下文的生命周期

```javascript
// 执行上下文的创建和执行过程

// 1. 创建阶段
function example() {
  var a = 1;
  var b = 2;
  return a + b;
}

example();

// 执行过程:
// 1. 创建全局执行上下文
// 2. 创建函数执行上下文
// 3. 执行代码
// 4. 销毁函数执行上下文
```

## 执行上下文的类型

### 1. 全局执行上下文

全局执行上下文是默认的执行上下文,在代码开始执行时创建。在任何函数外部创建的变量都会在全局执行上下文中。

```javascript
// 全局执行上下文示例
var globalVar = '全局变量';
const globalConst = '全局常量';
let globalLet = '全局 let';

function globalFunction() {
  console.log('全局函数');
}

// 在浏览器中,全局执行上下文绑定到 window 对象
console.log(window.globalVar); // 全局变量

// 在 Node.js 中,全局执行上下文绑定到 global 对象
// console.log(global.globalVar);
```

### 2. 函数执行上下文

每当调用一个函数时,都会为该函数创建一个新的执行上下文。每个函数都有自己的执行上下文。

```javascript
function first() {
  console.log('第一个函数');
  second();
}

function second() {
  console.log('第二个函数');
  third();
}

function third() {
  console.log('第三个函数');
}

first();

// 执行过程:
// 1. 创建全局执行上下文
// 2. 调用 first() - 创建 first 的执行上下文
// 3. 调用 second() - 创建 second 的执行上下文
// 4. 调用 third() - 创建 third 的执行上下文
// 5. third 执行完成 - 销毁 third 的执行上下文
// 6. second 执行完成 - 销毁 second 的执行上下文
// 7. first 执行完成 - 销毁 first 的执行上下文
```

### 3. eval 执行上下文

`eval` 函数创建的代码在独立的执行上下文中执行（不推荐使用）。

```javascript
// eval 执行上下文
var x = 10;

eval('var y = 20;');
console.log(y); // 20

// 严格模式下
'use strict';
eval('var z = 30;');
// console.log(z); // 报错: z is not defined
```

## 执行上下文的创建过程

### 创建阶段的三个步骤

```javascript
function example(a, b) {
  var c = a + b;
  var d = function() {
    return c * 2;
  };
  (function() {
    var e = d();
  })();
}

example(1, 2);
```

#### 1. 创建变量对象

```javascript
// 变量对象的创建过程
function createVO() {
  // 创建阶段
  // 1. 创建 arguments 对象
  // 2. 扫描函数声明
  // 3. 扫描变量声明
  
  var a = '变量 a';
  
  function foo() {
    console.log('函数 foo');
  }
  
  var bar = function() {
    console.log('函数 bar');
  };
}

// 执行顺序:
// 1. 创建 arguments 对象
// 2. 函数声明提升
//    foo: function foo() { ... }
// 3. 变量声明提升
//    a: undefined
//    bar: undefined
// 4. 执行代码
//    a = '变量 a'
//    bar = function() { ... }
```

#### 2. 建立作用域链

```javascript
// 作用域链的建立
var globalVar = '全局';

function outer() {
  var outerVar = '外层';
  
  function inner() {
    var innerVar = '内层';
    console.log(globalVar); // 通过作用域链访问
    console.log(outerVar);  // 通过作用域链访问
    console.log(innerVar);  // 当前作用域
  }
  
  inner();
}

outer();

// inner 的作用域链:
// innerVar (当前作用域)
//   ↓
// outerVar (outer 作用域)
//   ↓
// globalVar (全局作用域)
```

#### 3. 确定 this 指向

```javascript
// this 的确定
var obj = {
  name: '对象',
  method: function() {
    console.log(this.name); // this 指向 obj
  }
};

obj.method(); // 对象

var method = obj.method;
method(); // undefined (严格模式下) 或 window (非严格模式)
```

## 变量提升（Hoisting）

### 变量声明的提升

```javascript
// var 变量提升
console.log(a); // undefined (不是报错)
var a = 1;

// 等价于
var a;
console.log(a);
a = 1;
```

### 函数声明的提升

```javascript
// 函数声明提升
console.log(foo); // function foo() { ... }

function foo() {
  return '函数声明';
}

// 函数表达式不提升
console.log(bar); // undefined
var bar = function() {
  return '函数表达式';
};
```

### 变量提升的陷阱

```javascript
// 陷阱 1: 同名函数和变量
function test() {
  console.log(foo); // function foo() { ... }
  
  var foo = 1;
  
  function foo() {}
  
  console.log(foo); // 1
}

test();

// 陷阱 2: 条件语句中的函数声明
if (true) {
  function hoisted() {
    console.log('条件内');
  }
}

hoisted(); // 条件内

// 陷阱 3: let 和 const 的暂时性死区
console.log(x); // 报错: Cannot access 'x' before initialization
let x = 1;
```

## 执行栈（调用栈）

### 执行栈的工作原理

执行栈（Execution Stack）是一个后进先出（LIFO）的数据结构,用于管理执行上下文。

```javascript
function first() {
  console.log('first start');
  second();
  console.log('first end');
}

function second() {
  console.log('second start');
  third();
  console.log('second end');
}

function third() {
  console.log('third');
}

first();

// 执行栈变化:
// ┌─────────────────┐
// │  全局执行上下文  │
// └─────────────────┘
// ↓ 调用 first()
// ┌─────────────────┐
// │  first()        │ ← 栈顶
// └─────────────────┘
// ┌─────────────────┐
// │  全局执行上下文  │
// └─────────────────┘
// ↓ 调用 second()
// ┌─────────────────┐
// │  second()       │ ← 栈顶
// └─────────────────┘
// ┌─────────────────┐
// │  first()        │
// └─────────────────┘
// ┌─────────────────┐
// │  全局执行上下文  │
// └─────────────────┘
// ↓ 调用 third()
// ┌─────────────────┐
// │  third()        │ ← 栈顶
// └─────────────────┘
// ┌─────────────────┐
// │  second()       │
// └─────────────────┘
// ┌─────────────────┐
// │  first()        │
// └─────────────────┘
// ┌─────────────────┐
// │  全局执行上下文  │
// └─────────────────┘
// ↓ third() 执行完成,出栈
// ... 依次执行完成
```

### 递归调用

```javascript
// 递归调用和栈溢出
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

console.log(factorial(5)); // 120

// 栈溢出
function infiniteRecursion() {
  infiniteRecursion();
}

// infiniteRecursion(); // Maximum call stack size exceeded
```

### 尾调用优化

```javascript
// 尾调用优化（ES6）
// 尾调用是指函数的最后一步是调用另一个函数

// 非尾调用
function factorial1(n) {
  if (n <= 1) return 1;
  return n * factorial1(n - 1); // 乘法操作在调用之后,不是尾调用
}

// 尾调用优化
function factorial2(n, acc = 1) {
  if (n <= 1) return acc;
  return factorial2(n - 1, n * acc); // 纯尾调用
}

console.log(factorial2(5)); // 120

// 注意: 并非所有 JavaScript 引擎都实现了尾调用优化
```

## 执行上下文的详细解析

### 变量对象（Variable Object）

```javascript
// 变量对象示例
function testVO(a, b) {
  var c = a + b;
  
  function foo() {
    return c;
  }
  
  var bar = function() {
    return c;
  };
}

// 变量对象结构:
// {
//   arguments: { 0: a, 1: b, length: 2 },
//   a: value,
//   b: value,
//   c: undefined,
//   foo: pointer to function foo,
//   bar: undefined
// }

// 执行后:
// {
//   arguments: { 0: a, 1: b, length: 2 },
//   a: value,
//   b: value,
//   c: value,
//   foo: pointer to function foo,
//   bar: pointer to function bar
// }
```

### 活动对象（Activation Object）

```javascript
// 活动对象在函数执行时被激活
function testAO(x) {
  var y = 10;
  
  return function() {
    console.log(x, y);
  };
}

var closure = testAO(20);
closure(); // 20 10

// 活动对象在函数执行后不会被销毁,
// 因为闭包保持了对它的引用
```

### 作用域链的构建

```javascript
// 作用域链示例
var global = '全局';

function outer() {
  var outerVar = '外层';
  
  function inner() {
    var innerVar = '内层';
    
    console.log(innerVar); // 1. 当前作用域
    console.log(outerVar);  // 2. outer 作用域
    console.log(global);    // 3. 全局作用域
  }
  
  inner();
}

outer();

// inner 的作用域链:
// inner.[[Scope]] = [
//   innerAO,      // inner 的活动对象
//   outerAO,      // outer 的活动对象
//   globalVO      // 全局变量对象
// ]
```

## this 的指向规则

### 默认绑定

```javascript
// 严格模式下
'use strict';
function defaultBind() {
  console.log(this); // undefined
}
defaultBind();

// 非严格模式
function defaultBindNonStrict() {
  console.log(this); // window (浏览器)
}
defaultBindNonStrict();
```

### 隐式绑定

```javascript
// 对象方法
var obj = {
  name: '张三',
  method: function() {
    console.log(this.name); // 张三
  }
};
obj.method();

// 隐式丢失
var method = obj.method;
method(); // undefined (严格模式) 或 undefined (非严格模式)

// 回调函数
function doSomething(callback) {
  callback();
}

var obj2 = {
  name: '李四',
  method: function() {
    console.log(this.name);
  }
};

doSomething(obj2.method); // undefined
```

### 显式绑定

```javascript
// call
function greet(greeting, punctuation) {
  console.log(greeting + ', ' + this.name + punctuation);
}

var person = { name: '王五' };
greet.call(person, '你好', '！'); // 你好, 王五！

// apply
greet.apply(person, ['你好', '！']); // 你好, 王五！

// bind
var boundGreet = greet.bind(person);
boundGreet('你好', '！'); // 你好, 王五！
```

### new 绑定

```javascript
// 构造函数
function Person(name) {
  this.name = name;
}

var person = new Person('赵六');
console.log(person.name); // 赵六

// new 的过程:
// 1. 创建新对象
// 2. 新对象的 __proto__ 指向构造函数的 prototype
// 3. 将 this 指向新对象
// 4. 执行构造函数
// 5. 返回新对象
```

### 箭头函数的 this

```javascript
// 箭头函数没有自己的 this
var obj = {
  name: '箭头函数',
  method: function() {
    var regularFunction = function() {
      console.log(this.name); // undefined
    };
    
    var arrowFunction = () => {
      console.log(this.name); // 箭头函数
    };
    
    regularFunction();
    arrowFunction();
  }
};

obj.method();

// 箭头函数的 this 在定义时确定
var obj2 = {
  name: '外层',
  method: function() {
    return () => {
      console.log(this.name); // 外层
    };
  }
};

var arrow = obj2.method();
arrow();

var obj3 = {
  name: '内层'
};
obj3.method = arrow;
obj3.method(); // 仍然是外层
```

## 执行上下文的实际应用

### 1. 理解变量声明顺序

```javascript
// 变量声明的完整过程
function testDeclaration() {
  console.log(a); // undefined
  console.log(b); // undefined
  console.log(foo); // function foo() {}
  // console.log(c); // 报错: Cannot access 'c' before initialization
  
  var a = 1;
  var b = 2;
  let c = 3;
  
  function foo() {
    return 'foo';
  }
}

testDeclaration();
```

### 2. 闭包的作用域链

```javascript
// 闭包保持对外层作用域的引用
function counter() {
  var count = 0;
  
  return {
    increment: function() {
      count++;
      console.log(count);
    },
    decrement: function() {
      count--;
      console.log(count);
    },
    getCount: function() {
      return count;
    }
  };
}

var c = counter();
c.increment(); // 1
c.increment(); // 2
c.decrement(); // 1
console.log(c.getCount()); // 1
```

### 3. 立即执行函数（IIFE）

```javascript
// IIFE 创建独立作用域
(function() {
  var privateVar = '私有变量';
  console.log(privateVar);
})();

// console.log(privateVar); // 报错: privateVar is not defined

// 带参数的 IIFE
(function(name) {
  console.log('你好, ' + name);
})('张三');
```

### 4. 模块模式

```javascript
// 使用执行上下文实现模块模式
var module = (function() {
  var privateVar = '私有变量';
  
  function privateFunction() {
    console.log('私有函数');
  }
  
  return {
    publicVar: '公共变量',
    publicMethod: function() {
      console.log(privateVar);
      privateFunction();
    }
  };
})();

module.publicMethod();
// module.privateFunction(); // 报错
```

### 5. 作用域安全的构造函数

```javascript
// 防止构造函数被当作普通函数调用
function Person(name) {
  if (this instanceof Person) {
    this.name = name;
  } else {
    return new Person(name);
  }
}

var person1 = new Person('张三');
var person2 = Person('李四');

console.log(person1.name); // 张三
console.log(person2.name); // 李四
```

## 执行栈的调试

### 1. 使用 console.trace

```javascript
function first() {
  console.log('first');
  second();
}

function second() {
  console.log('second');
  console.trace('调用栈');
  third();
}

function third() {
  console.log('third');
  console.trace('调用栈');
}

first();

// 输出调用栈信息
```

### 2. 使用 debugger

```javascript
function debugExample() {
  var x = 10;
  var y = 20;
  
  debugger; // 在此处暂停
  
  return x + y;
}

debugExample();
```

### 3. 查看调用栈

```javascript
// 浏览器开发者工具
// 1. 打开 Sources 面板
// 2. 设置断点
// 3. 查看 Call Stack 面板

// Node.js
// node --inspect script.js
// 然后使用 Chrome DevTools 连接
```

## 性能优化

### 1. 减少作用域链查找

```javascript
// ❌ 不好: 多次跨作用域查找
function inefficient() {
  for (var i = 0; i < 1000; i++) {
    for (var j = 0; j < 1000; j++) {
      document.getElementById('element').innerHTML = i + j;
    }
  }
}

// ✅ 好: 缓存引用
function efficient() {
  var element = document.getElementById('element');
  for (var i = 0; i < 1000; i++) {
    for (var j = 0; j < 1000; j++) {
      element.innerHTML = i + j;
    }
  }
}
```

### 2. 避免深层嵌套

```javascript
// ❌ 不好: 深层嵌套
function deepNested() {
  function level1() {
    function level2() {
      function level3() {
        function level4() {
          // 增加了作用域链的长度
        }
      }
    }
  }
}

// ✅ 好: 扁平化结构
function flatStructure() {
  function helper1() {}
  function helper2() {}
  function helper3() {}
}
```

### 3. 及时释放引用

```javascript
// 及时释放大对象引用
function processLargeData() {
  var largeArray = new Array(1000000).fill('data');
  
  // 处理数据
  process(largeArray);
  
  // 释放引用
  largeArray = null;
}
```

## 常见问题与解决方案

### 1. 栈溢出

```javascript
// 问题: 递归深度过大
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

// factorial(10000); // Stack overflow

// 解决: 使用尾递归优化
function factorialTail(n, acc = 1) {
  if (n <= 1) return acc;
  return factorialTail(n - 1, n * acc);
}

// 解决: 使用迭代
function factorialIter(n) {
  var result = 1;
  for (var i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}
```

### 2. 变量提升导致的问题

```javascript
// 问题: 变量提升导致意外的 undefined
function testHoisting() {
  if (true) {
    console.log(name); // undefined
    var name = '张三';
  }
}

testHoisting();

// 解决: 使用 let 和 const
function testNoHoisting() {
  if (true) {
    // console.log(name); // 报错
    let name = '张三';
    console.log(name); // 张三
  }
}

testNoHoisting();
```

### 3. this 指向问题

```javascript
// 问题: this 指向丢失
var obj = {
  name: '张三',
  method: function() {
    setTimeout(function() {
      console.log(this.name); // undefined
    }, 100);
  }
};

obj.method();

// 解决 1: 保存 this
var obj1 = {
  name: '张三',
  method: function() {
    var self = this;
    setTimeout(function() {
      console.log(self.name); // 张三
    }, 100);
  }
};

obj1.method();

// 解决 2: 使用 bind
var obj2 = {
  name: '张三',
  method: function() {
    setTimeout(function() {
      console.log(this.name); // 张三
    }.bind(this), 100);
  }
};

obj2.method();

// 解决 3: 使用箭头函数
var obj3 = {
  name: '张三',
  method: function() {
    setTimeout(() => {
      console.log(this.name); // 张三
    }, 100);
  }
};

obj3.method();
```

## 现代JavaScript中的作用域

### 1. 块级作用域

```javascript
// let 和 const 创建块级作用域
function blockScope() {
  if (true) {
    let x = 10;
    const y = 20;
    console.log(x, y); // 10 20
  }
  
  // console.log(x); // 报错
  // console.log(y); // 报错
}

blockScope();
```

### 2. 类的作用域

```javascript
// 类的私有字段
class MyClass {
  #privateField = '私有字段';
  publicField = '公共字段';
  
  getPrivate() {
    return this.#privateField;
  }
}

const instance = new MyClass();
console.log(instance.publicField); // 公共字段
console.log(instance.getPrivate()); // 私有字段
// console.log(instance.#privateField); // 报错
```

### 3. 模块系统

```javascript
// ES6 模块创建独立作用域
// module.js
const moduleVar = '模块变量';
export function moduleFunc() {
  return '模块函数';
}

// main.js
import { moduleFunc } from './module.js';
// moduleVar 不可访问
```

## 总结

执行上下文与执行栈是理解 JavaScript 执行机制的基础:

1. **执行上下文**
   - 全局执行上下文
   - 函数执行上下文
   - eval 执行上下文

2. **创建过程**
   - 创建变量对象
   - 建立作用域链
   - 确定 this 指向

3. **变量提升**
   - var 声明会提升
   - 函数声明会提升
   - let 和 const 有暂时性死区

4. **执行栈**
   - 后进先出（LIFO）
   - 管理执行上下文
   - 递归调用可能导致栈溢出

5. **this 指向**
   - 默认绑定
   - 隐式绑定
   - 显式绑定
   - new 绑定
   - 箭头函数的 this

6. **最佳实践**
   - 使用 let 和 const 代替 var
   - 避免深层嵌套
   - 及时释放引用
   - 合理使用闭包

理解执行上下文和执行栈对于编写高效、可维护的 JavaScript 代码至关重要。它帮助你理解变量提升、作用域链、this 绑定等重要概念,从而更好地调试和优化代码。
