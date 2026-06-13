import { format, parseISO, differenceInCalendarDays, isSameDay as dateFnsIsSameDay } from 'date-fns'
import { JournalEntry } from '../types/journal'

/**
 * Formats ISO date string to "Mon, 9 Jun" format.
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
