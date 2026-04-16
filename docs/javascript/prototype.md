# 原型链

## 1. 原型的基本概念

### 1.1 什么是原型

原型（Prototype）是 JavaScript 中实现继承的核心机制。每个 JavaScript 对象都有一个内部属性 `[[Prototype]]`（通常称为 `__proto__`），它指向另一个对象。当访问对象的属性时，如果对象本身没有该属性，JavaScript 引擎会沿着原型链向上查找。

```javascript
const person = {
  name: 'John',
  sayHello() {
    console.log(`Hello, my name is ${this.name}`);
  }
};

console.log(person.name);      // 'John'
console.log(person.sayHello()); // 'Hello, my name is John'

// 访问不存在的属性
console.log(person.age);        // undefined
```

### 1.2 原型链的工作原理

```
实例对象
  ↓ __proto__
构造函数.prototype
  ↓ __proto__
Object.prototype
  ↓ __proto__
null
```

```javascript
// 创建对象时自动建立原型链
const obj = new Object();
console.log(obj.__proto__ === Object.prototype); // true
console.log(Object.prototype.__proto__ === null); // true
```

### 1.3 原型链的查找过程

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.sayHello = function() {
  console.log(`Hello, I'm ${this.name}`);
};

Person.prototype.greet = function() {
  console.log(`Greetings from ${this.name}`);
};

const person = new Person('Alice');

// 属性查找过程：
// 1. 先在 person 实例中查找 → 未找到
// 2. 在 Person.prototype 中查找 → 找到了！
person.sayHello(); // 'Hello, I'm Alice'
person.greet();    // 'Greetings from Alice'

// 添加实例属性
person.age = 25;
console.log(person.age); // 25 - 实例属性
```

## 2. 构造函数与原型

### 2.1 构造函数

```javascript
// 构造函数约定首字母大写
function Person(name, age) {
  // 实例属性
  this.name = name;
  this.age = age;
}

// 原型方法
Person.prototype.sayHello = function() {
  console.log(`Hello, I'm ${this.name}, ${this.age} years old`);
};

Person.prototype.getAge = function() {
  return this.age;
};

const person1 = new Person('Alice', 25);
const person2 = new Person('Bob', 30);

console.log(person1.sayHello === person2.sayHello); // true - 共享同一个方法
```

### 2.2 prototype 属性

```javascript
function Person() {}

console.log(Person.prototype); // {}
console.log(typeof Person.prototype); // 'object'

// 原型对象上的属性和方法会被所有实例共享
Person.prototype.sharedVar = 'Shared Value';

const person1 = new Person();
const person2 = new Person();

console.log(person1.sharedVar); // 'Shared Value'
console.log(person2.sharedVar); // 'Shared Value'

// 修改原型上的属性
Person.prototype.sharedVar = 'Modified';
console.log(person1.sharedVar); // 'Modified'
console.log(person2.sharedVar); // 'Modified'
```

### 2.3 constructor 属性

```javascript
function Person(name) {
  this.name = name;
}

const person = new Person('Alice');

// 每个原型对象都有一个 constructor 属性
console.log(Person.prototype.constructor === Person); // true
console.log(person.constructor === Person); // true

// 通过 constructor 创建新实例
const person2 = new person.constructor('Bob');
console.log(person2.name); // 'Bob'

// 手动设置原型时需要修复 constructor
function Dog(name) {
  this.name = name;
}

Dog.prototype = {
  sayHello() {
    console.log(`Woof! I'm ${this.name}`);
  }
};

console.log(Dog.prototype.constructor === Dog); // false
console.log(Dog.prototype.constructor === Object); // true

// 修复 constructor
Dog.prototype.constructor = Dog;
console.log(Dog.prototype.constructor === Dog); // true
```

### 2.4 __proto__ 与 prototype

```javascript
function Person() {}

const person = new Person();

console.log(person.__proto__ === Person.prototype); // true
console.log(person.constructor === Person); // true

// 获取原型对象
console.log(Object.getPrototypeOf(person) === Person.prototype); // true

