# 事件冒泡、事件捕获、事件委托

## 1. 事件流的基本概念

DOM 事件流描述了事件在 DOM 树中传播的完整过程，它分为三个阶段：

```
    ┌─────────────┐
    │   Document  │
    └──────┬──────┘
           │
    ┌──────▼──────┐      1. 捕获阶段（从外向内）
    │   HTML      │
    └──────┬──────┘
           │
    ┌──────▼──────┐      2. 目标阶段（到达目标元素）
    │    Body     │
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │    Div      │
    └──────┬──────┘
           │
    ┌──────▼──────┐      3. 冒泡阶段（从内向外）
    │   Button    │
    └─────────────┘
```

### 事件流的三个阶段

```javascript
element.addEventListener('click', handler, useCapture);
// useCapture: false（默认）- 冒泡阶段触发
// useCapture: true  - 捕获阶段触发
```

## 2. 事件冒泡

事件冒泡是指事件从目标元素开始，沿着 DOM 树向上传播到文档根节点。

### 2.1 基本示例

```html
<!DOCTYPE html>
<html>
<body>
  <div id="outer">
    <div id="middle">
      <button id="inner">Click Me</button>
    </div>
  </div>

  <script>
    const outer = document.getElementById('outer');
    const middle = document.getElementById('middle');
    const inner = document.getElementById('inner');

    outer.addEventListener('click', (e) => {
      console.log('Outer clicked');
    });

    middle.addEventListener('click', (e) => {
      console.log('Middle clicked');
    });

    inner.addEventListener('click', (e) => {
      console.log('Inner clicked');
    });

    // 点击按钮的输出顺序：
    // Inner clicked
    // Middle clicked
    // Outer clicked
  </script>
</body>
</html>
```

### 2.2 阻止事件冒泡

使用 `event.stopPropagation()` 阻止事件继续冒泡：

```javascript
inner.addEventListener('click', (e) => {
  console.log('Inner clicked');
  e.stopPropagation();  // 阻止冒泡
});

// 点击按钮的输出：
// Inner clicked
//（不再触发 middle 和 outer 的事件）
```

### 2.3 事件冒泡的实际应用

```javascript
// 场景：嵌套菜单
document.querySelectorAll('.menu').forEach(menu => {
  menu.addEventListener('click', (e) => {
    if (e.target.classList.contains('menu-trigger')) {
      e.stopPropagation();
      menu.classList.toggle('open');
    }
  });
});

// 点击文档其他地方关闭所有菜单
document.addEventListener('click', () => {
  document.querySelectorAll('.menu.open').forEach(menu => {
    menu.classList.remove('open');
  });
});
```

## 3. 事件捕获

事件捕获与冒泡相反，事件从文档根节点开始，向下传播到目标元素。

### 3.1 基本示例

```html
<!DOCTYPE html>
<html>
<body>
  <div id="outer">
    <div id="middle">
      <button id="inner">Click Me</button>
    </div>
  </div>

  <script>
    const outer = document.getElementById('outer');
    const middle = document.getElementById('middle');
    const inner = document.getElementById('inner');

    // 在捕获阶段监听（第三个参数为 true）
    outer.addEventListener('click', (e) => {
      console.log('Outer captured');
    }, true);

    middle.addEventListener('click', (e) => {
      console.log('Middle captured');
    }, true);

    inner.addEventListener('click', (e) => {
      console.log('Inner clicked');
    }, false); // 冒泡阶段

    // 点击按钮的输出顺序：
    // Outer captured
    // Middle captured
    // Inner clicked
  </script>
</body>
</html>
```

### 3.2 完整的事件流演示

