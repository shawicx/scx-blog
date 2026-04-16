# Promise 与 async/await

## Promise 基础

### 什么是 Promise

Promise 是 JavaScript 中用于处理异步操作的对象，它代表了一个异步操作的最终完成或失败。

### Promise 的三种状态

```javascript
const promise = new Promise((resolve, reject) => {
  // pending（进行中）
  // 通过 resolve 变为 fulfilled（已成功）
  // 通过 reject 变为 rejected（已失败）
});

// 状态转换：pending → fulfilled 或 pending → rejected
// 状态一旦改变，就不会再变
```

### 基本用法

```javascript
// 创建 Promise
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    const success = Math.random() > 0.5;
    
    if (success) {
      resolve('操作成功');
    } else {
      reject('操作失败');
    }
  }, 1000);
});

// 使用 Promise
promise
  .then(result => {
    console.log(result); // '操作成功'
  })
  .catch(error => {
    console.error(error); // '操作失败'
  })
  .finally(() => {
    console.log('无论成功或失败都会执行');
  });
```

## Promise 的链式调用

### then 方法

```javascript
// then 方法返回新的 Promise，可以链式调用
function fetchUser(userId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ id: userId, name: '张三' });
    }, 1000);
  });
}

function fetchPosts(userId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve([
        { id: 1, title: '文章 1', userId },
        { id: 2, title: '文章 2', userId },
      ]);
    }, 1000);
  });
}

// 链式调用
fetchUser(1)
  .then(user => {
    console.log('用户:', user);
    return fetchPosts(user.id); // 返回新的 Promise
  })
  .then(posts => {
    console.log('文章:', posts);
    return posts.length; // 返回普通值
  })
  .then(count => {
    console.log('文章数量:', count);
  });
```

### 错误传递

```javascript
// 错误会沿着链向后传递，直到被 catch 捕获
fetchUser(1)
  .then(user => {
    throw new Error('自定义错误');
  })
  .then(posts => {
    console.log('不会执行');
  })
  .catch(error => {
    console.error('捕获错误:', error.message);
  });

// catch 后可以继续链式调用
fetchUser(1)
  .then(user => {
    throw new Error('错误');
  })
  .catch(error => {
    console.error('捕获错误');
    return '恢复值';
  })
  .then(value => {
    console.log(value); // '恢复值'
  });
```

## Promise 静态方法

### Promise.all

```javascript
// 所有 Promise 都成功时返回结果数组
const promise1 = Promise.resolve(1);
const promise2 = Promise.resolve(2);
const promise3 = Promise.resolve(3);

Promise.all([promise1, promise2, promise3])
  .then(results => {
    console.log(results); // [1, 2, 3]
  });

// 一个失败，整个 Promise.all 失败
const promise4 = Promise.reject('错误');

Promise.all([promise1, promise2, promise4])
  .then(results => {
    console.log('不会执行');
  })
  .catch(error => {
    console.error(error); // '错误'
  });

// 实际应用：并行请求
async function fetchMultipleUsers() {
  const userPromises = [1, 2, 3].map(id => 
    fetch(`/api/users/${id}`).then(res => res.json())
  );
  
  const users = await Promise.all(userPromises);
  console.log(users);
}
```

### Promise.race

```javascript
// 返回最先完成的 Promise
const promise1 = new Promise(resolve => 
  setTimeout(() => resolve('快'), 100)
);
const promise2 = new Promise(resolve => 
  setTimeout(() => resolve('慢'), 500)
);

Promise.race([promise1, promise2])
  .then(result => {
    console.log(result); // '快'
  });

// 实际应用：请求超时处理
async function fetchWithTimeout(url, timeout = 5000) {
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('请求超时')), timeout)
  );
  
  return Promise.race([
    fetch(url).then(res => res.json()),
    timeoutPromise,
  ]);
}

fetchWithTimeout('/api/data', 3000)
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

### Promise.allSettled

```javascript
// 等待所有 Promise 完成，无论成功或失败
const promises = [
  Promise.resolve(1),
  Promise.reject('错误 1'),
  Promise.resolve(3),
  Promise.reject('错误 2'),
];

Promise.allSettled(promises)
  .then(results => {
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`Promise ${index + 1} 成功:`, result.value);
      } else {
        console.error(`Promise ${index + 1} 失败:`, result.reason);
      }
    });
  });