// 设置原型对象
const obj = {};
Object.setPrototypeOf(obj, Person.prototype);
console.log(obj.__proto__ === Person.prototype); // true
```

## 3. 原型链的继承

### 3.1 原型链继承

```javascript
// 父构造函数
function Animal(name) {
  this.name = name;
}

Animal.prototype.eat = function() {
  console.log(`${this.name} is eating`);
};

// 子构造函数
function Dog(name, breed) {
  Animal.call(this, name); // 调用父构造函数
  this.breed = breed;
}

// 建立原型链
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

// 添加子类方法
Dog.prototype.bark = function() {
  console.log(`${this.name} says: Woof!`);
};

const dog = new Dog('Rex', 'German Shepherd');
dog.eat();  // 'Rex is eating' - 继承自 Animal
dog.bark(); // 'Rex says: Woof!' - 自身方法

console.log(dog instanceof Dog);    // true
console.log(dog instanceof Animal); // true
```

### 3.2 借用构造函数继承

```javascript
function Parent(name) {
  this.name = name;
  this.colors = ['red', 'green', 'blue'];
}

function Child(name, age) {
  Parent.call(this, name); // 借用父构造函数
  this.age = age;
}

const child1 = new Child('Alice', 10);
const child2 = new Child('Bob', 12);

// 每个实例有独立的 colors 数组
child1.colors.push('yellow');
console.log(child1.colors); // ['red', 'green', 'blue', 'yellow']
console.log(child2.colors); // ['red', 'green', 'blue']
```

### 3.3 组合继承

```javascript
function Parent(name) {
  this.name = name;
  this.colors = ['red', 'green', 'blue'];
}

Parent.prototype.sayName = function() {
  console.log(this.name);
};

function Child(name, age) {
  Parent.call(this, name); // 借用构造函数
  this.age = age;
}

Child.prototype = new Parent(); // 原型链继承
Child.prototype.constructor = Child;

Child.prototype.sayAge = function() {
  console.log(this.age);
};

const child1 = new Child('Alice', 10);
const child2 = new Child('Bob', 12);

child1.colors.push('yellow');
console.log(child1.colors); // ['red', 'green', 'blue', 'yellow']
console.log(child2.colors); // ['red', 'green', 'blue']

child1.sayName(); // 'Alice'
child1.sayAge();  // 10
```

### 3.4 寄生组合继承（推荐）

```javascript
function inheritPrototype(subType, superType) {
  // 创建父类原型的副本
  const prototype = Object.create(superType.prototype);
  // 修复 constructor
  prototype.constructor = subType;
  // 设置子类原型
  subType.prototype = prototype;
}

function Parent(name) {
  this.name = name;
  this.colors = ['red', 'green', 'blue'];
}

Parent.prototype.sayName = function() {
  console.log(this.name);
};

function Child(name, age) {
  Parent.call(this, name);
  this.age = age;
}

inheritPrototype(Child, Parent);

Child.prototype.sayAge = function() {
  console.log(this.age);
};

const child = new Child('Alice', 10);
child.sayName(); // 'Alice'
child.sayAge();  // 10
```

### 3.5 原型式继承

```javascript
// Object.create 的底层实现
function objectCreate(proto) {
  function F() {}
  F.prototype = proto;
  return new F();
}

const person = {
  name: 'Default',
  friends: ['Alice', 'Bob']
};

const person1 = Object.create(person);
const person2 = Object.create(person);

person1.name = 'Person 1';
person1.friends.push('Charlie');

console.log(person1.name);    // 'Person 1'
console.log(person2.name);    // 'Default'
console.log(person2.friends); // ['Alice', 'Bob', 'Charlie'] - 共享引用类型
```

### 3.6 寄生式继承

```javascript
function createAnother(original) {
  const clone = Object.create(original);
  clone.sayHi = function() {
    console.log(`Hi, I'm ${this.name}`);
  };
  return clone;
}

const person = {
  name: 'Nicholas'
};

const anotherPerson = createAnother(person);
anotherPerson.sayHi(); // 'Hi, I'm Nicholas'
```

## 4. 原型链的实际应用

### 4.1 数组方法的扩展

```javascript
// 给 Array 添加新的方法
Array.prototype.first = function() {
  return this[0];
};

Array.prototype.last = function() {
  return this[this.length - 1];
};

