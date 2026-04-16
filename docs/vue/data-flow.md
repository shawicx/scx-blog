# Vue 的单向数据流

## 1. 单向数据流的基本概念

### 1.1 什么是单向数据流

单向数据流（Unidirectional Data Flow）是一种数据传递模式，数据只能从父组件流向子组件，而不能反向流动。这种模式使数据流动更加可预测和易于追踪。

```
父组件
  ↓ Props
子组件
  ↑ Events
```

### 1.2 数据流动的方向

```javascript
// 数据从父组件流向子组件
Parent Component
  ↓ props: data
Child Component
  ↑ emit: event

// 子组件不能直接修改 props
// 必须通过事件通知父组件进行修改
```

### 1.3 单向数据流的核心原则

1. **Props Down**: 数据通过 props 从父组件传递到子组件
2. **Events Up**: 子组件通过事件通知父组件
3. **单向流动**: 数据只能从上向下流动
4. **不可变性**: 子组件不能直接修改 props

## 2. Props 向下传递

### 2.1 基本的 Props 传递

```vue
<!-- 父组件 Parent.vue -->
<template>
  <div>
    <h2>Parent Component</h2>
    <Child
      :message="parentMessage"
      :count="count"
      :user="user"
      :isActive="isActive"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import Child from './Child.vue';

const parentMessage = ref('Hello from Parent');
const count = ref(10);
const user = reactive({
  name: 'John',
  age: 25
});
const isActive = ref(true);
</script>
```

```vue
<!-- 子组件 Child.vue -->
<template>
  <div>
    <h3>Child Component</h3>
    <p>Message: {{ message }}</p>
    <p>Count: {{ count }}</p>
    <p>User: {{ user.name }} ({{ user.age }})</p>
    <p>Active: {{ isActive }}</p>
  </div>
</template>

<script setup>
// 定义 props
const props = defineProps({
  message: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  },
  user: {
    type: Object,
    default: () => ({})
  },
  isActive: {
    type: Boolean,
    default: false
  }
});

// 使用 props
console.log(props.message);
console.log(props.user.name);
</script>
```

### 2.2 Props 的类型定义

```vue
<script setup>
// 方式1：对象语法定义
const props = defineProps({
  // 基本类型
  title: String,
  count: Number,
  isActive: Boolean,
  
  // 复杂类型
  user: {
    type: Object,
    required: true,
    default: () => ({ name: '', age: 0 })
  },
  
  // 数组
  items: {
    type: Array,
    default: () => []
  },
  
  // 函数
  onClick: Function,
  
  // 自定义验证
  age: {
    type: Number,
    validator: (value) => {
      return value >= 0 && value <= 150;
    }
  }
});

// 方式2：TypeScript 语法定义
interface Props {
  title: string;
  count: number;
  isActive: boolean;
  user: User;
  items: Item[];
  onClick?: (event: Event) => void;
}

interface User {
  name: string;
  age: number;
}

interface Item {
  id: number;
  name: string;
}

const props = defineProps<Props>();

// 方式3：带默认值的 TypeScript 语法
const props = withDefaults(defineProps<Props>(), {
  count: 0,
  isActive: false,
  user: () => ({ name: '', age: 0 }),
  items: () => []
});
</script>
```

### 2.3 Props 的只读特性

```vue
<script setup>
const props = defineProps({
  count: Number,
  user: Object
});

// ❌ 错误：不能直接修改 props
// props.count = 10; // Warning: "count" is read-only

// ❌ 错误：不能重新赋值 props
// props = { count: 20 }; // Error

// ✅ 正确：在组件内部使用计算属性
const doubledCount = computed(() => props.count * 2);

// ✅ 正确：创建本地副本进行修改
const localCount = ref(props.count);

// ✅ 正确：对对象类型创建深拷贝
const localUser = ref({ ...props.user });

// ❌ 注意：对象和数组是引用类型
props.user.name = 'New Name'; // 这会修改原始数据

// ✅ 正确：深拷贝避免修改原始数据
const deepClonedUser = ref(JSON.parse(JSON.stringify(props.user)));
</script>
```

