---
title: 'Vue3 组合式API实践指南'
description: 'Vue3组合式API的使用方法、依赖注入和组件开发最佳实践'
draft: false
published: 2025-08-09
---

# Vue 3 常用 API 实战指南

Vue 3 带来了许多激动人心的新特性，其中最重要的就是 Composition API。本文将通过丰富的示例来介绍 Vue 3 中最常用的 API，帮助你快速掌握 Vue 3 的核心功能。

## 🚀 Composition API 核心

### ref() - 响应式引用

`ref()` 是创建响应式数据的最基础 API，适用于基本数据类型和对象。

```vue
<template>
  <div>
    <p>计数器: {{ count }}</p>
    <button @click="increment">增加</button>
    <button @click="reset">重置</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 基本类型响应式
const count = ref(0)

// 对象引用
const user = ref({
  name: '张三',
  age: 25
})

const increment = () => {
  count.value++
}

const reset = () => {
  count.value = 0
}

// 访问对象属性
console.log(user.value.name) // '张三'
</script>
```

### reactive() - 响应式对象

`reactive()` 用于创建深度响应式的对象，更适合复杂的数据结构。

```vue
<template>
  <div>
    <h3>用户信息</h3>
    <p>姓名: {{ state.user.name }}</p>
    <p>年龄: {{ state.user.age }}</p>
    <p>地址: {{ state.user.address.city }}</p>
    <button @click="updateUser">更新用户</button>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const state = reactive({
  user: {
    name: '李四',
    age: 30,
    address: {
      city: '北京',
      street: '朝阳区'
    }
  },
  posts: [],
  loading: false
})

const updateUser = () => {
  // 直接修改，无需 .value
  state.user.age++
  state.user.address.city = '上海'
}
</script>
```

### computed() - 计算属性

计算属性基于依赖进行缓存，只有依赖发生变化时才重新计算。

```vue
<template>
  <div>
    <input v-model="firstName" placeholder="名">
    <input v-model="lastName" placeholder="姓">
    <p>全名: {{ fullName }}</p>
    <p>用户信息: {{ userSummary }}</p>
    <button @click="reverseName">反转姓名</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const firstName = ref('三')
const lastName = ref('张')

// 只读计算属性
const fullName = computed(() => {
  return `${lastName.value}${firstName.value}`
})

// 可写计算属性
const reverseName = computed({
  get() {
    return `${lastName.value}${firstName.value}`
  },
  set(value) {
    [lastName.value, firstName.value] = value.split('')
  }
})

// 复杂计算属性
const userSummary = computed(() => {
  const name = fullName.value
  return `用户: ${name} (${name.length}个字符)`
})
</script>
```

### watch() 和 watchEffect() - 侦听器

监听响应式数据的变化并执行副作用。

```vue
<template>
  <div>
    <input v-model="searchTerm" placeholder="搜索...">
    <p>搜索词: {{ searchTerm }}</p>
    <p>搜索次数: {{ searchCount }}</p>
    <div v-if="loading">搜索中...</div>
    <ul>
      <li v-for="result in searchResults" :key="result">
        {{ result }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch, watchEffect } from 'vue'

const searchTerm = ref('')
const searchCount = ref(0)
const searchResults = ref([])
const loading = ref(false)

// 基础 watch
watch(searchTerm, (newValue, oldValue) => {
  console.log(`搜索词从 "${oldValue}" 变为 "${newValue}"`)
  searchCount.value++
})

// 深度监听对象
const user = ref({ name: '张三', profile: { age: 25 } })
watch(user, (newUser) => {
  console.log('用户信息变化:', newUser)
}, { deep: true })

// 监听多个源
watch([searchTerm, searchCount], ([newTerm, newCount]) => {
  console.log(`第 ${newCount} 次搜索: ${newTerm}`)
})

// 立即执行 + 停止监听
const stopWatcher = watch(searchTerm, async (term) => {
  if (term.length > 2) {
    loading.value = true
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 500))
    searchResults.value = [`结果1: ${term}`, `结果2: ${term}`]
    loading.value = false
  }
}, { immediate: true })

// watchEffect - 自动追踪依赖
watchEffect(() => {
  if (searchTerm.value) {
    document.title = `搜索: ${searchTerm.value}`
  }
})

// 组件卸载时停止监听
// onUnmounted(() => stopWatcher())
</script>
```

