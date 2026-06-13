import { describe, it, expect, beforeEach } from 'vitest'
import { getDailyQuote, getRandomQuote, MOUNT_QUOTES } from '../src/api/zenquotes'

describe('zenquotes Tests', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('MOUNT_QUOTES array integrity', () => {
    it('contains at least 30 quotes', () => {
      expect(MOUNT_QUOTES.length).toBeGreaterThanOrEqual(30)
    })

    it('every quote has a non-empty text field', () => {
      MOUNT_QUOTES.forEach((q, i) => {
        expect(q.text.trim().length, `Quote ${i} has empty text`).toBeGreaterThan(0)
      })
    })

    it('every quote has a non-empty author field', () => {
      MOUNT_QUOTES.forEach((q, i) => {
        expect(q.author.trim().length, `Quote ${i} has empty author`).toBeGreaterThan(0)
      })
    })
  })

  describe('getDailyQuote', () => {
    it('returns a valid quote object with text and author', () => {
      const quote = getDailyQuote()
      expect(quote).toHaveProperty('text')
      expect(quote).toHaveProperty('author')
      expect(quote.text.length).toBeGreaterThan(0)
      expect(quote.author.length).toBeGreaterThan(0)
    })

    it('returns the same quote on subsequent calls within the same day (caching)', () => {
      const firstCall = getDailyQuote()
      const secondCall = getDailyQuote()
      expect(firstCall.text).toBe(secondCall.text)
      expect(firstCall.author).toBe(secondCall.author)
    })

    it('stores the quote in localStorage with the correct cache key', () => {
      getDailyQuote()
      const cached = localStorage.getItem('zenpath-daily-quote')
      expect(cached).toBeTruthy()
      const parsed = JSON.parse(cached!)
      expect(parsed).toHaveProperty('quote')
      expect(parsed).toHaveProperty('dateString')
    })
  })

  describe('getRandomQuote', () => {
    it('returns a valid quote object', () => {
      const quote = getRandomQuote()
      expect(quote).toHaveProperty('text')
      expect(quote).toHaveProperty('author')
      expect(quote.text.length).toBeGreaterThan(0)
    })

    it('returns a quote from the MOUNT_QUOTES array', () => {
      const quote = getRandomQuote()
      const found = MOUNT_QUOTES.some(q => q.text === quote.text && q.author === quote.author)
      expect(found).toBe(true)
    })
  })
})