### 2.4 动态 Props

```vue
<template>
  <div>
    <Child :dynamic-prop="dynamicValue" />
    <Child :[dynamicKey]="dynamicValue" />
    
    <button @click="changeValue">Change Value</button>
    <button @click="changeKey">Change Key</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Child from './Child.vue';

const dynamicValue = ref('hello');
const dynamicKey = ref('message');

function changeValue() {
  dynamicValue.value = 'world';
}

function changeKey() {
  dynamicKey.value = dynamicKey.value === 'message' ? 'content' : 'message';
}
</script>
```

### 2.5 Props 验证

```vue
<script setup>
const props = defineProps({
  // 类型验证
  basicType: String,
  
  // 多种类型
  multiType: [String, Number],
  
  // 必填项
  required: {
    type: String,
    required: true
  },
  
  // 默认值
  withDefault: {
    type: String,
    default: 'default value'
  },
  
  // 对象/数组默认值需要工厂函数
  objectDefault: {
    type: Object,
    default: () => ({ name: '', age: 0 })
  },
  
  // 自定义验证器
  age: {
    type: Number,
    validator: (value) => {
      return value >= 0 && value <= 150;
    }
  },
  
  // 复杂验证
  email: {
    type: String,
    validator: (value) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
  }
});

// 在开发模式下，验证失败会显示警告
</script>
```

## 3. Events 向上传递

### 3.1 基本的事件发射

```vue
<!-- 子组件 Child.vue -->
<template>
  <div>
    <button @click="handleClick">Click Me</button>
    <button @click="handleIncrement">Increment</button>
  </div>
</template>

<script setup>
const emit = defineEmits(['click', 'increment']);

function handleClick() {
  // 发射简单事件
  emit('click');
}

function handleIncrement() {
  // 发射带数据的事件
  emit('increment', { value: 1, timestamp: Date.now() });
}
</script>
```

```vue
<!-- 父组件 Parent.vue -->
<template>
  <div>
    <Child @click="handleChildClick" @increment="handleIncrement" />
    <p>Count: {{ count }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Child from './Child.vue';

const count = ref(0);

function handleChildClick() {
  console.log('Child clicked!');
}

function handleIncrement(data) {
  console.log('Increment:', data);
  count.value += data.value;
}
</script>
```

### 3.2 事件类型定义

```vue
<script setup>
// 方式1：数组语法
const emit = defineEmits(['update:modelValue', 'submit', 'cancel']);

// 方式2：对象语法
const emit = defineEmits({
  updateModelValue: null,
  submit: (payload) => {
    // 验证 payload
    return payload && typeof payload.id === 'number';
  },
  cancel: null
});

// 方式3：TypeScript 语法
interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'submit', data: FormData): void;
  (e: 'cancel'): void;
}

const emit = defineEmits<Emits>();

// 发射事件
function handleSubmit(data: FormData) {
  emit('submit', data);
}
</script>
```

### 3.3 v-model 和双向绑定

```vue
<!-- 子组件 CustomInput.vue -->
<template>
  <input
    :value="modelValue"
    @input="updateValue"
  />
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

function updateValue(event) {
  emit('update:modelValue', event.target.value);
}
</script>
```

```vue
<!-- 父组件中使用 -->
<template>
  <CustomInput v-model="message" />
  <p>Message: {{ message }}</p>
</template>

<script setup>
import { ref } from 'vue';
import CustomInput from './CustomInput.vue';

const message = ref('');
</script>
```

### 3.4 多个 v-model

```vue
<!-- 子组件 UserForm.vue -->
<template>
  <form>
    <input
      :value="name"
      @input="$emit('update:name', $event.target.value)"
      placeholder="Name"
    />
    <input
      :value="age"
      @input="$emit('update:age', $event.target.value)"
      placeholder="Age"
    />
  </form>
</template>

<script setup>
defineProps({
  name: String,
  age: Number
});

defineEmits(['update:name', 'update:age']);
</script>
```

