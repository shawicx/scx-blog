---
title: 'Default Title'
description: 'Default Description'
draft: false
---

<!--
 * @Author: shawicx d35f3153@proton.me
 * @Date: 2024-06-23 01:01:02
 * @LastEditors: shawicx d35f3153@proton.me
 * @LastEditTime: 2025-08-09 09:49:33
 * @Description: 
-->
# monorepo 的一些问题
## tsconfig paths 解析失败

```json
{
  "paths": {
    "@/*": [
      "./src/*"
    ],
    "@/api": [
      "./src/api"
    ],
    "@toucan/meta": [
      "../toucan-meta/src"
    ]
  }
}
```

webpack 报错 Error: ERROR in ./packages/toucan-core/src/DataStatistics/index.tsx
