# 简单排序

## 1. 冒泡排序（Bubble Sort）

相邻元素两两比较，将较大的元素逐步"冒泡"到数组末尾。

```ts
function bubbleSort(arr: number[]): number[] {
  const len = arr.length
  for (let i = 0; i < len - 1; i++) {
    let swapped = false
    for (let j = 0; j < len - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
        swapped = true
      }
    }
    if (!swapped) break
  }
  return arr
}
```

---

## 2. 选择排序（Selection Sort）

每轮从未排序区间中选出最小值，放到已排序区间的末尾。

```ts
function selectionSort(arr: number[]): number[] {
  const len = arr.length
  for (let i = 0; i < len - 1; i++) {
    let minIdx = i
    for (let j = i + 1; j < len; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j
    }
    ;[arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]
  }
  return arr
}
```

---

## 3. 插入排序（Insertion Sort）

将未排序元素逐个插入到已排序区间的正确位置，类似整理扑克牌。

```ts
function insertionSort(arr: number[]): number[] {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i]
    let j = i - 1
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j]
      j--
    }
    arr[j + 1] = key
  }
  return arr
}
```

---

## 4. 对比总结

| 排序算法 | 最好 | 平均 | 最差 | 空间 | 稳定性 | 特点 |
|---------|------|------|------|------|--------|------|
| 冒泡排序 | O(n) | O(n²) | O(n²) | O(1) | 稳定 | 实现简单，适合小数据量 |
| 选择排序 | O(n²) | O(n²) | O(n²) | O(1) | 不稳定 | 交换次数少，不受初始顺序影响 |
| 插入排序 | O(n) | O(n²) | O(n²) | O(1) | 稳定 | 对近乎有序的数据效率极高 |
