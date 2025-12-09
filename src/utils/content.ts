import type { CollectionEntry } from 'astro:content'
import { getCollection, render } from 'astro:content'
import { defaultLocale } from '@/config'
import { memoize } from '@/utils/cache'

export type Post = CollectionEntry<'posts'> & {
  remarkPluginFrontmatter: {
    minutes: number
  }
}

const metaCache = new Map<string, { minutes: number }>()

/**
 * Export the addMetaToPost function for use in other modules
 */

/**
 * Add metadata including reading time to a post
 *
 * @param post The post to enhance with metadata
 * @returns Enhanced post with reading time information
 */
export async function addMetaToPost(post: CollectionEntry<'posts'>): Promise<Post> {
  const cacheKey = `${post.id}-${post.data.lang || 'universal'}`

  if (metaCache.has(cacheKey)) {
    return {
      ...post,
      remarkPluginFrontmatter: metaCache.get(cacheKey)!,
    }
  }

  const { remarkPluginFrontmatter } = await render(post)
  metaCache.set(cacheKey, remarkPluginFrontmatter as { minutes: number })

  return {
    ...post,
    remarkPluginFrontmatter: metaCache.get(cacheKey)!,
  }
}

/**
 * Find duplicate post slugs within the same language
 *
 * @param posts Array of blog posts to check
 * @returns Array of descriptive error messages for duplicate slugs
 */
async function _checkPostSlugDuplication(posts: CollectionEntry<'posts'>[]): Promise<string[]> {
  const slugMap = new Map<string, Set<string>>()
  const duplicates: string[] = []

  posts.forEach((post) => {
    const lang = post.data.lang
    const slug = post.data.abbrlink || post.id

    if (!slugMap.has(lang)) {
      slugMap.set(lang, new Set())
    }

    const slugSet = slugMap.get(lang)!
    if (!slugSet.has(slug)) {
      slugSet.add(slug)
      return
    }

    if (!lang) {
      duplicates.push(`Duplicate slug "${slug}" found in universal post (applies to all languages)`)
    }
    else {
      duplicates.push(`Duplicate slug "${slug}" found in "${lang}" language post`)
    }
  })

  return duplicates
}

export const checkPostSlugDuplication = memoize(_checkPostSlugDuplication)

/**
 * Get all posts (including pinned ones, excluding drafts in production)
 *
 * @param lang The language code to filter by, defaults to site's default language
 * @returns Posts filtered by language, enhanced with metadata, sorted by date
 */
async function _getPosts(lang?: string) {
  const currentLang = lang || defaultLocale

  const filteredPosts = await getCollection(
    'posts',
    ({ data }: CollectionEntry<'posts'>) => {
      // Show drafts in dev mode only
      const shouldInclude = import.meta.env.DEV || !data.draft
      return shouldInclude && (data.lang === currentLang || data.lang === '')
    },
  )

  const enhancedPosts = await Promise.all(filteredPosts.map(addMetaToPost))

  return enhancedPosts.sort((a: Post, b: Post) =>
    b.data.published.valueOf() - a.data.published.valueOf(),
  )
}

export const getPosts = memoize(_getPosts)

/**
 * Get all non-pinned posts
 *
 * @param lang The language code to filter by, defaults to site's default language
 * @returns Regular posts (non-pinned), filtered by language
 */
async function _getRegularPosts(lang?: string) {
  const posts = await getPosts(lang)
  return posts.filter(post => !post.data.pin)
}

export const getRegularPosts = memoize(_getRegularPosts)

/**
 * Get pinned posts sorted by pin priority
 *
 * @param lang The language code to filter by, defaults to site's default language
 * @returns Pinned posts sorted by pin value in descending order
 */
async function _getPinnedPosts(lang?: string) {
  const posts = await getPosts(lang)
  return posts
    .filter(post => post.data.pin && post.data.pin > 0)
    .sort((a, b) => (b.data.pin ?? 0) - (a.data.pin ?? 0))
}

export const getPinnedPosts = memoize(_getPinnedPosts)

/**
 * Group posts by year and sort within each year
 *
 * @param lang The language code to filter by, defaults to site's default language
 * @returns Map of posts grouped by year (descending), sorted by date within each year
 */
async function _getPostsByYear(lang?: string): Promise<Map<number, Post[]>> {
  const posts = await getRegularPosts(lang)
  const yearMap = new Map<number, Post[]>()

  posts.forEach((post: Post) => {
    const year = post.data.published.getFullYear()
    if (!yearMap.has(year)) {
      yearMap.set(year, [])
    }
    yearMap.get(year)!.push(post)
  })

  // Sort posts within each year by date
  yearMap.forEach((yearPosts) => {
    yearPosts.sort((a, b) => {
      const aDate = a.data.published
      const bDate = b.data.published
      return bDate.getMonth() - aDate.getMonth() || bDate.getDate() - aDate.getDate()
    })
  })

  return new Map([...yearMap.entries()].sort((a, b) => b[0] - a[0]))
}

export const getPostsByYear = memoize(_getPostsByYear)

/**
 * Group posts by their tags
 *
 * @param lang The language code to filter by, defaults to site's default language
 * @returns Map where keys are tag names and values are arrays of posts with that tag
 */