```javascript
document.addEventListener('click', (e) => {
  console.log('Document capture');
}, true);

document.body.addEventListener('click', (e) => {
  console.log('Body capture');
}, true);

outer.addEventListener('click', (e) => {
  console.log('Outer capture');
}, true);

middle.addEventListener('click', (e) => {
  console.log('Middle capture');
}, true);

inner.addEventListener('click', (e) => {
  console.log('Inner target');
}, false); // 目标阶段

middle.addEventListener('click', (e) => {
  console.log('Middle bubble');
}, false);

outer.addEventListener('click', (e) => {
  console.log('Outer bubble');
}, false);

document.body.addEventListener('click', (e) => {
  console.log('Body bubble');
}, false);

document.addEventListener('click', (e) => {
  console.log('Document bubble');
}, false);

// 完整输出顺序：
// Document capture
// Body capture
// Outer capture
// Middle capture
// Inner target
// Middle bubble
// Outer bubble
// Body bubble
// Document bubble
```

### 3.3 阻止事件捕获

```javascript
outer.addEventListener('click', (e) => {
  console.log('Outer captured');
  e.stopPropagation(); // 阻止事件继续传播
}, true);

// 点击按钮的输出：
// Outer captured
//（不会触发 Middle 和 Inner 的事件）
```

## 4. 事件委托

事件委托是一种利用事件冒泡机制，将事件处理程序绑定到父元素上，从而管理子元素事件的技术。

### 4.1 基本概念

```javascript
// ❌ 不好的做法：为每个列表项单独绑定事件
document.querySelectorAll('.list-item').forEach(item => {
  item.addEventListener('click', function() {
    console.log(this.textContent);
  });
});

// ✅ 好的做法：使用事件委托
document.querySelector('.list').addEventListener('click', function(e) {
  if (e.target.classList.contains('list-item')) {
    console.log(e.target.textContent);
  }
});
```

### 4.2 为什么使用事件委托

#### 性能优势

```html
<ul id="list">
  <li>Item 1</li>
  <li>Item 2</li>
  <!-- ... 1000 个列表项 -->
  <li>Item 1000</li>
</ul>

<script>
  // ❌ 性能问题：创建 1000 个事件监听器
  const items = document.querySelectorAll('#list li');
  items.forEach(item => {
    item.addEventListener('click', handler);
  });

  // ✅ 性能优化：只需 1 个事件监听器
  document.getElementById('list').addEventListener('click', function(e) {
    if (e.target.tagName === 'LI') {
      console.log(e.target.textContent);
    }
  });
</script>
```

#### 动态元素支持

```javascript
const list = document.getElementById('list');

// 事件委托：新添加的元素也能触发事件
list.addEventListener('click', function(e) {
  if (e.target.classList.contains('delete-btn')) {
    e.target.parentElement.remove();
  }
});

// 动态添加新元素，无需重新绑定事件
function addNewItem(text) {
  const li = document.createElement('li');
  li.innerHTML = `
    ${text}
    <button class="delete-btn">Delete</button>
  `;
  list.appendChild(li);
}

addNewItem('New Item 1');
addNewItem('New Item 2');
// 新元素的删除按钮也能正常工作
```

### 4.3 事件委托的最佳实践

#### 使用 matches() 方法

```javascript
list.addEventListener('click', function(e) {
  // ✅ 推荐：使用 matches 方法
  if (e.target.matches('.delete-btn')) {
    e.target.parentElement.remove();
  }
});

// 支持更复杂的选择器
if (e.target.matches('.list-item button.delete')) {
  // 处理逻辑
}
```

#### 处理冒泡匹配

```javascript
list.addEventListener('click', function(e) {
  // 当点击的是子元素时，向上查找匹配的元素
  const target = e.target.closest('.list-item');
  
  if (target && list.contains(target)) {
    console.log('Clicked item:', target.textContent);
  }
});
```

#### 使用事件委托的注意事项

```javascript
list.addEventListener('click', function(e) {
  // 1. 检查事件目标是否匹配
  if (e.target.matches('.interactive')) {
    // 处理逻辑
  }
  
  // 2. 防止处理非预期元素
  if (e.target.tagName === 'BUTTON') {
    // 只处理按钮点击
  }
  
  // 3. 使用 data 属性传递额外信息
  if (e.target.dataset.action) {
    const action = e.target.dataset.action;
    console.log('Action:', action);
  }
});
```

