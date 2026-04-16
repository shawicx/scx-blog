# 作用域

## 什么是作用域

作用域（Scope）是 JavaScript 中一个重要的概念,它决定了代码中变量和函数的可访问性。简单来说,作用域定义了变量和函数在代码中的有效范围。

JavaScript 主要有三种作用域:全局作用域、函数作用域和块级作用域。

## 全局作用域

全局作用域是在代码任何地方都能访问的作用域。在浏览器中,全局作用域是 `window` 对象,在 Node.js 中是 `global` 对象。

```javascript
// 全局变量
var globalVar = '我是全局变量';

function accessGlobal() {
  console.log(globalVar); // 可以访问
  var localVar = '我是局部变量';
}

accessGlobal(); // 输出: 我是全局变量
console.log(globalVar); // 输出: 我是全局变量
// console.log(localVar); // 报错: localVar is not defined

// 在浏览器中
console.log(window.globalVar); // 输出: 我是全局变量
```

### 注意事项

- 在全局作用域中声明的变量可以在代码的任何地方访问
- 过度使用全局变量可能导致命名冲突和代码难以维护
- 在浏览器中,未使用 `var`、`let` 或 `const` 声明的变量会自动成为全局变量

```javascript
function createGlobal() {
  globalVar2 = '意外的全局变量';
}

createGlobal();
console.log(globalVar2); // 输出: 意外的全局变量
```

## 函数作用域

函数作用域是指在函数内部声明的变量,只能在函数内部访问。每个函数都会创建一个新的作用域。

```javascript
function outerFunction() {
  var outerVar = '外部函数变量';
  
  function innerFunction() {
    var innerVar = '内部函数变量';
    console.log(outerVar); // 可以访问外部函数的变量
    console.log(innerVar); // 可以访问自己的变量
  }
  
  innerFunction();
  // console.log(innerVar); // 报错: innerVar is not defined
}

outerFunction();
```

### 作用域链

JavaScript 使用作用域链（Scope Chain）来查找变量。当访问一个变量时,JavaScript 引擎会先在当前作用域中查找,如果找不到,就向外层作用域查找,直到找到全局作用域。

```javascript
var globalVar = '全局';

function level1() {
  var level1Var = '第1层';
  
  function level2() {
    var level2Var = '第2层';
    
    function level3() {
      var level3Var = '第3层';
      console.log(globalVar);  // 输出: 全局
      console.log(level1Var);  // 输出: 第1层
      console.log(level2Var);  // 输出: 第2层
      console.log(level3Var);  // 输出: 第3层
    }
    
    level3();
  }
  
  level2();
}

level1();
```

## 块级作用域

块级作用域是在块语句（`{}`）中声明的变量,只能在块内部访问。ES6 引入的 `let` 和 `const` 支持块级作用域。

```javascript
// var 没有块级作用域
if (true) {
  var blockVar = 'var 声明';
}
console.log(blockVar); // 输出: var 声明

// let 和 const 有块级作用域
if (true) {
  let blockLet = 'let 声明';
  const blockConst = 'const 声明';
  console.log(blockLet);   // 输出: let 声明
  console.log(blockConst); // 输出: const 声明
}
// console.log(blockLet);   // 报错: blockLet is not defined
// console.log(blockConst); // 报错: blockConst is not defined
```

### 常见块级作用域

```javascript
// 1. if 语句块
if (true) {
  let x = 10;
  console.log(x); // 10
}
// console.log(x); // 报错

// 2. for 循环块
for (let i = 0; i < 3; i++) {
  console.log(i); // 0, 1, 2
}
// console.log(i); // 报错

// 3. while 循环块
while (false) {
  let y = 20;
}
// console.log(y); // 报错

// 4. try-catch 块
try {
  let z = 30;
  throw new Error('test');
} catch (e) {
  console.log(e.message);
}
// console.log(z); // 报错
```

## var、let、const 的区别

### 声明方式对比