## 🔄 生命周期钩子

Vue 3 的生命周期钩子在 Composition API 中以函数形式提供。

```vue
<template>
  <div>
    <h3>生命周期演示</h3>
    <p>组件状态: {{ status }}</p>
    <p>计时器: {{ timer }}</p>
    <button @click="toggleTimer">{{ isRunning ? '停止' : '开始' }}计时器</button>
  </div>
</template>

<script setup>
import {
  ref,
  onMounted,
  onUpdated,
  onUnmounted,
  onBeforeMount,
  onBeforeUpdate,
  onBeforeUnmount
} from 'vue'

const status = ref('初始化')
const timer = ref(0)
const isRunning = ref(false)
let intervalId = null

// 组件挂载前
onBeforeMount(() => {
  console.log('组件即将挂载')
  status.value = '准备挂载'
})

// 组件挂载后
onMounted(() => {
  console.log('组件已挂载')
  status.value = '已挂载'

  // 初始化操作，如 API 调用
  fetchInitialData()
})

// 组件更新前
onBeforeUpdate(() => {
  console.log('组件即将更新')
})

// 组件更新后
onUpdated(() => {
  console.log('组件已更新')
})

// 组件卸载前
onBeforeUnmount(() => {
  console.log('组件即将卸载')
  if (intervalId) {
    clearInterval(intervalId)
  }
})

// 组件卸载后
onUnmounted(() => {
  console.log('组件已卸载')
})

const fetchInitialData = async () => {
  // 模拟 API 调用
  await new Promise(resolve => setTimeout(resolve, 1000))
  status.value = '数据加载完成'
}

const toggleTimer = () => {
  if (isRunning.value) {
    clearInterval(intervalId)
    intervalId = null
  } else {
    intervalId = setInterval(() => {
      timer.value++
    }, 1000)
  }
  isRunning.value = !isRunning.value
}
</script>
```

## 🎯 组件通信

### defineProps 和 defineEmits

父子组件通信的标准方式。

```vue
<!-- 子组件: UserCard.vue -->
<template>
  <div class="user-card">
    <h3>{{ user.name }}</h3>
    <p>年龄: {{ user.age }}</p>
    <p>邮箱: {{ user.email }}</p>
    <button @click="handleEdit">编辑</button>
    <button @click="handleDelete">删除</button>
  </div>
</template>

<script setup>
// 定义 props
const props = defineProps({
  user: {
    type: Object,
    required: true,
    default: () => ({})
  },
  editable: {
    type: Boolean,
    default: true
  }
})

// 定义 emits
const emit = defineEmits(['edit', 'delete', 'update'])

const handleEdit = () => {
  emit('edit', props.user.id)
}

const handleDelete = () => {
  if (confirm('确定要删除吗？')) {
    emit('delete', props.user.id)
  }
}

// 带参数的事件
const handleUpdate = (field, value) => {
  emit('update', {
    id: props.user.id,
    field,
    value
  })
}
</script>
```

```vue
<!-- 父组件使用 -->
<template>
  <div>
    <UserCard
      v-for="user in users"
      :key="user.id"
      :user="user"
      :editable="true"
      @edit="handleEditUser"
      @delete="handleDeleteUser"
      @update="handleUpdateUser"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import UserCard from './UserCard.vue'

const users = ref([
  { id: 1, name: '张三', age: 25, email: 'zhangsan@example.com' },
  { id: 2, name: '李四', age: 30, email: 'lisi@example.com' }
])

const handleEditUser = (userId) => {
  console.log('编辑用户:', userId)
}

const handleDeleteUser = (userId) => {
  users.value = users.value.filter(user => user.id !== userId)
}

const handleUpdateUser = ({ id, field, value }) => {
  const user = users.value.find(u => u.id === id)
  if (user) {
    user[field] = value
  }
}
</script>
```

