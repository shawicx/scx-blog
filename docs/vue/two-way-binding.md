# 双向绑定

## 1. 双向绑定基本概念

### 1.1 什么是双向绑定

双向绑定（Two-way Data Binding）是指数据模型和视图之间自动同步的机制。当数据模型发生变化时，视图会自动更新；当视图发生变化时，数据模型也会自动更新。

```
数据模型 (Data)
    ↓ 自动更新
    ↓ 自动同步
视图 (View)
    ↑ 自动更新
    ↑ 自动同步
数据模型 (Data)
```

### 1.2 双向绑定的核心要素

```javascript
// 双向绑定包含三个部分：
// 1. 数据劫持：监听数据的变化
// 2. 依赖收集：追踪哪些组件使用了数据
// 3. 派发更新：数据变化时更新视图

// 简化的双向绑定流程
const data = { value: 'Hello' };

// 数据劫持：监听数据变化
Object.defineProperty(data, 'value', {
  get() {
    console.log('读取数据');
    return this._value;
  },
  set(newValue) {
    console.log('更新数据');
    this._value = newValue;
    updateView(newValue); // 更新视图
  }
});

// 依赖收集：记录使用了数据的组件
function updateView(value) {
  document.getElementById('input').value = value;
  document.getElementById('text').textContent = value;
}

// 派发更新：数据变化时自动更新
data.value = 'World';
```

## 2. Vue 2 双向绑定原理

### 2.1 Object.defineProperty

```javascript
// Vue 2 使用 Object.defineProperty 实现数据劫持

function defineReactive(obj, key, val) {
  const dep = new Dep(); // 依赖收集器
  
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      // 依赖收集
      if (Dep.target) {
        dep.depend();
      }
      return val;
    },
    set(newVal) {
      if (newVal === val) return;
      val = newVal;
      // 派发更新
      dep.notify();
    }
  });
}

// 依赖收集器
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

Dep.target = null;
```

### 2.2 观察者模式

```javascript
// 观察者
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

// 使用示例
const vm = { message: 'Hello Vue 2' };

defineReactive(vm, 'message', vm.message);

const watcher = new Watcher(vm, 'message', (newVal, oldVal) => {
  console.log(`数据从 "${oldVal}" 变为 "${newVal}"`);
  // 更新 DOM
  document.getElementById('text').textContent = newVal;
});

// 数据变化，触发更新
vm.message = 'Hello World';
```

### 2.3 完整的响应式系统

```javascript
class Vue {
  constructor(options) {
    this.$options = options;
    this.$data = options.data;
    
    // 1. 数据劫持
    this.observe(this.$data);
    
    // 2. 编译模板
    this.$el = document.querySelector(options.el);
    this.compile(this.$el);
    
    // 3. 初始化数据到视图
    if (options.created) {
      options.created.call(this);
    }
  }
  
  observe(data) {
    if (!data || typeof data !== 'object') return;
    
    Object.keys(data).forEach(key => {
      defineReactive(data, key, data[key]);
    });
  }
  
  compile(el) {
    const nodes = el.childNodes;
    
    nodes.forEach(node => {
      if (node.nodeType === 1) {
        // 元素节点
        this.compileElement(node);
      } else if (node.nodeType === 3) {
        // 文本节点
        this.compileText(node);
      }
      
      // 递归编译子节点
      if (node.childNodes) {
        this.compile(node);
      }
    });
  }
  
  compileText(node) {
    const reg = /\{\{(.*)\}\}/;
    const text = node.textContent;
    
    if (reg.test(text)) {
      const key = reg.exec(text)[1].trim();
      
      // 初始化视图
      node.textContent = text.replace(reg, this.$data[key]);
      
      // 创建观察者
      new Watcher(this, key, (newVal) => {
        node.textContent = text.replace(reg, newVal);
      });
    }
  }
  
  compileElement(node) {
    const attrs = node.attributes;
    
    Array.from(attrs).forEach(attr => {
      const name = attr.name;
      const value = attr.value;
      
      if (name.startsWith('v-model')) {
        // 双向绑定
        this.bindModel(node, value);
      }
    });
  }
  
  bindModel(node, key) {
    // 初始化值
    node.value = this.$data[key];
    
    // 输入监听：更新数据
    node.addEventListener('input', (e) => {
      this.$data[key] = e.target.value;
    });
    
    // 数据变化监听：更新视图
    new Watcher(this, key, (newVal) => {
      node.value = newVal;
    });
  }
}

// 使用示例
new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue 2'
  },
  created() {
    console.log('Vue 实例创建完成');
  }
});
```