```vue
<!-- 父组件中使用 -->
<template>
  <UserForm
    v-model:name="userName"
    v-model:age="userAge"
  />
  <p>Name: {{ userName }}</p>
  <p>Age: {{ userAge }}</p>
</template>

<script setup>
import { ref } from 'vue';
import UserForm from './UserForm.vue';

const userName = ref('');
const userAge = ref(0);
</script>
```

### 3.5 .sync 修饰符（Vue 2 迁移）

```vue
<!-- Vue 3 中使用 v-model 替代 -->
<!-- 子组件 -->
<template>
  <button @click="toggle">Toggle</button>
</template>

<script setup>
const props = defineProps({
  modelValue: Boolean
});

const emit = defineEmits(['update:modelValue']);

function toggle() {
  emit('update:modelValue', !props.modelValue);
}
</script>

<!-- 父组件 -->
<template>
  <Child v-model="isActive" />
</template>
```

## 4. 单向数据流的优势

### 4.1 可预测性

```javascript
// ❌ 双向绑定：数据流向不清晰
// 子组件可以直接修改父组件的数据
function updateParentData() {
  this.$parent.data = 'new value'; // 数据来源不明确
}

// ✅ 单向数据流：数据流向清晰
// 子组件只能通过事件通知父组件
function updateParentData() {
  emit('update', 'new value'); // 明确的数据流动
}
```

### 4.2 可维护性

```vue
<!-- 清晰的数据流 -->
<template>
  <!-- 数据从上到下流动 -->
  <UserList
    :users="users"
    @select="handleUserSelect"
    @delete="handleUserDelete"
  />
</template>

<script setup>
// 所有数据修改都在一个地方
const users = ref([]);

function handleUserSelect(user) {
  console.log('Selected:', user);
}

function handleUserDelete(userId) {
  users.value = users.value.filter(u => u.id !== userId);
}
</script>
```

### 4.3 可测试性

```javascript
// 单向数据流更容易测试
function testComponent() {
  const wrapper = mount(Component, {
    props: {
      initialCount: 10
    }
  });
  
  // 触发事件
  await wrapper.find('button').trigger('click');
  
  // 验证事件是否正确发射
  expect(wrapper.emitted('increment')).toBeTruthy();
  expect(wrapper.emitted('increment')[0]).toEqual([{ value: 1 }]);
}
```

### 4.4 调试便利性

```javascript
// Vue DevTools 可以追踪数据流
// Props Down: 显示哪些 props 被传递
// Events Up: 显示哪些事件被发射

// 清晰的调用栈
Parent Component
  └─ emits: 'update' → data = 'new value'
Child Component
  └─ receives: 'update' event
```

## 5. 实际应用场景

### 5.1 父子组件通信

```vue
<!-- 父组件 TodoList.vue -->
<template>
  <div>
    <h2>Todo List</h2>
    
    <TodoForm @add="handleAddTodo" />
    
    <TodoItem
      v-for="todo in todos"
      :key="todo.id"
      :todo="todo"
      @toggle="handleToggleTodo"
      @delete="handleDeleteTodo"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import TodoForm from './TodoForm.vue';
import TodoItem from './TodoItem.vue';

const todos = ref([
  { id: 1, text: 'Learn Vue', completed: false },
  { id: 2, text: 'Build a project', completed: false }
]);

function handleAddTodo(text) {
  todos.value.push({
    id: Date.now(),
    text,
    completed: false
  });
}

function handleToggleTodo(id) {
  const todo = todos.value.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
  }
}

function handleDeleteTodo(id) {
  todos.value = todos.value.filter(t => t.id !== id);
}
</script>
```

```vue
<!-- 子组件 TodoForm.vue -->
<template>
  <form @submit.prevent="handleSubmit">
    <input
      v-model="inputText"
      placeholder="Add a todo"
    />
    <button type="submit">Add</button>
  </form>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['add']);
const inputText = ref('');

function handleSubmit() {
  if (inputText.value.trim()) {
    emit('add', inputText.value.trim());
    inputText.value = '';
  }
}
</script>
```

