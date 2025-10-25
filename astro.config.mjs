import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://scx-blog.pages.dev',
  integrations: [],
  build: {
    format: 'file',
  },
  trailingSlash: 'never', // Match VitePress behavior
  shikiConfig: {
    // 可選主題：https://shiki.style/themes
    // 背景色默認跟隨部落格主題，而非語法高亮主題
    themes: {
      light: 'github-light', // 亮色主題
      dark: 'github-dark' // 暗色主題
    }
  }
});