### provide 和 inject

跨层级组件通信，避免 prop 钻取。

```vue
<!-- 根组件 -->
<template>
  <div>
    <ThemeProvider>
      <UserProfile />
    </ThemeProvider>
  </div>
</template>

<script setup>
import { provide, ref, readonly } from 'vue'
import ThemeProvider from './ThemeProvider.vue'
import UserProfile from './UserProfile.vue'

// 主题管理
const theme = ref('light')
const changeTheme = (newTheme) => {
  theme.value = newTheme
}

// 用户数据管理
const currentUser = ref({
  id: 1,
  name: '张三',
  avatar: '/avatar.jpg',
  preferences: {
    language: 'zh-CN',
    notifications: true
  }
})

// 提供给子组件
provide('theme', {
  theme: readonly(theme),
  changeTheme
})

provide('user', {
  user: readonly(currentUser),
  updateUser: (updates) => {
    Object.assign(currentUser.value, updates)
  }
})
</script>
```

```vue
<!-- 深层子组件 -->
<template>
  <div :class="`profile ${theme}`">
    <img :src="user.avatar" :alt="user.name">
    <h2>{{ user.name }}</h2>
    <button @click="toggleTheme">
      切换到 {{ theme === 'light' ? '暗' : '亮' }} 主题
    </button>
    <Settings />
  </div>
</template>

<script setup>
import { inject } from 'vue'
import Settings from './Settings.vue'

// 注入依赖
const { theme, changeTheme } = inject('theme')
const { user, updateUser } = inject('user')

const toggleTheme = () => {
  changeTheme(theme.value === 'light' ? 'dark' : 'light')
}
</script>
```

## 🎨 模板引用 ref

直接访问 DOM 元素或组件实例。

```vue
<template>
  <div>
    <input
      ref="inputRef"
      v-model="inputValue"
      placeholder="点击按钮聚焦"
    >
    <button @click="focusInput">聚焦输入框</button>

    <div ref="containerRef" class="container">
      <p>滚动区域</p>
      <div v-for="i in 50" :key="i">项目 {{ i }}</div>
    </div>
    <button @click="scrollToTop">回到顶部</button>

    <!-- 组件引用 -->
    <ChildComponent ref="childRef" />
    <button @click="callChildMethod">调用子组件方法</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ChildComponent from './ChildComponent.vue'

const inputValue = ref('')
const inputRef = ref(null)
const containerRef = ref(null)
const childRef = ref(null)

// 聚焦输入框
const focusInput = () => {
  inputRef.value?.focus()
}

// 滚动到顶部
const scrollToTop = () => {
  containerRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

// 调用子组件方法
const callChildMethod = () => {
  childRef.value?.someMethod()
}

onMounted(() => {
  // 组件挂载后访问 DOM
  console.log('输入框元素:', inputRef.value)
  console.log('容器元素:', containerRef.value)
})
</script>
```

## 🔧 工具函数

### nextTick

等待下次 DOM 更新循环结束后执行回调。

```vue
<template>
  <div>
    <ul ref="listRef">
      <li v-for="item in items" :key="item.id">
        {{ item.text }}
      </li>
    </ul>
    <button @click="addItem">添加项目</button>
    <p>列表高度: {{ listHeight }}px</p>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const items = ref([
  { id: 1, text: '项目 1' },
  { id: 2, text: '项目 2' }
])
const listRef = ref(null)
const listHeight = ref(0)

const addItem = async () => {
  const newItem = {
    id: Date.now(),
    text: `项目 ${items.value.length + 1}`
  }

  items.value.push(newItem)

  // 等待 DOM 更新
  await nextTick()

  // 现在可以安全地访问更新后的 DOM
  listHeight.value = listRef.value?.offsetHeight || 0

  // 滚动到新添加的项目
  const newElement = listRef.value?.lastElementChild
  newElement?.scrollIntoView({ behavior: 'smooth' })
}
</script>
```

