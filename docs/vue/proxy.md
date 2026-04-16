# Vue 2 与 Vue 3 的 proxy

## 1. 概述

### 1.1 什么是 Proxy

Proxy 是 ES6 新增的 API，用于定义基本操作的自定义行为（如属性查找、赋值、枚举、函数调用等）。Vue 3 使用 Proxy 替代 Vue 2 的 Object.defineProperty 来实现响应式系统。

```javascript
const target = { name: 'Vue' };

const proxy = new Proxy(target, {
  get(target, key, receiver) {
    console.log(`Getting ${key}`);
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    console.log(`Setting ${key} to ${value}`);
    return Reflect.set(target, key, value, receiver);
  }
});

proxy.name; // 输出: Getting name
proxy.name = 'React'; // 输出: Setting name to React
```

### 1.2 Vue 响应式系统的演进

```javascript
// Vue 2: Object.defineProperty
const data = { count: 0 };

Object.defineProperty(data, 'count', {
  get() {
    console.log('读取 count');
    return data._count;
  },
  set(newVal) {
    console.log('更新 count');
    data._count = newVal;
  }
});

// Vue 3: Proxy
const state = reactive({ count: 0 });

state.count; // 自动追踪依赖
state.count = 1; // 自动触发更新
```

## 2. Vue 2 的 Object.defineProperty

### 2.1 基本原理

```javascript
function defineReactive(obj, key, val) {
  const dep = new Dep();
  
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      if (Dep.target) {
        dep.depend();
      }
      return val;
    },
    set(newVal) {
      if (newVal === val) return;
      val = newVal;
      dep.notify();
    }
  });
}

// 使用示例
const data = { message: 'Hello' };
defineReactive(data, 'message', data.message);
```

### 2.2 依赖收集

```javascript
class Dep {
  constructor() {
    this.subs = [];
  }
  
  depend() {
    if (Dep.target) {
      this.subs.push(Dep.target);
    }
  }
  
  notify() {
    this.subs.forEach(sub => sub.update());
  }
}

class Watcher {
  constructor(vm, key, callback) {
    this.vm = vm;
    this.key = key;
    this.callback = callback;
    this.value = this.get();
  }
  
  get() {
    Dep.target = this;
    const value = this.vm[this.key];
    Dep.target = null;
    return value;
  }
  
  update() {
    const newValue = this.vm[this.key];
    if (this.value !== newValue) {
      this.callback(newValue, this.value);
      this.value = newValue;
    }
  }
}
```

### 2.3 数组劫持

```javascript
const arrayProto = Array.prototype;
const arrayMethods = Object.create(arrayProto);

['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(method => {
  const original = arrayProto[method];
  Object.defineProperty(arrayMethods, method, {
    value: function(...args) {
      const result = original.apply(this, args);
      const ob = this.__ob__;
      ob.dep.notify();
      return result;
    }
  });
});

function observeArray(items) {
  for (let i = 0; i < items.length; i++) {
    observe(items[i]);
  }
}
```

### 2.4 局限性

```javascript
// ========== 局限性 1: 无法监听新增属性 ==========

const vm = new Vue({
  data: {
    user: { name: 'John' }
  }
});

vm.user.age = 25; // 响应式失败

// 解决方案
Vue.set(vm.user, 'age', 25);
// 或
vm.$set(vm.user, 'age', 25);

// ========== 局限性 2: 无法监听数组索引变化 ==========

const vm = new Vue({
  data: {
    items: [1, 2, 3]
  }
});

vm.items[0] = 10; // 响应式失败

// 解决方案
Vue.set(vm.items, 0, 10);
vm.items.splice(0, 1, 10);

// ========== 局限性 3: 无法监听数组长度变化 ==========

const vm = new Vue({
  data: {
    items: [1, 2, 3]
  }
});

vm.items.length = 0; // 响应式失败

// 解决方案
vm.items.splice(0, vm.items.length);

// ========== 性能问题 ==========
// 需要递归遍历所有属性，初始化性能较差
const largeObject = {
  // 大量嵌套属性...
};

// 首次初始化时需要遍历所有属性
// 深层嵌套对象会影响初始化性能
```

## 3. Vue 3 的 Proxy

### 3.1 基本原理

```javascript
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver);
      
      track(target, key);
      
      if (typeof result === 'object' && result !== null) {
        return reactive(result);
      }
      
      return result;
    },
    
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      
      if (oldValue !== value) {
        trigger(target, key);
      }
      
      return result;
    },
    
    deleteProperty(target, key) {
      const hadKey = key in target;
      const result = Reflect.deleteProperty(target, key);
      
      if (hadKey) {
        trigger(target, key);
      }
      
      return result;
    },
    
    has(target, key) {
      track(target, key);
      return Reflect.has(target, key);
    },
    
    ownKeys(target) {
      track(target, 'iterate');
      return Reflect.ownKeys(target);
    }
  });
}
```

