import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { checkRateLimit, RateLimitError, clearTimestamps } from '../src/utils/rateLimiter'

describe('rateLimiter Tests', () => {
  beforeEach(() => {
    clearTimestamps()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows exactly 8 rapid calls and throws RateLimitError on the 9th call', () => {
    // 8 calls must succeed
    for (let i = 0; i < 8; i++) {
      expect(() => checkRateLimit()).not.toThrow()
    }
    // 9th call must throw
    expect(() => checkRateLimit()).toThrow(RateLimitError)
  })

  it('resets request budget after 60 seconds (1 minute window) has passed', () => {
    // Exhaust rate limit window
    for (let i = 0; i < 8; i++) {
      checkRateLimit()
    }
    expect(() => checkRateLimit()).toThrow(RateLimitError)

    // Advance time by 61 seconds (beyond WINDOW_MS = 60,000ms)
    vi.advanceTimersByTime(61000)

    // Next 8 calls should work again
    for (let i = 0; i < 8; i++) {
      expect(() => checkRateLimit()).not.toThrow()
    }
    expect(() => checkRateLimit()).toThrow(RateLimitError)
  })
})
