# this 指向

## this 是什么

`this` 是 JavaScript 中的一个关键字，它在函数执行时指向一个对象。`this` 的值取决于函数是如何被调用的，而不是函数在哪里定义的。

### this 的作用

```javascript
// this 提供了一种在函数内部访问调用上下文的方式
function showThis() {
  console.log(this);
}

showThis(); // Window (浏览器) 或 global (Node.js)

const obj = {
  name: '张三',
  showThis() {
    console.log(this); // obj
  }
};

obj.showThis();
```

## this 的绑定规则

### 1. 默认绑定（Default Binding）

当函数独立调用时，`this` 指向全局对象（浏览器中是 `window`，Node.js 中是 `global`）。

```javascript
// 非严格模式
function foo() {
  console.log(this); // Window (浏览器)
}

foo();

// 严格模式
'use strict';

function bar() {
  console.log(this); // undefined
}

bar();

// 立即执行函数
(function() {
  console.log(this); // Window (非严格模式)
})();

// 定时器
setTimeout(function() {
  console.log(this); // Window
}, 1000);
```

### 2. 隐式绑定（Implicit Binding）

当函数作为对象的方法调用时，`this` 指向该对象。

```javascript
const person = {
  name: '张三',
  
  sayName() {
    console.log(this.name); // '张三'
  },
  
  greet() {
    console.log(`你好, 我是 ${this.name}`);
  }
};

person.sayName(); // '张三'
person.greet(); // '你好, 我是 张三'

// 嵌套对象
const parent = {
  name: '父对象',
  child: {
    name: '子对象',
    sayName() {
      console.log(this.name); // '子对象'
    }
  }
};

parent.child.sayName(); // '子对象'
```

### 隐式丢失

当函数引用被赋值给变量或作为参数传递时，`this` 会丢失。

```javascript
const person = {
  name: '张三',
  
  sayName() {
    console.log(this.name);
  }
};

const func = person.sayName;
func(); // undefined (this 丢失)

// 作为参数传递
function execute(fn) {
  fn();
}

execute(person.sayName); // undefined (this 丢失)

// 数组方法
const arr = [person.sayName];
arr[0](); // undefined (this 丢失)

// 延迟执行
setTimeout(person.sayName, 1000); // undefined (this 丢失)
```

### 3. 显式绑定（Explicit Binding）

使用 `call`、`apply`、`bind` 方法显式指定 `this` 的指向。

```javascript
function greet() {
  console.log(`你好, 我是 ${this.name}`);
}

const person = { name: '张三' };

// call - 逐个传递参数
greet.call(person); // '你好, 我是 张三'

// apply - 使用数组传递参数
greet.apply(person); // '你好, 我是 张三'

// bind - 返回新函数
const boundGreet = greet.bind(person);
boundGreet(); // '你好, 我是 张三'

// 传递参数
function sayHello(greeting, punctuation) {
  console.log(`${greeting}, 我是 ${this.name}${punctuation}`);
}

sayHello.call(person, '早上好', '！'); // '早上好, 我是 张三！'
sayHello.apply(person, ['晚上好', '～']); // '晚上好, 我是 张三～'

const boundSayHello = sayHello.bind(person, '你好');
boundSayHello('！'); // '你好, 我是 张三！'
```

### 4. new 绑定（New Binding）

使用 `new` 调用构造函数时，`this` 指向新创建的对象。

```javascript
function Person(name) {
  this.name = name;
  this.sayName = function() {
    console.log(this.name);
  };
}

const person1 = new Person('张三');
person1.sayName(); // '张三'

const person2 = new Person('李四');
person2.sayName(); // '李四'

console.log(person1 instanceof Person); // true
console.log(person1.constructor === Person); // true
```

### 5. 箭头函数绑定（Arrow Function Binding）

箭头函数没有自己的 `this`，它继承外层作用域的 `this`。

