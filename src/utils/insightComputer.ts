/**
 * @module insightComputer
 * @description Analytics engine for computing mood averages, stress triggers,
 * trend directions, positive patterns, stress heatmaps, and summary statistics
 * from journal entries.
 */

import { differenceInCalendarDays, parseISO } from 'date-fns'
import { JournalEntry } from '../types/journal'
import { UserProfile } from '../types/user'
import { computeCurrentStreak } from './streakHelpers'
import { daysFromNow } from './dateHelpers'

/** Threshold for mood trend detection — a difference above this is 'improving' or 'declining'. */
const TREND_THRESHOLD = 0.5

/** Number of weeks displayed in the stress heatmap. */
const HEATMAP_WEEKS = 3

/** Number of days in the recent window for trend comparison. */
const TREND_WINDOW_DAYS = 7

/** Number of days in the recent window for summary stats. */
const RECENT_DAYS = 30

/**
 * Calculates the overall average mood score of active (non-deleted) entries.
 *
 * @param entries - The full list of journal entries (including soft-deleted)
 * @returns The average mood score rounded to 1 decimal place, or 0 if no active entries
 */
export function computeMoodAverage(entries: JournalEntry[]): number {
  const activeEntries = entries.filter((e) => e.deletedAt === null)
  if (activeEntries.length === 0) return 0
  const total = activeEntries.reduce((sum, entry) => sum + entry.moodScore, 0)
  return Number((total / activeEntries.length).toFixed(1))
}

/**
 * Aggregates stress triggers from AI analysis across all active entries
 * and returns them sorted by frequency in descending order.
 *
 * @param entries - The full list of journal entries
 * @returns Array of trigger objects with `name` (capitalized) and `value` (count), sorted descending
 */
