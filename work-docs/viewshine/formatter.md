# 优雅的字符串格式化工具：Formatter 类深度解析

在前端开发中，我们经常需要处理各种数据格式化的需求：日期转换、字符串处理、多数据源组合等。传统的字符串拼接方式不仅代码冗长，还容易出错。今天分享一个优雅的解决方案——基于配置的字符串格式化工具类 `Formatter`。

## 🎯 解决的痛点

在日常开发中，你是否遇到过这些场景：

```javascript
// 传统的字符串拼接方式
const userInfo = `${user.name}${user.age ? `（${user.age}岁）` : ''}${user.department ? `，${user.department}` : ''}`;
const dateText = user.createTime ? dayjs(user.createTime).format('YYYY-MM-DD') : '';
```

这种方式存在诸多问题：
- 代码冗长且难以维护
- 容易出现空值处理不当
- 复用性差
- 逻辑分散，难以统一管理

## 💡 核心设计思想

`Formatter` 类采用**配置驱动**的设计理念，通过描述性的配置对象来定义字符串的构建规则，实现了：

- **声明式编程**：用配置描述结果，而非过程
- **高度可复用**：一次配置，多处使用
- **灵活的过滤器系统**：支持链式数据处理
- **多数据源支持**：自动从多个对象中查找字段值

## 🏗️ 核心架构

### 数据结构设计

```typescript
interface Segment {
  field?: string;           // 数据字段路径，支持嵌套（如 'user.profile.name'）
  defaultValue?: string;    // 字段为空时的默认值
  filters?: Array<string | { name: string; format?: string }>; // 过滤器链
  text?: string;           // 固定文本内容
  suffix?: string;         // 后缀符号（如 "，"、"/"、"-"）
  wrap?: [string, string]; // 包裹符号（如 ["（", "）"]）
}
```

### 内置过滤器

```typescript
{
  upper: (str: string) => str.toUpperCase(),        // 转大写
  lower: (str: string) => str.toLowerCase(),        // 转小写  
  trim: (str: string) => str.trim(),                // 去空格
  capitalize: (str: string) => str.charAt(0).toUpperCase() + str.slice(1), // 首字母大写
  formatDate: (str: string, format?: string) => {  // 日期格式化
    // 智能日期处理逻辑
  }
}
```

## 🚀 实际应用场景

### 场景1：用户信息展示

```typescript
const formatter = new Formatter();

// 配置用户信息格式
const userInfoConfig = [
  { field: 'name', filters: ['capitalize'] },
  { field: 'age', wrap: ['（', '岁）'], suffix: '，' },
  { field: 'department' },
  { field: 'position', wrap: ['/', ''] }
];

const userData = {
  name: 'zhang san',
  age: 28,
  department: '技术部',
  position: '前端工程师'
};

const result = formatter.format(userInfoConfig, userData);
// 输出: "Zhang san（28岁），技术部/前端工程师"
```

### 场景2：日期时间处理

```typescript
const dateConfig = [
  { text: '创建时间：' },
  { 
    field: 'createTime', 
    filters: [{ name: 'formatDate', format: 'YYYY年MM月DD日 HH:mm' }],
    defaultValue: '未知'
  }
];

const data = { createTime: '2024-01-15T10:30:00Z' };
const result = formatter.format(dateConfig, data);
// 输出: "创建时间：2024年01月15日 10:30"
```

### 场景3：多数据源合并

```typescript
// 支持从多个对象中查找字段值
const config = [
  { field: 'user.name' },
  { field: 'profile.title', wrap: ['（', '）'] },
  { field: 'contact.email', suffix: ' - ' },
  { field: 'department.name' }
];

const user = { name: 'Alice' };
const profile = { title: '高级工程师' };
const contact = { email: 'alice@company.com' };
const department = { name: 'AI研发部' };

const result = formatter.format(config, user, profile, contact, department);
// 输出: "Alice（高级工程师）alice@company.com - AI研发部"
```

## 🔧 高级特性

### 自定义过滤器

```typescript
const formatter = new Formatter();

// 注册自定义过滤器
formatter.registerFilter('currency', (value: string, currency = 'CNY') => {
  const num = parseFloat(value);
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: currency
  }).format(num);
});

// 使用自定义过滤器
const config = [
  { text: '价格：' },
  { field: 'price', filters: [{ name: 'currency', format: 'USD' }] }
];
```

### 嵌套字段访问

```typescript
// 支持深层嵌套字段访问
const config = [
  { field: 'user.profile.personal.firstName' },
  { field: 'user.profile.personal.lastName' }
];

const data = {
  user: {
    profile: {
      personal: {
        firstName: 'John',
        lastName: 'Doe'
      }
    }
  }
};
```

### 智能空值处理

```typescript
const config = [
  { field: 'title' },
  { field: 'subtitle', wrap: ['（', '）'], suffix: ' - ' }, // 如果subtitle为空，整个segment不输出
  { field: 'author', defaultValue: '匿名' }
];

// 自动处理空值，避免输出多余的符号
```

## 🎨 设计亮点

### 1. 链式过滤器处理
过滤器支持链式调用，数据经过多层处理：
```typescript
filters: ['trim', 'lower', { name: 'formatDate', format: 'MM/DD' }]
```

### 2. 智能符号处理
自动清理末尾多余的分隔符，确保输出整洁：
```typescript
// 正则清理：/[\s/，-]+$/
"张三，技术部，/" → "张三，技术部"
```

### 3. 安全的属性访问
使用 `Reflect.get` 和异常处理，避免访问不存在属性时报错：
```typescript
const val = fieldPath.split('.').reduce((obj, key) => {
  if (obj && typeof obj === 'object' && Object.prototype.hasOwnProperty.call(obj, key)) {
    return Reflect.get(obj, key);
  }
  return undefined;
}, data);
```

## 📈 性能优化

1. **惰性求值**：只有当字段值非空时才进行后续处理
2. **短路机制**：找到第一个有效值即停止搜索
3. **缓存友好**：过滤器函数可复用，避免重复创建

## 🔮 扩展性

### 添加新过滤器
```typescript
formatter.registerFilter('mask', (str: string, maskChar = '*') => {
  // 手机号脱敏处理
  return str.replace(/(\d{3})\d{4}(\d{4})/, `$1${maskChar.repeat(4)}$2`);
});
```

### 与模板引擎结合
```typescript
// 可与Vue、React等框架的模板系统结合
const Template = ({ config, data }) => {
  const formatter = new Formatter();
  return <span>{formatter.format(config, data)}</span>;
};
```

## 🎯 最佳实践

1. **配置复用**：将常用配置提取为常量
2. **类型安全**：结合TypeScript使用，获得更好的类型提示
3. **错误处理**：合理设置默认值，避免显示异常数据
4. **性能考虑**：对于大量数据处理，考虑使用缓存机制

## 总结

`Formatter` 类通过配置驱动的方式，优雅地解决了字符串格式化的常见问题。它不仅提高了代码的可读性和维护性，还提供了强大的扩展能力。在实际项目中，这种设计模式可以显著减少重复代码，提升开发效率。

无论是简单的字符串拼接，还是复杂的多数据源处理，`Formatter` 都能提供统一、优雅的解决方案。推荐在需要大量字符串处理的项目中使用这种设计思路。