## 5. 实际应用场景

### 5.1 表单验证

```html
<form id="signup-form">
  <input type="text" name="username" data-validate="required,min:3" placeholder="Username">
  <input type="email" name="email" data-validate="required,email" placeholder="Email">
  <input type="password" name="password" data-validate="required,min:6" placeholder="Password">
  <button type="submit">Sign Up</button>
</form>

<script>
document.getElementById('signup-form').addEventListener('focusout', function(e) {
  if (e.target.matches('input[data-validate]')) {
    const rules = e.target.dataset.validate.split(',');
    let isValid = true;
    
    rules.forEach(rule => {
      const [type, param] = rule.split(':');
      
      switch(type) {
        case 'required':
          if (!e.target.value.trim()) {
            isValid = false;
          }
          break;
        case 'min':
          if (e.target.value.length < parseInt(param)) {
            isValid = false;
          }
          break;
        case 'email':
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)) {
            isValid = false;
          }
          break;
      }
    });
    
    e.target.classList.toggle('error', !isValid);
  }
});
</script>
```

### 5.2 表格操作

```html
<table id="data-table">
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John Doe</td>
      <td>john@example.com</td>
      <td>
        <button class="btn-edit" data-id="1">Edit</button>
        <button class="btn-delete" data-id="1">Delete</button>
      </td>
    </tr>
  </tbody>
</table>

<script>
document.getElementById('data-table').addEventListener('click', function(e) {
  const row = e.target.closest('tr');
  
  if (e.target.matches('.btn-edit')) {
    const id = e.target.dataset.id;
    const name = row.querySelector('td:first-child').textContent;
    editRow(id, name);
  }
  
  if (e.target.matches('.btn-delete')) {
    const id = e.target.dataset.id;
    if (confirm('Are you sure you want to delete this row?')) {
      row.remove();
    }
  }
});

function editRow(id, name) {
  console.log('Editing row', id, name);
}
</script>
```

### 5.3 选项卡切换

```html
<div class="tabs">
  <div class="tab-buttons" id="tab-buttons">
    <button class="tab-btn active" data-tab="tab1">Tab 1</button>
    <button class="tab-btn" data-tab="tab2">Tab 2</button>
    <button class="tab-btn" data-tab="tab3">Tab 3</button>
  </div>
  
  <div class="tab-content">
    <div id="tab1" class="tab-panel active">Content 1</div>
    <div id="tab2" class="tab-panel">Content 2</div>
    <div id="tab3" class="tab-panel">Content 3</div>
  </div>
</div>

<script>
document.getElementById('tab-buttons').addEventListener('click', function(e) {
  if (e.target.matches('.tab-btn')) {
    // 移除所有 active 类
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    
    // 添加 active 类到当前选项
    e.target.classList.add('active');
    const tabId = e.target.dataset.tab;
    document.getElementById(tabId).classList.add('active');
  }
});
</script>
```

### 5.4 拖拽功能

```html
<div id="dropzone" class="dropzone">
  <p>Drag files here</p>
</div>

<script>
const dropzone = document.getElementById('dropzone');

dropzone.addEventListener('dragover', function(e) {
  e.preventDefault();  // 允许放置
  e.stopPropagation();
  dropzone.classList.add('dragover');
});

dropzone.addEventListener('dragleave', function(e) {
  e.preventDefault();
  e.stopPropagation();
  dropzone.classList.remove('dragover');
});

dropzone.addEventListener('drop', function(e) {
  e.preventDefault();
  e.stopPropagation();
  dropzone.classList.remove('dragover');
  
  const files = e.dataTransfer.files;
  console.log('Dropped files:', files);
  
  // 处理文件
  Array.from(files).forEach(file => {
    console.log('File:', file.name);
  });
});
</script>
```

## 6. 高级技巧

### 6.1 事件委托中的元素识别