```vue
<!-- 子组件 TodoItem.vue -->
<template>
  <div :class="{ completed: todo.completed }">
    <input
      type="checkbox"
      :checked="todo.completed"
      @change="$emit('toggle', todo.id)"
    />
    <span>{{ todo.text }}</span>
    <button @click="$emit('delete', todo.id)">Delete</button>
  </div>
</template>

<script setup>
defineProps({
  todo: {
    type: Object,
    required: true
  }
});

defineEmits(['toggle', 'delete']);
</script>
```

### 5.2 深层嵌套组件通信

```vue
<!-- 祖先组件 App.vue -->
<template>
  <div>
    <ParentComponent :theme="theme" @change-theme="handleThemeChange" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ParentComponent from './ParentComponent.vue';

const theme = ref('light');

function handleThemeChange(newTheme) {
  theme.value = newTheme;
}
</script>
```

```vue
<!-- 父组件 ParentComponent.vue -->
<template>
  <div>
    <ChildComponent
      :theme="theme"
      @change-theme="$emit('change-theme', $event)"
    />
  </div>
</template>

<script setup>
defineProps(['theme']);
defineEmits(['change-theme']);
</script>
```

```vue
<!-- 子组件 ChildComponent.vue -->
<template>
  <div :class="theme">
    <button @click="toggleTheme">Toggle Theme</button>
  </div>
</template>

<script setup>
defineProps(['theme']);
const emit = defineEmits(['change-theme']);

function toggleTheme() {
  emit('change-theme', 'dark');
}
</script>
```

### 5.3 跨组件通信（Provide/Inject）

```vue
<!-- 祖先组件 App.vue -->
<template>
  <div>
    <ParentComponent />
  </div>
</template>

<script setup>
import { provide, ref } from 'vue';
import ParentComponent from './ParentComponent.vue';

const theme = ref('light');
const user = ref({ name: 'John', age: 25 });

function setTheme(newTheme) {
  theme.value = newTheme;
}

// 提供数据和方法
provide('theme', {
  theme,
  setTheme
});

provide('user', user);
</script>
```

```vue
<!-- 深层子组件 DeepChild.vue -->
<template>
  <div :class="theme.theme">
    <p>Current theme: {{ theme.theme }}</p>
    <p>User: {{ user.name }}</p>
    <button @click="theme.setTheme('dark')">Dark Theme</button>
    <button @click="theme.setTheme('light')">Light Theme</button>
  </div>
</template>

<script setup>
import { inject } from 'vue';

// 注入数据和修改方法
const theme = inject('theme');
const user = inject('user');
</script>
```

### 5.4 复杂表单处理

```vue
<!-- 父组件 FormContainer.vue -->
<template>
  <form @submit.prevent="handleSubmit">
    <UserForm
      :user="user"
      :errors="errors"
      @update="handleUpdateUser"
    />
    
    <AddressForm
      :address="user.address"
      :errors="addressErrors"
      @update="handleUpdateAddress"
    />
    
    <button type="submit">Submit</button>
  </form>
</template>

<script setup>
import { ref, reactive } from 'vue';
import UserForm from './UserForm.vue';
import AddressForm from './AddressForm.vue';

const user = reactive({
  name: '',
  email: '',
  age: 0,
  address: {
    street: '',
    city: '',
    zipCode: ''
  }
});

const errors = reactive({});
const addressErrors = reactive({});

function handleUpdateUser(field, value) {
  user[field] = value;
}

function handleUpdateAddress(field, value) {
  user.address[field] = value;
}

function handleSubmit() {
  // 验证和提交
  console.log('Submit:', user);
}
</script>
```

```vue
<!-- 子组件 UserForm.vue -->
<template>
  <div>
    <input
      :value="user.name"
      @input="$emit('update', 'name', $event.target.value)"
      placeholder="Name"
    />
    <input
      :value="user.email"
      @input="$emit('update', 'email', $event.target.value)"
      placeholder="Email"
    />
    <input
      :value="user.age"
      @input="$emit('update', 'age', $event.target.value)"
      type="number"
      placeholder="Age"
    />
  </div>
</template>

<script setup>
defineProps({
  user: {
    type: Object,
    required: true
  },
  errors: {
    type: Object,
    default: () => ({})
  }
});

defineEmits(['update']);
</script>
```