```javascript
const obj = {
  name: '张三',
  
  // 箭头函数 - 继承外层 this
  arrowFn: () => {
    console.log(this); // Window 或 undefined
  },
  
  // 普通函数 - this 指向 obj
  normalFn() {
    console.log(this); // obj
  }
};

obj.arrowFn(); // Window 或 undefined
obj.normalFn(); // obj

// 在回调中使用箭头函数
const person = {
  name: '张三',
  
  init() {
    // 箭头函数继承 init 的 this
    setTimeout(() => {
      console.log(this.name); // '张三'
    }, 1000);
  }
};

person.init();

// 对比：普通函数在回调中 this 丢失
const person2 = {
  name: '李四',
  
  init() {
    // 普通函数 this 指向 window
    setTimeout(function() {
      console.log(this.name); // undefined
    }, 1000);
  }
};
```

## this 绑定优先级

### 优先级规则

```
new 绑定 > bind 显式绑定 > call/apply 显式绑定 > 隐式绑定 > 默认绑定
```

### 优先级演示

```javascript
// 1. new 绑定 > 显式绑定
function Person(name) {
  this.name = name;
}

const person = {};
const boundPerson = Person.bind(person);
const newPerson = new boundPerson('张三');

console.log(newPerson.name); // '张三' (new 绑定优先)
console.log(person.name); // undefined

// 2. 显式绑定 > 隐式绑定
function greet() {
  console.log(this.name);
}

const obj1 = { name: '张三' };
const obj2 = { name: '李四' };

obj1.greet = greet;
obj1.greet.call(obj2); // '李四' (显式绑定优先)

// 3. 隐式绑定 > 默认绑定
const obj3 = { name: '王五' };

obj3.greet = greet;
obj3.greet(); // '王五' (隐式绑定优先)

// 4. 箭头函数无法被改变
const obj4 = {
  name: '赵六',
  arrowFn: () => {
    console.log(this.name);
  }
};

const func = obj4.arrowFn;
func.call({ name: '测试' }); // undefined (箭头函数无法改变 this)
```

## 常见场景中的 this

### 1. DOM 事件处理

```javascript
const button = document.querySelector('button');

// 方式 1：普通函数 - this 指向触发事件的元素
button.addEventListener('click', function() {
  console.log(this); // button 元素
  console.log(this.textContent);
});

// 方式 2：箭头函数 - this 继承外层
button.addEventListener('click', () => {
  console.log(this); // Window
});

// 方式 3：使用 bind 保持 this
const handler = {
  message: '按钮被点击',
  
  handleClick(event) {
    console.log(this.message); // '按钮被点击'
    console.log(event.target); // button 元素
  }
};

button.addEventListener('click', handler.handleClick.bind(handler));
```

### 2. 定时器

```javascript
const person = {
  name: '张三',
  
  // 使用箭头函数保持 this
  setTimeoutArrow() {
    setTimeout(() => {
      console.log(this.name); // '张三'
    }, 1000);
  },
  
  // 使用 bind 保持 this
  setTimeoutBind() {
    setTimeout(function() {
      console.log(this.name); // '张三'
    }.bind(this), 1000);
  },
  
  // 使用闭包保持 this
  setTimeoutClosure() {
    const self = this;
    setTimeout(function() {
      console.log(self.name); // '张三'
    }, 1000);
  }
};
```

### 3. 数组方法

```javascript
const person = {
  name: '张三',
  skills: ['JavaScript', 'HTML', 'CSS'],
  
  // 使用箭头函数
  showSkillsArrow() {
    this.skills.forEach(skill => {
      console.log(`${this.name} 擅长 ${skill}`);
    });
  },
  
  // 使用 bind
  showSkillsBind() {
    this.skills.forEach(function(skill) {
      console.log(`${this.name} 擅长 ${skill}`);
    }.bind(this));
  },
  
  // 传递 thisArg
  showSkillsThisArg() {
    this.skills.forEach(function(skill) {
      console.log(`${this.name} 擅长 ${skill}`);
    }, this);
  }
};

person.showSkillsArrow();
person.showSkillsBind();
person.showSkillsThisArg();
```

### 4. 回调函数