```javascript
container.addEventListener('click', function(e) {
  // 方法1：使用 closest
  const button = e.target.closest('.my-button');
  if (button && container.contains(button)) {
    console.log('Button clicked');
  }
  
  // 方法2：使用向上遍历
  let target = e.target;
  while (target !== container) {
    if (target.classList.contains('my-button')) {
      console.log('Button clicked');
      break;
    }
    target = target.parentElement;
  }
});
```

### 6.2 组合使用冒泡和捕获

```html
<div id="modal">
  <div class="modal-content">
    <button class="close-btn">Close</button>
  </div>
</div>

<script>
// 点击遮罩层关闭模态框（捕获阶段）
document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) {
    this.classList.add('hidden');
  }
}, true);

// 点击关闭按钮关闭模态框（冒泡阶段）
document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target.matches('.close-btn')) {
    e.stopPropagation();  // 阻止冒泡到遮罩层
    this.classList.add('hidden');
  }
});
</script>
```

### 6.3 阻止默认行为

```javascript
// 阻止链接跳转
document.querySelectorAll('.prevent-default').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    console.log('Link clicked, but navigation prevented');
  });
});

// 阻止表单提交
form.addEventListener('submit', function(e) {
  e.preventDefault();
  // 自定义提交逻辑
});

// 阻止右键菜单
document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
  console.log('Context menu prevented');
});

// 阻止默认行为 + 阻止冒泡
document.addEventListener('click', function(e) {
  e.preventDefault();
  e.stopPropagation();
  console.log('Default prevented, propagation stopped');
});
```

### 6.4 事件对象的常用属性和方法

```javascript
element.addEventListener('click', function(e) {
  // 目标相关
  console.log('target:', e.target);        // 实际触发事件的元素
  console.log('currentTarget:', e.currentTarget); // 绑定事件的元素
  
  // 坐标相关
  console.log('clientX/Y:', e.clientX, e.clientY); // 相对于视口
  console.log('pageX/Y:', e.pageX, e.pageY);       // 相对于文档
  console.log('screenX/Y:', e.screenX, e.screenY); // 相对于屏幕
  
  // 修饰键
  console.log('shiftKey:', e.shiftKey);
  console.log('ctrlKey:', e.ctrlKey);
  console.log('altKey:', e.altKey);
  console.log('metaKey:', e.metaKey);
  
  // 鼠标按钮
  console.log('button:', e.button);  // 0:左键, 1:中键, 2:右键
  
  // 事件类型
  console.log('type:', e.type);
  
  // 事件时间戳
  console.log('timeStamp:', e.timeStamp);
  
  // 阻止事件传播
  e.stopPropagation();    // 阻止冒泡和捕获
  e.stopImmediatePropagation(); // 阻止同元素的其他监听器
  
  // 阻止默认行为
  e.preventDefault();
  
  // 组合使用
  // e.stopImmediatePropagation(); 阻止当前元素后续监听器
}, { once: true }); // 一次性事件
```

## 7. 性能优化

### 7.1 防抖和节流

```javascript
// 防抖：延迟执行，只在最后一次触发后执行
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 节流：固定时间间隔执行
function throttle(fn, delay) {
  let last = 0;
  return function(...args) {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn.apply(this, args);
    }
  };
}

// 应用：滚动事件
window.addEventListener('scroll', throttle(function() {
  console.log('Scrolling');
}, 100));

// 应用：搜索输入
searchInput.addEventListener('input', debounce(function(e) {
  console.log('Searching:', e.target.value);
}, 300));
```

### 7.2 事件监听器的管理

```javascript
class EventManager {
  constructor() {
    this.listeners = [];
  }
  
  on(element, event, handler, options) {
    element.addEventListener(event, handler, options);
    this.listeners.push({ element, event, handler, options });
    return this;
  }
  
  off(element, event, handler) {
    element.removeEventListener(event, handler);
    this.listeners = this.listeners.filter(
      l => !(l.element === element && l.event === event && l.handler === handler)
    );
    return this;
  }
  
  destroy() {
    this.listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.listeners = [];
  }
}

// 使用
const eventManager = new EventManager();
eventManager
  .on(button, 'click', handleClick)
  .on(window, 'scroll', handleScroll);

// 清理
eventManager.destroy();
```