### 2.4 Vue 2 双向绑定的局限性

```javascript
// ========== 局限性 1：无法检测对象属性的添加 ==========

const vm = new Vue({
  data: {
    user: { name: 'John' }
  }
});

// ❌ 无法检测到新添加的属性
vm.user.age = 25; // 响应式失败

// ✅ 解决方案：使用 Vue.set
Vue.set(vm.user, 'age', 25);

// 或者使用 this.$set
this.$set(vm.user, 'age', 25);

// ========== 局限性 2：无法检测数组索引的变化 ==========

const vm = new Vue({
  data: {
    items: [1, 2, 3]
  }
});

// ❌ 无法检测到通过索引修改数组元素
vm.items[0] = 10; // 响应式失败

// ✅ 解决方案：使用 Vue.set
Vue.set(vm.items, 0, 10);

// 或者使用变异方法
vm.items.splice(0, 1, 10);

// ========== 局限性 3：无法检测数组长度的变化 ==========

const vm = new Vue({
  data: {
    items: [1, 2, 3]
  }
});

// ❌ 无法检测到数组长度的变化
vm.items.length = 0; // 响应式失败

// ✅ 解决方案：使用变异方法
vm.items.splice(0, vm.items.length);

// ========== 性能问题 ==========

// Object.defineProperty 需要递归遍历对象的所有属性
const largeObject = {
  // 大量嵌套属性...
};

// 首次初始化时需要遍历所有属性
// 深层嵌套对象会影响初始化性能
```

## 3. Vue 3 双向绑定原理

### 3.1 Proxy API

```javascript
// Vue 3 使用 Proxy 实现数据劫持

function reactive(target) {
  return new Proxy(target, {
    // 拦截对象属性的读取
    get(target, key, receiver) {
      // 依赖收集
      track(target, key);
      
      const result = Reflect.get(target, key, receiver);
      
      // 深度响应式
      if (typeof result === 'object' && result !== null) {
        return reactive(result);
      }
      
      return result;
    },
    
    // 拦截对象属性的设置
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      
      // 只有当值真正改变时才触发更新
      if (oldValue !== value) {
        // 派发更新
        trigger(target, key);
      }
      
      return result;
    },
    
    // 拦截属性删除
    deleteProperty(target, key) {
      const hadKey = key in target;
      const result = Reflect.deleteProperty(target, key);
      
      if (hadKey) {
        trigger(target, key);
      }
      
      return result;
    }
  });
}

// 依赖收集
const targetMap = new WeakMap();

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
  
  dep.add(activeEffect);
}

// 派发更新
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  
  const dep = depsMap.get(key);
  if (dep) {
    dep.forEach(effect => effect());
  }
}

// 使用示例
let activeEffect = null;

function effect(fn) {
  activeEffect = fn;
  fn();
  activeEffect = null;
}

const state = reactive({ count: 0 });

effect(() => {
  console.log('Count:', state.count);
});

state.count = 1; // 自动触发更新
```

### 3.2 响应式系统

```javascript
// Vue 3 的响应式系统

class RefImpl {
  constructor(value) {
    this._value = toReactive(value);
    this.dep = new Set();
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

// 使用示例
const count = ref(0);

effect(() => {
  console.log('Count:', count.value);
});

count.value = 1;
```

### 3.3 computed 实现

```javascript
class ComputedRefImpl {
  constructor(getter) {
    this._value = undefined;
    this._dirty = true;
    this._getter = getter;
    this.dep = new Set();
    
    effect(() => {
      this._value = this._getter();
      this._dirty = false;
    });
  }
  
  get value() {
    if (this._dirty) {
      this._value = this._getter();
      this._dirty = false;
    }
    return this._value;
  }
}

function computed(getter) {
  return new ComputedRefImpl(getter);
}

// 使用示例
const count = ref(0);
const doubled = computed(() => count.value * 2);

console.log(doubled.value); // 0
count.value = 1;
console.log(doubled.value); // 2
```

