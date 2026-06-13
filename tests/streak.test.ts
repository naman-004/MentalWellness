import { describe, it, expect } from 'vitest'
import { isStreakAlive, computeCurrentStreak } from '../src/utils/streakHelpers'
import { JournalEntry } from '../src/types/journal'

describe('Streak Calculation Helpers', () => {
  it('correctly reports if streak is alive', () => {
    const today = new Date().toISOString()
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()

    expect(isStreakAlive(today)).toBe(true)
    expect(isStreakAlive(yesterday)).toBe(true)
    expect(isStreakAlive(threeDaysAgo)).toBe(false)
  })

  it('computes current streak count correctly for consecutive entries', () => {
    const todayStr = new Date().toISOString().split('T')[0]
    const yesterdayStr = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const twoDaysAgoStr = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const entries: JournalEntry[] = [
      {
        id: '1',
        text: 'Entry today',
        moodScore: 8,
        studyHours: 6,
        daysToExam: 30,
        tags: [],
        aiAnalysis: null,
        analysisStatus: 'pending',
        createdAt: todayStr + 'T10:00:00.000Z',
        deletedAt: null,
      },
      {
        id: '2',
        text: 'Entry yesterday',
        moodScore: 7,
        studyHours: 7,
        daysToExam: 31,
        tags: [],
        aiAnalysis: null,
        analysisStatus: 'pending',
        createdAt: yesterdayStr + 'T14:00:00.000Z',
        deletedAt: null,
      },
      {
        id: '3',
        text: 'Entry 2 days ago',
        moodScore: 6,
        studyHours: 8,
        daysToExam: 32,
        tags: [],
        aiAnalysis: null,
        analysisStatus: 'pending',
        createdAt: twoDaysAgoStr + 'T18:00:00.000Z',
        deletedAt: null,
      },
    ]

    expect(computeCurrentStreak(entries)).toBe(3)
  })

  it('returns 0 if the latest entry is older than yesterday', () => {
    const twoDaysAgoStr = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const entries: JournalEntry[] = [
      {
        id: '3',
        text: 'Entry 2 days ago',
        moodScore: 6,
        studyHours: 8,
        daysToExam: 32,
        tags: [],
        aiAnalysis: null,
        analysisStatus: 'pending',
        createdAt: twoDaysAgoStr + 'T18:00:00.000Z',
        deletedAt: null,
      },
    ]

    expect(computeCurrentStreak(entries)).toBe(0)
  })

  it('filters out soft deleted entries from streak calculation', () => {
    const todayStr = new Date().toISOString().split('T')[0]

    const entries: JournalEntry[] = [
      {
        id: '1',
        text: 'Deleted entry today',
        moodScore: 8,
        studyHours: 6,
        daysToExam: 30,
        tags: [],
        aiAnalysis: null,
        analysisStatus: 'pending',
        createdAt: todayStr + 'T10:00:00.000Z',
        deletedAt: new Date().toISOString(), // Soft-deleted
      },
    ]

    expect(computeCurrentStreak(entries)).toBe(0)
  })
})