| 特性 | var | let | const |
|------|-----|-----|-------|
| 作用域 | 函数作用域 | 块级作用域 | 块级作用域 |
| 变量提升 | 是 | 否（TDZ） | 否（TDZ） |
| 重复声明 | 允许 | 不允许 | 不允许 |
| 重新赋值 | 允许 | 允许 | 不允许 |
| 初始化 | 可选 | 可选 | 必须 |

### 详细示例

```javascript
// 1. 作用域差异
function testScope() {
  if (true) {
    var varVar = 'var';
    let letVar = 'let';
    const constVar = 'const';
  }
  
  console.log(varVar);   // 输出: var
  // console.log(letVar);   // 报错
  // console.log(constVar); // 报错
}

testScope();

// 2. 变量提升
console.log(hoistedVar); // undefined (不是报错)
// console.log(hoistedLet); // 报错: Cannot access before initialization

var hoistedVar = 'var 提升';
let hoistedLet = 'let 提升';

// 3. 重复声明
var repeated = '第一次';
var repeated = '第二次'; // 允许
console.log(repeated); // 输出: 第二次

let cannotRepeat = '第一次';
// let cannotRepeat = '第二次'; // 报错: Identifier has already been declared

// 4. const 的特殊性
const constant = '常量';
// constant = '新值'; // 报错: Assignment to constant variable

const obj = { name: '张三' };
obj.name = '李四'; // 允许,修改对象属性
console.log(obj.name); // 输出: 李四
// obj = {}; // 报错: Assignment to constant variable
```

## 临时死区（TDZ）

在 ES6 中,使用 `let` 和 `const` 声明的变量存在临时死区（Temporal Dead Zone）。在声明之前的区域称为 TDZ,访问这些变量会抛出错误。

```javascript
// 临时死区示例
{
  console.log(typeof x); // undefined (var)
  // console.log(typeof y); // 报错: Cannot access 'y' before initialization
  
  var x = 'var';
  let y = 'let'; // y 的 TDZ 结束
  console.log(y); // 'let'
}

// 在 TDZ 中访问
function testTDZ() {
  console.log(z); // 报错: Cannot access 'z' before initialization
  let z = 'test';
}

// testTDZ();

// 在循环中的 TDZ
for (let i = 0; i < 3; i++) {
  console.log(i); // 0, 1, 2
}
```

## 词法作用域与动态作用域

JavaScript 使用词法作用域（静态作用域）,作用域在函数定义时确定,而不是在调用时确定。

```javascript
var x = 10;

function f1() {
  console.log(x); // 10
}

function f2() {
  var x = 20;
  f1(); // 调用 f1,但 f1 的作用域在定义时确定
}

f2(); // 输出: 10 (不是 20)

// 对比动态作用域的伪代码
// 如果是动态作用域,这里会输出 20
```

### 词法作用域的优势

```javascript
// 1. 代码可预测
function factory() {
  var secret = '秘密数据';
  
  return function() {
    return secret; // 可以访问外层作用域
  };
}

var reveal = factory();
console.log(reveal()); // 输出: 秘密数据

// 2. 闭包的基础
function counter() {
  var count = 0;
  
  return {
    increment: function() {
      count++;
      return count;
    },
    decrement: function() {
      count--;
      return count;
    }
  };
}

var c = counter();
console.log(c.increment()); // 1
console.log(c.increment()); // 2
console.log(c.decrement()); // 1
```

## 作用域的实际应用

### 1. 避免全局污染

```javascript
// ❌ 不好: 污染全局作用域
var userName = '张三';
var userAge = 25;
var userCity = '北京';

// ✅ 好: 使用对象封装
var user = {
  name: '张三',
  age: 25,
  city: '北京'
};

// ✅ 更好: 使用 IIFE
var app = (function() {
  var privateVar = '私有变量';
  
  return {
    publicMethod: function() {
      return privateVar;
    }
  };
})();

console.log(app.publicMethod());
// console.log(app.privateVar); // 报错: undefined

// ✅ 最佳: 使用 ES6 模块
```

