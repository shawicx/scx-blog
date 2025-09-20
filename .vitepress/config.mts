/**
 * @Author: shawicx d35f3153@proton.me
 * @Date: 2025-03-28 17:26:27
 * @LastEditors: shawicx d35f3153@proton.me
 * @LastEditTime: 2025-04-05 10:02:27
 * @Description: vitepress 配置文件
 */
import { defineConfig } from "vitepress";

type SidebarItem = {
  text: string;
  link: string;
};

const NavPath = {
  WorkDocs: "/work-docs",
  UniUbiDocs: "/uniubi",
  ScatteredNotes: "/scattered-notes",
  ViewShineDocs: "/viewshine",
};

/**
 * @description 生成侧边栏
 * @param items
 * @param prefix
 */
const generateSidebarItems = (items: SidebarItem[], prefix: string[]) =>
  items.map((item) => ({
    text: item.text,
    link: `${prefix.join("/")}/${item.link}`,
  }));

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "shawicx",
  description: "个人博客",
  lang: "zh-CN",
  lastUpdated: true,
  head: [["link", { rel: "icon", href: "/favicon/favicon.ico" }]],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/favicon/favicon-32x32.png",
    nav: [
      { text: "首页", link: "/" },
      { text: "工作记录", link: "/work-docs", activeMatch: "/work-docs" },
      {
        text: "零散笔记",
        link: "/scattered-notes",
        activeMatch: "/scattered-notes",
      },
    ],
    sidebar: {
      [NavPath.WorkDocs]: [
        {
          text: "uni-ubi",
          collapsed: true,
          items: generateSidebarItems(
            [
              { text: "语音播报", link: "voice-speech" },
              { text: "取消请求", link: "cancel-request" },
              { text: "TPLink路由器", link: "TPLink" },
              { text: "axios封装", link: "encapsulated-axios" },
              { text: "小程序蓝牙", link: "mini-bluetooth" },
              { text: "视频监控", link: "video-monitoring" },
            ],
            [NavPath.WorkDocs, "uniubi"],
          ),
        },
        {
          text: "view-shine",
          collapsed: true,
          items: generateSidebarItems(
            [
              { text: "Vue 3 基本Api", link: "vue3-api" },
              { text: "BiMap 工具类", link: "bi-map" },
            ],
            [NavPath.WorkDocs, "viewshine"],
          ),
        },
      ],
      [NavPath.ScatteredNotes]: [
        {
          text: "基础知识",
          collapsed: true,
          items: generateSidebarItems(
            [
              { text: "http", link: "http" },
              { text: "坐标系", link: "coordinate-system" },
              { text: "节流防抖", link: "debounce-throttle" },
              { text: "深浅克隆", link: "js-clone" },
              { text: "数组去重", link: "array-dedup" },
              { text: "雅虎军规", link: "yahoo-rules" },
              { text: "常用正则", link: "regex" },
              { text: "promise", link: "my-promise" },
              { text: "monorepo", link: "monorepo" },
            ],
            [NavPath.ScatteredNotes],
          ),
        },
      ],
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/shawicx/scx-blog" },
    ],
  },
});
