---
title: '取消重复请求的实现方案'
description: '使用AbortController和axios cancelToken防止重复请求，提升应用性能'
draft: false
published: 2025-08-09
---

# 取消重复请求

1. 请求发出，以 url + params 生成 请求的key，将key添加到 队列中。
2. 请求完成，将key 从队列中删除。
3. 请求未完成，再次发出请求，判断队列中是否存在key，若存在，将请求取消。
4. 可通过设置白名单规避取消重复请求的逻辑。

## 使用 AbortController

```ts
// 请求队列
const pendingRequests = new Map();

function hashObject(obj: unknown): string {
  const str = JSON.stringify(obj);
  // 使用简单的哈希算法，在实际使用时可以选择 crypto
  return str.split('').reduce((hash, char) => {
    return ((hash << 5) - hash) + char.charCodeAt(0) | 0;
  }, 0).toString(36);
}

// 根据请求得到的唯一值，用于取消重复请求
function getRequestKey(
  url: string,
  { method, params, data }: AxiosRequestConfig,
): string {
  // 使用 URL 对象处理 url
  const urlObj = new URL(url, window.location.origin);

  // 使用 crypto 生成更短的唯一标识
  const paramsHash = params ? hashObject(params) : '';
  const dataHash = data ? hashObject(data) : '';

  return `${method}:${urlObj.pathname}:${paramsHash}:${dataHash}`;
}

// 生成请求键值
const requestKey = getRequestKey(url, config);
const { signal } = controller;
config.signal = signal;
// 如果重复请求,取消前一个
if (pendingRequests.has(requestKey)) {
  pendingRequests.get(requestKey).abort();
}
pendingRequests.set(requestKey, controller);

```

## ~~使用 axios cancelToken~~

```ts
const WHITE_LIST: string[] = [];

// 已发请求
const pendingRequest = new Map();
// 请求发出，添加到队列
const addPendingRequest = (config: AxiosRequestConfig) => {
  const requestKey = generateReqKey(config);
  config.cancelToken =
    config.cancelToken ||
    new axios.CancelToken((cancel) => {
      if (!pendingRequest.has(requestKey)) {
        pendingRequest.set(requestKey, cancel);
      }
    });
};

// 请求完成，移除请求
const removePendingRequest = (config: AxiosRequestConfig) => {
  const requestKey = generateReqKey(config);
  // 检查是否存在重复请求，若存在则取消已发的请求
  if (pendingRequest.has(requestKey)) {
    const cancelToken = pendingRequest.get(requestKey);
    cancelToken(requestKey);
    pendingRequest.delete(requestKey);
  }
};

// 根据请求URL以及参数生成Key(请求时间戳要注意)
const generateReqKey = (config: AxiosRequestConfig) => {
  const { method, url, params, data } = config;
  const newParams = _.omit(params, ['t']);
  return [method, url, qs.stringify(newParams), qs.stringify(data)].join('&');
};


const service = axios.create({
  baseURL: process.env.BASE_API, // api的base_url
  // timeout: 5000, // request timeout
});

service.interceptors.request.use((config) => {
  if (!WHITE_LIST.includes(config.url as string)) {
    removePendingRequest(config);
    addPendingRequest(config);
  }
})

service.interceptors.response.use((config) => {
  // 从pendingRequest对象中移除请求
  removePendingRequest(response.config);
})
```