### 3.4 Proxy 的优势

```javascript
// ========== 优势 1：可以检测对象属性的添加和删除 ==========

const state = reactive({ name: 'John' });

// ✅ 新增属性是响应式的
state.age = 25;

// ✅ 删除属性是响应式的
delete state.age;

// ========== 优势 2：可以检测数组索引的变化 ==========

const items = reactive([1, 2, 3]);

// ✅ 通过索引修改数组是响应式的
items[0] = 10;

// ✅ 修改数组长度是响应式的
items.length = 0;

// ========== 优势 3：支持 Map、Set、WeakMap、WeakSet ==========

const map = reactive(new Map());
map.set('key', 'value');

const set = reactive(new Set());
set.add(1);

// ========== 优势 4：性能优化 ==========

// Vue 3 的 Proxy 是懒响应式
const state = reactive({
  deep: {
    nested: {
      value: 'hello'
    }
  }
});

// 只有访问 deep.nested.value 时才会创建响应式代理
console.log(state.deep.nested.value);

// ========== 优势 5：更好的类型推断 ==========

import { reactive, ref } from 'vue';

interface User {
  name: string;
  age: number;
}

const user: User = reactive({
  name: 'John',
  age: 25
});

const count = ref<number>(0);
```

## 4. v-model 的使用

### 4.1 基本用法

```vue
<!-- Vue 2 -->
<template>
  <div>
    <!-- 文本输入 -->
    <input v-model="message" />
    <p>Message: {{ message }}</p>
    
    <!-- 多行文本 -->
    <textarea v-model="description"></textarea>
    
    <!-- 复选框 -->
    <input type="checkbox" v-model="isChecked" />
    <p>Checked: {{ isChecked }}</p>
    
    <!-- 单选按钮 -->
    <input type="radio" value="male" v-model="gender" />
    <input type="radio" value="female" v-model="gender" />
    
    <!-- 下拉选择 -->
    <select v-model="selected">
      <option value="a">Option A</option>
      <option value="b">Option B</option>
    </select>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello Vue 2',
      description: '',
      isChecked: false,
      gender: 'male',
      selected: 'a'
    };
  }
};
</script>
```

```vue
<!-- Vue 3 -->
<template>
  <div>
    <!-- 文本输入 -->
    <input v-model="message" />
    <p>Message: {{ message }}</p>
    
    <!-- 多行文本 -->
    <textarea v-model="description"></textarea>
    
    <!-- 复选框 -->
    <input type="checkbox" v-model="isChecked" />
    <p>Checked: {{ isChecked }}</p>
    
    <!-- 单选按钮 -->
    <input type="radio" value="male" v-model="gender" />
    <input type="radio" value="female" v-model="gender" />
    
    <!-- 下拉选择 -->
    <select v-model="selected">
      <option value="a">Option A</option>
      <option value="b">Option B</option>
    </select>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const message = ref('Hello Vue 3');
const description = ref('');
const isChecked = ref(false);
const gender = ref('male');
const selected = ref('a');
</script>
```

### 4.2 v-model 的原理

```javascript
// Vue 2 中 v-model 的实现

// 对于 input 元素，v-model 语法糖展开为：
// <input v-model="message" />
// 等价于：
// <input :value="message" @input="message = $event.target.value" />

// Vue 2 源码简化
function genDefaultModel(el, value, modifiers) {
  const type = el.attrsMap.type;
  
  if (type === 'checkbox') {
    // 复选框
    return genCheckboxModel(el, value, modifiers);
  } else if (type === 'radio') {
    // 单选按钮
    return genRadioModel(el, value, modifiers);
  } else {
    // 文本输入
    return genAssignmentCode(value, '$event.target.value');
  }
}

// Vue 3 中 v-model 的实现

// Vue 3 使用 modelValue 和 update:modelValue
// <input v-model="message" />
// 等价于：
// <input :value="message" @input="(e) => $emit('update:modelValue', e.target.value)" />

// Vue 3 源码简化
function vModelText(el, dir, _ctx) {
  const value = dir.value;
  
  el._assign = assignValue;
  
  addEventListener(el, 'input', (e) => {
    el._assign(getVModelCurrentValue(el));
  });
  
  setAttr(el, 'value', value);
}

function assignValue(val) {
  _ctx.$emit('update:modelValue', val);
}
```