```javascript
class Component {
  constructor() {
    this.name = '组件';
  }
  
  // 使用箭头函数
  handleEventArrow(callback) {
    callback(() => {
      console.log(this.name); // '组件'
    });
  },
  
  // 使用 bind
  handleEventBind(callback) {
    callback(function() {
      console.log(this.name); // '组件'
    }.bind(this));
  }
}

const component = new Component();

component.handleEventArrow(fn => fn());
component.handleEventBind(fn => fn());
```

## 常见误区

### 误区 1：this 指向函数定义的对象

```javascript
// 错误理解
const obj = {
  name: '张三',
  
  init() {
    function showName() {
      // 这里 this 不指向 obj
      console.log(this.name); // undefined
    }
    
    showName();
  }
};

obj.init();

// 正确理解：this 取决于函数如何调用
const obj2 = {
  name: '李四',
  
  init() {
    const showName = () => {
      // 箭头函数继承外层 this
      console.log(this.name); // '李四'
    };
    
    showName();
  }
};

obj2.init();
```

### 误区 2：嵌套函数中的 this 会自动继承

```javascript
const obj = {
  name: '张三',
  
  outer() {
    console.log(this.name); // '张三'
    
    function inner() {
      // this 不会自动继承 outer 的 this
      console.log(this.name); // undefined
    }
    
    inner();
  }
};

obj.outer();

// 正确做法：使用箭头函数或 bind
const obj2 = {
  name: '李四',
  
  outer() {
    console.log(this.name); // '李四'
    
    const inner = () => {
      // 箭头函数继承 this
      console.log(this.name); // '李四'
    };
    
    inner();
  }
};

obj2.outer();
```

### 误区 3：箭头函数的 this 可以被改变

```javascript
const obj = {
  name: '张三',
  arrowFn: () => {
    console.log(this.name);
  }
};

const func = obj.arrowFn;

// 箭头函数的 this 无法被 call/apply/bind 改变
func.call({ name: '李四' }); // undefined
func.apply({ name: '李四' }); // undefined
func.bind({ name: '李四' })(); // undefined
```

### 误区 4：在类方法中使用普通函数不会丢失 this

```javascript
class Counter {
  constructor() {
    this.count = 0;
  }
  
  increment() {
    this.count++;
    console.log(this.count);
  }
  
  // 错误：this 可能丢失
  badMount() {
    document.addEventListener('click', this.increment);
  },
  
  // 正确 1：使用箭头函数
  goodMount1() {
    document.addEventListener('click', () => this.increment());
  },
  
  // 正确 2：使用 bind
  goodMount2() {
    document.addEventListener('click', this.increment.bind(this));
  },
  
  // 正确 3：使用属性初始化器
  incrementArrow = () => {
    this.count++;
    console.log(this.count);
  };
}
```

## 实际应用案例

### 案例 1：实现 bind

```javascript
Function.prototype.myBind = function(thisArg, ...boundArgs) {
  const fn = this;
  
  function boundFn(...args) {
    // 判断是否作为构造函数调用
    const isNewCall = new.target !== undefined;
    
    // 如果是构造函数调用，this 指向新创建的对象
    // 否则使用绑定的 thisArg
    const thisValue = isNewCall ? this : thisArg;
    
    return fn.apply(thisValue, [...boundArgs, ...args]);
  }
  
  // 保持原型链
  boundFn.prototype = Object.create(fn.prototype);
  
  return boundFn;
};

// 测试
function Person(name) {
  this.name = name;
}

const boundPerson = Person.myBind(null, '张三');
const person = new boundPerson();
console.log(person.name); // '张三'
```

### 案例 2：实现 call

```javascript
Function.prototype.myCall = function(thisArg, ...args) {
  // 如果 thisArg 是 null 或 undefined，使用全局对象
  const context = thisArg === null || thisArg === undefined ? 
    globalThis : Object(thisArg);
  
  // 创建唯一属性，避免冲突
  const fn = Symbol('fn');
  context[fn] = this;
  
  // 调用函数
  const result = context[fn](...args);
  
  // 删除属性
  delete context[fn];
  
  return result;
};

// 测试
function greet(greeting) {
  console.log(`${greeting}, 我是 ${this.name}`);
}

const person = { name: '张三' };
greet.myCall(person, '你好'); // '你好, 我是 张三'
```

