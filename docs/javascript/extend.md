# JavaScript 如何实现继承

### 1. 继承的概念

继承是面向对象编程（OOP）的核心概念之一，它允许一个对象获取另一个对象的属性和方法。在 JavaScript 中，继承主要通过原型链和 ES6 的 class 语法来实现。

### 2. 原型链继承

原型链是 JavaScript 实现继承的最基本方式。每个对象都有一个内部指针 `[[Prototype]]`（通过 `__proto__` 访问），指向其原型对象。

#### 2.1 基本实现

```javascript
function Parent() {
  this.name = 'parent';
  this.colors = ['red', 'blue', 'green'];
}

Parent.prototype.sayName = function() {
  console.log(this.name);
};

function Child() {}

// 实现继承：将 Child 的原型指向 Parent 的实例
Child.prototype = new Parent();

const child1 = new Child();
const child2 = new Child();

console.log(child1.name);  // 'parent'
child1.sayName();          // 'parent'

// 问题：引用类型属性被所有实例共享
child1.colors.push('yellow');
console.log(child2.colors);  // ['red', 'blue', 'green', 'yellow']
```

#### 2.2 原型链继承的问题

1. **引用类型属性被共享**：所有实例共享原型上的引用类型属性
2. **无法向父构造函数传递参数**：创建子类实例时无法向父构造函数传参

### 3. 构造函数继承

构造函数继承通过在子类构造函数中调用父类构造函数来实现继承。

#### 3.1 基本实现

```javascript
function Parent(name) {
  this.name = name;
  this.colors = ['red', 'blue', 'green'];
}

function Child(name) {
  // 调用父类构造函数，绑定 this
  Parent.call(this, name);
}

const child1 = new Child('child1');
const child2 = new Child('child2');

// 解决了引用类型共享的问题
child1.colors.push('yellow');
console.log(child1.colors);  // ['red', 'blue', 'green', 'yellow']
console.log(child2.colors);  // ['red', 'blue', 'green']

// 可以向父构造函数传递参数
console.log(child1.name);  // 'child1'
console.log(child2.name);  // 'child2'
```

#### 3.2 构造函数继承的问题

1. **方法必须在构造函数中定义**：导致每次创建实例都要重新创建方法
2. **无法继承原型上的方法**：只能继承构造函数中定义的属性和方法

```javascript
function Parent() {
  this.sayName = function() {
    console.log(this.name);
  };
}

// 方法无法复用
console.log(child1.sayName === child2.sayName);  // false
```

### 4. 组合继承

组合继承结合了原型链继承和构造函数继承的优点，是 JavaScript 中常用的继承方式。

#### 4.1 基本实现

```javascript
function Parent(name) {
  this.name = name;
  this.colors = ['red', 'blue', 'green'];
}

Parent.prototype.sayName = function() {
  console.log(this.name);
};

function Child(name, age) {
  // 构造函数继承：继承实例属性
  Parent.call(this, name);
  this.age = age;
}

// 原型链继承：继承原型方法
Child.prototype = new Parent();
Child.prototype.constructor = Child;  // 修复构造函数指向

Child.prototype.sayAge = function() {
  console.log(this.age);
};

const child1 = new Child('child1', 18);
const child2 = new Child('child2', 20);

child1.colors.push('yellow');
console.log(child1.colors);  // ['red', 'blue', 'green', 'yellow']
console.log(child2.colors);  // ['red', 'blue', 'green']

child1.sayName();  // 'child1'
child1.sayAge();   // 18
```

#### 4.2 组合继承的问题

```javascript
// 问题：父类构造函数被调用了两次
const child = new Child('test', 10);
// 第一次：Child.prototype = new Parent()
// 第二次：Parent.call(this, name)

console.log(child.__proto__);  // Parent { name: undefined, colors: [...] }
```

### 5. 原型式继承

原型式继承不使用构造函数，而是基于已有对象创建新对象。

#### 5.1 基本实现

```javascript
function object(o) {
  function F() {}
  F.prototype = o;
  return new F();
}

const parent = {
  name: 'parent',
  colors: ['red', 'blue', 'green']
};

const child1 = object(parent);
const child2 = object(parent);

child1.name = 'child1';
child1.colors.push('yellow');

console.log(child1.name);   // 'child1'
console.log(child2.name);   // 'parent'
console.log(child2.colors); // ['red', 'blue', 'green', 'yellow']
```

#### 5.2 Object.create()

ES5 提供了 `Object.create()` 方法实现原型式继承：

```javascript
const parent = {
  name: 'parent',
  colors: ['red', 'blue', 'green']
};

const child = Object.create(parent, {
  name: {
    value: 'child',
    enumerable: true,
    configurable: true,
    writable: true
  }
});

console.log(child.name);  // 'child'
console.log(child.colors); // ['red', 'blue', 'green']
```

### 6. 寄生式继承

寄生式继承是在原型式继承的基础上，通过创建对象并增强对象的功能来实现继承。

#### 6.1 基本实现

