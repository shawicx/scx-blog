
```JavaScript
/**
 * @description 深层对象取值（类似 Lodash _.get）
 * 支持点路径（a.b.c）和数组索引（a[0].b）
 */
function getValue(object, path, defaultValue) {
  if (object == null || typeof path !== 'string' || path.trim() === '') {
    return defaultValue;
  }

  const keys = path
    .replace(/\[\s*(\d+)\s*\]/g, '.$1')
    .split('.')
    .filter(Boolean);

  let result = object;
  for (const key of keys) {
    if (result == null) return defaultValue;
    result = result[key];
  }

  return result !== undefined ? result : defaultValue;
}
```
