# ref 与 reactive 的区别

## 1. 基本概念

### 1.1 什么是 ref

`ref` 是 Vue 3 中的一个响应式 API，用于创建一个响应式的引用。它主要用于包装基本数据类型，使其具有响应式特性。

```javascript
import { ref } from 'vue';

const count = ref(0);
const message = ref('Hello Vue');
const isActive = ref(false);

// 访问值需要使用 .value
console.log(count.value); // 0
count.value = 1;
```

### 1.2 什么是 reactive

`reactive` 用于创建一个响应式的对象。它返回一个对象的响应式代理，使对象的所有嵌套属性都变成响应式的。

```javascript
import { reactive } from 'vue';

const state = reactive({
  count: 0,
  message: 'Hello Vue',
  isActive: false,
  user: {
    name: 'John',
    age: 25
  }
});

// 直接访问属性，不需要 .value
console.log(state.count); // 0
state.count = 1;
state.user.name = 'Alice';
```

## 2. 核心区别对比

### 2.1 使用场景对比

| 特性 | ref | reactive |
|------|-----|----------|
| 适用类型 | 基本类型、对象、数组 | 对象、数组 |
| 访问方式 | 需要 `.value` | 直接访问属性 |
| 模板中使用 | 自动解包，不需要 `.value` | 直接访问 |
| 重新赋值 | 可以直接赋值 | 不能直接重新赋值 |
| TypeScript 支持 | 类型推导更准确 | 需要手动指定类型 |

### 2.2 基本类型使用

```javascript
import { ref, reactive } from 'vue';

// ✅ 推荐：基本类型使用 ref
const count = ref(0);
const message = ref('Hello');
const isLoading = ref(false);

// ❌ 不推荐：基本类型不能使用 reactive
// const count = reactive(0); // Error: reactive 只接受对象
```

### 2.3 对象类型使用

```javascript
import { ref, reactive } from 'vue';

// 方式1：使用 ref 包装对象
const user = ref({
  name: 'John',
  age: 25
});

// 访问和修改
console.log(user.value.name); // 'John'
user.value.name = 'Alice';

// 方式2：使用 reactive
const state = reactive({
  name: 'John',
  age: 25
});

// 访问和修改
console.log(state.name); // 'John'
state.name = 'Alice';
```

### 2.4 数组使用

```javascript
import { ref, reactive } from 'vue';

// 使用 ref 包装数组
const items = ref([1, 2, 3]);
items.value.push(4);
items.value[0] = 10;

// 使用 reactive 包装数组
const list = reactive([1, 2, 3]);
list.push(4);
list[0] = 10;
```

## 3. 在模板中的使用

### 3.1 ref 在模板中

```vue
<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Message: {{ message }}</p>
    <p>User: {{ user.name }}</p>
    
    <button @click="increment">Increment</button>
    <button @click="updateUser">Update User</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const count = ref(0);
const message = ref('Hello');
const user = ref({ name: 'John' });

function increment() {
  count.value++; // 需要使用 .value
}

function updateUser() {
  user.value.name = 'Alice';
}
</script>
```

### 3.2 reactive 在模板中

```vue
<template>
  <div>
    <p>Count: {{ state.count }}</p>
    <p>Message: {{ state.message }}</p>
    <p>User: {{ state.user.name }}</p>
    
    <button @click="increment">Increment</button>
    <button @click="updateUser">Update User</button>
  </div>
</template>

<script setup>
import { reactive } from 'vue';

const state = reactive({
  count: 0,
  message: 'Hello',
  user: { name: 'John' }
});

function increment() {
  state.count++; // 直接访问，不需要 .value
}

function updateUser() {
  state.user.name = 'Alice';
}
</script>
```

### 3.3 混合使用

```vue
<template>
  <div>
    <p>Ref: {{ count }}</p>
    <p>Reactive: {{ state.name }}</p>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

const count = ref(0);
const state = reactive({ name: 'John' });
</script>
```

## 4. 深入理解 ref

### 4.1 ref 的工作原理

```javascript
import { ref } from 'vue';

const count = ref(0);

// ref 内部实现（简化版）
function ref(value) {
  return {
    __v_isRef: true,
    get value() {
      track(this, 'value'); // 依赖收集
      return value;
    },
    set value(newValue) {
      if (value !== newValue) {
        value = newValue;
        trigger(this, 'value'); // 触发更新
      }
    }
  };
}
```