### 3.2 依赖收集与触发

```javascript
const targetMap = new WeakMap();
let activeEffect = null;

function track(target, key) {
  if (!activeEffect) return;
  
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect);
  }
}

function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  
  const dep = depsMap.get(key);
  if (dep) {
    dep.forEach(effect => effect());
  }
  
  const iterateEffects = depsMap.get('iterate');
  if (iterateEffects) {
    iterateEffects.forEach(effect => effect());
  }
}

function effect(fn) {
  const effectFn = () => {
    activeEffect = effectFn;
    fn();
    activeEffect = null;
  };
  
  effectFn();
  
  return effectFn;
}
```

### 3.3 ref 实现

```javascript
class RefImpl {
  constructor(value) {
    this._value = toReactive(value);
    this.dep = new Set();
    this.__v_isRef = true;
  }
  
  get value() {
    trackRefValue(this);
    return this._value;
  }
  
  set value(newVal) {
    if (hasChanged(newVal, this._value)) {
      this._value = toReactive(newVal);
      triggerRefValue(this);
    }
  }
}

function toReactive(value) {
  return isObject(value) ? reactive(value) : value;
}

function trackRefValue(ref) {
  if (activeEffect) {
    ref.dep.add(activeEffect);
  }
}

function triggerRefValue(ref) {
  ref.dep.forEach(effect => effect());
}

function ref(value) {
  return new RefImpl(value);
}
```

### 3.4 computed 实现

```javascript
class ComputedRefImpl {
  constructor(getter) {
    this._value = undefined;
    this._dirty = true;
    this._getter = getter;
    this.dep = new Set();
    this.__v_isRef = true;
    this.effect = effect(() => {
      this._value = this._getter();
      this._dirty = false;
    });
  }
  
  get value() {
    if (this._dirty) {
      this._value = this.effect();
      this._dirty = false;
    }
    return this._value;
  }
}

function computed(getter) {
  return new ComputedRefImpl(getter);
}
```

## 4. Proxy 优势详解

### 4.1 支持新增/删除属性

```javascript
const state = reactive({
  name: 'John'
});

// ✅ 新增属性是响应式的
state.age = 25;

effect(() => {
  console.log('Age:', state.age); // 25
});

state.age = 30; // 触发更新

// ✅ 删除属性是响应式的
delete state.age;
```

### 4.2 支持数组索引和长度

```javascript
const items = reactive([1, 2, 3]);

// ✅ 通过索引修改是响应式的
items[0] = 10;

effect(() => {
  console.log('First item:', items[0]); // 10
});

// ✅ 修改长度是响应式的
items.length = 0;

effect(() => {
  console.log('Length:', items.length); // 0
});
```

### 4.3 支持多种数据结构

```javascript
// Map
const map = reactive(new Map());

map.set('key', 'value');

effect(() => {
  console.log('Map value:', map.get('key')); // 'value'
});

map.set('key', 'new value'); // 触发更新

// Set
const set = reactive(new Set());

set.add(1);

effect(() => {
  console.log('Set size:', set.size); // 1
});

set.add(2); // 触发更新

// WeakMap 和 WeakSet 也支持
```

### 4.4 性能优化

```javascript
// ========== 懒响应式 ==========
const state = reactive({
  deep: {
    nested: {
      value: 'hello'
    }
  }
});

// 只有访问时才创建代理
console.log(state.deep.nested.value);

// ========== 使用 WeakMap ==========
// WeakMap 允许垃圾回收，不会造成内存泄漏
const targetMap = new WeakMap();

// ========== 减少初始化时间 ==========
const largeObject = {
  // 大量属性...
};

const reactiveObj = reactive(largeObject);
// 初始化时间: ~1ms (Vue 2 需要 ~100ms)
```

## 5. 详细对比

### 5.1 功能对比

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| 监听属性新增 | ❌ 需要 Vue.set | ✅ 原生支持 |
| 监听属性删除 | ❌ 需要 Vue.delete | ✅ 原生支持 |
| 监听数组索引 | ❌ 需要特殊处理 | ✅ 原生支持 |
| 监听数组长度 | ❌ 需要特殊处理 | ✅ 原生支持 |
| 支持 Map/Set | ❌ 不支持 | ✅ 原生支持 |
| 支持类数组 | ❌ 不支持 | ✅ 原生支持 |
| 初始化性能 | 较慢 | 更快 |
| 运行时性能 | 一般 | 更快 |
| 内存占用 | 较高 | 较低 |