### 4.3 修饰符

```vue
<template>
  <div>
    <!-- .lazy：在 change 事件后同步 -->
    <input v-model.lazy="message" />
    
    <!-- .number：自动转换为数字 -->
    <input v-model.number="age" type="number" />
    
    <!-- .trim：自动去除首尾空格 -->
    <input v-model.trim="username" />
    
    <!-- 自定义修饰符 -->
    <input v-model.capitalize="message" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello',
      age: '25',
      username: '  John  '
    };
  },
  directives: {
    capitalize: {
      bind(el, binding, vnode) {
        el.addEventListener('input', (e) => {
          e.target.value = e.target.value.charAt(0).toUpperCase() + 
                         e.target.value.slice(1);
        });
      }
    }
  }
};
</script>
```

## 5. 自定义组件的双向绑定

### 5.1 Vue 2 自定义组件 v-model

```vue
<!-- 父组件 -->
<template>
  <div>
    <CustomInput v-model="message" />
    <p>Message: {{ message }}</p>
  </div>
</template>

<script>
import CustomInput from './CustomInput.vue';

export default {
  components: { CustomInput },
  data() {
    return {
      message: 'Hello Vue 2'
    };
  }
};
</script>
```

```vue
<!-- 子组件 CustomInput.vue -->
<template>
  <div>
    <input
      :value="value"
      @input="$emit('input', $event.target.value)"
    />
  </div>
</template>

<script>
export default {
  props: ['value'],
  model: {
    prop: 'value',
    event: 'input'
  }
};
</script>
```

### 5.2 Vue 3 自定义组件 v-model

```vue
<!-- 父组件 -->
<template>
  <div>
    <CustomInput v-model="message" />
    <p>Message: {{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import CustomInput from './CustomInput.vue';

const message = ref('Hello Vue 3');
</script>
```

```vue
<!-- 子组件 CustomInput.vue -->
<template>
  <div>
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    required: true
  }
});

defineEmits(['update:modelValue']);
</script>
```

### 5.3 多个 v-model

```vue
<!-- Vue 2 -->
<template>
  <div>
    <UserForm
      v-model="name"
      v-model:age="age"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: 'John',
      age: 25
    };
  }
};
</script>
```

```vue
<!-- Vue 3 -->
<template>
  <div>
    <UserForm
      v-model:name="userName"
      v-model:age="userAge"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const userName = ref('John');
const userAge = ref(25);
</script>
```

```vue
<!-- 子组件 UserForm.vue -->
<template>
  <div>
    <input
      :value="name"
      @input="$emit('update:name', $event.target.value)"
      placeholder="Name"
    />
    <input
      :value="age"
      @input="$emit('update:age', $event.target.value)"
      type="number"
      placeholder="Age"
    />
  </div>
</template>

<script setup>
defineProps({
  name: String,
  age: Number
});

defineEmits(['update:name', 'update:age']);
</script>
```

## 6. 双向绑定的性能优化

### 6.1 避免过度响应式

```javascript
// Vue 2
export default {
  data() {
    return {
      // ❌ 不需要响应式的数据
      staticData: {
        // 大量静态配置...
      },
      
      // ✅ 需要响应式的数据
      dynamicData: {
        count: 0
      }
    };
  },
  created() {
    // 将静态数据转为非响应式
    this.staticData = Object.freeze(this.staticData);
  }
};

// Vue 3
<script setup>
import { ref, reactive, markRaw, shallowRef, shallowReactive } from 'vue';

// ✅ 使用 markRaw 标记不需要响应式的对象
const staticConfig = markRaw({
  // 静态配置...
});

// ✅ 使用 shallowRef 避免深层响应式
const largeData = shallowRef({
  nested: {
    value: 'hello'
  }
});

// ✅ 使用 shallowReactive
const shallowState = shallowReactive({
  nested: {
    value: 'hello'
  }
});

// 深层修改不会触发更新
largeData.value.nested.value = 'new value';

// 需要手动触发更新
largeData.value = { ...largeData.value };
</script>
```