### 4.2 ref 的自动解包

```vue
<template>
  <!-- 模板中自动解包，不需要 .value -->
  <p>{{ count }}</p>
  <p>{{ user.name }}</p>
</template>

<script setup>
import { ref } from 'vue';

const count = ref(0);
const user = ref({ name: 'John' });
</script>
```

### 4.3 ref 在对象中的使用

```javascript
import { ref } from 'vue';

const state = ref({
  count: 0,
  nested: ref({ value: 'hello' })
});

// 访问嵌套的 ref
console.log(state.value.nested.value.value); // 'hello'

// Vue 3.2+ 自动解包嵌套的 ref
console.log(state.value.nested.value); // 'hello'（自动解包）
```

### 4.4 toRef 和 toRefs

```javascript
import { reactive, toRef, toRefs } from 'vue';

const state = reactive({
  name: 'John',
  age: 25
});

// toRef：将响应式对象的属性转换为 ref
const nameRef = toRef(state, 'name');
console.log(nameRef.value); // 'John'

nameRef.value = 'Alice';
console.log(state.name); // 'Alice'

// toRefs：将响应式对象的所有属性转换为 ref
const { name, age } = toRefs(state);
console.log(name.value); // 'Alice'
console.log(age.value); // 25

name.value = 'Bob';
console.log(state.name); // 'Bob'
```

## 5. 深入理解 reactive

### 5.1 reactive 的工作原理

```javascript
import { reactive } from 'vue';

const state = reactive({ count: 0 });

// reactive 内部实现（简化版）
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      track(target, key); // 依赖收集
      const result = Reflect.get(target, key, receiver);
      if (typeof result === 'object' && result !== null) {
        return reactive(result); // 递归处理嵌套对象
      }
      return result;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      if (oldValue !== value) {
        trigger(target, key); // 触发更新
      }
      return result;
    }
  });
}
```

### 5.2 响应式对象的局限性

```javascript
import { reactive } from 'vue';

const state = reactive({
  count: 0
});

// ✅ 正确：修改属性
state.count = 1;

// ❌ 错误：不能直接重新赋值
// state = { count: 1 }; // 失去响应式

// ✅ 正确：使用 Object.assign
Object.assign(state, { count: 1, newProp: 'value' });

// ❌ 错误：解构会失去响应式
const { count } = state;
// count = 2; // 不会触发更新
```

### 5.3 响应式数组的注意事项

```javascript
import { reactive } from 'vue';

const list = reactive([1, 2, 3]);

// ✅ 正确：使用数组方法
list.push(4);
list.pop();
list.splice(0, 1);

// ✅ 正确：直接通过索引赋值（Vue 3）
list[0] = 10;

// ❌ 错误：直接替换整个数组
// list = [4, 5, 6]; // 失去响应式

// ✅ 正确：使用 slice 创建新数组
list.splice(0, list.length, ...[4, 5, 6]);
```

### 5.4 响应式 Map 和 Set

```javascript
import { reactive } from 'vue';

const map = reactive(new Map());
const set = reactive(new Set());

// Map 操作
map.set('key', 'value');
console.log(map.get('key')); // 'value'
map.delete('key');

// Set 操作
set.add(1);
set.add(2);
console.log(set.has(1)); // true
set.delete(1);
```

## 6. 重新赋值的差异

### 6.1 ref 的重新赋值

```javascript
import { ref } from 'vue';

const count = ref(0);
const user = ref({ name: 'John' });

// ✅ 完全可以重新赋值
count.value = 10;

// ✅ 也可以重新赋值为新对象
user.value = { name: 'Alice' };

// ✅ 重新赋值为 null
user.value = null;

console.log(count.value); // 10
console.log(user.value); // null
```

### 6.2 reactive 的重新赋值问题

```javascript
import { reactive } from 'vue';

const state = reactive({
  count: 0,
  user: { name: 'John' }
});

// ❌ 错误：不能直接重新赋值
// state = { count: 10 }; // 失去响应式

// ✅ 正确：修改属性
state.count = 10;

// ✅ 正确：修改嵌套对象
state.user = { name: 'Alice' };

// ❌ 错误：解构赋值会失去响应式
const { count } = state;
count = 20; // 不会触发更新

// ✅ 正确：使用 toRefs
const { count: countRef } = toRefs(state);
countRef.value = 20; // 会触发更新
```

