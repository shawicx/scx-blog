# BiMap 双向映射工具类

## 介绍

BiMap 是一个双向映射数据结构，支持 label 和 value 之间的双向查找。它内部维护两个 Map，确保 label 和 value 的一一对应关系，提供了高效的双向查询能力。

## 特性

- **双向映射**: 支持通过 label 查找 value，也支持通过 value 查找 label
- **类型安全**: 使用 TypeScript 提供完整的类型支持
- **高性能**: 基于原生 Map 实现，查找时间复杂度为 O(1)
- **缓存优化**: BiMapFactory 提供基于 WeakMap 的缓存机制
- **灵活的数据类型**: value 支持 string、number、boolean 类型

## 类型定义

```typescript
type ValueType = string | number | boolean;
type Item = { label: string; value: ValueType };
```

## BiMap 类

### 构造函数

```typescript
constructor(items: Item[] = [])
```

创建一个新的 BiMap 实例，可选择性地传入初始数据。

**参数:**
- `items`: 初始化的映射项数组，默认为空数组

**示例:**
```typescript
const biMap = new BiMap([
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 }
]);
```

### 添加方法

#### add(item: Item)
添加单个映射关系。

**参数:**
- `item`: 包含 label 和 value 的对象

**示例:**
```typescript
biMap.add({ label: '待审核', value: 'pending' });
```

#### addAll(items: Item[])
批量添加映射关系。

**参数:**
- `items`: 映射项数组

**示例:**
```typescript
biMap.addAll([
  { label: '草稿', value: 'draft' },
  { label: '已发布', value: 'published' }
]);
```

### 查询方法

#### getLabel(value: ValueType): string | undefined
根据 value 获取对应的 label。

**参数:**
- `value`: 要查询的值

**返回值:** 对应的 label，如果不存在则返回 undefined

**示例:**
```typescript
const label = biMap.getLabel(1); // '启用'
```

#### getValue(label: string): ValueType | undefined
根据 label 获取对应的 value。

**参数:**
- `label`: 要查询的标签

**返回值:** 对应的 value，如果不存在则返回 undefined

**示例:**
```typescript
const value = biMap.getValue('启用'); // 1
```

#### hasValue(value: ValueType): boolean
检查是否存在指定的 value。

**示例:**
```typescript
if (biMap.hasValue(1)) {
  console.log('存在该值');
}
```

#### hasLabel(label: string): boolean
检查是否存在指定的 label。

**示例:**
```typescript
if (biMap.hasLabel('启用')) {
  console.log('存在该标签');
}
```

### 删除方法

#### removeByValue(value: ValueType): boolean
根据 value 删除映射关系。

**参数:**
- `value`: 要删除的值

**返回值:** 是否成功删除

**示例:**
```typescript
const success = biMap.removeByValue(1); // true
```

#### removeByLabel(label: string): boolean
根据 label 删除映射关系。

**参数:**
- `label`: 要删除的标签

**返回值:** 是否成功删除

**示例:**
```typescript
const success = biMap.removeByLabel('启用'); // true
```

#### clear()
清空所有映射关系。

**示例:**
```typescript
biMap.clear();
```

### 工具方法

#### entries(): [ValueType, string][]
获取所有 value→label 映射的数组。

**返回值:** [value, label] 元组数组

**示例:**
```typescript
const entries = biMap.entries(); // [[1, '启用'], [0, '禁用']]
```

#### toArray(): Item[]
将 BiMap 转换为 Item 数组。

**返回值:** Item 对象数组

**示例:**
```typescript
const items = biMap.toArray();
// [{ label: '启用', value: 1 }, { label: '禁用', value: 0 }]
```

## BiMapFactory 工厂类

BiMapFactory 提供了创建和转换 BiMap 的静态方法，并包含缓存优化。

### fromArray(items: Item[]): BiMap
基于数组创建 BiMap，支持缓存复用。

**参数:**
- `items`: Item 数组

**返回值:** BiMap 实例

**特性:**
- 使用 WeakMap 缓存，相同的数组引用会返回缓存的 BiMap 实例
- 提高性能，避免重复创建

**示例:**
```typescript
const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 }
];

const biMap1 = BiMapFactory.fromArray(statusOptions);
const biMap2 = BiMapFactory.fromArray(statusOptions); // 返回缓存的实例
console.log(biMap1 === biMap2); // true
```