### 案例 3：实现 apply

```javascript
Function.prototype.myApply = function(thisArg, argsArray) {
  // 如果 thisArg 是 null 或 undefined，使用全局对象
  const context = thisArg === null || thisArg === undefined ? 
    globalThis : Object(thisArg);
  
  // 创建唯一属性
  const fn = Symbol('fn');
  context[fn] = this;
  
  // 调用函数
  const result = context[fn](...(argsArray || []));
  
  // 删除属性
  delete context[fn];
  
  return result;
};

// 测试
function greet(greeting, punctuation) {
  console.log(`${greeting}, 我是 ${this.name}${punctuation}`);
}

const person = { name: '李四' };
greet.myApply(person, ['早上好', '！']); // '早上好, 我是 李四！'
```

### 案例 4：事件委托

```javascript
class EventDelegator {
  constructor(container) {
    this.container = container;
    this.handlers = new Map();
  }
  
  on(eventName, selector, handler) {
    const wrappedHandler = function(event) {
      const target = event.target.closest(selector);
      
      if (target && this.container.contains(target)) {
        handler.call(target, event);
      }
    }.bind(this);
    
    this.container.addEventListener(eventName, wrappedHandler);
    
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    
    this.handlers.get(eventName).push({ 
      selector, 
      handler, 
      wrappedHandler 
    });
  }
  
  off(eventName, selector, handler) {
    const handlers = this.handlers.get(eventName);
    
    if (!handlers) return;
    
    const index = handlers.findIndex(
      h => h.selector === selector && h.handler === handler
    );
    
    if (index !== -1) {
      const { wrappedHandler } = handlers[index];
      this.container.removeEventListener(eventName, wrappedHandler);
      handlers.splice(index, 1);
    }
  }
}

// 使用
const delegator = new EventDelegator(document.body);

delegator.on('click', '.button', function(event) {
  console.log('按钮被点击:', this.textContent);
});

delegator.on('change', '.input', function(event) {
  console.log('输入框改变:', this.value);
});
```

### 案例 5：观察者模式

```javascript
class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  on(eventName, handler) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    
    // 保存原始 handler 用于移除
    const wrappedHandler = handler.bind(this);
    handler._wrapped = wrappedHandler;
    
    this.events[eventName].push(wrappedHandler);
  }
  
  off(eventName, handler) {
    if (!this.events[eventName]) return;
    
    const wrappedHandler = handler._wrapped;
    const index = this.events[eventName].indexOf(wrappedHandler);
    
    if (index !== -1) {
      this.events[eventName].splice(index, 1);
    }
  }
  
  emit(eventName, ...args) {
    if (!this.events[eventName]) return;
    
    this.events[eventName].forEach(handler => {
      handler(...args);
    });
  }
}

// 使用
class Component extends EventEmitter {
  constructor(name) {
    super();
    this.name = name;
  }
  
  doSomething() {
    console.log(`${this.name} 正在执行操作...`);
    this.emit('action', this.name);
  }
}

const component = new Component('组件 A');

component.on('action', function(componentName) {
  console.log(`收到事件: ${componentName}`);
  console.log(`当前组件: ${this.name}`);
});

component.doSomething();
```

## 最佳实践

### 1. 优先使用箭头函数

```javascript
// 好的做法 - 使用箭头函数
const person = {
  name: '张三',
  
  showName() {
    setTimeout(() => {
      console.log(this.name); // '张三'
    }, 1000);
  }
};

// 避免 - 使用传统函数 + bind
const person2 = {
  name: '李四',
  
  showName() {
    setTimeout(function() {
      console.log(this.name); // undefined
    }.bind(this), 1000);
  }
};
```

### 2. 在类中使用箭头函数属性

```javascript
class Counter {
  constructor() {
    this.count = 0;
  }
  
  // 推荐 - 使用箭头函数属性
  increment = () => {
    this.count++;
    console.log(this.count);
  };
  
  mount() {
    document.addEventListener('click', this.increment);
  }
}

const counter = new Counter();
counter.mount();
```