Array.prototype.sum = function() {
  return this.reduce((sum, num) => sum + num, 0);
};

const numbers = [1, 2, 3, 4, 5];
console.log(numbers.first()); // 1
console.log(numbers.last());  // 5
console.log(numbers.sum());   // 15

// 字符串方法扩展
String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

console.log('hello world'.capitalize()); // 'Hello world'
```

### 4.2 实用工具函数

```javascript
// 类型检查
Object.prototype.getType = function() {
  return Object.prototype.toString.call(this).slice(8, -1);
};

console.log((42).getType());          // 'Number'
console.log(('hello').getType());     // 'String'
console.log(([]).getType());          // 'Array'
console.log(({}).getType());          // 'Object'

// 深度克隆
Object.prototype.deepClone = function() {
  if (this === null || typeof this !== 'object') {
    return this;
  }

  const clone = Array.isArray(this) ? [] : {};
  
  for (let key in this) {
    if (this.hasOwnProperty(key)) {
      clone[key] = this[key] !== null && typeof this[key] === 'object'
        ? this[key].deepClone()
        : this[key];
    }
  }
  
  return clone;
};

const original = { a: 1, b: { c: 2 } };
const cloned = original.deepClone();
cloned.b.c = 3;

console.log(original.b.c); // 2
console.log(cloned.b.c);   // 3
```

### 4.3 链式调用

```javascript
function Calculator() {
  this.value = 0;
}

Calculator.prototype.add = function(num) {
  this.value += num;
  return this; // 返回 this 实现链式调用
};

Calculator.prototype.subtract = function(num) {
  this.value -= num;
  return this;
};

Calculator.prototype.multiply = function(num) {
  this.value *= num;
  return this;
};

Calculator.prototype.getValue = function() {
  return this.value;
};

const calculator = new Calculator();
const result = calculator
  .add(10)
  .subtract(2)
  .multiply(3)
  .getValue();

console.log(result); // 24
```

### 4.4 单例模式

```javascript
function Singleton() {
  if (typeof Singleton.instance === 'object') {
    return Singleton.instance;
  }

  this.value = 'Singleton Instance';
  Singleton.instance = this;
}

const instance1 = new Singleton();
const instance2 = new Singleton();

console.log(instance1 === instance2); // true
```

### 4.5 观察者模式

```javascript
function Subject() {
  this.observers = [];
}

Subject.prototype.subscribe = function(fn) {
  this.observers.push(fn);
};

Subject.prototype.unsubscribe = function(fn) {
  this.observers = this.observers.filter(observer => observer !== fn);
};

Subject.prototype.notify = function(data) {
  this.observers.forEach(fn => fn(data));
};

const subject = new Subject();

const observer1 = (data) => console.log('Observer 1:', data);
const observer2 = (data) => console.log('Observer 2:', data);

subject.subscribe(observer1);
subject.subscribe(observer2);

subject.notify('Hello Observers!');

subject.unsubscribe(observer2);
subject.notify('Only Observer 1 will see this');
```

## 5. 原型链的高级技巧

### 5.1 动态修改原型

```javascript
function Person(name) {
  this.name = name;
}

const person1 = new Person('Alice');

// 动态添加方法
Person.prototype.sayHello = function() {
  console.log(`Hello, I'm ${this.name}`);
};

person1.sayHello(); // 'Hello, I'm Alice'

const person2 = new Person('Bob');
person2.sayHello(); // 'Hello, I'm Bob'

// 注意：动态修改原型会影响所有实例
```

### 5.2 检测原型关系

```javascript
function Parent() {}
function Child() {}
Child.prototype = Object.create(Parent.prototype);

const child = new Child();

// instanceof
console.log(child instanceof Child);  // true
console.log(child instanceof Parent); // true
console.log(child instanceof Object); // true

// isPrototypeOf
console.log(Parent.prototype.isPrototypeOf(child)); // true
console.log(Child.prototype.isPrototypeOf(child));  // true
console.log(Object.prototype.isPrototypeOf(child)); // true

