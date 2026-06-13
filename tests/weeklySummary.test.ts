import { describe, it, expect, beforeEach, vi } from 'vitest'
import { generateWeeklySummary, WeeklySummaryFallbackError } from '../src/api/weeklySummary'
import { callGemini } from '../src/api/geminiClient'
import { UserProfile } from '../src/types/user'

vi.mock('../src/api/geminiClient', () => ({
  callGemini: vi.fn(),
  checkRateLimit: vi.fn(),
}))

const mockProfile: UserProfile = {
  id: 'user-1',
  name: 'Test Student',
  examType: 'JEE_MAINS',
  examDate: new Date().toISOString(),
  stressBaseline: 6,
  journalTimePreference: 'evening',
  onboardingComplete: true,
  createdAt: new Date().toISOString(),
  topWorries: ['Syllabus Backlog'],
}

const mockMetrics = {
  avgMood: 6.5,
  topTriggers: ['Mock test', 'Syllabus backlog'],
  daysToExam: 30,
  entriesThisWeek: 4,
  topPositiveSignal: 'Keeps studying consistently',
}

describe('Weekly Summary Generation & Cache Tests', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('makes a fresh call to callGemini when no cache exists', async () => {
    vi.mocked(callGemini).mockResolvedValueOnce('This is a fresh mock weekly reflection.')

    const result = await generateWeeklySummary('dummy-api-key', mockProfile, mockMetrics)
    
    expect(callGemini).toHaveBeenCalledTimes(1)
    expect(result.summary).toBe('This is a fresh mock weekly reflection.')
    expect(localStorage.getItem('zenpath-weekly-summary')).toBeTruthy()
  })

  it('uses the cached summary if it is fresh (<24h) and forceRefresh is false', async () => {
    // Setup fresh cache in localStorage
    const now = Date.now()
    localStorage.setItem(
      'zenpath-weekly-summary',
      JSON.stringify({
        summary: 'Cached weekly reflection text.',
        timestamp: now - 2 * 60 * 60 * 1000, // 2 hours ago
      })
    )

    const result = await generateWeeklySummary('dummy-api-key', mockProfile, mockMetrics)

    // Should NOT call Gemini
    expect(callGemini).not.toHaveBeenCalled()
    expect(result.summary).toBe('Cached weekly reflection text.')
  })

  it('forces a fresh call to callGemini if forceRefresh is true, even if fresh cache exists', async () => {
    const now = Date.now()
    localStorage.setItem(
      'zenpath-weekly-summary',
      JSON.stringify({
        summary: 'Cached weekly reflection text.',
        timestamp: now - 2 * 60 * 60 * 1000, // 2 hours ago
      })
    )

    vi.mocked(callGemini).mockResolvedValueOnce('Newly refreshed reflection text.')

    const result = await generateWeeklySummary('dummy-api-key', mockProfile, mockMetrics, true)

    expect(callGemini).toHaveBeenCalledTimes(1)
    expect(result.summary).toBe('Newly refreshed reflection text.')
  })

  it('falls back to cache and throws WeeklySummaryFallbackError if callGemini fails and cache exists', async () => {
    const now = Date.now()
    localStorage.setItem(
      'zenpath-weekly-summary',
      JSON.stringify({
        summary: 'Cached reflection for fallback.',
        timestamp: now - 25 * 60 * 60 * 1000, // 25 hours ago (expired cache)
      })
    )

    vi.mocked(callGemini).mockRejectedValueOnce(new Error('Rate limit or API error'))

    await expect(
      generateWeeklySummary('dummy-api-key', mockProfile, mockMetrics)
    ).rejects.toThrow(WeeklySummaryFallbackError)
  })
})