### 5.2 实现对比

```javascript
// ========== Vue 2 实现 ==========
function observe(data) {
  if (!data || typeof data !== 'object') return;
  
  Object.keys(data).forEach(key => {
    defineReactive(data, key, data[key]);
  });
}

function defineReactive(obj, key, val) {
  observe(val);
  
  Object.defineProperty(obj, key, {
    get() {
      Dep.target && dep.depend();
      return val;
    },
    set(newVal) {
      if (newVal === val) return;
      val = newVal;
      observe(newVal);
      dep.notify();
    }
  });
}

// ========== Vue 3 实现 ==========
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver);
      track(target, key);
      return typeof result === 'object' ? reactive(result) : result;
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      trigger(target, key);
      return result;
    }
  });
}
```

### 5.3 性能对比

```javascript
// ========== 初始化性能测试 ==========

const largeObject = {};
for (let i = 0; i < 10000; i++) {
  largeObject[`key${i}`] = i;
}

console.time('Vue 2');
const vm2 = new Vue({
  data: largeObject
});
console.timeEnd('Vue 2');
// Vue 2: ~100ms

console.time('Vue 3');
const state3 = reactive(largeObject);
console.timeEnd('Vue 3');
// Vue 3: ~1ms

// ========== 运行时性能测试 ==========

console.time('Vue 2 access');
for (let i = 0; i < 100000; i++) {
  vm2.key0;
}
console.timeEnd('Vue 2 access');
// Vue 2: ~50ms

console.time('Vue 3 access');
for (let i = 0; i < 100000; i++) {
  state3.key0;
}
console.timeEnd('Vue 3 access');
// Vue 3: ~20ms

// ========== 内存占用测试 ==========

const objects = [];
for (let i = 0; i < 1000; i++) {
  objects.push({ a: 1, b: 2, c: 3 });
}

// Vue 2 每个属性都有 Dep 实例
const vm2Array = objects.map(obj => reactiveVue2(obj));

// Vue 3 使用 WeakMap，内存占用更少
const vm3Array = objects.map(obj => reactive(obj));
```

## 6. 实际应用场景

### 6.1 动态属性

```javascript
// Vue 2
export default {
  data() {
    return {
      dynamicFields: {}
    };
  },
  methods: {
    addField(name, value) {
      // 必须使用 Vue.set
      this.$set(this.dynamicFields, name, value);
    }
  }
};

// Vue 3
<script setup>
import { reactive } from 'vue';

const dynamicFields = reactive({});

function addField(name, value) {
  // 直接添加，自动响应式
  dynamicFields[name] = value;
}
</script>
```

### 6.2 数组操作

```javascript
// Vue 2
export default {
  data() {
    return {
      items: [1, 2, 3]
    };
  },
  methods: {
    updateItem(index, value) {
      // 必须使用 Vue.set 或 splice
      this.$set(this.items, index, value);
      // 或
      this.items.splice(index, 1, value);
    },
    
    clearArray() {
      this.items.splice(0, this.items.length);
    }
  }
};

// Vue 3
<script setup>
import { reactive } from 'vue';

const items = reactive([1, 2, 3]);

function updateItem(index, value) {
  // 直接操作索引
  items[index] = value;
}

function clearArray() {
  // 直接修改长度
  items.length = 0;
}
</script>
```

### 6.3 使用 Map 和 Set

```javascript
// Vue 2
// 不支持 Map 和 Set 的响应式
// 需要转换成对象

export default {
  data() {
    return {
      userMap: {
        1: { name: 'John' },
        2: { name: 'Jane' }
      }
    };
  }
};

// Vue 3
<script setup>
import { reactive } from 'vue';

const userMap = reactive(new Map());
const userSet = reactive(new Set());

userMap.set(1, { name: 'John' });
userMap.set(2, { name: 'Jane' });

userSet.add('item1');
userSet.add('item2');

function getUser(id) {
  return userMap.get(id);
}

function hasItem(item) {
  return userSet.has(item);
}
</script>
```

## 7. Proxy 注意事项

### 7.1 不支持的数据类型

```javascript
const state = reactive({});

// ❌ 无法代理原始类型
const primitive = reactive(1); // 失败

// ✅ 使用 ref
const count = ref(1);

// ❌ 无法代理 null
const nullable = reactive(null); // 失败

// ✅ 使用 ref
const data = ref(null);

// ❌ 无法代理函数
const fn = reactive(() => {}); // 失败
```

### 7.2 响应式丢失