### toBiMap(items: Item[]): BiMap
一次性创建 BiMap，不使用缓存。

**参数:**
- `items`: Item 数组

**返回值:** 新的 BiMap 实例

**示例:**
```typescript
const biMap = BiMapFactory.toBiMap(statusOptions);
```

### toValueMap(items: Item[]): Map<ValueType, string>
将 Item 数组转换为 value→label 的 Map。

**参数:**
- `items`: Item 数组

**返回值:** Map<ValueType, string>

**示例:**
```typescript
const valueMap = BiMapFactory.toValueMap(statusOptions);
console.log(valueMap.get(1)); // '启用'
```

### toLabelMap(items: Item[]): Map<string, ValueType>
将 Item 数组转换为 label→value 的 Map。

**参数:**
- `items`: Item 数组

**返回值:** Map<string, ValueType>

**示例:**
```typescript
const labelMap = BiMapFactory.toLabelMap(statusOptions);
console.log(labelMap.get('启用')); // 1
```

## 使用场景

### 1. 状态码映射
```typescript
const statusBiMap = new BiMap([
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已拒绝', value: 'rejected' }
]);

// API 返回状态码，需要显示中文
const displayStatus = statusBiMap.getLabel('pending'); // '待审核'

// 用户选择中文状态，需要提交状态码
const statusCode = statusBiMap.getValue('已通过'); // 'approved'
```

### 2. 下拉选项处理
```typescript
const departmentOptions = [
  { label: '技术部', value: 'tech' },
  { label: '产品部', value: 'product' },
  { label: '运营部', value: 'operation' }
];

const departmentBiMap = BiMapFactory.fromArray(departmentOptions);

// 表单提交时获取 value
const selectedValue = departmentBiMap.getValue('技术部'); // 'tech'

// 数据回显时获取 label
const displayLabel = departmentBiMap.getLabel('tech'); // '技术部'
```

### 3. 枚举值转换
```typescript
const priorityBiMap = new BiMap([
  { label: '低', value: 1 },
  { label: '中', value: 2 },
  { label: '高', value: 3 },
  { label: '紧急', value: 4 }
]);

// 根据优先级数值显示文本
const getPriorityText = (level: number) => {
  return priorityBiMap.getLabel(level) || '未知';
};

// 根据优先级文本获取数值
const getPriorityLevel = (text: string) => {
  return priorityBiMap.getValue(text) as number;
};
```

## 最佳实践

### 1. 使用工厂方法创建
推荐使用 `BiMapFactory.fromArray()` 来创建 BiMap，可以享受缓存带来的性能优势：

```typescript
// 推荐
const biMap = BiMapFactory.fromArray(options);

// 不推荐
const biMap = new BiMap(options);
```

### 2. 类型安全使用
配合 TypeScript 的类型系统，确保类型安全：

```typescript
interface StatusOption {
  label: string;
  value: 'active' | 'inactive' | 'pending';
}

const statusOptions: StatusOption[] = [
  { label: '激活', value: 'active' },
  { label: '禁用', value: 'inactive' },
  { label: '待处理', value: 'pending' }
];

const statusBiMap = BiMapFactory.fromArray(statusOptions);
```

### 3. 空值检查
查询方法可能返回 undefined，使用时应进行空值检查：

```typescript
const label = biMap.getLabel(value);
if (label) {
  console.log(`标签: ${label}`);
} else {
  console.log('未找到对应标签');
}

// 或使用默认值
const displayLabel = biMap.getLabel(value) || '未知';
```

### 4. 数据一致性
确保 label 和 value 的唯一性，避免数据覆盖：

```typescript
// 错误示例：重复的 value 会导致前面的映射被覆盖
const wrongData = [
  { label: '是', value: 1 },
  { label: '对', value: 1 }  // 会覆盖前面的映射
];

// 正确示例：确保 value 唯一
const correctData = [
  { label: '是', value: 1 },
  { label: '对', value: 2 }
];
```

## 性能特性

- **查询复杂度**: O(1) - 基于 Map 的快速查找
- **内存优化**: 使用 WeakMap 缓存，避免内存泄漏
- **私有字段**: 使用 `#` 私有字段，确保数据封装性