### unref 和 toRef

处理可能是 ref 或普通值的数据。

```vue
<template>
  <div>
    <p>用户名: {{ userName }}</p>
    <p>年龄: {{ userAge }}</p>
    <button @click="updateUser">更新用户</button>
  </div>
</template>

<script setup>
import { ref, reactive, toRef, unref } from 'vue'

const user = reactive({
  name: '张三',
  age: 25,
  email: 'zhangsan@example.com'
})

// 将响应式对象的属性转为 ref
const userName = toRef(user, 'name')
const userAge = toRef(user, 'age')

// 处理可能是 ref 或普通值的函数
const getValue = (maybeRef) => {
  return unref(maybeRef) // 如果是 ref 返回 .value，否则返回原值
}

const updateUser = () => {
  // 修改 ref 会同步到原对象
  userName.value = '李四'
  userAge.value = 30

  console.log('用户对象:', user) // { name: '李四', age: 30, email: '...' }
}

// 使用 unref 的实用函数
const formatUserInfo = (nameRef, ageRef) => {
  const name = unref(nameRef)
  const age = unref(ageRef)
  return `${name} (${age}岁)`
}
</script>
```

## 🎪 常用指令进阶用法

### v-model 修饰符

```vue
<template>
  <div>
    <!-- 基础用法 -->
    <input v-model="message" placeholder="基础绑定">

    <!-- 修饰符 -->
    <input v-model.lazy="lazyValue" placeholder="失焦时更新">
    <input v-model.number="numberValue" placeholder="转为数字">
    <input v-model.trim="trimValue" placeholder="自动去空格">

    <!-- 自定义组件的 v-model -->
    <CustomInput v-model="customValue" />
    <CustomInput v-model:title="title" v-model:content="content" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CustomInput from './CustomInput.vue'

const message = ref('')
const lazyValue = ref('')
const numberValue = ref(0)
const trimValue = ref('')
const customValue = ref('')
const title = ref('')
const content = ref('')
</script>
```

### 动态指令和参数

```vue
<template>
  <div>
    <!-- 动态指令 -->
    <p v-bind:[attributeName]="attributeValue">动态属性</p>
    <button v-on:[eventName]="handleEvent">动态事件</button>

    <!-- 动态参数的实际应用 -->
    <form>
      <input
        v-for="field in formFields"
        :key="field.name"
        v-model="formData[field.name]"
        :[field.attributeName]="field.attributeValue"
        @[field.eventName]="field.handler"
        :placeholder="field.placeholder"
      >
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const attributeName = ref('title')
const attributeValue = ref('这是一个动态标题')
const eventName = ref('click')

const formData = reactive({})

const formFields = ref([
  {
    name: 'email',
    placeholder: '邮箱',
    attributeName: 'type',
    attributeValue: 'email',
    eventName: 'blur',
    handler: (e) => console.log('邮箱失焦:', e.target.value)
  },
  {
    name: 'phone',
    placeholder: '手机号',
    attributeName: 'maxlength',
    attributeValue: '11',
    eventName: 'input',
    handler: (e) => console.log('手机号输入:', e.target.value)
  }
])

const handleEvent = () => {
  console.log('动态事件被触发')
}
</script>
```

## 🚀 性能优化技巧

### shallowRef 和 shallowReactive

对于大型数据结构，使用浅响应式可以提升性能。