// 输出：
// Promise 1 成功: 1
// Promise 2 失败: 错误 1
// Promise 3 成功: 3
// Promise 4 失败: 错误 2
```

### Promise.any

```javascript
// 返回第一个成功的 Promise
const promises = [
  Promise.reject('错误 1'),
  Promise.resolve('成功 1'),
  Promise.resolve('成功 2'),
];

Promise.any(promises)
  .then(result => {
    console.log(result); // '成功 1'
  })
  .catch(error => {
    console.error(error); // 当所有 Promise 都失败时
  });

// 实际应用：尝试多个数据源
async function fetchFromMultipleSources(sources) {
  const promises = sources.map(source => fetch(source).then(res => res.json()));
  
  try {
    const result = await Promise.any(promises);
    return result;
  } catch (error) {
    console.error('所有数据源都失败');
    return null;
  }
}

fetchFromMultipleSources([
  'https://api1.com/data',
  'https://api2.com/data',
  'https://api3.com/data',
]);
```

## async/await 基础

### async 函数

```javascript
// async 函数返回 Promise
async function fetchData() {
  return '数据';
}

fetchData().then(data => console.log(data)); // '数据'

// async 函数内部可以使用 await
async function fetchData() {
  const data = await '数据';
  return data;
}

fetchData().then(data => console.log(data)); // '数据'
```

### await 表达式

```javascript
// await 等待 Promise 完成
async function getUser() {
  const promise = new Promise(resolve => {
    setTimeout(() => resolve({ id: 1, name: '张三' }), 1000);
  });
  
  const user = await promise;
  console.log(user); // { id: 1, name: '张三' }
}

// await 会暂停 async 函数执行
async function example() {
  console.log('开始');
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('1 秒后');
}

// await 只能在 async 函数内部使用
// function badExample() {
//   await Promise.resolve(); // SyntaxError
// }

// 顶层 await（ES2022）
// const data = await fetch('/api/data').then(res => res.json());
```

## async/await 错误处理

### try/catch

```javascript
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('请求失败:', error);
    return null;
  }
}

fetchData().then(data => console.log(data));
```

### 链式 try/catch

```javascript
async function fetchUserData(userId) {
  try {
    // 获取用户信息
    const userResponse = await fetch(`/api/users/${userId}`);
    const user = await userResponse.json();
    
    try {
      // 获取用户文章
      const postsResponse = await fetch(`/api/users/${userId}/posts`);
      const posts = await postsResponse.json();
      
      return { user, posts };
    } catch (error) {
      console.error('获取文章失败:', error);
      return { user, posts: [] };
    }
  } catch (error) {
    console.error('获取用户失败:', error);
    return null;
  }
}
```

### 处理多个 await 错误

```javascript
async function fetchMultiple() {
  const results = await Promise.allSettled([
    fetch('/api/data1').then(res => res.json()),
    fetch('/api/data2').then(res => res.json()),
    fetch('/api/data3').then(res => res.json()),
  ]);
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`请求 ${index + 1} 成功:`, result.value);
    } else {
      console.error(`请求 ${index + 1} 失败:`, result.reason);
    }
  });
}
```

## Promise vs async/await

### 可读性对比

```javascript
// Promise 链式调用
function fetchUserData(userId) {
  return fetch(`/api/users/${userId}`)
    .then(response => response.json())
    .then(user => {
      return fetch(`/api/users/${userId}/posts`)
        .then(response => response.json())
        .then(posts => ({ user, posts }));
    })
    .catch(error => {
      console.error('请求失败:', error);
      return null;
    });
}

// async/await
async function fetchUserData(userId) {
  try {
    const userResponse = await fetch(`/api/users/${userId}`);
    const user = await userResponse.json();
    
    const postsResponse = await fetch(`/api/users/${userId}/posts`);
    const posts = await postsResponse.json();
    
    return { user, posts };
  } catch (error) {
    console.error('请求失败:', error);
    return null;
  }
}
```

### 并行处理对比

```javascript
// Promise 并行处理
function fetchParallel() {
  return Promise.all([
    fetch('/api/data1').then(res => res.json()),
    fetch('/api/data2').then(res => res.json()),
    fetch('/api/data3').then(res => res.json()),
  ]);
}

