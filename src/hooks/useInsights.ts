import { useMemo } from 'react'
import { useJournalStore } from '../store/journalStore'
import { useUserStore } from '../store/userStore'
import {
  computeMoodAverage,
  aggregateTriggers,
  evaluateTrendDirection,
  discoverPositivePatterns,
  computeStressHeatmap,
  computeSummaryStats,
  SummaryStats,
  HeatmapCell,
} from '../utils/insightComputer'
import { JournalEntry } from '../types/journal'

export interface InsightData {
  entries: JournalEntry[]
  stats: SummaryStats
  triggers: { name: string; value: number }[]
  trendDirection: 'improving' | 'declining' | 'stable'
  positiveSignals: string[]
  heatmap: HeatmapCell[]
  moodAverage: number
}

/**
 * Custom React Hook that returns memoized statistics and insights computed from active journal entries.
 */
export function useInsights(): InsightData {
  const entries = useJournalStore((state) => state.entries)
  const profile = useUserStore((state) => state.profile)

  // Memoize active entries so we don't recalculate unless entries reference changes
  const activeEntries = useMemo(() => {
    return entries.filter((e) => e.deletedAt === null)
  }, [entries])

  const stats = useMemo(() => {
    return computeSummaryStats(entries, profile)
  }, [entries, profile])

  const triggers = useMemo(() => {
    return aggregateTriggers(entries)
  }, [entries])

  const trendDirection = useMemo(() => {
    return evaluateTrendDirection(entries)
  }, [entries])

  const positiveSignals = useMemo(() => {
    return discoverPositivePatterns(entries)
  }, [entries])

  const heatmap = useMemo(() => {
    return computeStressHeatmap(entries)
  }, [entries])

  const moodAverage = useMemo(() => {
    return computeMoodAverage(entries)
  }, [entries])

  return {
    entries: activeEntries,
    stats,
    triggers,
    trendDirection,
    positiveSignals,
    heatmap,
    moodAverage,
  }
}
