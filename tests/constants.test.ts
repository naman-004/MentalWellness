import { describe, it, expect } from 'vitest'
import {
  EXAM_TYPES,
  MOOD_LABELS,
  JOURNAL_TAGS,
  STRESS_TRIGGERS_LIST,
  CRISIS_KEYWORDS,
} from '../src/utils/constants'

describe('Constants Integrity Tests', () => {
  describe('EXAM_TYPES', () => {
    it('contains all expected competitive exams and has non-empty fields', () => {
      expect(EXAM_TYPES.length).toBeGreaterThanOrEqual(8)
      EXAM_TYPES.forEach((exam) => {
        expect(exam.value.trim().length).toBeGreaterThan(0)
        expect(exam.label.trim().length).toBeGreaterThan(0)
        expect(exam.typicalMonth.trim().length).toBeGreaterThan(0)
      })
    })

    it('has correct mapping structure', () => {
      const neet = EXAM_TYPES.find((e) => e.value === 'NEET')
      expect(neet).toBeDefined()
      expect(neet?.label).toBe('NEET (Medical Entrance)')
    })
  })

  describe('MOOD_LABELS', () => {
    it('covers all mood scores from 1 to 10', () => {
      for (let i = 1; i <= 10; i++) {
        const mood = MOOD_LABELS[i]
        expect(mood).toBeDefined()
        expect(mood.emoji.trim().length).toBeGreaterThan(0)
        expect(mood.label.trim().length).toBeGreaterThan(0)
        expect(mood.description.trim().length).toBeGreaterThan(0)
      }
    })
  })

  describe('JOURNAL_TAGS', () => {
    it('contains a list of non-empty tags', () => {
      expect(JOURNAL_TAGS.length).toBeGreaterThan(0)
      JOURNAL_TAGS.forEach((tag) => {
        expect(tag.trim().length).toBeGreaterThan(0)
      })
    })
  })

  describe('STRESS_TRIGGERS_LIST', () => {
    it('contains a list of non-empty triggers', () => {
      expect(STRESS_TRIGGERS_LIST.length).toBeGreaterThan(0)
      STRESS_TRIGGERS_LIST.forEach((trigger) => {
        expect(trigger.trim().length).toBeGreaterThan(0)
      })
    })
  })

  describe('CRISIS_KEYWORDS', () => {
    it('contains lowercase search keywords for crisis detection', () => {
      expect(CRISIS_KEYWORDS.length).toBeGreaterThan(0)
      CRISIS_KEYWORDS.forEach((keyword) => {
        expect(keyword.trim().length).toBeGreaterThan(0)
        // Ensure they are lowercase for case-insensitive matching
        expect(keyword).toBe(keyword.toLowerCase())
      })
    })
  })
})
