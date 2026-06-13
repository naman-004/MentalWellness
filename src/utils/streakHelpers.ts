import { differenceInCalendarDays, parseISO } from 'date-fns'
import { JournalEntry } from '../types/journal'

/**
 * Checks if the streak is still alive based on the last entry date.
 * A streak is alive if the last entry was made today or yesterday.
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
 * Returns the streak count.
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
