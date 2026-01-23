import type {
  GitHubCacheData,
  GitHubContributionData,
  GraphQLResponse,
} from '@/types/github'

const GITHUB_GRAPHQL_API = 'https://api.github.com/graphql'
const CACHE_DURATION = 6 * 60 * 60 * 1000 // 6 hours

/**
 * Fetch GitHub contribution data using GraphQL API
 *
 * @param username - GitHub username
 * @param token - GitHub Personal Access Token (optional but recommended)
 * @returns Contribution data
 */
export async function fetchContributions(
  username: string,
  token?: string,
): Promise<GitHubContributionData> {
  // Check sessionStorage cache first
  const cacheKey = `github-contributions-${username}`
  const cached = sessionStorage.getItem(cacheKey)

  if (cached) {
    try {
      const cacheData: GitHubCacheData = JSON.parse(cached)
      const now = Date.now()

      // Return cached data if not expired
      if (now - cacheData.timestamp < CACHE_DURATION) {
        return cacheData.data
      }
    }
    catch (error) {
      console.error('Failed to parse cache data:', error)
      // Continue to fetch fresh data
    }
  }

  // Prepare GraphQL query
  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              firstDay
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
  `

  // Prepare request headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.github.v3+json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    // Fetch data from GitHub GraphQL API
    const response = await fetch(GITHUB_GRAPHQL_API, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables: { username },
      }),
    })

    if (!response.ok) {
      const errorMessage = response.status === 401
        ? 'GitHub Token 无效或已过期，请更新 Token'
        : response.status === 403
          ? 'GitHub API 速率限制已超出，请稍后再试'
          : `GitHub API 请求失败: ${response.status}`

      throw new Error(errorMessage)
    }

    const graphqlResponse: GraphQLResponse = await response.json()

    // Check for GraphQL errors
    if (graphqlResponse.errors && graphqlResponse.errors.length > 0) {
      const errorMessages = graphqlResponse.errors.map(e => e.message).join('; ')
      throw new Error(`GraphQL 错误: ${errorMessages}`)
    }

    // Validate response data
    if (!graphqlResponse.data?.user?.contributionsCollection) {
      throw new Error('无法获取 GitHub 用户数据，请检查用户名是否正确')
    }

    const calendar = graphqlResponse.data.user.contributionsCollection.contributionCalendar

    // Transform GraphQL response to internal format
    const data: GitHubContributionData = {
      totalContributions: calendar.totalContributions,
      login: username,
      weeks: calendar.weeks.map(week => ({
        firstDay: week.firstDay,
        totalContributions: week.contributionDays.reduce(
          (sum, day) => sum + day.contributionCount,
          0,
        ),
        days: week.contributionDays.map(day => ({
          date: day.date,
          count: day.contributionCount,
          level: day.contributionLevel,
        })),
      })),
    }

    // Cache the data
    const cacheData: GitHubCacheData = {
      timestamp: Date.now(),
      data,
    }

    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(cacheData))
    }
    catch (error) {
      console.warn('Failed to cache GitHub data:', error)
      // Non-fatal, continue without caching
    }

    return data
  }
  catch (error) {
    // Re-throw with more context
    if (error instanceof Error) {
      throw error
    }
    throw new Error('获取 GitHub 贡献数据时发生未知错误')
  }
}

/**
 * Clear cached contribution data for a specific user
 *
 * @param username - GitHub username
 */
export function clearContributionCache(username: string): void {
  const cacheKey = `github-contributions-${username}`
  sessionStorage.removeItem(cacheKey)
}

/**
 * Get cache status for contribution data
 *
 * @param username - GitHub username
 * @returns Object with cache status or null if no cache exists
 */
export function getContributionCacheStatus(username: string): {
  exists: boolean
  expired: boolean
  age: number
} | null {
  const cacheKey = `github-contributions-${username}`
  const cached = sessionStorage.getItem(cacheKey)

  if (!cached) {
    return null
  }

  try {
    const cacheData: GitHubCacheData = JSON.parse(cached)
    const now = Date.now()
    const age = now - cacheData.timestamp
    const expired = age >= CACHE_DURATION

    return {
      exists: true,
      expired,
      age,
    }
  }
  catch {
    return null
  }
}
