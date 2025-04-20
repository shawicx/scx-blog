---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "shawicx"
  text: "工作、学习文档"
  # tagline: My great project tagline
  actions:
    # - theme: alt
    #   text: Markdown Examples
    #   link: /markdown-examples
    - theme: brand
      text: 工作记录
      link: /work-docs
    - theme: alt
      text: 学习笔记
      link: /study-notes

features:
  - title: Feature A
    details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
  - title: Feature B
    details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
  - title: Feature C
    details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
---

## Vercel 部署 404

vercel 设置中，vitepress 项目的默认配置存在问题，需要修改 build command 以及 output directory。

## favicon 本地正常，部署之后未显示

将 favicon.ico 文件放在 public 目录下 而不是 assets 目录，确保在本地和线上都能正常访问。

```json lines
{
  head: [
    [
      'link',
      {
        rel: 'icon',
        href: '/favicon/favicon.ico'
      }
    ]
  ]
}
```