### 3. 使用 call/apply 改变 this

```javascript
// 借用数组方法
const arrayLike = { 0: 'a', 1: 'b', length: 2 };
const array = Array.prototype.slice.call(arrayLike);

// 使用 Math.max
const numbers = [1, 5, 3, 2, 4];
const max = Math.max.apply(null, numbers);
```

### 4. 避免在循环中创建函数

```javascript
// 不好的做法 - 每次循环都创建新函数
for (let i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', function() {
    console.log(i);
  }.bind(this));
}

// 好的做法 - 使用事件委托
container.addEventListener('click', (event) => {
  const button = event.target.closest('.button');
  if (button) {
    console.log(button.dataset.index);
  }
});
```

### 5. 明确 this 的指向

```javascript
// 好的做法 - 明确 this
const handler = {
  message: '点击事件',
  
  handleClick(event) {
    console.log(this.message);
  },
  
  init() {
    document.addEventListener('click', this.handleClick.bind(this));
  }
};

// 或者使用箭头函数
const handler2 = {
  message: '点击事件',
  
  init() {
    document.addEventListener('click', (event) => {
      this.handleClick(event);
    });
  },
  
  handleClick(event) {
    console.log(this.message);
  }
};
```

## 常见问题

### Q: 严格模式和非严格模式下的 this 有什么区别？

A: 严格模式下，普通函数的 `this` 默认为 `undefined`；非严格模式下，`this` 默认为全局对象。

### Q: 箭头函数中的 this 是如何确定的？

A: 箭头函数没有自己的 `this`，它继承外层作用域的 `this`，无法通过 `call`、`apply`、`bind` 改变。

### Q: 如何判断一个函数中的 this 指向什么？

A: 根据调用方式判断：
1. `new` 调用：指向新创建的对象
2. `call`、`apply`、`bind`：指向指定的对象
3. 对象方法调用：指向该对象
4. 箭头函数：继承外层作用域
5. 独立调用：指向全局对象或 `undefined`

### Q: 什么时候应该使用箭头函数，什么时候使用普通函数？

A:
- 回调函数、需要保持 `this` 时使用箭头函数
- 定义方法、需要动态 `this` 时使用普通函数

### Q: 为什么在回调中 this 会丢失？

A: 因为回调函数的调用方式通常是独立调用，而不是作为对象的方法调用，所以 `this` 指向全局对象或 `undefined`。

### Q: bind、call、apply 的返回值有什么区别？

A: `call` 和 `apply` 立即执行函数并返回函数的返回值；`bind` 返回一个新函数，需要手动调用。

### Q: 如何在回调中使用正确的 this？

A: 使用箭头函数、`bind` 方法，或将 `this` 保存到变量中（如 `self`、`that`）。

## 总结

### this 的绑定规则

1. **默认绑定**：独立调用，指向全局对象或 `undefined`
2. **隐式绑定**：作为对象方法调用，指向该对象
3. **显式绑定**：使用 `call`、`apply`、`bind`，指向指定的对象
4. **new 绑定**：作为构造函数调用，指向新创建的对象
5. **箭头函数**：继承外层作用域的 `this`

### 优先级

```
new 绑定 > bind 显式绑定 > call/apply 显式绑定 > 隐式绑定 > 默认绑定
```

### 最佳实践

1. 优先使用箭头函数保持 `this`
2. 在类中使用箭头函数属性
3. 使用 `call`、`apply`、`bind` 改变 `this`
4. 避免在循环中创建大量函数
5. 明确 `this` 的指向

### 避免误区

1. `this` 不指向函数定义的对象
2. 嵌套函数的 `this` 不会自动继承
3. 箭头函数的 `this` 无法被改变
4. 在类方法中要注意 `this` 丢失

掌握 `this` 的指向规则，可以让你更准确地理解和使用 JavaScript 中的函数调用。记住：**`this` 的值取决于函数如何被调用，而不是函数在哪里定义。**