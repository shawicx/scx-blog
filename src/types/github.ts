/**
 * GitHub contribution day data
 */
export interface GitHubContributionDay {
  date: string
  count: number
  level: 'NONE' | 'FIRST_QUARTILE' | 'SECOND_QUARTILE' | 'THIRD_QUARTILE' | 'FOURTH_QUARTILE'
}

/**
 * GitHub contribution week data
 */
export interface GitHubContributionWeek {
  firstDay: string
  totalContributions: number
  days: GitHubContributionDay[]
}

/**
 * Complete GitHub contribution data
 */
export interface GitHubContributionData {
  totalContributions: number
  weeks: GitHubContributionWeek[]
  login: string
}

/**
 * Cache data structure for sessionStorage
 */
export interface GitHubCacheData {
  timestamp: number
  data: GitHubContributionData
}

/**
 * GraphQL response types
 */
export interface GraphQLContributionDay {
  date: string
  contributionCount: number
  contributionLevel: 'NONE' | 'FIRST_QUARTILE' | 'SECOND_QUARTILE' | 'THIRD_QUARTILE' | 'FOURTH_QUARTILE'
}

export interface GraphQLContributionWeek {
  firstDay: string
  contributionDays: GraphQLContributionDay[]
}

export interface GraphQLContributionCalendar {
  totalContributions: number
  weeks: GraphQLContributionWeek[]
}

export interface GraphQLContributionsCollection {
  contributionCalendar: GraphQLContributionCalendar
}

export interface GraphQLUser {
  contributionsCollection: GraphQLContributionsCollection
}

export interface GraphQLResponse {
  data?: {
    user?: GraphQLUser
  }
  errors?: Array<{
    message: string
    type?: string
  }>
}
