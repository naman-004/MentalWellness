import { describe, it, expect } from 'vitest'
import { computeCurrentStreak, isStreakAlive } from '../src/utils/streakHelpers'
import { JournalEntry } from '../src/types/journal'

// Helper to create mocked journal entries for testing
const createMockEntry = (createdAt: string, deletedAt: string | null = null): JournalEntry => ({
  id: Math.random().toString(),
  text: 'Revision session finished successfully.',
  moodScore: 8,
  studyHours: 9,
  daysToExam: 45,
  tags: ['Revision'],
  aiAnalysis: null,
  analysisStatus: 'pending',
  createdAt,
  deletedAt,
})

describe('streakHelpers Tests', () => {
  const formatTime = (date: Date) => date.toISOString()

  describe('isStreakAlive', () => {
    it('returns true if the last entry date was today', () => {
      const todayStr = formatTime(new Date())
      expect(isStreakAlive(todayStr)).toBe(true)
    })

    it('returns true if the last entry date was yesterday', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(isStreakAlive(formatTime(yesterday))).toBe(true)
    })

    it('returns false if the last entry date was 3 days ago', () => {
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      expect(isStreakAlive(formatTime(threeDaysAgo))).toBe(false)
    })
  })

  describe('computeCurrentStreak', () => {
    it('calculates a 2-day streak when entries are today and yesterday', () => {
      const today = new Date()
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const entries = [
        createMockEntry(formatTime(today)),
        createMockEntry(formatTime(yesterday)),
      ]
      expect(computeCurrentStreak(entries)).toBe(2)
    })

    it('calculates a 0-day streak when the last entry was 3 days ago (streak is dead)', () => {
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

      const entries = [
        createMockEntry(formatTime(threeDaysAgo)),
      ]
      expect(computeCurrentStreak(entries)).toBe(0)
    })

    it('ignores deleted entries in calculation', () => {
      const today = new Date()
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const entries = [
        createMockEntry(formatTime(today)),
        // deleted entry
        createMockEntry(formatTime(yesterday), formatTime(new Date())),
      ]
      // Should be 1 because yesterday's entry is soft-deleted
      expect(computeCurrentStreak(entries)).toBe(1)
    })

    it('returns 0 for empty logs list', () => {
      expect(computeCurrentStreak([])).toBe(0)
    })
  })
})