### 6.2 合理使用计算属性

```vue
<template>
  <div>
    <input v-model="text" />
    <p>Computed: {{ computedText }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      text: 'Hello'
    };
  },
  computed: {
    // ✅ 使用计算属性，有缓存
    computedText() {
      console.log('计算');
      return this.text.toUpperCase();
    }
  }
};
</script>

<script setup>
import { ref, computed } from 'vue';

const text = ref('Hello');

// ✅ 使用计算属性，有缓存
const computedText = computed(() => {
  console.log('计算');
  return text.value.toUpperCase();
});
</script>
```

### 6.3 防抖和节流

```vue
<template>
  <div>
    <input v-model="searchText" @input="handleSearch" />
    <p>Search: {{ searchText }}</p>
  </div>
</template>

<script>
import { debounce } from 'lodash-es';

export default {
  data() {
    return {
      searchText: ''
    };
  },
  created() {
    this.handleSearch = debounce(this.performSearch, 300);
  },
  methods: {
    performSearch() {
      console.log('搜索:', this.searchText);
    }
  }
};
</script>

<script setup>
import { ref, onUnmounted } from 'vue';

const searchText = ref('');

let timer = null;

function handleSearch() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    performSearch();
  }, 300);
}

function performSearch() {
  console.log('搜索:', searchText.value);
}

onUnmounted(() => {
  clearTimeout(timer);
});
</script>
```

## 7. 双向绑定的实际应用

### 7.1 表单验证

```vue
<template>
  <div>
    <form @submit.prevent="handleSubmit">
      <div>
        <label>Email:</label>
        <input
          v-model="form.email"
          type="email"
          :class="{ error: errors.email }"
        />
        <span v-if="errors.email" class="error-message">
          {{ errors.email }}
        </span>
      </div>
      
      <div>
        <label>Password:</label>
        <input
          v-model="form.password"
          type="password"
          :class="{ error: errors.password }"
        />
        <span v-if="errors.password" class="error-message">
          {{ errors.password }}
        </span>
      </div>
      
      <button type="submit" :disabled="!isValid">
        Submit
      </button>
    </form>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue';

const form = reactive({
  email: '',
  password: ''
});

const errors = reactive({
  email: '',
  password: ''
});

const isValid = computed(() => {
  return form.email && form.password && !errors.email && !errors.password;
});

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

function handleSubmit() {
  if (isValid.value) {
    console.log('表单提交:', form);
  }
}

// 监听表单变化
watch(() => form.email, (email) => {
  errors.email = validateEmail(email) ? '' : 'Invalid email';
});

watch(() => form.password, (password) => {
  errors.password = validatePassword(password) ? '' : 'Password too short';
});
</script>
```

### 7.2 搜索框实时搜索

```vue
<template>
  <div>
    <input
      v-model="searchQuery"
      placeholder="Search..."
    />
    <div v-if="loading">Loading...</div>
    <ul v-else>
      <li v-for="item in filteredItems" :key="item.id">
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { debounce } from 'lodash-es';

const searchQuery = ref('');
const items = ref([]);
const loading = ref(false);

const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value;
  
  return items.value.filter(item =>
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const performSearch = debounce(async (query) => {
  loading.value = true;
  
  try {
    // 模拟 API 调用
    const response = await fetch(`/api/search?q=${query}`);
    items.value = await response.json();
  } finally {
    loading.value = false;
  }
}, 300);

watch(searchQuery, (query) => {
  if (query.trim()) {
    performSearch(query);
  } else {
    items.value = [];
  }
});
</script>
```

### 7.3 复杂表单