// getPrototypeOf
console.log(Object.getPrototypeOf(child) === Child.prototype); // true
console.log(Object.getPrototypeOf(Child.prototype) === Parent.prototype); // true
```

### 5.3 属性查找优化

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype = {
  constructor: Person,
  sayHello() {
    console.log(`Hello, ${this.name}`);
  }
};

// 使用 hasOwnProperty 检查实例属性
const person = new Person('Alice');

console.log(person.hasOwnProperty('name')); // true
console.log(person.hasOwnProperty('sayHello')); // false

// 遍历实例属性
for (let key in person) {
  if (person.hasOwnProperty(key)) {
    console.log('Own property:', key);
  }
}

// Object.keys 只返回实例属性
console.log(Object.keys(person)); // ['name']

// for...in 会遍历原型链
for (let key in person) {
  console.log(key); // 'name', 'sayHello'
}
```

### 5.4 冻结原型

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype = {
  constructor: Person,
  sayHello() {
    console.log(`Hello, ${this.name}`);
  }
};

// 冻结原型，防止修改
Object.freeze(Person.prototype);

// 尝试修改（无效）
Person.prototype.newMethod = function() {
  console.log('This will not work');
};

console.log(typeof Person.prototype.newMethod); // 'undefined'

// 检查是否被冻结
console.log(Object.isFrozen(Person.prototype)); // true
```

### 5.5 原型链中的 this 指向

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.sayHello = function() {
  console.log(`Hello, I'm ${this.name}`);
};

const person = new Person('Alice');
person.sayHello(); // 'Hello, I'm Alice' - this 指向 person

// 借用方法
const anotherPerson = { name: 'Bob' };
person.sayHello.call(anotherPerson); // 'Hello, I'm Bob' - this 指向 anotherPerson

// 使用 bind
const sayHelloToCharlie = person.sayHello.bind({ name: 'Charlie' });
sayHelloToCharlie(); // 'Hello, I'm Charlie'

// 注意：在 setTimeout 中 this 会改变
setTimeout(person.sayHello, 100); // 'Hello, I'm undefined' - this 指向 window/undefined

// 正确方式
setTimeout(() => person.sayHello(), 100); // 'Hello, I'm Alice'
setTimeout(person.sayHello.bind(person), 100); // 'Hello, I'm Alice'
```

## 6. ES6 Class 与原型

### 6.1 Class 语法糖

```javascript
// ES5 构造函数
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.sayHello = function() {
  console.log(`Hello, I'm ${this.name}`);
};

// ES6 Class
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  sayHello() {
    console.log(`Hello, I'm ${this.name}`);
  }
}

console.log(typeof Person); // 'function'
console.log(Person.prototype.sayHello); // function
```

### 6.2 Class 继承

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }

  eat() {
    console.log(`${this.name} is eating`);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name); // 调用父类构造函数
    this.breed = breed;
  }

  bark() {
    console.log(`${this.name} says: Woof!`);
  }

  eat() {
    console.log(`${this.name} (a ${this.breed}) is eating happily`);
  }
}

const dog = new Dog('Rex', 'German Shepherd');
dog.eat();  // 'Rex (a German Shepherd) is eating happily'
dog.bark(); // 'Rex says: Woof!'

console.log(dog instanceof Dog);    // true
console.log(dog instanceof Animal); // true
```

### 6.3 静态方法

```javascript
// ES5
function MathUtils() {}

MathUtils.add = function(a, b) {
  return a + b;
};

console.log(MathUtils.add(2, 3)); // 5

// ES6
class MathUtils {
  static add(a, b) {
    return a + b;
  }

  static multiply(a, b) {
    return a * b;
  }
}

console.log(MathUtils.add(2, 3));      // 5
console.log(MathUtils.multiply(2, 3)); // 6
```

### 6.4 Getter 和 Setter

```javascript
class Person {
  constructor(name) {
    this._name = name;
  }

  get name() {
    return this._name.toUpperCase();
  }

  set name(value) {
    if (value.length < 2) {
      throw new Error('Name too short');
    }
    this._name = value;
  }
}

const person = new Person('Alice');
console.log(person.name); // 'ALICE'

person.name = 'Bob';
console.log(person.name); // 'BOB'

try {
  person.name = 'X'; // Error: Name too short
} catch (e) {
  console.error(e.message);
}
```