### 2. 实现私有变量

```javascript
// 使用闭包实现私有变量
function Person(name) {
  var _name = name; // 私有变量
  
  return {
    getName: function() {
      return _name;
    },
    setName: function(newName) {
      _name = newName;
    }
  };
}

var person = Person('张三');
console.log(person.getName()); // 张三
person.setName('李四');
console.log(person.getName()); // 李四
// console.log(person._name); // undefined
```

### 3. 模块模式

```javascript
var myModule = (function() {
  var privateVar = '私有变量';
  var privateMethod = function() {
    console.log('私有方法');
  };
  
  return {
    publicVar: '公共变量',
    publicMethod: function() {
      privateMethod();
      return privateVar;
    }
  };
})();

console.log(myModule.publicVar); // 公共变量
console.log(myModule.publicMethod()); // 私有变量
// console.log(myModule.privateVar); // undefined
// console.log(myModule.privateMethod()); // 不是函数
```

### 4. 循环中的闭包

```javascript
// ❌ 问题: 循环中的闭包
for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i); // 3, 3, 3
  }, 100);
}

// ✅ 解决方案 1: 使用 let
for (let i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i); // 0, 1, 2
  }, 100);
}

// ✅ 解决方案 2: 使用 IIFE
for (var i = 0; i < 3; i++) {
  (function(index) {
    setTimeout(function() {
      console.log(index); // 0, 1, 2
    }, 100);
  })(i);
}

// ✅ 解决方案 3: 使用 bind
for (var i = 0; i < 3; i++) {
  setTimeout(function(index) {
    console.log(index); // 0, 1, 2
  }.bind(null, i), 100);
}
```

## 作用域与 this

`this` 关键字与作用域是两个不同的概念。`this` 指向函数执行时的上下文对象。

```javascript
var obj = {
  name: '对象',
  method: function() {
    console.log(this.name); // 对象
    
    var inner = function() {
      console.log(this.name); // undefined (在非严格模式下可能是 window)
    };
    inner();
    
    // 解决方案 1
    var self = this;
    var inner2 = function() {
      console.log(self.name); // 对象
    };
    inner2();
    
    // 解决方案 2: 使用箭头函数
    var inner3 = () => {
      console.log(this.name); // 对象
    };
    inner3();
  }
};

obj.method();
```

## 作用域的性能考虑

### 变量查找性能

```javascript
// 访问不同作用域的变量性能不同
function testPerformance() {
  var local = '局部变量';
  
  return function() {
    // 访问局部变量最快
    console.log(local);
  };
}

// 嵌套过深会影响性能
function deepScope() {
  var level1 = '第1层';
  
  return function() {
    var level2 = '第2层';
    
    return function() {
      var level3 = '第3层';
      
      return function() {
        console.log(level1); // 需要跨越多个作用域
      };
    };
  };
}
```

### 最佳实践

```javascript
// ✅ 尽量减少跨作用域访问
function betterApproach() {
  var local1 = '局部1';
  var local2 = '局部2';
  
  function inner() {
    // 直接使用局部变量,避免跨作用域查找
    console.log(local1, local2);
  }
  
  inner();
}

// ✅ 缓存跨作用域的变量
function optimized() {
  var external = '外部变量';
  
  return function() {
    var cached = external; // 缓存外部变量
    console.log(cached);
    console.log(cached);
    console.log(cached);
  };
}
```

## 作用域与内存管理

作用域会影响变量的生命周期和内存管理。

```javascript
// 变量生命周期
function memoryExample() {
  var temp = '临时变量';
  console.log(temp);
  // temp 在函数执行后被垃圾回收
}

memoryExample();

// 闭包中的内存管理
function closureMemory() {
  var largeData = new Array(1000000).fill('data');
  
  return function() {
    console.log('使用闭包');
    // largeData 不会被垃圾回收,因为闭包保持了引用
  };
}

var closure = closureMemory();
// 如果不再需要,手动释放
closure = null;
```