```vue
<template>
  <div>
    <form @submit.prevent="handleSubmit">
      <fieldset>
        <legend>Personal Info</legend>
        <div>
          <label>First Name:</label>
          <input v-model="form.personal.firstName" />
        </div>
        <div>
          <label>Last Name:</label>
          <input v-model="form.personal.lastName" />
        </div>
      </fieldset>
      
      <fieldset>
        <legend>Contact Info</legend>
        <div>
          <label>Email:</label>
          <input v-model="form.contact.email" type="email" />
        </div>
        <div>
          <label>Phone:</label>
          <input v-model="form.contact.phone" />
        </div>
      </fieldset>
      
      <fieldset>
        <legend>Address</legend>
        <div>
          <label>Street:</label>
          <input v-model="form.address.street" />
        </div>
        <div>
          <label>City:</label>
          <input v-model="form.address.city" />
        </div>
        <div>
          <label>Zip Code:</label>
          <input v-model="form.address.zipCode" />
        </div>
      </fieldset>
      
      <button type="submit">Submit</button>
    </form>
    
    <pre>{{ form }}</pre>
  </div>
</template>

<script setup>
import { reactive } from 'vue';

const form = reactive({
  personal: {
    firstName: '',
    lastName: ''
  },
  contact: {
    email: '',
    phone: ''
  },
  address: {
    street: '',
    city: '',
    zipCode: ''
  }
});

function handleSubmit() {
  console.log('表单数据:', JSON.parse(JSON.stringify(form)));
}
</script>
```

## 8. Vue 2 vs Vue 3 双向绑定对比

### 8.1 实现原理对比

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| 核心技术 | Object.defineProperty | Proxy |
| 数据劫持 | 递归遍历所有属性 | 懒响应式 |
| 数组监听 | 重写数组方法 | 原生支持 |
| 性能 | 初始化较慢 | 初始化更快 |
| 内存占用 | 较高 | 较低 |
| 新增属性 | 需要 Vue.set | 原生支持 |
| 删除属性 | 需要 Vue.delete | 原生支持 |

### 8.2 性能对比

```javascript
// ========== 初始化性能 ==========

// Vue 2：需要递归遍历所有属性
const largeObject = {
  // 假设有 10000 个属性
};

const vm2 = new Vue({
  data: largeObject
});
// 初始化时间：~100ms

// Vue 3：懒响应式，按需代理
const largeObject = {
  // 假设有 10000 个属性
};

const state3 = reactive(largeObject);
// 初始化时间：~1ms

// ========== 运行时性能 ==========

// Vue 2：每次访问都需要通过 getter/setter
console.log(vm2.someProperty);

// Vue 3：直接访问代理对象
console.log(state3.someProperty);
// 访问速度更快

// ========== 内存占用 ==========

// Vue 2：每个属性都有独立的 Dep 实例
// 内存占用：~10MB

// Vue 3：使用 WeakMap 存储依赖
// 内存占用：~5MB
```

### 8.3 API 对比

```javascript
// ========== 数据定义 ==========

// Vue 2
export default {
  data() {
    return {
      message: 'Hello'
    };
  }
};

// Vue 3
<script setup>
import { ref, reactive } from 'vue';

const message = ref('Hello');
const state = reactive({
  count: 0
});
</script>

// ========== 计算属性 ==========

// Vue 2
export default {
  computed: {
    doubled() {
      return this.count * 2;
    }
  }
};

// Vue 3
<script setup>
import { ref, computed } from 'vue';

const count = ref(0);
const doubled = computed(() => count.value * 2);
</script>

// ========== 侦听器 ==========

// Vue 2
export default {
  watch: {
    message(newVal, oldVal) {
      console.log(newVal, oldVal);
    }
  }
};

// Vue 3
<script setup>
import { ref, watch } from 'vue';

const message = ref('Hello');
watch(message, (newVal, oldVal) => {
  console.log(newVal, oldVal);
});
</script>
```

### 8.4 TypeScript 支持

```typescript
// ========== Vue 2 ==========

import Vue from 'vue';

interface User {
  name: string;
  age: number;
}

export default Vue.extend({
  data() {
    return {
      user: {
        name: 'John',
        age: 25
      } as User
    };
  }
});

// ========== Vue 3 ==========

import { ref, reactive, computed } from 'vue';

interface User {
  name: string;
  age: number;
}

const user: User = reactive({
  name: 'John',
  age: 25
});

const count = ref<number>(0);
const doubled = computed<number>(() => count.value * 2);
```

