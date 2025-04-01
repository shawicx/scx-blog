1. 请求发出，以 url + params 生成 请求的key，将key添加到 队列中。
2. 请求完成，将key 从队列中删除。
3. 请求未完成，再次发出请求，判断队列中是否存在key，若存在，将请求取消。
4. 可通过设置白名单规避取消重复请求的逻辑。

```typescript
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