## 6. 单向数据流与状态管理

### 6.1 Vuex 的单向数据流

```javascript
// Vuex 的单向数据流模式
// View → Dispatch Action → Commit Mutation → Mutate State → Re-render

// Vue Component
export default {
  methods: {
    increment() {
      // 分发 Action
      this.$store.dispatch('increment');
    },
    async fetchData() {
      // 异步 Action
      await this.$store.dispatch('fetchData');
    }
  }
}

// Vuex Store
export default createStore({
  state: {
    count: 0,
    data: []
  },
  mutations: {
    // 同步修改状态
    INCREMENT(state) {
      state.count++;
    },
    SET_DATA(state, data) {
      state.data = data;
    }
  },
  actions: {
    // 异步操作
    async fetchData({ commit }) {
      const data = await api.getData();
      commit('SET_DATA', data);
    },
    increment({ commit }) {
      commit('INCREMENT');
    }
  },
  getters: {
    // 计算属性
    doubleCount: (state) => state.count * 2
  }
});
```

### 6.2 Pinia 的单向数据流

```javascript
// Pinia Store
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    loading: false,
    error: null
  }),
  
  getters: {
    activeUsers: (state) => state.users.filter(u => u.isActive),
    userCount: (state) => state.users.length
  },
  
  actions: {
    async fetchUsers() {
      this.loading = true;
      try {
        const response = await api.getUsers();
        this.users = response.data;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    
    addUser(user) {
      this.users.push(user);
    },
    
    deleteUser(userId) {
      this.users = this.users.filter(u => u.id !== userId);
    }
  }
});

// Component
<script setup>
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

// 读取状态
const users = computed(() => userStore.users);
const activeUsers = computed(() => userStore.activeUsers);

// 调用 actions
onMounted(() => {
  userStore.fetchUsers();
});

function handleAddUser(user) {
  userStore.addUser(user);
}
</script>
```

### 6.3 组合式 API 的状态管理

```javascript
// composables/useTodos.js
import { ref, computed } from 'vue';

export function useTodos() {
  const todos = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const completedTodos = computed(() => 
    todos.value.filter(t => t.completed)
  );

  const activeTodos = computed(() => 
    todos.value.filter(t => !t.completed)
  );

  async function fetchTodos() {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await api.getTodos();
      todos.value = response.data;
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  function addTodo(text) {
    todos.value.push({
      id: Date.now(),
      text,
      completed: false
    });
  }

  function toggleTodo(id) {
    const todo = todos.value.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
    }
  }

  function deleteTodo(id) {
    todos.value = todos.value.filter(t => t.id !== id);
  }

  return {
    todos,
    loading,
    error,
    completedTodos,
    activeTodos,
    fetchTodos,
    addTodo,
    toggleTodo,
    deleteTodo
  };
}

// Component
<script setup>
import { useTodos } from '@/composables/useTodos';

const {
  todos,
  loading,
  error,
  completedTodos,
  activeTodos,
  fetchTodos,
  addTodo,
  toggleTodo,
  deleteTodo
} = useTodos();

onMounted(() => {
  fetchTodos();
});
</script>
```

## 7. 单向数据流的最佳实践

### 7.1 Props 命名规范

```vue
<script setup>
// ✅ 使用 kebab-case 在模板中
<Child :user-name="userName" />

// ✅ 使用 camelCase 在 JavaScript 中
const props = defineProps({
  userName: String,
  userId: Number,
  isActive: Boolean,
  userProfile: Object
});

// ✅ 使用明确的命名
const props = defineProps({
  // 清晰表达意图
  userId: Number,        // 而不是 id
  userAge: Number,       // 而不是 age
  isLoading: Boolean,    // 而不是 loading
  errorMessage: String   // 而不是 error
});
</script>
```

### 7.2 事件命名规范

```vue
<script setup>
// ✅ 使用 kebab-case
emit('update:modelValue');
emit('item-clicked');
emit('user-deleted');

// ✅ 使用动词开头
emit('submit-form');
emit('save-changes');
emit('delete-item');

// ✅ 明确表达事件目的
emit('todo-completed', { id: 1 });
emit('user-selected', { userId: 1 });
emit('data-loaded', { data: [] });
</script>
```

