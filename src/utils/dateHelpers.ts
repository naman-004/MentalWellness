/**
 * @module dateHelpers
 * @description Date formatting and comparison utilities for ZenPath.
 * Provides safe wrappers around date-fns functions with error handling and input validation.
 */

import { format, parseISO, differenceInCalendarDays, isSameDay as dateFnsIsSameDay } from 'date-fns'
import { JournalEntry } from '../types/journal'

/**
 * Validates whether a string is a valid ISO 8601 date string.
 *
 * @param dateStr - The string to validate
 * @returns `true` if the string can be parsed as a valid Date, `false` otherwise
 *
 * @example
 * ```ts
 * isValidISODate('2024-06-13T10:00:00.000Z')  // true
 * isValidISODate('not-a-date')                  // false
 * isValidISODate('')                            // false
 * ```
 */
export function isValidISODate(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false
  try {
    const parsed = parseISO(dateStr)
    return !isNaN(parsed.getTime())
  } catch {
    return false
  }
}

/**
 * Formats an ISO date string to "Mon, 9 Jun" format.
 *
 * @param iso - An ISO 8601 date string
 * @returns The formatted date string, or empty string on invalid input
 *
 * @example
 * ```ts
 * formatDate('2024-06-13T10:00:00.000Z')  // 'Thu, 13 Jun'
 * formatDate('')                           // ''
 * ```
 */
export function formatDate(iso: string): string {
  if (!iso) return ''
  try {
    return format(parseISO(iso), 'EEE, d MMM')
  } catch (e) {
    console.error('Error formatting date:', e)
    return ''
  }
}

/**
 * Calculates calendar days from now until the target date.
 * Positive if target is in the future, negative if in the past.
 *
 * @param isoDate - An ISO 8601 date string representing the target date
 * @returns The number of calendar days from today (positive = future, negative = past, 0 = today)
 *
 * @example
 * ```ts
 * // If today is 2024-06-13:
 * daysFromNow('2024-06-20T00:00:00Z')  // 7
 * daysFromNow('2024-06-10T00:00:00Z')  // -3
 * ```
 */
export function daysFromNow(isoDate: string): number {
  if (!isoDate) return 0
  try {
    const target = parseISO(isoDate)
    const today = new Date()
    return differenceInCalendarDays(target, today)
  } catch (e) {
    console.error('Error calculating days from now:', e)
    return 0
  }
}

/**
 * Checks if two ISO date strings belong to the same calendar day.
 *
 * @param a - First ISO date string
 * @param b - Second ISO date string
 * @returns `true` if both dates fall on the same calendar day, `false` otherwise
 *
 * @example
 * ```ts
 * isSameDay('2024-06-13T08:00:00Z', '2024-06-13T20:00:00Z')  // true
 * isSameDay('2024-06-13T08:00:00Z', '2024-06-14T08:00:00Z')  // false
 * ```
 */
export function isSameDay(a: string, b: string): boolean {
  if (!a || !b) return false
  try {
    return dateFnsIsSameDay(parseISO(a), parseISO(b))
  } catch (e) {
    console.error('Error comparing dates:', e)
    return false
  }
}

/**
 * Groups journal entries by their creation date (YYYY-MM-DD).
 *
 * @param entries - Array of journal entries to group
 * @returns An object keyed by YYYY-MM-DD date strings, each containing an array of entries for that day
 *
 * @example
 * ```ts
 * const groups = groupEntriesByDate(entries)
 * // { '2024-06-13': [entry1, entry2], '2024-06-12': [entry3] }
 * ```
 */
export function groupEntriesByDate(entries: JournalEntry[]): Record<string, JournalEntry[]> {
  const groups: Record<string, JournalEntry[]> = {}
  entries.forEach((entry) => {
    try {
      const datePart = entry.createdAt.split('T')[0]
      if (!groups[datePart]) {
        groups[datePart] = []
      }
      groups[datePart].push(entry)
    } catch (e) {
      console.error('Error grouping entry:', entry.id, e)
    }
  })
  return groups
}