## 7. TypeScript 支持

### 7.1 ref 的类型定义

```typescript
import { ref } from 'vue';

// 类型自动推导
const count = ref(0); // Ref<number>
const message = ref('Hello'); // Ref<string>

// 显式指定类型
const user = ref<{ name: string; age: number }>({
  name: 'John',
  age: 25
});

// 联合类型
const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle');

// 可选类型
const data = ref<{ name: string; age?: number } | null>(null);

// 使用 Ref 泛型
const count2: Ref<number> = ref(0);
```

### 7.2 reactive 的类型定义

```typescript
import { reactive } from 'vue';

// 接口定义
interface User {
  name: string;
  age: number;
  email?: string;
}

// 类型自动推导
const state = reactive({
  count: 0,
  name: 'John'
});

// 显式指定类型
const user: User = reactive({
  name: 'John',
  age: 25
});

// 使用 Reactive 泛型
const state2: Reactive<{
  count: number;
  name: string;
}> = reactive({
  count: 0,
  name: 'John'
});

// 嵌套对象类型
interface State {
  user: User;
  isLoading: boolean;
  data: any[];
}

const appState: State = reactive({
  user: { name: 'John', age: 25 },
  isLoading: false,
  data: []
});
```

### 7.3 类型推导对比

```typescript
import { ref, reactive } from 'vue';

// ref：类型推导更精确
const count = ref(0);
// count 类型是 Ref<number>
// count.value 类型是 number

// reactive：需要手动指定类型
interface State {
  count: number;
  name: string;
}

const state = reactive<State>({
  count: 0,
  name: 'John'
});
// state 类型是 State
// state.count 类型是 number
```

## 8. 性能考虑

### 8.1 ref 的性能特点

```javascript
import { ref } from 'vue';

// ref 包装单个值，开销较小
const count = ref(0);
const message = ref('Hello');

// 对于大量独立的值，使用 ref 更高效
const name = ref('');
const age = ref(0);
const email = ref('');
const phone = ref('');

// 而不是
const user = reactive({
  name: '',
  age: 0,
  email: '',
  phone: ''
});
```

### 8.2 reactive 的性能特点

```javascript
import { reactive } from 'vue';

// reactive 包装整个对象，适合复杂的对象结构
const state = reactive({
  user: {
    name: 'John',
    profile: {
      age: 25,
      address: {
        city: 'New York'
      }
    }
  },
  settings: {
    theme: 'dark',
    language: 'en'
  }
});

// reactive 对整个对象进行代理，深度响应式
state.user.profile.address.city = 'Boston';
```

### 8.3 性能优化建议

```javascript
import { ref, reactive, shallowRef, shallowReactive } from 'vue';

// 使用 shallowRef 避免深层响应式
const deepObject = shallowRef({
  nested: {
    value: 'deep'
  }
});

// 深层修改不会触发更新
deepObject.value.nested.value = 'new value';

// 需要手动触发更新
deepObject.value = { ...deepObject.value };

// 使用 shallowReactive 避免深层响应式
const shallowState = shallowReactive({
  nested: {
    value: 'deep'
  }
});

// 深层修改不会触发更新
shallowState.nested.value = 'new value';

// 顶层修改会触发更新
shallowState.nested = { value: 'new value' };
```

## 9. 实际应用场景

### 9.1 计数器示例

```vue
<template>
  <div>
    <h2>Counter</h2>
    <p>Count: {{ count }}</p>
    <button @click="increment">+1</button>
    <button @click="decrement">-1</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 单个值，使用 ref 更合适
const count = ref(0);

function increment() {
  count.value++;
}

function decrement() {
  count.value--;
}
</script>
```

### 9.2 表单示例

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="form.name" placeholder="Name">
    <input v-model="form.email" placeholder="Email">
    <input v-model="form.age" type="number" placeholder="Age">
    <button type="submit">Submit</button>
  </form>
</template>

<script setup>
import { reactive } from 'vue';

// 表单数据，使用 reactive 更合适
const form = reactive({
  name: '',
  email: '',
  age: 0
});