// async/await 并行处理
async function fetchParallel() {
  const [data1, data2, data3] = await Promise.all([
    fetch('/api/data1').then(res => res.json()),
    fetch('/api/data2').then(res => res.json()),
    fetch('/api/data3').then(res => res.json()),
  ]);
  
  return { data1, data2, data3 };
}
```

## 实际应用案例

### 案例 1：数据获取和转换

```javascript
class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }
  
  async get(endpoint) {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async post(endpoint, data) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async put(endpoint, data) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async delete(endpoint) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.ok;
  }
}

// 使用
const api = new ApiClient('https://api.example.com');

async function fetchUserWithPosts(userId) {
  try {
    const user = await api.get(`/users/${userId}`);
    const posts = await api.get(`/users/${userId}/posts`);
    
    return { ...user, posts };
  } catch (error) {
    console.error('获取用户数据失败:', error);
    return null;
  }
}

fetchUserWithPosts(1).then(data => console.log(data));
```

### 案例 2：文件上传

```javascript
async function uploadFile(file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        onProgress(percentComplete);
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error('解析响应失败'));
        }
      } else {
        reject(new Error(`上传失败: ${xhr.statusText}`));
      }
    });
    
    xhr.addEventListener('error', () => {
      reject(new Error('网络错误'));
    });
    
    xhr.addEventListener('abort', () => {
      reject(new Error('上传已取消'));
    });
    
    const formData = new FormData();
    formData.append('file', file);
    
    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  });
}

// 使用
async function handleFileUpload(file) {
  try {
    const result = await uploadFile(file, (progress) => {
      console.log(`上传进度: ${progress.toFixed(2)}%`);
    });
    
    console.log('上传成功:', result);
    return result;
  } catch (error) {
    console.error('上传失败:', error);
    return null;
  }
}
```

### 案例 3：轮询接口

```javascript
async function pollUntilComplete(url, options = {}) {
  const {
    interval = 1000,
    maxAttempts = 10,
    isComplete = (data) => data.status === 'completed',
  } = options;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(url);
    const data = await response.json();
    
    if (isComplete(data)) {
      return data;
    }
    
    console.log(`轮询中... (${attempt + 1}/${maxAttempts})`);
    
    if (attempt < maxAttempts - 1) {
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
  
  throw new Error('轮询超时');
}

// 使用
async function checkTaskStatus(taskId) {
  try {
    const result = await pollUntilComplete(`/api/tasks/${taskId}`, {
      interval: 2000,
      maxAttempts: 15,
      isComplete: (data) => ['completed', 'failed'].includes(data.status),
    });
    
    console.log('任务完成:', result);
    return result;
  } catch (error) {
    console.error('任务失败:', error);
    return null;
  }
}
```

### 案例 4：重试机制

```javascript
async function retryWithBackoff(fn, options = {}) {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    shouldRetry = (error) => true,
  } = options;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts || !shouldRetry(error)) {
        throw error;
      }
      
      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
      console.log(`重试中... (${attempt}/${maxAttempts})，延迟 ${delay}ms`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// 使用
async function fetchWithRetry(url) {
  return retryWithBackoff(
    async () => {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 5000,
      shouldRetry: (error) => error.message.includes('500'),
    }
  );
}

fetchWithRetry('/api/data')
  .then(data => console.log(data))
  .catch(error => console.error('请求失败:', error));
```

### 案例 5：并发限制

```javascript
class ConcurrencyLimiter {
  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent;
    this.running = 0;
    this.queue = [];
  }
  
  async run(fn) {
    // 等待直到有可用的槽位
    while (this.running >= this.maxConcurrent) {
      await new Promise(resolve => {
        this.queue.push(resolve);
      });
    }
    
    this.running++;
    
    try {
      return await fn();
    } finally {
      this.running--;
      
      // 执行队列中的下一个任务
      const next = this.queue.shift();
      if (next) {
        next();
      }
    }
  }
}

// 使用
async function fetchMultipleWithLimit(urls) {
  const limiter = new ConcurrencyLimiter(3);
  
  const results = await Promise.all(
    urls.map(url => 
      limiter.run(() => fetch(url).then(res => res.json()))
    )
  );
  
  return results;
}

const urls = [
  'https://api1.com/data',
  'https://api2.com/data',
  'https://api3.com/data',
  'https://api4.com/data',
  'https://api5.com/data',
];