export function aggregateTriggers(entries: JournalEntry[]): { name: string; value: number }[] {
  const activeEntries = entries.filter((e) => e.deletedAt === null)
  const counts: Record<string, number> = {}

  activeEntries.forEach((entry) => {
    if (entry.aiAnalysis && entry.aiAnalysis.stressTriggers) {
      entry.aiAnalysis.stressTriggers.forEach((trigger) => {
        // Normalize triggers to Title Case or keep them standard
        const normalized = trigger.trim().toLowerCase()
        if (normalized) {
          const capitalized = normalized.charAt(0).toUpperCase() + normalized.slice(1)
          counts[capitalized] = (counts[capitalized] || 0) + 1
        }
      })
    }
  })

  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

/**
 * Evaluates mood trend direction by comparing the last 7 days against the prior 7 days.
 * Falls back to splitting all entries in half if either period has no data.
 *
 * @param entries - The full list of journal entries
 * @returns `'improving'` if recent average exceeds prior by more than {@link TREND_THRESHOLD},
 *          `'declining'` if lower by the same margin, or `'stable'` otherwise
 */
export function evaluateTrendDirection(entries: JournalEntry[]): 'improving' | 'declining' | 'stable' {
  const activeEntries = entries.filter((e) => e.deletedAt === null)
  if (activeEntries.length === 0) return 'stable'

  const now = new Date()
  const recentEntries = activeEntries.filter((e) => {
    const diff = differenceInCalendarDays(now, parseISO(e.createdAt))
    return diff >= 0 && diff < TREND_WINDOW_DAYS
  })

  const priorEntries = activeEntries.filter((e) => {
    const diff = differenceInCalendarDays(now, parseISO(e.createdAt))
    return diff >= TREND_WINDOW_DAYS && diff < TREND_WINDOW_DAYS * 2
  })

  let recentAvg = 0
  let priorAvg = 0

  if (recentEntries.length > 0) {
    recentAvg = recentEntries.reduce((sum, e) => sum + e.moodScore, 0) / recentEntries.length
  }
  if (priorEntries.length > 0) {
    priorAvg = priorEntries.reduce((sum, e) => sum + e.moodScore, 0) / priorEntries.length
  }

  // Fallback: If one period is empty, split all sorted entries in half to find a trend
  if (recentEntries.length === 0 || priorEntries.length === 0) {
    if (activeEntries.length < 2) return 'stable'
    const sorted = [...activeEntries].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const half = Math.ceil(sorted.length / 2)
    const firstHalf = sorted.slice(0, half)
    const secondHalf = sorted.slice(half)

    recentAvg = firstHalf.reduce((sum, e) => sum + e.moodScore, 0) / firstHalf.length
    priorAvg = secondHalf.reduce((sum, e) => sum + e.moodScore, 0) / secondHalf.length
  }

  const diff = recentAvg - priorAvg
  if (diff > TREND_THRESHOLD) return 'improving'
  if (diff < -TREND_THRESHOLD) return 'declining'
  return 'stable'
}

/**
 * Discovers and extracts unique positive signals from AI analysis across all active entries.
 *
 * @param entries - The full list of journal entries
 * @returns Deduplicated array of positive signal strings
 */
export function discoverPositivePatterns(entries: JournalEntry[]): string[] {
  const activeEntries = entries.filter((e) => e.deletedAt === null)
  const signalsSet = new Set<string>()

  activeEntries.forEach((entry) => {
    if (entry.aiAnalysis && entry.aiAnalysis.positiveSignals) {
      entry.aiAnalysis.positiveSignals.forEach((sig) => {
        const cleaned = sig.trim()
        if (cleaned) {
          signalsSet.add(cleaned)
        }
      })
    }
  })

  return Array.from(signalsSet)
}

export interface HeatmapCell {
  weekday: string
  weekIndex: number // 0 = current week, 1 = last week, 2 = 2 weeks ago
  value: number     // 0 = no data, 1 = low, 2 = medium, 3 = high, 4 = critical
  count: number
}

/**
 * Computes a 7×{@link HEATMAP_WEEKS} grid mapping weekday (Mon-Sun) vs daily stress levels.
 *
 * Each cell contains the average stress intensity value:
 * - 0 = no data
 * - 1 = low
 * - 2 = medium
 * - 3 = high
 * - 4 = critical
 *
 * @param entries - The full list of journal entries
 * @returns Array of 21 HeatmapCell objects (7 weekdays × 3 weeks)
 */
export function computeStressHeatmap(entries: JournalEntry[]): HeatmapCell[] {
  const activeEntries = entries.filter((e) => e.deletedAt === null)
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const cells: HeatmapCell[] = []

  // Initialize the grid cells (7 weekdays × HEATMAP_WEEKS weeks)
  for (let w = 0; w < HEATMAP_WEEKS; w++) {
    for (let d = 0; d < 7; d++) {
      cells.push({
        weekday: weekdays[d],
        weekIndex: w,
        value: 0,
        count: 0,
      })
    }
  }

  const now = new Date()
  activeEntries.forEach((entry) => {
    const entryDate = parseISO(entry.createdAt)
    const diffDays = differenceInCalendarDays(now, entryDate)
    
    // We only map the last HEATMAP_WEEKS * 7 days
    if (diffDays >= 0 && diffDays < HEATMAP_WEEKS * 7) {
      const weekIndex = Math.floor(diffDays / 7)
      const rawDay = entryDate.getDay() // 0 = Sun, 1 = Mon, ...
      const weekdayIndex = rawDay === 0 ? 6 : rawDay - 1 // map to Mon=0, ..., Sun=6
      
      const cell = cells.find((c) => c.weekIndex === weekIndex && c.weekday === weekdays[weekdayIndex])
      if (cell && entry.aiAnalysis) {
        let stressVal = 0
        switch (entry.aiAnalysis.stressLevel) {
          case 'low': stressVal = 1; break
          case 'medium': stressVal = 2; break
          case 'high': stressVal = 3; break
          case 'critical': stressVal = 4; break
        }
        cell.value += stressVal
        cell.count += 1
      }
    }
  })

  // Normalize cell values by calculating average for each cell
  cells.forEach((cell) => {
    if (cell.count > 0) {
      cell.value = Math.round(cell.value / cell.count)
    }
  })

  return cells
}

export interface SummaryStats {
  avgMood: number
  avgStudyHours: number
  stressBaseline: number
  totalEntries: number
  streak: number
  daysToExam: number
}

/**
 * Computes all summary statistics needed for dashboard stats cards.
 *
 * Uses the last {@link RECENT_DAYS} days of entries for mood and study hour averages.
 * Falls back to all entries if no recent data exists.
 *
 * @param entries - The full list of journal entries
 * @param profile - The user's profile (for exam date and stress baseline)
 * @returns A {@link SummaryStats} object with computed metrics
 */
export function computeSummaryStats(
  entries: JournalEntry[],
  profile: UserProfile | null
): SummaryStats {
  const activeEntries = entries.filter((e) => e.deletedAt === null)
  
  // Mood average over last 30 days
  const now = new Date()
  const last30DaysEntries = activeEntries.filter((e) => {
    const diff = differenceInCalendarDays(now, parseISO(e.createdAt))
    return diff >= 0 && diff < RECENT_DAYS
  })

  const moodEntriesToUse = last30DaysEntries.length > 0 ? last30DaysEntries : activeEntries
  const avgMood = computeMoodAverage(moodEntriesToUse)

  // Average study hours
  const studyHoursEntries = last30DaysEntries.length > 0 ? last30DaysEntries : activeEntries
  let avgStudyHours = 0
  if (studyHoursEntries.length > 0) {
    const totalHours = studyHoursEntries.reduce((sum, e) => sum + (e.studyHours || 0), 0)
    avgStudyHours = Number((totalHours / studyHoursEntries.length).toFixed(1))
  }

  const streak = computeCurrentStreak(entries)
  const daysToExam = profile ? daysFromNow(profile.examDate) : 0
  const stressBaseline = profile ? profile.stressBaseline : 5
  
  return {
    avgMood,
    avgStudyHours,
    stressBaseline,
    totalEntries: activeEntries.length,
    streak,
    daysToExam,
  }
}