function handleSubmit() {
  console.log(form);
  // 提交后重置
  Object.assign(form, {
    name: '',
    email: '',
    age: 0
  });
}
</script>
```

### 9.3 混合使用示例

```vue
<template>
  <div>
    <h2>User Management</h2>
    <p>Loading: {{ isLoading }}</p>
    <p>Error: {{ error || 'No error' }}</p>
    
    <div v-if="!isLoading && !error">
      <p>Name: {{ user.name }}</p>
      <p>Age: {{ user.age }}</p>
      <button @click="updateUser">Update User</button>
      <button @click="fetchUser">Fetch User</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

// 独立的状态，使用 ref
const isLoading = ref(false);
const error = ref<string | null>(null);

// 相关的数据，使用 reactive
const user = reactive({
  name: 'John',
  age: 25
});

async function fetchUser() {
  isLoading.value = true;
  error.value = null;
  
  try {
    // 模拟 API 调用
    const response = await new Promise(resolve => {
      setTimeout(() => resolve({ name: 'Alice', age: 30 }), 1000);
    });
    
    Object.assign(user, response);
  } catch (e) {
    error.value = 'Failed to fetch user';
  } finally {
    isLoading.value = false;
  }
}

function updateUser() {
  user.name = 'Bob';
  user.age = 35;
}
</script>
```

### 9.4 列表管理示例

```vue
<template>
  <div>
    <h2>Todo List</h2>
    <input v-model="newTodo" @keyup.enter="addTodo" placeholder="Add todo">
    <button @click="addTodo">Add</button>
    
    <ul>
      <li v-for="todo in todos" :key="todo.id">
        <input type="checkbox" v-model="todo.done">
        <span :style="{ textDecoration: todo.done ? 'line-through' : 'none' }">
          {{ todo.text }}
        </span>
        <button @click="removeTodo(todo.id)">Remove</button>
      </li>
    </ul>
    
    <p>Completed: {{ completedCount }}</p>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';

const newTodo = ref('');

const todos = ref([
  { id: 1, text: 'Learn Vue', done: false },
  { id: 2, text: 'Build a project', done: false }
]);

// 可以使用 ref + computed
const completedCount = computed(() => {
  return todos.value.filter(todo => todo.done).length;
});

function addTodo() {
  if (newTodo.value.trim()) {
    todos.value.push({
      id: Date.now(),
      text: newTodo.value,
      done: false
    });
    newTodo.value = '';
  }
}

function removeTodo(id) {
  todos.value = todos.value.filter(todo => todo.id !== id);
}
</script>
```

## 10. 常见问题与解决方案

### 10.1 解构失去响应式

```javascript
import { reactive, toRefs } from 'vue';

const state = reactive({
  name: 'John',
  age: 25
});

// ❌ 错误：解构会失去响应式
// const { name, age } = state;
// name = 'Alice'; // 不会触发更新

// ✅ 正确：使用 toRefs
const { name, age } = toRefs(state);
name.value = 'Alice'; // 会触发更新

// ✅ 正确：直接访问
state.name = 'Alice'; // 会触发更新
```

### 10.2 reactive 不能重新赋值

```javascript
import { reactive } from 'vue';

const state = reactive({
  count: 0,
  name: 'John'
});

// ❌ 错误：不能直接重新赋值
// state = { count: 1, name: 'Alice' }; // 失去响应式

// ✅ 正确：使用 Object.assign
Object.assign(state, { count: 1, name: 'Alice' });

// ✅ 正确：逐个修改属性
state.count = 1;
state.name = 'Alice';
```

### 10.3 ref 在模板中的自动解包

```vue
<template>
  <div>
    <!-- ✅ 正确：ref 在模板中自动解包 -->
    <p>{{ count }}</p>
    
    <!-- ❌ 错误：不要使用 .value -->
    <p>{{ count.value }}</p> <!-- 会显示 'undefined' -->
    
    <!-- ✅ 正确：reactive 直接访问 -->
    <p>{{ state.name }}</p>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

const count = ref(0);
const state = reactive({ name: 'John' });
</script>
```

### 10.4 computed 返回值

```javascript
import { ref, reactive, computed } from 'vue';

const count = ref(0);
const state = reactive({ name: 'John' });

