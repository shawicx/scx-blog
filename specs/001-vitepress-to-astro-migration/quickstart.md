# Quickstart Guide: Astro Blog

## Prerequisites

- Node.js 18+ 
- pnpm (preferred) or npm/yarn
- Git

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or npm install
   # or yarn install
   ```

3. **Run development server**
   ```bash
   pnpm astro dev
   # or npm run astro dev
   # or yarn astro dev
   ```
   
   Your site will be available at `http://localhost:4321`

## Project Structure

```
src/
├── components/     # Reusable Astro components
├── layouts/        # Page layouts (e.g., BaseLayout.astro)
├── pages/          # Route definitions (.astro files become pages)
├── styles/         # Global styles (CSS, SCSS)
├── content/        # Markdown content (blog posts, pages)
└── utils/          # Utility functions
public/             # Static assets (images, favicon, etc.)
```

## Creating Content

### Adding a Blog Post
1. Create a Markdown file in `src/content/blog/`
2. Include frontmatter with required fields:

```markdown
---
title: "My Blog Post"
description: "A brief description"
date: 2025-10-24
author: "Your Name"
tags: ["astro", "blog", "migration"]
---

# My Blog Post

Content goes here...
```

### Adding a Page
1. Create a Markdown file in `src/content/pages/`
2. Use similar frontmatter to blog posts

### Creating a Route
1. Create an `.astro` file in the `src/pages/` directory
2. Export your layout and content

## Building & Deploying

1. **Build the site**
   ```bash
   pnpm build
   # or npm run build
   # or yarn build
   ```
   
   The built site will be in the `dist/` directory

2. **Preview the build**
   ```bash
   pnpm preview
   # or npm run preview
   # or yarn preview
   ```

## Working with Content

### Migration from VitePress
Use the migration script to convert VitePress content:
```bash
pnpm run migrate-vitepress
```

### Content Validation
Content is validated using Zod schemas defined in `src/content/config.ts`. When adding content, ensure all required fields are present.

## Development Workflow

1. Create or edit content in the `src/content/` directory
2. Create or modify layouts in `src/layouts/`
3. Run `pnpm astro dev` to see changes live
4. Commit changes to version control
5. Deployment happens automatically via GitHub Actions when pushing to main branch