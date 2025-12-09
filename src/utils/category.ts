import type { Post } from './content'
import { getCollection } from 'astro:content'
import { memoize } from './cache'
import { addMetaToPost } from './content'

export interface CategoryPostInfo {
  title: string
  description: string
  postList: Post[]
}

/**
 * Get posts and category information for a specific category path
 */
async function _getCategoryPostInfo(categoryPath: string, lang?: string): Promise<CategoryPostInfo> {
  const posts = await getCollection('posts', ({ data, id }) => {
    const shouldInclude = import.meta.env.DEV || !data.draft
    const isInCategory = id.startsWith(`${categoryPath}/`)
    const isNotIndex = !id.endsWith('/index') && id !== `${categoryPath}/index` && id !== `${categoryPath}/index.md`
    const hasCorrectLang = data.lang === lang || data.lang === '' || !lang

    return shouldInclude && isInCategory && isNotIndex && hasCorrectLang
  })

  // 获取分类信息（从 index.md）
  const indexPosts = await getCollection('posts', ({ id, data }) => {
    const isIndexFile = id === categoryPath || id === `${categoryPath}/index` || id === `${categoryPath}/index.md`
    const hasCorrectLang = data.lang === lang || data.lang === '' || !lang
    const shouldInclude = import.meta.env.DEV || !data.draft

    return isIndexFile && hasCorrectLang && shouldInclude
  })

  const enhancedPosts = await Promise.all(posts.map(addMetaToPost))
  const sortedPosts = enhancedPosts.sort((a, b) =>
    b.data.published.valueOf() - a.data.published.valueOf(),
  )

  const indexPost = indexPosts[0]
  const displayName = getCategoryDisplayName(categoryPath)

  return {
    title: indexPost?.data.title || displayName,
    description: indexPost?.data.description || `${displayName}分类下的所有文章`,
    postList: sortedPosts,
  }
}

export const getCategoryPostInfo = memoize(_getCategoryPostInfo)

/**
 * Get display name for a category path
 */
export function getCategoryDisplayName(categoryPath: string): string {
  const displayNames: Record<string, string> = {
    'projects': '项目实战',
    'projects/uniubi': 'Uniubi 项目',
    'projects/viewshine': 'Viewshine 项目',
    'tutorials': '技术教程',
    'tutorials/frontend': '前端开发',
    'tutorials/backend': '后端开发',
    'tutorials/tools': '工具使用',
    'notes': '学习笔记',
    'notes/concepts': '概念理解',
    'notes/snippets': '代码片段',
    'miscellaneous': '杂项',
  }

  // 先查找完整路径匹配
  if (displayNames[categoryPath]) {
    return displayNames[categoryPath]
  }

  // 如果没有完整匹配，返回最后一部分的格式化名称
  const lastPart = categoryPath.split('/').pop()
  return lastPart?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || categoryPath
}

/**
 * Get all category paths
 */
async function _getAllCategoryPaths(lang?: string): Promise<string[]> {
  const posts = await getCollection('posts', ({ data }) => {
    const shouldInclude = import.meta.env.DEV || !data.draft
    const hasCorrectLang = data.lang === lang || data.lang === '' || !lang
    return shouldInclude && hasCorrectLang
  })

  const categoryPaths = new Set<string>()

  // 提取所有可能的分类路径
  posts.forEach((post) => {
    const parts = post.id.split('/')

    // 生成所有可能的分类路径
    for (let i = 1; i < parts.length; i++) {
      const categoryPath = parts.slice(0, i).join('/')
      categoryPaths.add(categoryPath)
    }
  })

  return Array.from(categoryPaths).sort()
}

export const getAllCategoryPaths = memoize(_getAllCategoryPaths)