// computed 返回 ref
const doubled = computed(() => count.value * 2);
console.log(doubled.value); // 0

const greeting = computed(() => `Hello, ${state.name}`);
console.log(greeting.value); // 'Hello, John'

// 在模板中不需要 .value
```

### 10.5 响应式丢失问题

```javascript
import { reactive } from 'vue';

const state = reactive({
  items: [1, 2, 3]
});

// ❌ 错误：解构数组
// const [first, second] = state.items;
// first = 10; // 不会触发更新

// ✅ 正确：直接访问
state.items[0] = 10; // 会触发更新

// ✅ 正确：使用 ref
const items = ref([1, 2, 3]);
items.value[0] = 10; // 会触发更新
```

## 11. 最佳实践

### 11.1 选择 ref 的场景

```javascript
import { ref } from 'vue';

// ✅ 1. 基本数据类型
const count = ref(0);
const message = ref('Hello');
const isLoading = ref(false);

// ✅ 2. 需要重新赋值的对象
const user = ref<{ name: string; age: number } | null>(null);

// ✅ 3. 独立的值
const title = ref('My App');
const description = ref('A Vue app');
const version = ref('1.0.0');

// ✅ 4. 解构时保持响应式
const state = reactive({ name: 'John', age: 25 });
const { name, age } = toRefs(state);
```

### 11.2 选择 reactive 的场景

```javascript
import { reactive } from 'vue';

// ✅ 1. 复杂的对象结构
const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: ''
});

// ✅ 2. 相关的数据组合
const state = reactive({
  user: { name: 'John', age: 25 },
  settings: { theme: 'dark', language: 'en' },
  ui: { sidebarOpen: true, notifications: false }
});

// ✅ 3. 嵌套的对象
const data = reactive({
  meta: {
    page: 1,
    total: 100,
    pageSize: 10
  },
  items: [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' }
  ]
});
```

### 11.3 混合使用的原则

```javascript
import { ref, reactive } from 'vue';

// 原则：相关的数据放在一起，独立的数据分开
const isLoading = ref(false);      // 独立的状态
const error = ref<string | null>(null); // 独立的状态

const user = reactive({            // 相关的用户数据
  name: '',
  email: '',
  age: 0
});

const settings = reactive({        // 相关的设置数据
  theme: 'light' as 'light' | 'dark',
  language: 'zh' as 'zh' | 'en',
  fontSize: 16
});

const items = ref([]);              // 可能需要重新赋值的数组
```

### 11.4 性能优化原则

```javascript
import { ref, reactive, shallowRef, shallowReactive } from 'vue';

// ✅ 大型数据结构使用浅层响应式
const largeData = shallowRef({
  // 大量数据...
});

// ✅ 不变的数据使用普通对象
const config = {
  apiKey: 'xxx',
  apiEndpoint: 'https://api.example.com'
};

// ✅ 需要深层响应式的使用 reactive
const state = reactive({
  nested: {
    deep: {
      value: 'hello'
    }
  }
});
```

### 11.5 可读性原则

```javascript
// ✅ 清晰的命名
const isLoading = ref(false);
const errorMessage = ref('');
const userCount = ref(0);

const userForm = reactive({
  username: '',
  email: '',
  password: ''
});

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

// ❌ 模糊的命名
const a = ref(0);
const b = reactive({});
const c = ref([]);
```

## 12. 实战案例

### 12.1 购物车实现

```vue
<template>
  <div>
    <h2>Shopping Cart</h2>
    
    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="cart-items">
        <div v-for="item in cart.items" :key="item.id" class="item">
          <h3>{{ item.name }}</h3>
          <p>Price: ¥{{ item.price }}</p>
          <div class="quantity">
            <button @click="decreaseQuantity(item)">-</button>
            <span>{{ item.quantity }}</span>
            <button @click="increaseQuantity(item)">+</button>
          </div>
          <button @click="removeItem(item.id)">Remove</button>
        </div>
      </div>
      
      <div class="cart-summary">
        <p>Total: ¥{{ totalPrice }}</p>
        <p>Items: {{ totalItems }}</p>
        <button @click="checkout" :disabled="cart.items.length === 0">
          Checkout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';

// 独立状态使用 ref
const loading = ref(false);
const error = ref('');

