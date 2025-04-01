# 数组去重

```typescript
const arr = ['宫保鸡丁', '红烧茄子', '番茄炒蛋', '扬州炒饭', '兰州拉面', '麻婆豆腐', '回锅牛肉', '红烧茄子'];
```

## 双循环

```typescript
function NoRepeat (arr) {
  if (!Array.isArray(arr)) {
    console.log("not Array");
    return
  }
  let res = [], isRepeat = false;
  for (let i = 1; i < arr.length; i++) {
    isRepeat = false
    for (let j = 0; j < res.length; j++) {
      if (arr[i] === res[j]) {
        isRepeat = true;
        break;
      }
    }
    if (!isRepeat) {
      res.push(arr[i])
    }
  }
  return res
}
```

## indexOf (1)

```typescript
function NoRepeat (arr) {
  if (!Array.isArray(arr)) {
    consolole.log("not Array");
    return
  }
  let newArr = [];
  for(let i = 0, i < arr.length; i++){
    if(newArr.indexOf(arr[i]) === -1){
      newArr.push(item);
    }
  }
  return newArr;
}
```

## indexOf (2)

```typescript
function NoRepeat (arr) {
  if (!Array.isArray(arr)) {
    consolole.log("not Array");
    return
  }
  return arr.filter.call(arr,   function(item, index){
    return arr.indexOf(item) === index;
  });
}
```

## 相邻元素

```typescript
function NoRepeat (arr) {
  if (!Array.isArray(arr)) {
    consolole.log("not Array");
    return
  }
  arr = arr.sort()
  let res = []
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] !== arr[i-1]) {
      res.push(arr[i])
    }
  }
  return res
}
```

## 对象属性

```typescript
function NoRepeat (arr) {
  if (!Array.isArray(arr)) {
    consolole.log("not Array");
    return
  }
  let res = [], obj = {}
  for (let i = 0; i < arr.length; i++) {
    if (!obj[arr[i]]) {
      res.push(arr[i])
      obj[arr[i]] = 1;
    } else {
      obj[arr[i]]++;
    }
  }
  return res
}
```

## Set与解构赋值

```typescript
function NoRepeat (arr) {
  if (!Array.isArray(arr)) {
    consolole.log("not Array");
    return
  }
  return [...new Set(arr)]
}
```

## Array.from与Set

```typescript
function NoRepeat (arr) {
  if (!Array.isArray(arr)) {
    consolole.log("not Array");
    return
  }
  return Array.from(new Set(arr))
}
```

## Map (1)

```typescript
function NoRepeat (arr) {
  if (!Array.isArray(arr)) {
    consolole.log("not Array");
    return
  }
  const newArr = [];
  const newMap = new Map();
  for(let i = 0; i < arr.length; i++){
    if(!newMap.get(arr[i])){
      newMap.set(arr[i], 1);
      newArray.push(arr[i]);
    }
  }
  return newArr;
}
```

## Map (2)

```typescript
function NoRepeat (arr) {
  if (!Array.isArray(arr)) {
    consolole.log("not Array");
    return
  }
  const newMap = new Map();
  return arr.filter((item) => {
    return !newMap.has(item) && newMap.set(item, 1);
  })
}
```

## includes

```typescript
function NoRepeat (arr) {
  if (!Array.isArray(arr)) {
    consolole.log("not Array");
    return
  }
  const newArr = [];
  arr.forEach(item => {
    if (!newArr.includes(item)) {
      newArr.push(item);
    }
  });
  return newArr;    
}
```

## reduce

```typescript
function NoRepeat (arr) {
  if (!Array.isArray(arr)) {
    consolole.log("not Array");
    return
  }
  const newArr = [];
  return arr.reduce((init, current) => {
    if(init.length === 0 || init[init.length - 1] !== current){
      init.push(current);
    }
    return init;
  }, []);
}
```