### 6.5 私有字段

```javascript
class BankAccount {
  #balance = 0; // 私有字段

  deposit(amount) {
    if (amount > 0) {
      this.#balance += amount;
      console.log(`Deposited: ${amount}`);
    }
  }

  getBalance() {
    return this.#balance;
  }
}

const account = new BankAccount();
account.deposit(100);
console.log(account.getBalance()); // 100

// account.#balance = 200; // SyntaxError - 私有字段无法外部访问
```

## 7. 原型链的常见问题

### 7.1 共享引用类型的问题

```javascript
function Person() {
  this.friends = [];
}

const person1 = new Person();
const person2 = new Person();

person1.friends.push('Alice');
person2.friends.push('Bob');

console.log(person1.friends); // ['Alice', 'Bob'] - 意外的共享！
console.log(person2.friends); // ['Alice', 'Bob']

// 正确做法：在构造函数中初始化引用类型
function Person() {
  this.friends = [];
}
```

### 7.2 重写原型导致的问题

```javascript
function Person(name) {
  this.name = name;
}

const person1 = new Person('Alice');

// 重写原型
Person.prototype = {
  sayHello() {
    console.log(`Hello, I'm ${this.name}`);
  }
};

const person2 = new Person('Bob');

person2.sayHello(); // 'Hello, I'm Bob'
// person1.sayHello(); // TypeError - person1 的原型链已经断开

// 正确做法：在创建实例前设置原型
function Person(name) {
  this.name = name;
}

Person.prototype = {
  constructor: Person,
  sayHello() {
    console.log(`Hello, I'm ${this.name}`);
  }
};

const person1 = new Person('Alice');
const person2 = new Person('Bob');

person1.sayHello(); // 'Hello, I'm Alice'
person2.sayHello(); // 'Hello, I'm Bob'
```

### 7.3 原型链过长的性能问题

```javascript
// 创建过长的原型链
function A() {}
function B() {}
function C() {}
function D() {}
function E() {}
function F() {}

B.prototype = new A();
C.prototype = new B();
D.prototype = new C();
E.prototype = new D();
F.prototype = new E();

const f = new F();

// 属性查找需要遍历整个原型链
console.log(f.toString()); // 需要遍历 6 层原型链

// 建议：控制原型链深度，避免过多继承
```

### 7.4 忘记修复 constructor

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype = {
  sayHello() {
    console.log(`Hello, I'm ${this.name}`);
  }
};

console.log(Person.prototype.constructor === Person); // false
console.log(Person.prototype.constructor === Object); // true

// 正确做法
Person.prototype = {
  constructor: Person, // 修复 constructor
  sayHello() {
    console.log(`Hello, I'm ${this.name}`);
  }
};

console.log(Person.prototype.constructor === Person); // true
```

## 8. 原型链的最佳实践

### 8.1 使用 Object.create 创建原型

```javascript
// 原来的方式
function Parent() {}
function Child() {}
Child.prototype = new Parent();

// 更好的方式
function Parent() {}
function Child() {}
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;
```

### 8.2 原型方法放在 prototype 上

```javascript
// ✅ 好的做法
function Calculator() {
  this.value = 0;
}

Calculator.prototype.add = function(num) {
  this.value += num;
  return this;
};

Calculator.prototype.subtract = function(num) {
  this.value -= num;
  return this;
};

// ❌ 不好的做法（每次创建实例都创建新函数）
function Calculator() {
  this.value = 0;
  this.add = function(num) {
    this.value += num;
    return this;
  };
}
```

### 8.3 避免修改内置原型

```javascript
// ❌ 不推荐：修改内置原型
Array.prototype.customMethod = function() {
  console.log('Custom method');
};

const arr = [1, 2, 3];
arr.customMethod();

// ✅ 推荐：使用自己的工具函数
const arrayUtils = {
  customMethod(arr) {
    console.log('Custom method');
  }
};

arrayUtils.customMethod([1, 2, 3]);
```

### 8.4 使用 ES6 Class

```javascript
// ✅ 推荐：使用 ES6 Class
class Person {
  constructor(name) {
    this.name = name;
  }