## 作用域的常见陷阱

### 1. 块级作用域中的函数声明

```javascript
// 非严格模式下,函数声明会提升到块外
if (true) {
  function test() {
    console.log('块内');
  }
}

test(); // 输出: 块内

// 严格模式下,函数声明会被限制在块内
'use strict';

if (true) {
  function testStrict() {
    console.log('严格模式块内');
  }
  testStrict(); // 输出: 严格模式块内
}

// testStrict(); // 报错: testStrict is not defined
```

### 2. eval 创建的作用域

```javascript
// eval 会创建新的作用域
var x = 10;

function testEval() {
  var x = 20;
  eval('console.log(x);'); // 20
}

testEval();

// 严格模式下,eval 有独立作用域
'use strict';

function testEvalStrict() {
  var x = 20;
  eval('var x = 30;');
  console.log(x); // 20 (eval 中的 x 不影响外层)
}

testEvalStrict();
```

### 3. with 语句的作用域

```javascript
// with 语句创建的对象作用域（不推荐使用）
var obj = { a: 1, b: 2 };

with (obj) {
  console.log(a); // 1
  console.log(b); // 2
  var c = 3; // c 被添加到全局作用域
}

console.log(c); // 3
```

## 现代开发中的作用域

### 1. 模块系统

```javascript
// ES6 模块创建独立作用域
// module.js
export const moduleVar = '模块变量';
export function moduleFunction() {
  return '模块函数';
}

// main.js
import { moduleVar, moduleFunction } from './module.js';
console.log(moduleVar);
console.log(moduleFunction());
```

### 2. 类的作用域

```javascript
class MyClass {
  constructor() {
    this.publicVar = '公共变量';
    var privateVar = '私有变量'; // 传统私有方式
  }
  
  publicMethod() {
    console.log(this.publicVar);
    // console.log(privateVar); // 报错
  }
  
  // 私有字段（ES2022）
  #privateField = '私有字段';
  
  getPrivate() {
    return this.#privateField;
  }
}

const instance = new MyClass();
console.log(instance.publicVar);
// console.log(instance.#privateField); // 报错
console.log(instance.getPrivate());
```

## 调试作用域

### 1. 使用调试器

```javascript
function debugScope() {
  var x = 1;
  var y = 2;
  
  var inner = function() {
    var z = 3;
    debugger; // 在此处暂停,可以查看作用域链
    console.log(x + y + z);
  };
  
  inner();
}

debugScope();
```

### 2. 使用 console.dir

```javascript
var obj = { name: '对象', value: 42 };
console.dir(obj);
```

### 3. 使用闭包检查

```javascript
function createClosure() {
  var secret = '秘密';
  
  return function() {
    return secret;
  };
}

var closure = createClosure();
console.dir(closure);
// 可以在控制台看到 [[Scopes]] 属性
```

## 总结

作用域是 JavaScript 中理解变量访问和内存管理的关键概念:

1. **三种作用域**
   - 全局作用域: 任何地方都可以访问
   - 函数作用域: 函数内部可访问
   - 块级作用域: 块语句内可访问（ES6）

2. **var、let、const 的区别**
   - `var`: 函数作用域,变量提升,可重复声明
   - `let`: 块级作用域,临时死区,不可重复声明
   - `const`: 块级作用域,临时死区,不可重复声明和重新赋值

3. **作用域链**
   - 从内向外查找变量
   - 当前作用域 → 外层作用域 → 全局作用域

4. **最佳实践**
   - 优先使用 `const`,其次使用 `let`,避免使用 `var`
   - 避免全局变量污染
   - 合理使用闭包
   - 注意循环中的闭包问题

掌握作用域对于编写清晰、可维护、无错误的 JavaScript 代码至关重要。深入理解作用域机制,能够帮助你更好地理解闭包、模块化等重要概念。
