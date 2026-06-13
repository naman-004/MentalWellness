/**
 * @module weeklySummary
 * @description Weekly wellness reflection generator for ZenPath.
 * Generates AI-powered weekly summaries with 24-hour localStorage caching.
 */

import { callGemini } from './geminiClient'
import { checkRateLimit } from '../utils/rateLimiter'
import { WEEKLY_SUMMARY_SYSTEM_PROMPT } from '../utils/promptTemplates'
import { sanitizeText } from '../utils/sanitize'
import type { UserProfile } from '../types/user'

/** Shape of the cached weekly summary stored in localStorage. */
export interface WeeklySummaryCache {
  summary: string
  timestamp: number
}

/**
 * Generates a weekly reflection letter using Google Gemini.
 * Employs a local storage cache to keep calls to at most once per 24 hours.
 *
 * @param apiKey - The user's Gemini API key
 * @param profile - The user's profile with name and exam details
 * @param weekMetrics - Aggregated wellness metrics for the past week
 * @param forceRefresh - If `true`, bypasses the cache and generates a new summary
 * @returns An object containing the summary text and the cache timestamp
 * @throws {WeeklySummaryFallbackError} If the API call fails but a cached version exists
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

    const safeName = sanitizeText(profile.name, 200)
    const userMessage = `
      Student: ${safeName}, preparing for ${profile.examType}
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

/**
 * Custom error thrown when a weekly summary API call fails but a cached version exists.
 * Allows the UI to display the stale cache with a warning message.
 *
 * @property {string} cachedSummary - The cached summary text to display
 * @property {number} cachedAt - Timestamp when the cache was written
 */
export class WeeklySummaryFallbackError extends Error {
  constructor(message: string, public cachedSummary: string, public cachedAt: number) {
    super(message)
    this.name = 'WeeklySummaryFallbackError'
    Object.setPrototypeOf(this, WeeklySummaryFallbackError.prototype)
  }
}
