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