```javascript
function createObject(o) {
  const clone = Object.create(o);
  
  // 增强对象
  clone.sayHi = function() {
    console.log('Hi, ' + this.name);
  };
  
  return clone;
}

const parent = {
  name: 'parent',
  colors: ['red', 'blue', 'green']
};

const child = createObject(parent);
child.sayHi();  // 'Hi, parent'
```

### 7. 寄生组合继承

寄生组合继承是组合继承的优化版本，解决了父类构造函数被调用两次的问题。

#### 7.1 基本实现

```javascript
function Parent(name) {
  this.name = name;
  this.colors = ['red', 'blue', 'green'];
}

Parent.prototype.sayName = function() {
  console.log(this.name);
};

function Child(name, age) {
  Parent.call(this, name);
  this.age = age;
}

// 核心优化：使用 Object.create 继承原型
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;

Child.prototype.sayAge = function() {
  console.log(this.age);
};

const child = new Child('child', 18);

console.log(child instanceof Child);   // true
console.log(child instanceof Parent);  // true
console.log(child.__proto__);  // Parent {}，没有多余的属性
```

#### 7.2 工具函数

```javascript
function inheritPrototype(child, parent) {
  const prototype = Object.create(parent.prototype);
  prototype.constructor = child;
  child.prototype = prototype;
}

// 使用示例
function Parent(name) {
  this.name = name;
}

function Child(name, age) {
  Parent.call(this, name);
  this.age = age;
}

inheritPrototype(Child, Parent);
```

### 8. ES6 Class 继承

ES6 引入了 `class` 语法糖，提供了更简洁的继承方式。

#### 8.1 基本语法

```javascript
class Parent {
  constructor(name) {
    this.name = name;
    this.colors = ['red', 'blue', 'green'];
  }

  sayName() {
    console.log(this.name);
  }

  static staticMethod() {
    console.log('This is a static method');
  }
}

class Child extends Parent {
  constructor(name, age) {
    // 必须调用 super()
    super(name);
    this.age = age;
  }

  sayAge() {
    console.log(this.age);
  }

  // 重写父类方法
  sayName() {
    super.sayName();  // 调用父类方法
    console.log(`Age: ${this.age}`);
  }
}

const child = new Child('child', 18);
child.sayName();  // 'child' \n 'Age: 18'
child.sayAge();   // 18
```

#### 8.2 类的静态方法继承

```javascript
class Parent {
  static staticMethod() {
    console.log('Parent static method');
  }
}

class Child extends Parent {
  static staticMethod() {
    super.staticMethod();
    console.log('Child static method');
  }
}

Child.staticMethod();
// 'Parent static method'
// 'Child static method'
```

#### 8.3 getter 和 setter 继承

```javascript
class Parent {
  constructor(name) {
    this._name = name;
  }

  get name() {
    return this._name;
  }

  set name(value) {
    this._name = value;
  }
}

class Child extends Parent {
  get name() {
    return super.name.toUpperCase();
  }
}

const child = new Child('child');
console.log(child.name);  // 'CHILD'
```

### 9. 继承方式对比

| 继承方式 | 优点 | 缺点 |
|---------|------|------|
| 原型链继承 | 简单 | 引用类型共享，无法传参 |
| 构造函数继承 | 可以传参，解决引用共享 | 方法无法复用，无法继承原型 |
| 组合继承 | 结合两者优点 | 父类构造函数调用两次 |
| 原型式继承 | 简单，适用于对象创建 | 引用类型共享 |
| 寄生式继承 | 可以增强对象 | 和原型式继承一样的问题 |
| 寄生组合继承 | 完美继承，无多余调用 | 稍微复杂 |
| ES6 Class | 语法简洁，易读 | 需要转译，兼容性考虑 |

### 10. 实际应用场景

#### 10.1 组件继承（React）

```javascript
class BaseComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: null
    };
  }

  async fetchData() {
    this.setState({ loading: true });
    try {
      const data = await this.fetchDataImplementation();
      this.setState({ data, loading: false });
    } catch (error) {
      this.setState({ error, loading: false });
    }
  }

  fetchDataImplementation() {
    throw new Error('Must implement fetchDataImplementation');
  }

  render() {
    if (this.state.loading) return <Loading />;
    if (this.state.error) return <Error />;
    return this.renderContent();
  }

  renderContent() {
    throw new Error('Must implement renderContent');
  }
}

class UserList extends BaseComponent {
  constructor(props) {
    super(props);
    this.state.data = [];
  }

  async fetchDataImplementation() {
    const response = await fetch('/api/users');
    return response.json();
  }

  renderContent() {
    return (
      <ul>
        {this.state.data.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    );
  }
}
```

#### 10.2 模型继承

