/**
 * @module streakHelpers
 * @description Calculates journaling streaks — consecutive days with at least one journal entry.
 * Streaks motivate students to maintain a consistent wellness journaling habit.
 */

import { differenceInCalendarDays, parseISO } from 'date-fns'
import { JournalEntry } from '../types/journal'

/**
 * Checks if the streak is still alive based on the last entry date.
 * A streak is alive if the last entry was made today or yesterday.
 *
 * @param lastEntryDate - ISO date string of the most recent journal entry
 * @returns `true` if the streak is alive, `false` otherwise
 */
export function isStreakAlive(lastEntryDate: string): boolean {
  if (!lastEntryDate) return false
  try {
    const lastDate = parseISO(lastEntryDate)
    const today = new Date()
    const diff = differenceInCalendarDays(today, lastDate)
    return diff >= 0 && diff <= 1
  } catch (e) {
    console.error('Error in isStreakAlive:', e)
    return false
  }
}

/**
 * Computes the current streak of consecutive days with journal entries.
 * Filters out soft-deleted entries, deduplicates by calendar date,
 * and counts consecutive days backwards from the most recent.
 *
 * @param entries - The full list of journal entries (including soft-deleted)
 * @returns The streak count (0 if no active streak)
 */
export function computeCurrentStreak(entries: JournalEntry[]): number {
  // 1. Filter out soft-deleted entries
  const activeEntries = entries.filter((e) => e.deletedAt === null)
  if (activeEntries.length === 0) return 0

  // 2. Extract unique calendar dates in YYYY-MM-DD format
  const dateStrings = activeEntries.map((e) => e.createdAt.split('T')[0])
  const uniqueDates = Array.from(new Set(dateStrings))

  // 3. Sort dates in descending order (newest first)
  uniqueDates.sort((a, b) => b.localeCompare(a))

  // 4. Check if the latest entry is today or yesterday
  const newestDateStr = uniqueDates[0]
  if (!isStreakAlive(newestDateStr + 'T12:00:00')) {
    // Note: append a time suffix to avoid time-zone parsing discrepancies in tests
    return 0
  }

  // 5. Count consecutive days
  let streak = 1
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const current = parseISO(uniqueDates[i])
    const next = parseISO(uniqueDates[i + 1])
    const diff = differenceInCalendarDays(current, next)

    if (diff === 1) {
      streak++
    } else if (diff > 1) {
      // Streak is broken
      break
    }
    // If diff === 0, it is the same day, which shouldn't happen because of uniqueDates, but we ignore it.
  }

  return streak
}

/**
 * Returns a user-friendly message describing the current streak status.
 * Used in dashboard UI to provide encouraging feedback.
 *
 * @param streak - The current streak count
 * @returns A motivational streak status message string
 *
 * @example
 * ```ts
 * getStreakMessage(0)   // '🌱 Start journaling to build your streak!'
 * getStreakMessage(3)   // '🔥 3 day streak! Keep going!'
 * getStreakMessage(7)   // '🌟 7 day streak! One full week — incredible!'
 * getStreakMessage(30)  // '🏆 30 day streak! You are unstoppable!'
 * ```
 */
export function getStreakMessage(streak: number): string {
  if (streak === 0) return '🌱 Start journaling to build your streak!'
  if (streak === 1) return '✨ First day! A great start to your wellness journey.'
  if (streak < 7) return `🔥 ${streak} day streak! Keep going!`
  if (streak < 14) return `🌟 ${streak} day streak! One full week — incredible!`
  if (streak < 30) return `💪 ${streak} day streak! Your consistency is inspiring!`
  return `🏆 ${streak} day streak! You are unstoppable!`
}
