/**
 * @module rateLimiter
 * @description Client-side sliding-window token-bucket rate limiter for Gemini free tier.
 *
 * Enforces a maximum number of API requests within a rolling time window to prevent
 * HTTP 429 quota exhaustion errors under Gemini's free tier constraints (10 RPM).
 *
 * **Design Decision:** The budget is set to 8 RPM (2 slots buffered) to account for
 * network latency overlaps where a request might still be in-flight when the next arrives.
 *
 * **Limitation:** The rate limit counter uses an in-memory sliding window (the `timestamps` array).
 * The counter resets when the page is refreshed.
 */

import { securityLog } from './security'

/** Maximum number of requests allowed within the time window. */
export const MAX_REQUESTS = 8

/** Duration of the sliding window in milliseconds (1 minute). */
export const WINDOW_MS = 60_000

/** In-memory sliding window of request timestamps. */
const timestamps: number[] = []

/**
 * Custom error class thrown when the rate limit budget is exhausted.
 *
 * @property {number} waitMs - The number of milliseconds the caller should wait before retrying.
 *
 * @example
 * ```ts
 * try {
 *   checkRateLimit()
 * } catch (err) {
 *   if (err instanceof RateLimitError) {
 *     console.log(`Wait ${Math.ceil(err.waitMs / 1000)} seconds`)
 *   }
 * }
 * ```
 */
export class RateLimitError extends Error {
  constructor(message: string, public waitMs: number) {
    super(message)
    this.name = 'RateLimitError'
    Object.setPrototypeOf(this, RateLimitError.prototype)
  }
}

/**
 * Checks and enforces the rate limit before making a Gemini API call.
 *
 * Removes expired timestamps from the sliding window, then checks if the
 * current request count exceeds the budget. If so, throws a `RateLimitError`
 * with a student-friendly message and the exact wait time.
 *
 * @throws {RateLimitError} If the rate limit budget has been exhausted
 *
 * @example
 * ```ts
 * checkRateLimit()  // succeeds if under budget
 * checkRateLimit()  // throws RateLimitError if budget exhausted
 * ```
 */
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
    securityLog('RATE_LIMIT_HIT', { currentCount: timestamps.length, waitSec })
    // Student-friendly error message
    throw new RateLimitError(
      `Slow down — Zen needs a moment to catch up! Try again in ${waitSec} seconds.`,
      waitMs
    )
  }
  timestamps.push(now)
}

/**
 * Returns the number of remaining API requests available in the current sliding window.
 *
 * @returns The number of requests remaining before the rate limit is hit
 *
 * @example
 * ```ts
 * const remaining = getRemainingRequests()
 * console.log(`${remaining} requests available`)
 * ```
 */
export function getRemainingRequests(): number {
  const now = Date.now()
  const recentCount = timestamps.filter(t => now - t < WINDOW_MS).length
  return Math.max(0, MAX_REQUESTS - recentCount)
}

/**
 * Returns the wait time in milliseconds before the next request can be made.
 * Returns 0 if a request can be made immediately.
 *
 * Unlike `checkRateLimit()`, this function does not throw — it is designed for
 * UI components that need to display countdown timers or disable buttons.
 *
 * @returns The wait time in milliseconds, or 0 if immediately available
 *
 * @example
 * ```ts
 * const waitMs = getWaitTime()
 * if (waitMs > 0) {
 *   showCountdown(Math.ceil(waitMs / 1000))
 * }
 * ```
 */
export function getWaitTime(): number {
  const now = Date.now()
  // Purge expired timestamps
  while (timestamps.length > 0 && now - timestamps[0] > WINDOW_MS) {
    timestamps.shift()
  }
  if (timestamps.length < MAX_REQUESTS) return 0
  const oldestRequest = timestamps[0]
  return Math.max(0, WINDOW_MS - (now - oldestRequest))
}

/**
 * Clears all tracked timestamps. Used for test isolation.
 * @internal
 */
export function clearTimestamps(): void {
  timestamps.length = 0
}

/** @internal Exported for test helpers. */
export { timestamps }