```javascript
class BaseModel {
  constructor(data = {}) {
    this.id = data.id;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  save() {
    // 保存逻辑
    console.log('Saving:', this.toJSON());
  }

  toJSON() {
    return { ...this };
  }
}

class User extends BaseModel {
  constructor(data = {}) {
    super(data);
    this.username = data.username;
    this.email = data.email;
    this.password = data.password;
  }

  validate() {
    if (!this.username || !this.email) {
      throw new Error('Username and email are required');
    }
  }
}

class Product extends BaseModel {
  constructor(data = {}) {
    super(data);
    this.name = data.name;
    this.price = data.price;
    this.stock = data.stock;
  }

  calculateDiscount(percentage) {
    return this.price * (1 - percentage / 100);
  }
}
```

#### 10.3 工具类继承

```javascript
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return this;
  }

  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach(listener => {
        listener.apply(this, args);
      });
    }
    return this;
  }

  off(event, listener) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(l => l !== listener);
    }
    return this;
  }
}

class Timer extends EventEmitter {
  constructor() {
    super();
    this.timerId = null;
    this.currentTime = 0;
  }

  start() {
    this.timerId = setInterval(() => {
      this.currentTime++;
      this.emit('tick', this.currentTime);
    }, 1000);
    this.emit('start');
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
      this.emit('stop', this.currentTime);
    }
  }
}

// 使用
const timer = new Timer();
timer.on('tick', time => console.log('Tick:', time));
timer.on('stop', time => console.log('Stopped at:', time));
timer.start();
// 3秒后
timer.stop();
```

### 11. 最佳实践

#### 11.1 优先使用 ES6 Class

```javascript
// ✅ 推荐
class Parent { }
class Child extends Parent { }

// ❌ 不推荐（除非需要兼容旧环境）
function Parent() { }
function Child() { }
Child.prototype = new Parent();
```

#### 11.2 遵循单一职责原则

```javascript
// ✅ 好：每个类职责单一
class Vehicle {
  constructor(speed) {
    this.speed = speed;
  }
}

class Car extends Vehicle {
  constructor(speed, brand) {
    super(speed);
    this.brand = brand;
  }
}

class ElectricCar extends Car {
  constructor(speed, brand, battery) {
    super(speed, brand);
    this.battery = battery;
  }
}

// ❌ 不好：职责混乱
class Vehicle {
  constructor(speed, brand, battery, flying, underwater) {
    this.speed = speed;
    this.brand = brand;
    this.battery = battery;
    this.flying = flying;
    this.underwater = underwater;
  }
}
```

#### 11.3 正确使用 super()

```javascript
class Child extends Parent {
  constructor(name, age) {
    // ✅ 必须在使用 this 之前调用 super()
    super(name);
    this.age = age;
  }
  
  method() {
    // ✅ 调用父类方法
    super.method();
    
    // ✅ 访问父类属性
    console.log(super.name);
  }
}
```

#### 11.4 避免深层继承

```javascript
// ❌ 不好：深层继承难以维护
class A extends Base {}
class B extends A {}
class C extends B {}
class D extends C {}
class E extends D {}

// ✅ 好：使用组合替代继承
class User {
  constructor(data) {
    this.validatable = new Validatable(data);
    this.serializable = new Serializable(data);
  }
}
```

### 12. 常见问题与解决方案

#### 12.1 多重继承

JavaScript 不支持真正的多重继承，但可以通过混入（Mixin）实现：

```javascript
const Flying = {
  fly() {
    console.log('Flying');
  }
};

const Swimmable = {
  swim() {
    console.log('Swimming');
  }
};

class Animal { }

function mixin(target, ...sources) {
  Object.assign(target.prototype, ...sources);
}

mixin(Animal, Flying, Swimmable);

const animal = new Animal();
animal.fly();    // 'Flying'
animal.swim();   // 'Swimming'
```

#### 12.2 继承内置对象

```javascript
// ✅ 正确方式
class MyArray extends Array {
  get first() {
    return this[0];
  }

  get last() {
    return this[this.length - 1];
  }
}

const arr = new MyArray(1, 2, 3, 4, 5);
console.log(arr.first);  // 1
console.log(arr.last);   // 5
```

#### 12.3 检测继承关系

```javascript
class Parent { }
class Child extends Parent { }

const child = new Child();

console.log(child instanceof Child);    // true
console.log(child instanceof Parent);   // true
console.log(child instanceof Object);   // true

console.log(Child.prototype.isPrototypeOf(child));  // true
console.log(Parent.prototype.isPrototypeOf(child)); // true
```

### 13. 总结

JavaScript 提供了多种实现继承的方式，从早期的原型链继承到现代的 ES6 Class 继承：

1. **原型链继承**：简单但有问题，适合简单场景
2. **构造函数继承**：可以传参但方法无法复用
3. **组合继承**：结合两者优点但有性能问题
4. **寄生组合继承**：最优的原型继承方式
5. **ES6 Class 继承**：推荐的现代继承方式

选择继承方式时，应该：
- 优先使用 ES6 Class 语法
- 避免过深的继承层次
- 必要时使用组合替代继承
- 遵循单一职责原则

理解 JavaScript 的继承机制对于编写可维护、可扩展的代码至关重要。在实际开发中，应该根据项目需求和团队规范选择合适的继承方式。