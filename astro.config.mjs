import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://scx-blog.pages.dev',
  integrations: [],
  build: {
    format: 'file',
  },
  trailingSlash: 'never', // Match VitePress behavior
});