```vue
<template>
  <div>
    <h3>大型列表优化</h3>
    <button @click="addItems">添加1000个项目</button>
    <button @click="updateFirstItem">更新第一个项目</button>
    <p>项目总数: {{ items.length }}</p>

    <virtual-list :items="items" />
  </div>
</template>

<script setup>
import { shallowRef, triggerRef } from 'vue'

// 使用 shallowRef 优化大型数组
const items = shallowRef([])

const addItems = () => {
  const newItems = Array.from({ length: 1000 }, (_, i) => ({
    id: Date.now() + i,
    name: `项目 ${items.value.length + i + 1}`,
    data: { /* 复杂数据 */ }
  }))

  // 直接替换数组，而不是 push
  items.value = [...items.value, ...newItems]
}

const updateFirstItem = () => {
  if (items.value.length > 0) {
    // 修改浅响应式数据后手动触发更新
    items.value[0].name = `更新的项目 ${Date.now()}`
    triggerRef(items) // 手动触发响应式更新
  }
}
</script>
```

### readonly 和 markRaw

保护数据不被修改或标记为非响应式。

```vue
<script setup>
import { ref, reactive, readonly, markRaw } from 'vue'

// 只读数据
const config = readonly({
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3
})

// 尝试修改只读数据会发出警告
// config.apiUrl = 'other-url' // 警告: Set operation on key "apiUrl" failed

// 标记为非响应式的对象（如第三方库实例）
const chart = markRaw(new SomeChartLibrary())
const map = markRaw(new MapLibrary())

const state = reactive({
  user: { name: '张三' },
  chart, // 不会被代理
  map    // 不会被代理
})
</script>
```

## 📝 实用组合式函数示例

### 自定义组合式函数

```javascript
// composables/useCounter.js
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)

  const increment = () => count.value++
  const decrement = () => count.value--
  const reset = () => count.value = initialValue

  const isEven = computed(() => count.value % 2 === 0)
  const isPositive = computed(() => count.value > 0)

  return {
    count,
    increment,
    decrement,
    reset,
    isEven,
    isPositive
  }
}
```

```javascript
// composables/useFetch.js
import { ref, watchEffect } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)
  const loading = ref(false)

  const fetchData = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(url.value || url)
      if (!response.ok) throw new Error(response.statusText)
      data.value = await response.json()
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  watchEffect(() => {
    if (url.value || url) {
      fetchData()
    }
  })

  return { data, error, loading, refetch: fetchData }
}
```

```vue
<!-- 使用组合式函数 -->
<template>
  <div>
    <div>
      <p>计数器: {{ count }}</p>
      <p>状态: {{ isEven ? '偶数' : '奇数' }}, {{ isPositive ? '正数' : '非正数' }}</p>
      <button @click="increment">+1</button>
      <button @click="decrement">-1</button>
      <button @click="reset">重置</button>
    </div>

    <div>
      <h3>用户数据</h3>
      <div v-if="loading">加载中...</div>
      <div v-else-if="error">错误: {{ error }}</div>
      <div v-else-if="data">
        <p>用户名: {{ data.name }}</p>
        <p>邮箱: {{ data.email }}</p>
      </div>
      <button @click="refetch">重新加载</button>
    </div>
  </div>
</template>

<script setup>
import { useCounter } from '@/composables/useCounter'
import { useFetch } from '@/composables/useFetch'

// 使用计数器
const { count, increment, decrement, reset, isEven, isPositive } = useCounter(10)

// 使用数据获取
const { data, error, loading, refetch } = useFetch('/api/user/1')
</script>
```

## 🎉 总结

### 核心优势
- **更好的逻辑复用** - 通过组合式函数轻松共享逻辑
- **更清晰的代码组织** - 相关逻辑可以组织在一起
- **更好的类型推导** - TypeScript 支持更完善
- **更小的包体积** - 支持 tree-shaking

### 最佳实践
1. **优先使用 `ref()` 和 `reactive()`** - 根据数据类型选择合适的响应式 API
2. **合理使用计算属性** - 复杂的派生状态使用 `computed()`
3. **善用组合式函数** - 将可复用逻辑提取为组合式函数
4. **注意性能优化** - 大型数据使用 `shallowRef`/`shallowReactive`
5. **正确处理副作用** - 使用 `watch`/`watchEffect` 处理异步操作
