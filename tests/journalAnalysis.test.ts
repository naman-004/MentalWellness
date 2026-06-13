import { describe, it, expect, vi, beforeEach } from 'vitest'
import { analyzeJournalEntry } from '../src/api/journalAnalysis'
import { callGemini } from '../src/api/geminiClient'
import { checkRateLimit } from '../src/utils/rateLimiter'

vi.mock('../src/api/geminiClient', () => ({
  callGemini: vi.fn(),
}))

vi.mock('../src/utils/rateLimiter', () => ({
  checkRateLimit: vi.fn(),
}))

describe('journalAnalysis API tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws an error if entryText is empty', async () => {
    await expect(
      analyzeJournalEntry('test-key', '', {
        examType: 'NEET',
        daysToExam: 30,
        recentMoodAvg: 7,
        stressBaseline: 5,
      })
    ).rejects.toThrow('Journal entry text cannot be empty.')
  })

  it('calls rate limiter, gemini, and parses response successfully', async () => {
    const mockResponse = JSON.stringify({
      stressLevel: 'medium',
      sentimentScore: 0.2,
      stressTriggers: ['mock test'],
      emotionalPatterns: ['focused'],
      keyThemes: ['exam_pressure'],
      hiddenConcerns: ['backlog'],
      positiveSignals: ['proactive study'],
    })

    vi.mocked(callGemini).mockResolvedValue(mockResponse)

    const result = await analyzeJournalEntry('test-key', 'Studying hard for the test.', {
      examType: 'NEET',
      daysToExam: 30,
      recentMoodAvg: 7,
      stressBaseline: 5,
    })

    expect(checkRateLimit).toHaveBeenCalledTimes(1)
    expect(callGemini).toHaveBeenCalledTimes(1)
    expect(result.stressLevel).toBe('medium')
    expect(result.sentimentScore).toBe(0.2)
    expect(result.stressTriggers).toContain('mock test')
  })
})