async function _getPostsGroupByTags(lang?: string) {
  const posts = await getPosts(lang)
  const tagMap = new Map<string, Post[]>()

  posts.forEach((post: Post) => {
    post.data.tags?.forEach((tag: string) => {
      if (!tagMap.has(tag)) {
        tagMap.set(tag, [])
      }
      tagMap.get(tag)!.push(post)
    })
  })

  return tagMap
}

export const getPostsGroupByTags = memoize(_getPostsGroupByTags)

/**
 * Get all tags sorted by post count
 *
 * @param lang The language code to filter by, defaults to site's default language
 * @returns Array of tags sorted by popularity (most posts first)
 */
async function _getAllTags(lang?: string) {
  const tagMap = await getPostsGroupByTags(lang)
  const tagsWithCount = Array.from(tagMap.entries())

  tagsWithCount.sort((a, b) => b[1].length - a[1].length)
  return tagsWithCount.map(([tag]) => tag)
}

export const getAllTags = memoize(_getAllTags)

/**
 * Get all posts that contain a specific tag
 *
 * @param tag The tag name to filter posts by
 * @param lang The language code to filter by, defaults to site's default language
 * @returns Array of posts that contain the specified tag
 */
async function _getPostsByTag(tag: string, lang?: string) {
  const tagMap = await getPostsGroupByTags(lang)
  return tagMap.get(tag) ?? []
}

export const getPostsByTag = memoize(_getPostsByTag)

/**
 * Check which languages support a specific tag
 *
 * @param tag The tag name to check language support for
 * @returns Array of language codes that support the specified tag
 */
async function _getTagSupportedLangs(tag: string) {
  const posts = await getCollection(
    'posts',
    ({ data }) => !data.draft,
  )
  const { allLocales } = await import('@/config')

  return allLocales.filter(locale =>
    posts.some(post =>
      post.data.tags?.includes(tag)
      && (post.data.lang === locale || post.data.lang === ''),
    ),
  )
}

export const getTagSupportedLangs = memoize(_getTagSupportedLangs)

/**
 * Group interface for folder-based organization
 */
export interface PostGroup {
  id: string
  title: string
  description: string
  posts: Post[]
  level: number
}

/**
 * Get folder group information from index.md files
 */
async function _getGroupInfo(groupId: string, lang?: string): Promise<PostGroup | null> {
  try {
    const indexPosts = await getCollection('posts', ({ id, data }) => {
      // Check if this is an index.md file in the target folder
      // Handle both 'folder-name' and 'folder-name/index' patterns
      const isIndexFile = id === groupId || id === `${groupId}/index` || id === `${groupId}/index.md`
      const hasCorrectLang = data.lang === lang || data.lang === ''
      const shouldInclude = import.meta.env.DEV || !data.draft

      return isIndexFile && hasCorrectLang && shouldInclude
    })

    if (indexPosts.length === 0)
      return null

    const indexPost = indexPosts[0]
    const level = groupId.split('/').length

    return {
      id: groupId,
      title: indexPost.data.title,
      description: indexPost.data.description || '',
      posts: [],
      level,
    }
  }
  catch (error) {
    console.error('Error getting group info for', groupId, error)
    return null
  }
}

/**
 * Get posts organized by folder groups (max 3 levels)
 */
async function _getPostsByGroups(lang?: string): Promise<Map<string, PostGroup>> {
  const posts = await getRegularPosts(lang)
  const groupMap = new Map<string, PostGroup>()

  // First, identify all group index files to exclude them from regular posts
  const groupIndexIds = new Set<string>()

  // Collect all folder paths (max 3 levels) and identify group indexes
  const folderPaths = new Set<string>()

  posts.forEach((post) => {
    const pathParts = post.id.split('/')

    // Skip direct files in posts root
    if (pathParts.length <= 1) {
      return
    }

    // Generate folder paths for up to 3 levels
    for (let i = 1; i <= Math.min(3, pathParts.length - 1); i++) {
      const folderPath = pathParts.slice(0, i).join('/')
      folderPaths.add(folderPath)
    }
  })

  // Identify which posts are group index files
  posts.forEach((post) => {
    // Check if this post is an index file for any folder
    if (folderPaths.has(post.id) || post.id.endsWith('/index')) {
      groupIndexIds.add(post.id)
    }
  })

  // Create groups for each folder
  for (const folderPath of folderPaths) {
    const groupInfo = await _getGroupInfo(folderPath, lang)
    if (groupInfo) {
      groupMap.set(folderPath, groupInfo)
    }
  }

  // Assign posts to their respective groups (excluding group index files)
  posts.forEach((post) => {
    const pathParts = post.id.split('/')

    // Skip group index files - they are descriptions, not content
    if (groupIndexIds.has(post.id)) {
      return
    }

    // Skip direct files in posts root
    if (pathParts.length <= 1) {
      return
    }

    // Find the most specific group this post belongs to (deepest folder)
    let targetGroup: string | null = null

    // Check from deepest to shallowest level to find the most specific group
    for (let i = Math.min(3, pathParts.length - 1); i >= 1; i--) {
      const folderPath = pathParts.slice(0, i).join('/')
      if (groupMap.has(folderPath)) {
        targetGroup = folderPath
        break
      }
    }

    if (targetGroup && groupMap.has(targetGroup)) {
      groupMap.get(targetGroup)!.posts.push(post)
    }
  })

  // Sort posts within each group by date
  groupMap.forEach((group) => {
    group.posts.sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf())
  })

  return groupMap
}

export const getPostsByGroups = memoize(_getPostsByGroups)
