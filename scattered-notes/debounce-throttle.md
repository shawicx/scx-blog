<!--
 * @Author: shawicx d35f3153@proton.me
 * @Date: 2024-06-23 11:53:22
 * @LastEditors: shawicx d35f3153@proton.me
 * @LastEditTime: 2025-08-09 09:44:55
 * @Description: 
-->
# 节流与防抖

## 节流: 规定时间段内只执行一次事件

```typescript
function throttle(fn, delay) {
  let previous = 0;
  return function() {
    let now = +new Date();
    let that = this, args = arguments;
    if (now - previous > delay) {
      fn.apply(that, args);
      previous = now;
    }
  }
}
```

```typescript
function throttle(fn, delay) {
  let timer = null;
  return function() {
    let that = this, args = arguments;
    if(!timer){
      timer = setTimeout(() => {
        fn.apply(that,args);
        timer = null;
      },delay);
    }
  }
}
```

## 防抖: 事件在n秒内才执行，如果n秒内再次触发，以新的事件时间为准重新计时，n秒后再执行

```typescript
function debounce(fn, delay) {
  let timer = null;
  return function() {
    <!-- this指向 和 event对象-->
    let that = this, args = arguments;
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(function() {
      fn.apply(that, args);
    }, delay);
  }
}
```

``` typescript
function debounce(fn, delay, immediate) {
  let timer = null;
  return function() {
    <!-- this指向 和 event对象-->
    let that = this, args = arguments;
    if (timer) {
      clearTimeout(timer);
    }
    if (immediate) {
      let callNow = !timeout;
      timeout = setTimeout(function(){
        timeout = null;
      }, wait)
      if (callNow) result = fn.apply(context, args)
    } else {
      timer = setTimeout(function() {
        fn.apply(that, args);
      }, delay);
    }
  }
}
```
