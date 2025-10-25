# Data Model: VitePress to Astro Migration

## Content Entities

### Blog Post
- **id**: string (auto-generated from filename)
- **slug**: string (URL-friendly identifier)
- **title**: string (from frontmatter)
- **description**: string (from frontmatter)
- **date**: Date (from frontmatter, optional)
- **author**: string (from frontmatter, optional)
- **tags**: string[] (from frontmatter, optional)
- **content**: string (Markdown content)
- **excerpt**: string (auto-generated from content)
- **layout**: string (component path reference)

### Page
- **id**: string (auto-generated from filename)
- **slug**: string (URL-friendly identifier)
- **title**: string (from frontmatter)
- **description**: string (from frontmatter)
- **date**: Date (from frontmatter, optional)
- **content**: string (Markdown content)
- **layout**: string (component path reference)

### Navigation Item
- **title**: string (display text)
- **url**: string (relative path)
- **children**: NavigationItem[] (nested items, optional)

## Content Relationships

### Blog Post Relationships
- Each Blog Post belongs to one Layout component
- Each Blog Post can have multiple Tags
- Each Blog Post has one Author (optional)

### Page Relationships
- Each Page belongs to one Layout component
- Pages can be organized hierarchically through navigation

## Validation Rules

### Blog Post Validation
- Title is required
- Content is required
- Date format must be valid if present
- Slug must be URL-friendly
- Tags must be valid strings if present

### Page Validation
- Title is required
- Content is required
- Slug must be URL-friendly

## State Transitions

### Content Publishing States
- DRAFT: Content exists but is not published
- PUBLISHED: Content is available on the site
- ARCHIVED: Content is no longer visible but preserved

## Content Collection Schema

```typescript
// src/content/config.ts

import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional().default(false),
  }),
});

const pagesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = {
  blog: blogCollection,
  pages: pagesCollection,
};
```

## Content Migration Schema

### Migration Result
- **status**: 'success' | 'warning' | 'error'
- **originalPath**: string (source file path)
- **newPath**: string (destination file path)
- **issues**: string[] (migration problems encountered)
- **mappings**: object (old to new property mappings)