// 相关数据使用 reactive
const cart = reactive({
  items: [
    { id: 1, name: 'iPhone', price: 6999, quantity: 1 },
    { id: 2, name: 'MacBook', price: 12999, quantity: 1 }
  ]
});

// 计算属性
const totalPrice = computed(() => {
  return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

const totalItems = computed(() => {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
});

function increaseQuantity(item) {
  item.quantity++;
}

function decreaseQuantity(item) {
  if (item.quantity > 1) {
    item.quantity--;
  } else {
    removeItem(item.id);
  }
}

function removeItem(id) {
  cart.items = cart.items.filter(item => item.id !== id);
}

async function checkout() {
  loading.value = true;
  error.value = '';
  
  try {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Checkout successful!');
    
    // 清空购物车
    cart.items = [];
  } catch (e) {
    error.value = 'Checkout failed';
  } finally {
    loading.value = false;
  }
}
</script>
```

### 12.2 数据表格实现

```vue
<template>
  <div>
    <h2>Data Table</h2>
    
    <div class="controls">
      <input v-model="searchQuery" placeholder="Search...">
      <select v-model="filterStatus">
        <option value="">All</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <button @click="fetchData">Refresh</button>
    </div>
    
    <div v-if="loading">Loading...</div>
    <div v-else>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.status }}</td>
            <td>
              <button @click="editUser(user)">Edit</button>
              <button @click="deleteUser(user.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div class="pagination">
        <button @click="prevPage" :disabled="pagination.currentPage === 1">
          Previous
        </button>
        <span>Page {{ pagination.currentPage }}</span>
        <button @click="nextPage" :disabled="pagination.currentPage >= totalPages">
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';

// 独立状态
const loading = ref(false);
const searchQuery = ref('');
const filterStatus = ref('');

// 相关数据
const users = ref([
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'active' }
]);

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

// 计算属性
const filteredUsers = computed(() => {
  let result = users.value;
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  }
  
  if (filterStatus.value) {
    result = result.filter(user => user.status === filterStatus.value);
  }
  
  pagination.total = result.length;
  return result;
});

const totalPages = computed(() => {
  return Math.ceil(pagination.total / pagination.pageSize);
});

// 方法
async function fetchData() {
  loading.value = true;
  
  try {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 500));
    // 这里应该是实际的 API 调用
  } finally {
    loading.value = false;
  }
}

function prevPage() {
  if (pagination.currentPage > 1) {
    pagination.currentPage--;
  }
}

function nextPage() {
  if (pagination.currentPage < totalPages.value) {
    pagination.currentPage++;
  }
}

function editUser(user) {
  console.log('Edit user:', user);
}

function deleteUser(id) {
  users.value = users.value.filter(user => user.id !== id);
}
</script>
```

## 13. 总结

### 核心区别

1. **使用场景**
   - `ref`: 基本类型、需要重新赋值的对象、独立的值
   - `reactive`: 复杂对象、相关的数据组合、需要深层响应式

2. **访问方式**
   - `ref`: 需要 `.value` 访问（模板中自动解包）
   - `reactive`: 直接访问属性

3. **重新赋值**
   - `ref`: 可以直接重新赋值
   - `reactive`: 不能直接重新赋值，需要使用 `Object.assign`

4. **TypeScript**
   - `ref`: 类型推导更准确
   - `reactive`: 需要手动指定类型

### 选择指南

| 场景 | 推荐使用 |
|------|---------|
| 基本数据类型 | `ref` |
| 需要重新赋值的对象 | `ref` |
| 复杂的对象结构 | `reactive` |
| 相关的数据组合 | `reactive` |
| 解构时保持响应式 | `toRefs` + `reactive` |
| 独立的值 | `ref` |
| 表单数据 | `reactive` |

### 最佳实践

1. **简单值使用 ref，复杂对象使用 reactive**
2. **相关数据放在一起，独立数据分开**
3. **使用 toRefs 在解构时保持响应式**
4. **避免在模板中使用 `.value`**
5. **合理使用 shallowRef 和 shallowReactive 优化性能**

掌握 `ref` 和 `reactive` 的区别和使用场景，能够帮助我们更好地组织 Vue 3 应用的状态管理，提高代码的可读性和可维护性。
