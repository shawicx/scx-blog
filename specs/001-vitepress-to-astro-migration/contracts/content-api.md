# Content API Contract

## Purpose
Define the interface for accessing and querying content within the Astro application. This contract ensures consistent access to blog posts, pages, and other content types.

## Content Query Interface

### Blog Post Queries

#### Get All Blog Posts
- **Function**: `getAllBlogPosts()`
- **Returns**: `Promise<BlogPost[]>`
- **Description**: Retrieves all published blog posts sorted by date (newest first)

#### Get Blog Post by Slug
- **Function**: `getBlogPostBySlug(slug: string)`
- **Returns**: `Promise<BlogPost | undefined>`
- **Description**: Retrieves a specific blog post by its slug

#### Get Blog Posts by Tag
- **Function**: `getBlogPostsByTag(tag: string)`
- **Returns**: `Promise<BlogPost[]>`
- **Description**: Retrieves all published blog posts with a specific tag

#### Get Recent Blog Posts
- **Function**: `getRecentBlogPosts(limit: number)`
- **Returns**: `Promise<BlogPost[]>`
- **Description**: Retrieves the most recent blog posts up to the specified limit

### Page Queries

#### Get All Pages
- **Function**: `getAllPages()`
- **Returns**: `Promise<Page[]>`
- **Description**: Retrieves all published pages

#### Get Page by Slug
- **Function**: `getPageBySlug(slug: string)`
- **Returns**: `Promise<Page | undefined>`
- **Description**: Retrieves a specific page by its slug

## Content Types

### BlogPost
```typescript
interface BlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: Date;
  author?: string;
  tags?: string[];
  content: string;
  excerpt: string;
  layout: string;
  draft?: boolean;
}
```

### Page
```typescript
interface Page {
  id: string;
  slug: string;
  title: string;
  description: string;
  date?: Date;
  content: string;
  layout: string;
  draft?: boolean;
}
```

## Error Handling
- Functions should return `undefined` for single item queries when item is not found
- Functions should return empty arrays for multi-item queries when no items match
- All functions must handle content loading errors gracefully

## Performance Requirements
- Content queries should resolve within 50ms for sites with up to 500 content items
- Content should be statically generated at build time where possible
- Client-side queries should utilize efficient caching strategies