### 7.3 被动事件监听器

```javascript
// 被动监听器：告诉浏览器不会调用 preventDefault()
// 可以提高滚动性能，特别是在移动端

document.addEventListener('touchstart', function(e) {
  // 可以访问事件属性，但不能调用 preventDefault()
  console.log('Touch started');
}, { passive: true });

// 自动检测支持情况
const supportsPassive = (() => {
  let supports = false;
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get() {
        supports = true;
      }
    });
    window.addEventListener('test', null, opts);
    window.removeEventListener('test', null, opts);
  } catch (e) {}
  return supports;
})();

// 使用被动监听器提升滚动性能
window.addEventListener('wheel', handleScroll, {
  passive: true
});

document.addEventListener('touchmove', handleTouchMove, {
  passive: true
});
```

## 8. 常见陷阱和解决方案

### 8.1 事件目标变化

```javascript
// 问题：点击子元素时 e.target 可能不是预期的元素
<div class="card">
  <h3>Title</h3>
  <p>Content with <strong>bold text</strong></p>
</div>

// ❌ 错误：可能匹配到子元素
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', function(e) {
    if (e.target.classList.contains('card')) {
      // 点击 <strong> 时不会执行
    }
  });
});

// ✅ 正确：使用 closest 或 currentTarget
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', function(e) {
    // 方法1：使用 closest
    const cardTarget = e.target.closest('.card');
    if (cardTarget === card) {
      console.log('Card clicked');
    }
    
    // 方法2：使用 currentTarget
    if (e.currentTarget === card) {
      console.log('Card clicked');
    }
  });
});
```

### 8.2 多次绑定同一事件

```javascript
// 问题：每次调用都添加新的事件监听器
function addListeners() {
  button.addEventListener('click', handleClick);  // 重复绑定
}

// 解决方案1：先移除再添加
function addListeners() {
  button.removeEventListener('click', handleClick);
  button.addEventListener('click', handleClick);
}

// 解决方案2：使用标志
let isListenerAdded = false;
function addListeners() {
  if (!isListenerAdded) {
    button.addEventListener('click', handleClick);
    isListenerAdded = true;
  }
}

// 解决方案3：使用 once 选项
function addListeners() {
  button.addEventListener('click', handleClick, { once: true });
}
```

### 8.3 内存泄漏

```javascript
// 问题：移除元素但未移除事件监听器
function createComponent() {
  const container = document.createElement('div');
  container.addEventListener('click', function() {
    console.log('Clicked');
  });
  document.body.appendChild(container);
  
  // 移除容器，但事件监听器仍然存在
  setTimeout(() => {
    container.remove();
  }, 5000);
}

// 解决方案：使用 AbortController
function createComponent() {
  const abortController = new AbortController();
  const container = document.createElement('div');
  
  container.addEventListener('click', function() {
    console.log('Clicked');
  }, { signal: abortController.signal });
  
  document.body.appendChild(container);
  
  // 移除容器和所有事件监听器
  setTimeout(() => {
    container.remove();
    abortController.abort();
  }, 5000);
}

// 或者使用 cleanup 函数
function createComponent() {
  const container = document.createElement('div');
  
  function handleClick() {
    console.log('Clicked');
  }
  
  container.addEventListener('click', handleClick);
  document.body.appendChild(container);
  
  // 返回清理函数
  return function cleanup() {
    container.removeEventListener('click', handleClick);
    container.remove();
  };
}

const cleanup = createComponent();
// 清理时调用
// cleanup();
```

## 9. 现代事件 API

### 9.1 新的事件选项