```javascript
const state = reactive({
  name: 'John',
  age: 25
});

// ❌ 解构会失去响应式
const { name, age } = state;
name = 'Alice'; // 不触发更新

// ✅ 使用 toRefs
const { name, age } = toRefs(state);
name.value = 'Alice'; // 触发更新

// ❌ 直接赋值会失去响应式
const newState = state;
newState = { name: 'Bob' }; // 不触发更新

// ✅ 使用 Object.assign
Object.assign(state, { name: 'Bob' }); // 触发更新
```

### 7.3 Proxy 拦截限制

```javascript
const obj = { _prop: 'value' };
const proxy = new Proxy(obj, {
  get(target, key) {
    if (key.startsWith('_')) {
      return undefined;
    }
    return target[key];
  }
});

// this 问题
const handler = {
  get(target, key, receiver) {
    // 使用 receiver 确保 this 指向 proxy
    return Reflect.get(target, key, receiver);
  }
};
```

## 8. 最佳实践

### 8.1 选择合适的 API

```javascript
// ========== 基本类型使用 ref ==========
const count = ref(0);
const message = ref('Hello');
const isLoading = ref(false);

// ========== 对象使用 reactive ==========
const user = reactive({
  name: 'John',
  age: 25
});

// ========== 需要重新赋值使用 ref ==========
const data = ref(null);
const response = ref({ items: [] });

data.value = { items: [1, 2, 3] };
response.value = await fetchData();
```

### 8.2 避免响应式丢失

```javascript
import { reactive, toRefs } from 'vue';

const state = reactive({
  count: 0,
  name: 'Vue'
});

// ✅ 在返回中使用 toRefs
function useState() {
  return toRefs(state);
}

// ✅ 在 setup 中使用
const { count, name } = toRefs(state);
```

### 8.3 性能优化

```javascript
import { reactive, markRaw, shallowReactive } from 'vue';

// 不变数据使用 markRaw
const config = markRaw({
  apiEndpoint: 'https://api.example.com',
  version: '1.0.0'
});

// 浅层响应式
const shallowState = shallowReactive({
  nested: {
    value: 'hello'
  }
});

// 只代理顶层
shallowState.nested = { value: 'new value' }; // 触发更新
shallowState.nested.value = 'updated'; // 不触发更新
```

## 9. 迁移指南

### 9.1 从 Vue 2 迁移到 Vue 3

```javascript
// ========== data 函数 ==========
// Vue 2
export default {
  data() {
    return {
      count: 0,
      user: { name: 'John' }
    };
  }
};

// Vue 3
<script setup>
import { ref, reactive } from 'vue';

const count = ref(0);
const user = reactive({ name: 'John' });
</script>

// ========== Vue.set ==========
// Vue 2
this.$set(this.user, 'age', 25);

// Vue 3
user.age = 25;

// ========== Vue.delete ==========
// Vue 2
this.$delete(this.user, 'age');

// Vue 3
delete user.age;

// ========== 数组操作 ==========
// Vue 2
this.items[0] = value;
this.items.splice(0, 1, value);

// Vue 3
items[0] = value;
```

### 9.2 兼容性处理

```javascript
// 检查 Proxy 支持
const supportsProxy = typeof Proxy !== 'undefined';

if (!supportsProxy) {
  console.warn('Proxy is not supported, falling back to Vue 2');
}

// Vue 3 仍然支持 IE11（通过 polyfill）
// 但推荐使用现代浏览器
```

## 10. 总结

### 核心区别

1. **实现方式**
   - Vue 2: Object.defineProperty
   - Vue 3: Proxy

2. **功能完整性**
   - Vue 2: 需要特殊处理数组和新增属性
   - Vue 3: 原生支持所有操作

3. **性能**
   - Vue 2: 初始化较慢，内存占用高
   - Vue 3: 懒响应式，性能更好

4. **API 简洁性**
   - Vue 2: 需要 Vue.set、Vue.delete
   - Vue 3: 更自然的操作方式

### 选择建议

```javascript
// 新项目推荐使用 Vue 3
- 更好的性能
- 更简洁的 API
- 完整的 TypeScript 支持
- 更小的包体积

// Vue 2 项目
- 稳定，生产环境验证
- 生态成熟
- 不急迁移可继续使用
```

### 最佳实践

1. **新项目直接使用 Vue 3**
2. **合理使用 ref 和 reactive**
3. **使用 toRefs 避免响应式丢失**
4. **利用 markRaw 和 shallowReactive 优化性能**
5. **充分利用 Proxy 的完整功能**

Proxy 的引入是 Vue 3 最重要的改进之一，它不仅解决了 Vue 2 响应式系统的诸多限制，还带来了更好的性能和更简洁的 API。理解 Proxy 的原理和优势，有助于我们更好地使用 Vue 3 构建高效、可维护的应用。