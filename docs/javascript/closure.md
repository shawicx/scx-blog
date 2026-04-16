# 闭包

## 什么是闭包

闭包（Closure）是 JavaScript 中一个重要且强大的特性。简单来说，闭包是指一个函数可以记住并访问其词法作用域，即使该函数在其词法作用域之外执行。

当一个函数返回另一个函数时，返回的函数会保留对外层函数作用域的访问能力，这就形成了闭包。

## 闭包的基本原理

### 词法作用域

JavaScript 使用词法作用域（静态作用域），这意味着函数在定义时就决定了作用域，而不是在调用时。

```javascript
function outer() {
  const outerVar = '外部变量';

  function inner() {
    console.log(outerVar);
  }

  return inner;
}

const closureFunc = outer();
closureFunc(); // 输出: 外部变量
```

在这个例子中，`inner` 函数在定义时就能够访问 `outerVar`，即使它在 `outer` 函数外部被调用。

## 闭包的使用场景

### 1. 数据私有化

闭包可以用来创建私有变量：

```javascript
function createCounter() {
  let count = 0;

  return {
    increment() {
      count++;
      return count;
    },
    decrement() {
      count--;
      return count;
    },
    getCount() {
      return count;
    }
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.decrement()); // 1
console.log(counter.getCount());  // 1
// count 变量无法直接访问，实现了数据私有化
```

### 2. 函数工厂

闭包可以创建具有预设参数的函数：

```javascript
function makeMultiplier(multiplier) {
  return function(number) {
    return number * multiplier;
  };
}

const double = makeMultiplier(2);
const triple = makeMultiplier(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15
```

### 3. 模块模式

使用闭包创建模块：

```javascript
const module = (function() {
  let privateVar = '私有变量';

  function privateMethod() {
    console.log('私有方法');
  }

  return {
    publicMethod() {
      console.log(privateVar);
      privateMethod();
    }
  };
})();

module.publicMethod(); // 可以访问
// module.privateMethod(); // 无法访问，抛出错误
```

### 4. 保持状态

闭包可以保持函数间的状态：

```javascript
function setupGame() {
  let score = 0;
  let level = 1;

  return {
    addScore(points) {
      score += points;
      if (score >= 100 * level) {
        level++;
        console.log(`升级到第 ${level} 级！`);
      }
    },
    getStatus() {
      return { score, level };
    }
  };
}

const game = setupGame();
game.addScore(50);
game.addScore(60); // 升级到第 2 级！
console.log(game.getStatus()); // { score: 110, level: 2 }
```

## 闭包的常见陷阱

### 1. 循环中的闭包

在循环中使用闭包时要注意变量的作用域：

```javascript
// 错误示例
for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i); // 都输出 3
  }, 100);
}

// 正确示例 1: 使用 let
for (let i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i); // 输出 0, 1, 2
  }, 100);
}

// 正确示例 2: 使用立即执行函数
for (var i = 0; i < 3; i++) {
  (function(index) {
    setTimeout(() => {
      console.log(index); // 输出 0, 1, 2
    }, 100);
  })(i);
}
```

### 2. 内存泄漏

闭包会保持对外层作用域的引用，可能导致内存泄漏：

```javascript
function createLargeObject() {
  const largeData = new Array(1000000).fill('data');

  return function() {
    console.log('使用闭包');
  };
}

const closure = createLargeObject();
// largeData 仍然存在于内存中，因为闭包保持了对它的引用

// 如果不再需要，可以将闭包设为 null
closure = null;
```

## 闭包的性能考虑

闭包虽然强大，但也需要注意性能：

1. **内存占用**：闭包会保持对外层作用域的引用，占用更多内存
2. **性能开销**：访问闭包变量比访问普通变量稍慢
3. **合理使用**：只在需要时使用闭包，避免过度使用

## 箭头函数与闭包

箭头函数也可以形成闭包：

```javascript
const createAdder = (x) => (y) => x + y;

const add5 = createAdder(5);
console.log(add5(3)); // 8
console.log(add5(10)); // 15
```

## 高阶应用

### 函数柯里化

```javascript
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...more) {
      return curried.apply(this, args.concat(more));
    };
  };
}

function add(a, b, c) {
  return a + b + c;
}

const curriedAdd = curry(add);
console.log(curriedAdd(1)(2)(3)); // 6
console.log(curriedAdd(1, 2)(3)); // 6
```

### 节流与防抖

```javascript
// 防抖
function debounce(func, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// 节流
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
```

## 总结

闭包是 JavaScript 中一个强大且重要的特性，它使函数能够记住其词法作用域。闭包的主要用途包括：

- 数据私有化
- 函数工厂
- 模块模式
- 状态保持

理解闭包对于编写高质量的 JavaScript 代码至关重要，但也要注意合理使用，避免内存泄漏等性能问题。

掌握闭包将帮助你更好地理解 JavaScript 的作用域机制，编写更加优雅和高效的代码。
