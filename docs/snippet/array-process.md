
```JavaScript
/**
 * @description 数组差异计算（新增 / 更新 / 移除）
 */
function diff(prev, next, key = 'id') {
  const prevMap = new Map(prev.map((i) => [i[key], i]));
  const nextMap = new Map(next.map((i) => [i[key], i]));

  const added = [];
  const updated = [];
  const removed = [];

  for (const [id, item] of nextMap) {
    if (!prevMap.has(id)) {
      added.push(item);
    } else {
      updated.push(item);
    }
  }

  for (const [id, item] of prevMap) {
    if (!nextMap.has(id)) {
      removed.push(item);
    }
  }

  return { added, updated, removed };
}
```
```JavaScript
/**
 * @description 扁平数组转树结构
 */
function buildTree(list, key = 'id') {
  if (!Array.isArray(list) || !list.length) return [];

  const map = new Map();
  const result = [];

  for (const item of list) {
    map.set(item[key], { ...item, children: [] });
  }

  for (const item of list) {
    const node = map.get(item[key]);
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId).children.push(node);
    } else {
      result.push(node);
    }
  }

  return result;
}
```
```JavaScript
/**
 * @description 按指定 key 去重并按 score 降序排列
 */
function processRecords(records, key = 'id') {
  const map = new Map();

  for (const item of records) {
    if (!map.has(item[key])) {
      map.set(item[key], item);
    }
  }

  return Array.from(map.values()).sort((a, b) => b.score - a.score);
}
```

```JavaScript
/**
 * @description 笛卡尔积生成（SKU 组合）
 */
function produceSKU(list) {
  return list.reduce(
    (acc, curr) => {
      const res = [];
      acc.forEach((prevItem) => {
        curr.forEach((currItem) => {
          res.push([...prevItem, currItem]);
        });
      });
      return res;
    },
    [[]],
  );
}
```
