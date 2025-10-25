const excerptLengths: Record<ExcerptScene, {
  cjk: number // 中文、日文、韓文
  other: number // 其他語言
}> = {
  list: { // 首頁文章列表
    cjk: 120, // 自動摘要前 120 字
    other: 240, // 自動摘要前 240 字
  },
}
