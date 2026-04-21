# Handlebars 基本使用

Handlebars 是一个逻辑无关的模板引擎，通过简单的语法将数据动态地插入到模板中，生成最终的输出结果。这里基于 [scx-api-tool](https://github.com/shawicx/scx-api-tool.git) 介绍 Handlebars 的使用

## 基础语法

### 变量替换

使用双大括号 <span v-pre>`{{variable}}`</span> 来插入变量值：

```typescript
// Hello {{name}}!
```

当传入数据 `{ name: "World" }` 时，输出 `Hello World!`。

### 条件渲染

使用 <span v-pre>`{{#if}}`</span> 和 <span v-pre>`{{/if}}`</span> 进行条件渲染：

```typescript
{{#if isActive}}
  <p>User is active</p>
{{else}}
  <p>User is inactive</p>
{{/if}}
```

### 循环遍历

使用 <span v-pre>`{{#each}}`</span> 和 <span v-pre>`{{/each}}`</span> 遍历数组或对象：

```typescript
<ul>
{{#each items}}
  <li>{{this}}</li>
{{/each}}
</ul>
```

### 助手函数

助手函数提供了扩展模板功能的能力：

```typescript
{{toLowerCase name}}
{{eq a b}}
{{httpMethod method}}
```

在项目中，助手函数通过 `registerTemplateHelpers` 函数进行注册：

```typescript
Handlebars.registerHelper('toLowerCase', (str: string) => str.toLowerCase());
Handlebars.registerHelper('eq', (a: any, b: any) => a === b);
```

### 模板继承与 Partials

partials 是可重用的模板片段，通过 <span v-pre>`{{> partialName}}`</span> 引入：

```handlebars
{{> functionBody}}
{{> importStatement}}
```

在项目中，partials 通过 `registerTemplatePartials` 函数进行注册：

```typescript
Handlebars.registerPartial(
  'functionBody',
  `
{{#if (eq requestMethodStyle 'method-specific')}}
  {{#if (eq method 'GET')}}
    {{#if hasParameters}}
  return {{requestMethodsObjectName}}.get<{{responseTypeName}}>('{{path}}', {{requestParamName}});
    {{else}}
  return {{requestMethodsObjectName}}.get<{{responseTypeName}}>('{{path}}');
    {{/if}}
  {{/if}}
{{/if}}
`,
);
```

## 实际应用示例

### 接口模板

在项目中，Handlebars 用于生成 API 接口代码：

```handlebars
/**
 * @description {{description}}
 */
export async function {{functionName}}({{requestParamName}}: {{requestTypeName}}): Promise<{{responseTypeName}}> {
  {{> functionBody}}
}
```

### 类型定义模板

用于生成 TypeScript 类型定义：

```handlebars
/**
 * @description {{description}}
 */
export interface {{typeName}} {
{{#each properties}}
  {{{name}}}{{#unless required}}?{{/unless}}: {{{type}}};
{{/each}}
}
```

### Zod Schema 模板

用于生成 Zod 验证 Schema：

```handlebars
export const {{requestTypeName}}Schema = {{{requestSchema}}};

export const {{responseTypeName}}Schema = {{{responseSchema}}};

export type {{requestTypeName}} = z.infer<typeof {{requestTypeName}}Schema>;
export type {{responseTypeName}} = z.infer<typeof {{responseTypeName}}Schema>;
```

## 模板编译与缓存

项目中的模板编译过程包含缓存机制以提升性能：

```typescript
export function compileTemplate(template: string): (data: any) => string {
  if (isTemplateCached(template)) {
    return getTemplateFromCache(template)!;
  }

  registerTemplateHelpers();
  registerTemplatePartials();

  const compiledTemplate = Handlebars.compile(template);
  setTemplateCache(template, compiledTemplate);

  return compiledTemplate;
}
```
