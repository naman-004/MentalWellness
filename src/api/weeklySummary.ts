import { callGemini } from './geminiClient'
import { checkRateLimit } from '../utils/rateLimiter'
import { WEEKLY_SUMMARY_SYSTEM_PROMPT } from '../utils/promptTemplates'
import type { UserProfile } from '../types/user'

export interface WeeklySummaryCache {
  summary: string
  timestamp: number
}

/**
 * Generates a weekly reflection letter using Google Gemini.
 * Employs a local storage cache to keep calls to at most once per 24 hours.
 */
export async function generateWeeklySummary(
  apiKey: string,
  profile: UserProfile,
  weekMetrics: {
    avgMood: number
    topTriggers: string[]
    daysToExam: number
    entriesThisWeek: number
    topPositiveSignal: string
  },
  forceRefresh = false
): Promise<{ summary: string; cachedAt: number }> {
  const cacheKey = 'zenpath-weekly-summary'
  const cached = localStorage.getItem(cacheKey)
  
  if (cached && !forceRefresh) {
    try {
      const parsed: WeeklySummaryCache = JSON.parse(cached)
      const isFresh = Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000
      if (isFresh) {
        return { summary: parsed.summary, cachedAt: parsed.timestamp }
      }
    } catch (e) {
      console.error('Failed to parse weekly summary cache', e)
    }
  }

  // If we reach here, we need to generate a new summary
  try {
    // checkRateLimit() must be called
    checkRateLimit()

    const userMessage = `
      Student: ${profile.name}, preparing for ${profile.examType}
      Days to exam: ${weekMetrics.daysToExam}
      This week's mood average: ${weekMetrics.avgMood}/10
      Top stress themes this week: ${weekMetrics.topTriggers.join(', ')}
      Journal entries this week: ${weekMetrics.entriesThisWeek}
      Notable strength observed: ${weekMetrics.topPositiveSignal}
      
      Write the weekly reflection letter now.
    `.trim()

    // Gemini call using maxOutputTokens = 350 as requested
    const summary = await callGemini(apiKey, WEEKLY_SUMMARY_SYSTEM_PROMPT, userMessage, 350)
    
    // Write new summary cache
    const newCache: WeeklySummaryCache = {
      summary,
      timestamp: Date.now(),
    }
    localStorage.setItem(cacheKey, JSON.stringify(newCache))
    return { summary, cachedAt: newCache.timestamp }
  } catch (err) {
    // If rate limited or error occurred, and we have a cached version, fallback to it
    if (cached) {
      try {
        const parsed: WeeklySummaryCache = JSON.parse(cached)
        // Re-throw RateLimitError or another error but let caller know we fall back
        console.warn('Weekly summary API error, falling back to cache', err)
        throw new WeeklySummaryFallbackError(
          "Zen is taking a short break. Cached summary shown below.",
          parsed.summary,
          parsed.timestamp
        )
      } catch (e) {
        if (e instanceof WeeklySummaryFallbackError) throw e
      }
    }
    throw err
  }
}

export class WeeklySummaryFallbackError extends Error {
  constructor(message: string, public cachedSummary: string, public cachedAt: number) {
    super(message)
    this.name = 'WeeklySummaryFallbackError'
    Object.setPrototypeOf(this, WeeklySummaryFallbackError.prototype)
  }
}
