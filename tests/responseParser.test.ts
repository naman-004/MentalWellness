import { describe, it, expect } from 'vitest'
import { parseAnalysisResponse } from '../src/utils/responseParser'

describe('responseParser Tests', () => {
  it('successfully cleans markdown json tags and backticks from Gemini responses', () => {
    const rawMarkdown = `
\`\`\`json
{
  "stressTriggers": ["Mock scoring fears"],
  "emotionalPatterns": ["Anxious"],
  "sentimentScore": -0.4,
  "stressLevel": "high",
  "keyThemes": ["exam_pressure", "time_anxiety"],
  "hiddenConcerns": ["Is backlog recoverable?"],
  "positiveSignals": ["Wrote reflections down"],
  "analysisTimestamp": "2024-01-01T00:00:00.000Z"
}
\`\`\`
    `
    const result = parseAnalysisResponse(rawMarkdown)
    expect(result.stressLevel).toBe('high')
    expect(result.sentimentScore).toBe(-0.4)
    expect(result.stressTriggers).toContain('Mock scoring fears')
  })

  it('handles missing or invalid stressLevel fields gracefully by defaulting to medium', () => {
    const rawMissingStress = `
{
  "stressTriggers": [],
  "emotionalPatterns": [],
  "sentimentScore": 0.0,
  "keyThemes": [],
  "hiddenConcerns": [],
  "positiveSignals": []
}
    `
    const result = parseAnalysisResponse(rawMissingStress)
    expect(result.stressLevel).toBe('medium')
  })

  it('clamps sentimentScore to the range of [-1.0, 1.0]', () => {
    const rawTooHigh = `{ "sentimentScore": 1.8 }`
    const rawTooLow = `{ "sentimentScore": -4.2 }`

    expect(parseAnalysisResponse(rawTooHigh).sentimentScore).toBe(1.0)
    expect(parseAnalysisResponse(rawTooLow).sentimentScore).toBe(-1.0)
  })

  it('ensures positiveSignals never returns an empty array to maintain morale indicator guidelines', () => {
    const rawEmptyPositives = `
{
  "stressTriggers": [],
  "emotionalPatterns": [],
  "sentimentScore": -0.8,
  "stressLevel": "critical",
  "keyThemes": ["burnout"],
  "hiddenConcerns": [],
  "positiveSignals": []
}
    `
    const result = parseAnalysisResponse(rawEmptyPositives)
    expect(result.positiveSignals.length).toBeGreaterThan(0)
    expect(result.positiveSignals[0]).toContain('reflect')
  })
})
