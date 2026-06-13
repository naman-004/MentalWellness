import { describe, it, expect } from 'vitest'
import {
  computeMoodAverage,
  aggregateTriggers,
  evaluateTrendDirection,
  discoverPositivePatterns,
  computeStressHeatmap,
  computeSummaryStats,
} from '../src/utils/insightComputer'
import { JournalEntry } from '../src/types/journal'
import { UserProfile } from '../src/types/user'

const mockProfile: UserProfile = {
  id: 'user-1',
  name: 'Test Student',
  examType: 'JEE_MAINS',
  examDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  stressBaseline: 6,
  journalTimePreference: 'evening',
  onboardingComplete: true,
  createdAt: new Date().toISOString(),
  topWorries: ['Syllabus Backlog'],
}

const mockEntries: JournalEntry[] = [
  {
    id: '1',
    text: 'Syllabus backlog is making me anxious.',
    moodScore: 4,
    studyHours: 8,
    daysToExam: 30,
    tags: ['stress'],
    analysisStatus: 'complete',
    createdAt: new Date().toISOString(),
    deletedAt: null,
    aiAnalysis: {
      stressTriggers: ['Syllabus backlog', 'Exam prep'],
      emotionalPatterns: ['Anxiety'],
      sentimentScore: -0.6,
      stressLevel: 'high',
      keyThemes: ['exam_pressure'],
      hiddenConcerns: ['Fear of not finishing on time'],
      positiveSignals: ['Wrote journal entry'],
      analysisTimestamp: new Date().toISOString(),
    },
  },
  {
    id: '2',
    text: 'Studied well today. Got good scores in mock test.',
    moodScore: 8,
    studyHours: 10,
    daysToExam: 29,
    tags: ['productive'],
    analysisStatus: 'complete',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    deletedAt: null,
    aiAnalysis: {
      stressTriggers: ['Mock test'],
      emotionalPatterns: ['Confidence', 'Relief'],
      sentimentScore: 0.8,
      stressLevel: 'low',
      keyThemes: ['exam_pressure'],
      hiddenConcerns: [],
      positiveSignals: ['Positive self-reflection', 'Studied hard'],
      analysisTimestamp: new Date().toISOString(),
    },
  },
]

describe('insightComputer Utility Functions', () => {
  it('correctly computes mood average', () => {
    expect(computeMoodAverage(mockEntries)).toBe(6.0)
    expect(computeMoodAverage([])).toBe(0)
  })

  it('aggregates and capitalizes triggers correctly', () => {
    const triggers = aggregateTriggers(mockEntries)
    expect(triggers).toHaveLength(3)
    expect(triggers[0].name).toBe('Syllabus backlog')
    expect(triggers[0].value).toBe(1)
  })

  it('evaluates trend direction correctly', () => {
    // Both entries are within the last 7 days. Under our fallback:
    // Sorted entries: ID 1 (mood 4), ID 2 (mood 8).
    // Newer half = ID 1 (4), Older half = ID 2 (8)
    // Trend should be declining (recent avg < prior avg)
    const trend = evaluateTrendDirection(mockEntries)
    expect(trend).toBe('declining')
  })

  it('discovers unique positive patterns', () => {
    const patterns = discoverPositivePatterns(mockEntries)
    expect(patterns).toContain('Wrote journal entry')
    expect(patterns).toContain('Positive self-reflection')
    expect(patterns).toContain('Studied hard')
    expect(patterns).toHaveLength(3)
  })

  it('computes stress heatmap array of 21 cells', () => {
    const cells = computeStressHeatmap(mockEntries)
    expect(cells).toHaveLength(21)
    
    // Check that we have cells with positive values representing our mock entries
    const positiveCells = cells.filter((c) => c.value > 0)
    expect(positiveCells.length).toBeGreaterThan(0)
    const values = positiveCells.map((c) => c.value)
    expect(values).toContain(1) // Low stress (Entry 2)
    expect(values).toContain(3) // High stress (Entry 1)
  })

  it('computes summary statistics cards values', () => {
    const stats = computeSummaryStats(mockEntries, mockProfile)
    expect(stats.avgMood).toBe(6)
    expect(stats.avgStudyHours).toBe(9) // (8 + 10) / 2 = 9
    expect(stats.stressBaseline).toBe(6)
    expect(stats.totalEntries).toBe(2)
  })
})