```javascript
// once: 只触发一次
button.addEventListener('click', handler, { once: true });

// passive: 不会调用 preventDefault()
document.addEventListener('touchstart', handler, { passive: true });

// capture: 捕获阶段触发
container.addEventListener('click', handler, { capture: true });

// signal: 使用 AbortController 取消事件
const controller = new AbortController();
button.addEventListener('click', handler, { signal: controller.signal });
controller.abort(); // 取消所有使用该 signal 的事件监听器
```

### 9.2 自定义事件

```javascript
// 创建自定义事件
const customEvent = new CustomEvent('myevent', {
  detail: { message: 'Hello from custom event!' },
  bubbles: true,
  cancelable: true
});

// 派发自定义事件
element.dispatchEvent(customEvent);

// 监听自定义事件
element.addEventListener('myevent', function(e) {
  console.log('Custom event received:', e.detail.message);
});

// 使用示例：组件通信
class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
  
  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
}

// 使用
const emitter = new EventEmitter();
emitter.on('message', (data) => console.log('Received:', data));
emitter.emit('message', { text: 'Hello' });
```

## 10. 最佳实践总结

### 10.1 何时使用事件委托

✅ **使用事件委托的场景：**
- 动态添加或删除的元素
- 大量相似元素（如列表、表格）
- 减少事件监听器数量以提升性能

❌ **不使用事件委托的场景：**
- 事件处理逻辑复杂且元素不相关
- 需要频繁阻止冒泡
- 元素层级较深且性能不是关键问题

### 10.2 性能优化建议

```javascript
// 1. 优先使用事件委托
container.addEventListener('click', handler);

// 2. 使用 passive 选项提升滚动性能
document.addEventListener('touchmove', handler, { passive: true });

// 3. 使用防抖和节流
window.addEventListener('scroll', throttle(handler, 100));
input.addEventListener('input', debounce(handler, 300));

// 4. 及时清理事件监听器
function cleanup() {
  element.removeEventListener('click', handler);
}

// 5. 使用 AbortController 批量管理
const controller = new AbortController();
element1.addEventListener('click', handler1, { signal: controller.signal });
element2.addEventListener('click', handler2, { signal: controller.signal });
controller.abort(); // 一次性清理所有
```

### 10.3 代码规范

```javascript
// ✅ 好的实践
// 1. 命名清晰
document.getElementById('user-list').addEventListener('click', handleUserListClick);

// 2. 使用语义化的选择器
if (e.target.matches('[data-action="delete"]')) {
  handleDelete(e.target.dataset.id);
}

// 3. 及时清理
useEffect(() => {
  element.addEventListener('click', handler);
  return () => {
    element.removeEventListener('click', handler);
  };
}, []);

// ❌ 避免
// 1. 匿名函数（难以移除）
element.addEventListener('click', function() { });

// 2. 过度嵌套
container.addEventListener('click', function(e) {
  if (e.target.tagName === 'BUTTON') {
    if (e.target.parentElement) {
      if (e.target.parentElement.parentElement) {
        // 太深了
      }
    }
  }
});

// 3. 混合使用冒泡和捕获导致混乱
```

## 11. 总结

事件冒泡、事件捕获和事件委托是 DOM 事件处理的核心概念：

### 关键要点

1. **事件流**：捕获 → 目标 → 冒泡
2. **事件冒泡**：从目标元素向上传播到文档根
3. **事件捕获**：从文档根向下传播到目标元素
4. **事件委托**：利用冒泡机制，在父元素上管理子元素事件

### 实用技巧

- 使用 `e.stopPropagation()` 阻止事件传播
- 使用 `e.preventDefault()` 阻止默认行为
- 使用事件委托提升性能，特别是动态元素
- 使用 `e.target.closest()` 处理复杂的事件匹配
- 使用防抖和节流优化频繁触发的事件
- 及时清理事件监听器避免内存泄漏

### 现代开发

- 使用 `AbortController` 管理事件监听器
- 利用 `passive` 选项提升滚动性能
- 合理使用 `once` 选项处理一次性事件
- 自定义事件实现组件间通信

掌握这些概念和技巧，可以帮助我们编写更高效、更可维护的前端代码。