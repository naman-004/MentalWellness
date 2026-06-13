/**
 * Simple token-bucket rate limiter for Gemini free tier.
 * Allows MAX_REQUESTS per WINDOW_MS.
 * Used before every Gemini API call.
 * 
 * NOTE & LIMITATION:
 * The rate limit counter uses an in-memory sliding window (the `timestamps` array).
 * Rate limit counter resets when you refresh the page.
 */

const MAX_REQUESTS = 8          // stay under 10 RPM with buffer
const WINDOW_MS = 60_000        // 1 minute window
const timestamps: number[] = [] // sliding window of request times

export class RateLimitError extends Error {
  constructor(message: string, public waitMs: number) {
    super(message)
    this.name = 'RateLimitError'
    Object.setPrototypeOf(this, RateLimitError.prototype)
  }
}

export function checkRateLimit(): void {
  const now = Date.now()
  // Remove timestamps older than 1 minute
  while (timestamps.length > 0 && now - timestamps[0] > WINDOW_MS) {
    timestamps.shift()
  }
  if (timestamps.length >= MAX_REQUESTS) {
    const oldestRequest = timestamps[0]
    const waitMs = WINDOW_MS - (now - oldestRequest)
    const waitSec = Math.ceil(waitMs / 1000)
    // Student-friendly error message
    throw new RateLimitError(
      `Slow down — Zen needs a moment to catch up! Try again in ${waitSec} seconds.`,
      waitMs
    )
  }
  timestamps.push(now)
}

export function getRemainingRequests(): number {
  const now = Date.now()
  const recentCount = timestamps.filter(t => now - t < WINDOW_MS).length
  return Math.max(0, MAX_REQUESTS - recentCount)
}

// Export for test helper to clear state if needed
export function clearTimestamps(): void {
  timestamps.length = 0
}
export { timestamps }