### 7.3 避免直接修改 Props

```vue
<script setup>
const props = defineProps({
  user: Object,
  items: Array
});

// ❌ 错误：直接修改 props
props.user.name = 'New Name';
props.items.push({ id: 1, name: 'Item 1' });

// ✅ 正确：创建本地副本
const localUser = ref({ ...props.user });
const localItems = ref([...props.items]);

// ✅ 正确：使用计算属性
const userName = computed(() => props.user.name);
const itemCount = computed(() => props.items.length);

// ✅ 正确：深拷贝对象
const deepClonedUser = ref(
  JSON.parse(JSON.stringify(props.user))
);

// ✅ 正确：通过事件通知父组件
function updateUser(newName) {
  emit('update-user', { ...props.user, name: newName });
}

function addItem(item) {
  emit('add-item', item);
}
</script>
```

### 7.4 合理的组件拆分

```vue
<!-- ✅ 组件职责单一 -->
<!-- UserList.vue -->
<template>
  <div>
    <UserFilter
      :filter="filter"
      @update:filter="$emit('update:filter', $event)"
    />
    
    <UserTable
      :users="filteredUsers"
      @select="$emit('select', $event)"
      @delete="$emit('delete', $event)"
    />
    
    <UserPagination
      :current-page="currentPage"
      :total-pages="totalPages"
      @change-page="$emit('change-page', $event)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import UserFilter from './UserFilter.vue';
import UserTable from './UserTable.vue';
import UserPagination from './UserPagination.vue';

const props = defineProps({
  users: Array,
  filter: Object,
  currentPage: Number,
  totalPages: Number
});

defineEmits(['update:filter', 'select', 'delete', 'change-page']);

const filteredUsers = computed(() => {
  return props.users.filter(user => {
    // 过滤逻辑
    return true;
  });
});
</script>
```

### 7.5 使用 Composables 复用逻辑

```javascript
// composables/useFormField.js
import { computed } from 'vue';

export function useFormField(props, emit, fieldName) {
  const fieldValue = computed({
    get() {
      return props[fieldName];
    },
    set(value) {
      emit(`update:${fieldName}`, value);
    }
  });

  const hasError = computed(() => {
    return props.errors && props.errors[fieldName];
  });

  const errorMessage = computed(() => {
    return hasError.value ? props.errors[fieldName] : '';
  });

  return {
    fieldValue,
    hasError,
    errorMessage
  };
}

// Component
<script setup>
const props = defineProps({
  name: String,
  email: String,
  errors: Object
});

const emit = defineEmits(['update:name', 'update:email']);

// 使用 composable
const { fieldValue: nameValue, hasError: nameError } = useFormField(
  props,
  emit,
  'name'
);

const { fieldValue: emailValue, hasError: emailError } = useFormField(
  props,
  emit,
  'email'
);
</script>
```

## 8. 常见问题与解决方案

### 8.1 Props 变更不更新

```vue
<script setup>
import { watch } from 'vue';

const props = defineProps({
  userId: Number
});

// ✅ 使用 watch 监听 props 变化
watch(
  () => props.userId,
  (newId) => {
    // 当 userId 变化时执行
    console.log('User ID changed:', newId);
    fetchData(newId);
  },
  { immediate: true }
);

// ✅ 使用 computed 派生新值
const userData = computed(() => {
  return userStore.getUserById(props.userId);
});

// ❌ 错误：直接赋值给本地变量
// const userId = props.userId; // 不会更新
</script>
```

### 8.2 事件不触发

```vue
<script setup>
const emit = defineEmits(['click', 'submit']);

// ✅ 正确：在 defineEmits 中声明事件
emit('click');

// ❌ 错误：未声明的事件会发出警告
// emit('unknown-event');

// ✅ 正确：传递参数
emit('submit', { id: 1, name: 'John' });

// ✅ 正确：使用 TypeScript 类型
interface Emits {
  (e: 'click'): void;
  (e: 'submit', data: FormData): void;
}

const typedEmit = defineEmits<Emits>();
typedEmit('submit', new FormData());
</script>
```

