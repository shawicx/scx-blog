import { defineConfig } from 'vitepress'

import { type DefaultTheme } from 'vitepress'

// function sidebarBase(): DefaultTheme.SidebarItem[] {
//   return [
//     { text: 'JavaScript', link: '/javascript.md' },
//     { text: 'CSS', link: '/css.md' },
//     { text: 'React', link: '/react.md' },
//     { text: '性能优化', link: '/performance.md' },
//     { text: '浏览器', link: '/browser.md' },
//     { text: '网络/HTTP', link: '/network.md' },
//     { text: '工程化', link: '/engineering.md' },
//   ]
// }


function sidebarCss(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: '基础',
      collapsed: false,
      items: [
        { text: '盒模型', link: 'box-model' },
        { text: 'BFC', link: 'bfc' },
        { text: '重绘与回流', link: 'repaint-reflow' },
      ]
    },
    {
      text: '进阶',
      collapsed: false,
      items: [
        { text: 'css 原子化与 css modules', link: 'atomic-css-and-css-modules' },
        { text: '渲染管线', link: 'rendering-pipeline' },
      ]
    },
  ]
}

function sidebarEs(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: '基础概念',
      collapsed: false,
      items: [
        { text: 'this 指向', link: 'this' },
        { text: '闭包', link: 'closure' },
        { text: '作用域', link: 'scope' },
        { text: '原型与原型链', link: 'prototype' },
        { text: '事件冒泡', link: 'event-bub-cap' },
        { text: 'promise', link: 'promise' },
        { text: '执行上下文与执行栈', link: 'execution-context' },
      ]
    },
    {
      text: '基础概念', collapsed: false, items: [
        { text: '垃圾回收机制', link: 'garbage-collection' },
        { text: '事件循环', link: 'event-loop' },
        { text: '函数柯里化', link: 'curry' },
        { text: '继承', link: 'extend' },
      ]
    }

  ]
}

function sidebarVue(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: '基础',
      collapsed: false,
      items: [
        { text: '单向数据流', link: 'data-flow' },
        { text: 'ref与reactive的区别', link: 'ref-reactive' },
      ]
    },
  ]
}

function sidebarReact(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'React基础',
      collapsed: false,
      items: [
        { text: '核心概念', link: 'basic' },
        { text: '事件代理', link: 'event-agent' }
      ]
    },
    {
      text: 'Diff算法',
      collapsed: false,
      items: [
        { text: 'diff算法', link: 'diff-algorithm' },
        { text: 'Fiber 机制', link: 'fiber' },
      ]
    },
    {
      text: 'Hooks',
      collapsed: false,
      items: [
        { text: '闭包陷阱', link: 'closure-trap' },
      ]
    },
    {
      text: '高级进阶',
      collapsed: false,
      items: [
        // { text: '闭包陷阱', link: 'closure-trap' },
      ]
    },
  ]
}

function sidebarCompre(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: '网络相关',
      collapsed: false,
      items: [
        { text: 'nginx 入门', link: 'nginx' },
        { text: 'Docker 入门', link: 'docker' },
        { text: 'pnpm VS npm', link: 'pnpm' },
        { text: '性能优化（React）', link: 'performance' },
      ]
    },
  ]
}

function sidebarSnippet(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: '代码片段',
      collapsed: false,
      items: [
        { text: '数组处理', link: 'array-process' },
        { text: '对象工具', link: 'object-utils' },
      ]
    },
  ]
}

function siderbarWork(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'UniUbi',
      collapsed: false,
      items: [
        { text: '语音播报', link: 'voice-speech' },
      ]
    },
    {
      text: 'ViewShine',
      collapsed: false,
      items: [
        { text: '键值对', link: 'bi-map' },
        { text: 'handlebars 基本使用', link: 'handlebars' },
        { text: '深浅克隆', link: 'js-clone' },
        { text: '密码登录', link: 'password' },
      ]
    },
  ]
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "docs",
  head: [['link', { rel: 'icon', href: '/favicon/favicon.ico' }]],
  title: "小小前端",
  description: "",
  themeConfig: {
    logo: '/favicon/favicon-32x32.png',
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '基础', link: '/javascript/this.md', activeMatch: '/javascript/' },
      { text: 'CSS', link: '/css/box-model.md', activeMatch: '/css/' },
      { text: 'React', link: '/react/basic.md', activeMatch: '/react/' },
      { text: 'Vue', link: '/vue/data-flow.md', activeMatch: '/vue/' },
      { text: '综合', link: '/compre/nginx.md', activeMatch: '/compre/' },
      { text: '代码片段', link: '/snippet/array-process.md', activeMatch: '/snippet/' },
      { text: '工作记录', link: '/work/bi-map.md', activeMatch: '/work/' },
      // { text: '前端工具', link: '/tools/git.md', activeMatch: '/tools/' },
    ],

    sidebar: {
      // '/base/':sidebarBase(),
      '/vue/': {
        base: '/vue/',
        items: sidebarVue(),
      },
      '/javascript/': {
        base: '/javascript/',
        items: sidebarEs(),
      },
      '/css/': {
        base: '/css/',
        items: sidebarCss(),
      },
      '/react/': {
        base: '/react/',
        items: sidebarReact(),
      },
      '/compre/': {
        base: '/compre/',
        items: sidebarCompre(),
      },
      '/snippet/': {
        base: '/snippet/',
        items: sidebarSnippet(),
      },
      '/work/': {
        base: '/work/',
        items: siderbarWork(),
      },
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
