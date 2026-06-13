import { describe, it, expect } from 'vitest'
import {
  formatDate,
  daysFromNow,
  isSameDay,
  groupEntriesByDate,
  isValidISODate,
} from '../src/utils/dateHelpers'
import { JournalEntry } from '../src/types/journal'

// Helper to create a mock journal entry
const createMockEntry = (createdAt: string): JournalEntry => ({
  id: Math.random().toString(),
  text: 'Test entry.',
  moodScore: 7,
  studyHours: 6,
  daysToExam: 30,
  tags: [],
  aiAnalysis: null,
  analysisStatus: 'pending',
  createdAt,
  deletedAt: null,
})

describe('dateHelpers Tests', () => {
  describe('isValidISODate', () => {
    it('returns true for valid ISO date strings', () => {
      expect(isValidISODate('2024-06-13T10:00:00.000Z')).toBe(true)
      expect(isValidISODate('2024-01-01')).toBe(true)
      expect(isValidISODate(new Date().toISOString())).toBe(true)
    })

    it('returns false for invalid date strings', () => {
      expect(isValidISODate('not-a-date')).toBe(false)
      expect(isValidISODate('')).toBe(false)
      expect(isValidISODate('abc123')).toBe(false)
    })

    it('returns false for null and undefined', () => {
      expect(isValidISODate(null as unknown as string)).toBe(false)
      expect(isValidISODate(undefined as unknown as string)).toBe(false)
    })
  })

  describe('formatDate', () => {
    it('formats a valid ISO date string to EEE, d MMM format', () => {
      // We check that the output is a non-empty string
      const result = formatDate('2024-06-13T10:00:00.000Z')
      expect(result).toBeTruthy()
      expect(result).toContain('Jun')
    })

    it('returns empty string for empty input', () => {
      expect(formatDate('')).toBe('')
    })

    it('returns empty string for invalid date strings', () => {
      expect(formatDate('not-a-date')).toBe('')
    })
  })

  describe('daysFromNow', () => {
    it('returns a positive number for future dates', () => {
      const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
      const result = daysFromNow(futureDate)
      expect(result).toBeGreaterThanOrEqual(9)
      expect(result).toBeLessThanOrEqual(11)
    })

    it('returns a negative number for past dates', () => {
      const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      const result = daysFromNow(pastDate)
      expect(result).toBeLessThanOrEqual(-4)
      expect(result).toBeGreaterThanOrEqual(-6)
    })

    it('returns 0 for today', () => {
      const today = new Date().toISOString()
      expect(daysFromNow(today)).toBe(0)
    })

    it('returns 0 for empty input', () => {
      expect(daysFromNow('')).toBe(0)
    })
  })

  describe('isSameDay', () => {
    it('returns true for two timestamps on the same calendar day', () => {
      expect(isSameDay('2024-06-13T12:00:00', '2024-06-13T15:00:00')).toBe(true)
    })

    it('returns false for timestamps on different days', () => {
      expect(isSameDay('2024-06-13T12:00:00', '2024-06-14T12:00:00')).toBe(false)
    })

    it('returns false for empty string inputs', () => {
      expect(isSameDay('', '2024-06-13T08:00:00Z')).toBe(false)
      expect(isSameDay('2024-06-13T08:00:00Z', '')).toBe(false)
      expect(isSameDay('', '')).toBe(false)
    })
  })

  describe('groupEntriesByDate', () => {
    it('groups entries by their YYYY-MM-DD date part', () => {
      const entries = [
        createMockEntry('2024-06-13T08:00:00Z'),
        createMockEntry('2024-06-13T20:00:00Z'),
        createMockEntry('2024-06-12T10:00:00Z'),
      ]
      const groups = groupEntriesByDate(entries)
      expect(Object.keys(groups)).toHaveLength(2)
      expect(groups['2024-06-13']).toHaveLength(2)
      expect(groups['2024-06-12']).toHaveLength(1)
    })

    it('returns empty object for empty entries array', () => {
      const groups = groupEntriesByDate([])
      expect(Object.keys(groups)).toHaveLength(0)
    })
  })
})