### 8.3 深层 Props 的响应性

```vue
<script setup>
const props = defineProps({
  user: {
    type: Object,
    default: () => ({})
  }
});

// ✅ 直接访问深层属性是响应式的
watch(
  () => props.user.name,
  (newName) => {
    console.log('Name changed:', newName);
  }
);

// ✅ 使用 computed
const userName = computed(() => props.user.name);

// ❌ 错误：解构会失去响应性
// const { name, age } = props.user;

// ✅ 正确：使用 toRefs
import { toRefs } from 'vue';
const { name, age } = toRefs(props.user);
</script>
```

### 8.4 数组 Props 的修改

```vue
<script setup>
const props = defineProps({
  items: {
    type: Array,
    default: () => []
  }
});

// ❌ 错误：直接修改 props 数组
// props.items.push({ id: 1, name: 'New Item' });

// ✅ 正确：创建副本
const localItems = ref([...props.items]);

// ✅ 正确：通过事件通知父组件
function addItem(item) {
  emit('add-item', item);
}

function removeItem(index) {
  emit('remove-item', index);
}

// ✅ 正确：使用 computed 进行过滤
const activeItems = computed(() => {
  return props.items.filter(item => item.isActive);
});
</script>
```

## 9. 性能优化

### 9.1 Props 优化

```vue
<script setup>
import { shallowRef, markRaw } from 'vue';

// ✅ 对于大型对象使用 shallowRef
const props = defineProps({
  largeData: {
    type: Object,
    default: () => ({})
  }
});

// ✅ 对于不需要响应式的数据使用 markRaw
const staticData = markRaw({
  // 大量的静态数据
});

// ✅ 使用计算属性缓存结果
const filteredData = computed(() => {
  return props.items.filter(item => item.active);
});

// ✅ 避免不必要的重新计算
const expensiveValue = computed(() => {
  // 只有当依赖变化时才重新计算
  return props.items.reduce((sum, item) => sum + item.value, 0);
});
</script>
```

### 9.2 事件节流

```vue
<script setup>
import { debounce } from 'lodash-es';

const emit = defineEmits(['input', 'search']);

// ✅ 使用防抖优化频繁触发的事件
const debouncedEmit = debounce((value) => {
  emit('search', value);
}, 300);

function handleInput(event) {
  emit('input', event.target.value);
  debouncedEmit(event.target.value);
}

// ✅ 组件卸载时清理防抖函数
onUnmounted(() => {
  debouncedEmit.cancel();
});
</script>
```

### 9.3 虚拟滚动优化

```vue
<template>
  <RecycleScroller
    :items="items"
    :item-size="50"
    key-field="id"
  >
    <template #default="{ item }">
      <div class="item">
        {{ item.name }}
      </div>
    </template>
  </RecycleScroller>
</template>

<script setup>
import { ref } from 'vue';
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

const props = defineProps({
  items: {
    type: Array,
    required: true
  }
});
</script>
```

## 10. 总结

### 核心原则

1. **Props Down**: 数据只能从父组件流向子组件
2. **Events Up**: 子组件通过事件通知父组件进行修改
3. **单向流动**: 确保数据流动方向的一致性
4. **不可变性**: 子组件不能直接修改 props

### 主要优势

1. **可预测性**: 数据流向清晰，易于追踪
2. **可维护性**: 代码结构清晰，易于理解和修改
3. **可测试性**: 组件间解耦，易于单元测试
4. **调试便利**: Vue DevTools 完整追踪数据流

### 最佳实践

1. **使用明确的命名**: props 和 events 命名要清晰表达意图
2. **避免直接修改 props**: 使用本地副本或事件通知
3. **合理拆分组件**: 保持组件职责单一
4. **使用 composables**: 复用逻辑和状态管理
5. **性能优化**: 使用计算属性、防抖节流、虚拟滚动等技术

### 适用场景

- **简单应用**: 直接使用 props 和 events
- **中型应用**: 使用 composables 组织逻辑
- **大型应用**: 结合 Pinia/Vuex 进行状态管理