fetchMultipleWithLimit(urls)
  .then(results => console.log(results))
  .catch(error => console.error(error));
```

## 最佳实践

### 1. 总是处理错误

```javascript
// 好的做法
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('请求失败:', error);
    throw error;
  }
}

// 或者
fetchData()
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

### 2. 避免嵌套的 async 函数

```javascript
// 不好的做法
async function badExample() {
  const data = await async function() {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  }();
  
  return data;
}

// 好的做法
async function goodExample() {
  const response = await fetch('/api/data');
  const data = await response.json();
  return data;
}
```

### 3. 并行处理独立操作

```javascript
// 不好的做法 - 串行执行
async function badExample() {
  const data1 = await fetch('/api/data1').then(res => res.json());
  const data2 = await fetch('/api/data2').then(res => res.json());
  const data3 = await fetch('/api/data3').then(res => res.json());
  
  return { data1, data2, data3 };
}

// 好的做法 - 并行执行
async function goodExample() {
  const [data1, data2, data3] = await Promise.all([
    fetch('/api/data1').then(res => res.json()),
    fetch('/api/data2').then(res => res.json()),
    fetch('/api/data3').then(res => res.json()),
  ]);
  
  return { data1, data2, data3 };
}
```

### 4. 使用 Promise.allSettled 处理部分失败

```javascript
async function fetchMultiple(urls) {
  const results = await Promise.allSettled(
    urls.map(url => fetch(url).then(res => res.json()))
  );
  
  return results.map((result, index) => ({
    url: urls[index],
    success: result.status === 'fulfilled',
    data: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason : null,
  }));
}
```

### 5. 避免未处理的 Promise

```javascript
// 不好的做法 - 可能导致未处理的 Promise
async function badExample() {
  const promise = fetch('/api/data');
  // 忘记 await 或处理结果
}

// 好的做法
async function goodExample() {
  const response = await fetch('/api/data');
  const data = await response.json();
  return data;
}

// 或使用 void 标记有意未处理
function example() {
  void fetch('/api/data').then(data => console.log(data));
}
```

### 6. 使用 finally 清理资源

```javascript
async function fetchDataWithCleanup() {
  let connection = null;
  
  try {
    connection = await createConnection();
    const data = await connection.query('SELECT * FROM users');
    return data;
  } catch (error) {
    console.error('查询失败:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}
```

### 7. 使用 AbortController 取消请求

```javascript
async function fetchWithAbort(url, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('请求超时');
      throw new Error('请求超时');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// 使用
fetchWithAbort('/api/data', 3000)
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

## 常见问题

### Q: async/await 会阻塞线程吗？

A: 不会。`await` 只会暂停当前 async 函数的执行，不会阻塞事件循环。

### Q: 如何处理多个 Promise 的错误？

A: 使用 `Promise.allSettled` 可以获取每个 Promise 的结果，无论成功或失败。

### Q: 什么时候使用 Promise，什么时候使用 async/await？

A: 优先使用 async/await，代码更清晰易读。Promise 适合简单的链式调用或并行操作。

### Q: 如何实现请求超时？

A: 使用 `Promise.race` 配合超时 Promise，或使用 `AbortController`。

### Q: await 可以在非 async 函数中使用吗？

A: 不能。`await` 只能在 `async` 函数或模块顶层（ES2022）中使用。

### Q: 如何避免回调地狱？

A: 使用 Promise 或 async/await 替代回调函数。

## 总结

### Promise 的核心概念

1. **三种状态**：pending、fulfilled、rejected
2. **链式调用**：then、catch、finally
3. **静态方法**：all、race、allSettled、any
4. **错误处理**：自动传递和捕获

### async/await 的优势

1. **代码更清晰**：同步风格的代码
2. **错误处理更直观**：使用 try/catch
3. **调试更方便**：堆栈跟踪更准确
4. **组合更灵活**：可以与 Promise 混用

### 最佳实践

1. 总是处理错误
2. 避免嵌套的 async 函数
3. 并行处理独立操作
4. 使用 Promise.allSettled 处理部分失败
5. 避免未处理的 Promise
6. 使用 finally 清理资源
7. 使用 AbortController 取消请求

掌握 Promise 和 async/await，可以让你更优雅地处理 JavaScript 中的异步操作。记住：**选择合适的方式，让代码更清晰、更易维护。**