## 9. 最佳实践

### 9.1 合理使用双向绑定

```vue
<template>
  <div>
    <!-- ✅ 适合使用 v-model：表单输入 -->
    <input v-model="form.name" />
    <textarea v-model="form.description" />
    <select v-model="form.country" />
    
    <!-- ❌ 不适合使用 v-model：只读数据 -->
    <div v-model="readOnlyData">
      <!-- 不要这样做 -->
    </div>
    
    <!-- ✅ 应该使用单向绑定 -->
    <div>{{ readOnlyData }}</div>
    
    <!-- ✅ 复杂组件使用 v-model -->
    <CustomInput v-model="form.username" />
    
    <!-- ❌ 简单展示不要使用 v-model -->
    <span v-model="displayText">
      <!-- 不要这样做 -->
    </span>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';

const form = reactive({
  name: '',
  description: '',
  country: ''
});

const readOnlyData = ref('This is read only');
</script>
```

### 9.2 避免性能陷阱

```vue
<template>
  <div>
    <!-- ❌ 避免在大列表中使用 v-model -->
    <div v-for="item in largeList" :key="item.id">
      <input v-model="item.value" />
    </div>
    
    <!-- ✅ 使用事件处理 -->
    <div v-for="item in largeList" :key="item.id">
      <input :value="item.value" @input="handleInput(item, $event)" />
    </div>
    
    <!-- ❌ 避免深层嵌套响应式 -->
    <div v-model="deep.nested.value">
    </div>
    
    <!-- ✅ 使用 shallowRef 或 markRaw -->
    <div v-model="shallowData.value">
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, markRaw } from 'vue';

const largeList = ref([]);

function handleInput(item, event) {
  item.value = event.target.value;
}

const shallowData = shallowRef({
  nested: {
    value: 'hello'
  }
});
</script>
```

### 9.3 代码组织

```vue
<template>
  <div>
    <form @submit.prevent="handleSubmit">
      <InputField
        v-model="form.email"
        label="Email"
        :error="errors.email"
      />
      
      <InputField
        v-model="form.password"
        label="Password"
        type="password"
        :error="errors.password"
      />
      
      <button type="submit">Submit</button>
    </form>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue';
import InputField from './InputField.vue';

const form = reactive({
  email: '',
  password: ''
});

const errors = reactive({
  email: '',
  password: ''
});

const isValid = computed(() => {
  return form.email && form.password && !errors.email && !errors.password;
});

function handleSubmit() {
  if (isValid.value) {
    console.log('提交表单');
  }
}
</script>
```

## 10. 总结

### 核心原理对比

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| 技术栈 | Object.defineProperty | Proxy |
| 响应式方式 | 递归遍历 | 懒响应式 |
| 数组支持 | 重写方法 | 原生支持 |
| 新增/删除属性 | 需要特殊方法 | 原生支持 |
| 初始化性能 | 较慢 | 更快 |
| 运行时性能 | 较慢 | 更快 |
| TypeScript 支持 | 一般 | 优秀 |

### Vue 2 双向绑定

1. 使用 Object.defineProperty 劫持数据
2. 通过观察者模式管理依赖
3. 递归遍历对象实现深度响应式
4. 需要特殊方法处理数组和新属性

### Vue 3 双向绑定

1. 使用 Proxy 代理对象
2. 实现懒响应式，按需代理
3. 原生支持数组、Map、Set 等
4. 更好的性能和更小的内存占用

### 最佳实践

1. 合理使用 v-model，避免过度响应式
2. 复杂表单使用自定义组件封装
3. 使用计算属性和侦听器优化性能
4. 避免在大型列表中使用 v-model
5. 使用 shallowRef 和 markRaw 优化性能
6. 保持代码简洁和可维护性

掌握 Vue 2 和 Vue 3 的双向绑定原理，能够帮助我们更好地理解 Vue 的响应式系统，编写出更高效、更可维护的代码。