  sayHello() {
    console.log(`Hello, I'm ${this.name}`);
  }
}

// 清晰的语法糖，更易读
const person = new Person('Alice');
person.sayHello();
```

### 8.5 使用 Object.defineProperty

```javascript
function Person(name) {
  this._name = name;
}

Object.defineProperty(Person.prototype, 'name', {
  get() {
    return this._name;
  },
  set(value) {
    this._name = value;
  },
  enumerable: true,
  configurable: true
});

const person = new Person('Alice');
console.log(person.name); // 'Alice'
person.name = 'Bob';
console.log(person.name); // 'Bob'
```

## 9. 原型链的实际案例

### 9.1 实现 jQuery 风格的选择器

```javascript
function $(selector) {
  if (!(this instanceof $)) {
    return new $(selector);
  }

  const elements = document.querySelectorAll(selector);
  this.elements = Array.from(elements);
}

$.prototype.addClass = function(className) {
  this.elements.forEach(el => el.classList.add(className));
  return this;
};

$.prototype.removeClass = function(className) {
  this.elements.forEach(el => el.classList.remove(className));
  return this;
};

$.prototype.css = function(property, value) {
  this.elements.forEach(el => el.style[property] = value);
  return this;
};

// 使用
$('.box')
  .addClass('active')
  .css('color', 'red')
  .removeClass('inactive');
```

### 9.2 实现 Promise

```javascript
class MyPromise {
  constructor(executor) {
    this.state = 'pending';
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };

    const reject = (reason) => {
      if (this.state === 'pending') {
        this.state = 'rejected';
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const handleFulfilled = () => {
        try {
          const result = onFulfilled(this.value);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      const handleRejected = () => {
        try {
          const result = onRejected(this.reason);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      if (this.state === 'fulfilled') {
        handleFulfilled();
      } else if (this.state === 'rejected') {
        handleRejected();
      } else {
        this.onFulfilledCallbacks.push(handleFulfilled);
        this.onRejectedCallbacks.push(handleRejected);
      }
    });
  }
}

// 使用
const promise = new MyPromise((resolve, reject) => {
  setTimeout(() => resolve('Success!'), 1000);
});

promise.then(
  value => console.log(value),     // 'Success!'
  error => console.error(error)
);
```

### 9.3 实现 EventEmitter

```javascript
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    return this;
  }

  off(event, callback) {
    if (!this.events[event]) return this;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
    return this;
  }

  emit(event, data) {
    if (!this.events[event]) return this;
    this.events[event].forEach(callback => callback(data));
    return this;
  }

  once(event, callback) {
    const onceCallback = (data) => {
      callback(data);
      this.off(event, onceCallback);
    };
    return this.on(event, onceCallback);
  }
}

// 使用
const emitter = new EventEmitter();

emitter
  .on('message', (data) => console.log('Handler 1:', data))
  .on('message', (data) => console.log('Handler 2:', data))
  .once('message', (data) => console.log('Once handler:', data));

emitter.emit('message', 'Hello'); // 3 个处理器都会执行
emitter.emit('message', 'World'); // 只有 2 个处理器执行
```

## 10. 总结

### 关键概念

1. **原型**：每个对象都有一个内部原型，指向另一个对象
2. **原型链**：通过 `__proto__` 链接的对象链，用于属性查找
3. **构造函数**：用于创建对象，每个构造函数都有 `prototype` 属性
4. **继承**：通过原型链实现对象之间的继承关系

### 最佳实践

1. **优先使用 ES6 Class**：语法更清晰，更易维护
2. **方法放在 prototype 上**：避免重复创建函数
3. **避免修改内置原型**：防止污染全局环境
4. **合理使用继承**：控制原型链深度，避免性能问题
5. **及时修复 constructor**：重写原型时不要忘记修复

### 实用技巧

- 使用 `Object.create()` 创建对象和原型链
- 使用 `hasOwnProperty()` 区分实例属性和原型属性
- 使用 `Object.freeze()` 冻结原型，防止意外修改
- 使用 `getPrototypeOf()` 和 `isPrototypeOf()` 检查原型关系
- 使用 `instanceof` 运算符检查对象类型
