---
title: 'Default Title'
description: 'Default Description'
draft: false
---

<!--
 * @Author: shawicx d35f3153@proton.me
 * @Date: 2024-06-23 00:57:25
 * @LastEditors: shawicx d35f3153@proton.me
 * @LastEditTime: 2025-08-09 09:45:45
 * @Description: 
-->
# 深浅拷贝

## 一、问题由来

*这个问题的出现主要是Javascript的数据类型差异，即原始数据类型和引用数据类型。**我们知道对于原始数据类型来说，变量是直接按值存放的，存放在栈内存中的简单数据段，可以直接访问。而对于引用数据类型来说，变量保存的是一个指针，这个指针指向另一个位置。当需要访问引用类型（如对象，数组等）的值时，首先从栈中获得该对象的地址指针，然后再从堆内存中取得所需的数据。*

```typescript
let obj = {
  begin: "begin",
  last: "last",
  func: function() {
    console.log(this.first);
  }
};
let copy = obj;
copy.begin = "end";
console.log(obj.begin);
// end
```

> 出现这个现象的原因是因为copy和obj指向的是同一个内存地址，改变其中一个时另一个自然也改变了，这就是浅拷贝。而深拷贝则会新开辟一个内存地址，将原对象的各个属性逐个复制进去，对拷贝对象和被拷贝对象的操作互不影响。

***

## 二、浅拷贝

> 定义一个复制对象:

```typescript
const obj = {
  name: "张三",
  age: 18,
  // 性别
  gender: "man",
  school: {
    primary: "希望小学",
    middle: "明德中学",
    university: "人生大学"
  }
}
```

#### 1. 遍历复制

```typescript
function shallowCopy(obj) {
  if (typeof obj !== 'object') return;
  // 根据obj的类型判断是新建一个数组还是对象
  let _obj = obj instanceof Array ? [] : {};
  // 遍历obj，并且判断是obj的属性才拷贝
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      _obj[key] = obj[key];
    }
  }
  return _obj;
}
```

现在来测试一下这个函数:

```typescript
let x = shallowCopy(obj);
let y = x;
y.school.middle = "平川中学";
console.log(x.school.middle);
// 平川中学
// 测试结果表明这是浅拷贝
```

#### 2. `Object.assign()`

*这个Api的功能是把任意多个的源对象自身的可枚举属性拷贝给目标对象，然后返回目标对象*

```typescript
let _obj = Object.assign({}, obj);
_obj.school.primary = "红旗小学";
console.log(obj.school.primary);
// 红旗小学
```

## 三、深拷贝

#### 1. `Object.prototype.hasOwnProperty()`

```typescript
function deepCopy(obj) {
  if (typeof obj !== 'object') return;
  let _obj = obj instanceof Array ? [] : {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      _obj[key] = typeof obj[key] === 'object' ? deepCopy(obj[key]) : obj[key];
    }
  }
  return _obj;
}
```

**测试：**

```typescript
let copy = deepCopy(obj);
copy.school.middle = "华夏中学";
console.log(obj.school.middle);
// 明德中学
// 拷贝出来的对象值的改变并未导致原对象值的改变。
```

#### 2. `JSON.parse()`和`JSON.stringify()`

```typescript
let copy = JSON.parse(JSON.stringify(obj));
copy.shcool.university = "清华大学";
console.log(obj.shcool.university);
// 人生大学
```

> 这种方法不能对Function、Date等对象实现深拷贝。

## 四、能应对大部分场景的深拷贝

> 此方法来自Stackoverflow的高支持答案，目前支持数达到1342(截至2018-10-01)，原答案[戳这里](https://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object?page=1#tab-top "戳这里")

```typescript
function deepCopy(obj) {
  let copy;
  // 处理3个简单的类型, null 或者 undefined
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }
  if (obj instanceof Array) {
    let copy = [];
    for (var i = 0, len = obj.length; i < len; i++) {
      copy[i] = clone(obj[i]);
    }
    return copy;
  }
  if (obj instanceof Object) {
    let copy = {};
    for (let attr in obj) {
      if (obj.hasOwnProperty(attr)) {
        copy[attr] = clone(obj[attr]);
      }
    }
    return copy;
  }
  throw new Error("Unable to copy obj! Its type isn't supported.");
}
```

以上代码能满足大部分的需求，但仍有一些情形不能解决，如：

```typescript
// 这样可以成功深拷贝
var tree = {
  "left": { "left": null, "right": null, "data": 3 },
  "right": null,
  "data": 8
};

// 这样也可以成功，但是你会得到2份内部节点，而不是2个引用相同的副本
var directedAcyclicGraph = {
  "left"  : { "left" : null, "right" : null, "data" : 3 },
  "data"  : 8
};

directedAcyclicGraph["right"] = directedAcyclicGraph["left"];

// 这种情况因为无限的递归，会导致堆栈溢出
var cylicGraph = {
  "left"  : { "left" : null, "right" : null, "data" : 3 },
  "data"  : 8
};
cylicGraph["right"] = cylicGraph;
```
