import { useEffect, useMemo, useCallback } from 'react'
import { useJournalStore } from '../store/journalStore'
import { computeCurrentStreak } from '../utils/streakHelpers'

/**
 * Hook to compute current journaling streak and handle milestone confetti alerts.
 */
export function useStreak() {
  const entries = useJournalStore((state) => state.entries)

  const currentStreak = useMemo(() => {
    return computeCurrentStreak(entries)
  }, [entries])

  const checkAndCelebrateStreak = useCallback(async (streak: number) => {
    const milestones = [7, 14, 21, 30]
    if (!milestones.includes(streak)) return

    const celebratedKey = 'zenpath-celebrated-milestones'
    let celebrated: number[] = []

    try {
      const stored = localStorage.getItem(celebratedKey)
      if (stored) {
        celebrated = JSON.parse(stored)
      }
    } catch (e) {
      console.error('Failed to parse celebrated streaks', e)
    }

    // If already celebrated, skip
    if (celebrated.includes(streak)) return

    try {
      // Dynamic import to keep JS bundle lean
      const { default: confetti } = await import('canvas-confetti')
      
      // Fire confetti splash
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#58A6FF', '#BC8CFF', '#3FB950', '#D29922'],
      })

      // Add to celebrated lists
      celebrated.push(streak)
      localStorage.setItem(celebratedKey, JSON.stringify(celebrated))
      console.log(`[StreakSystem] Celebrated milestone streak of ${streak} days with confetti!`)
    } catch (err) {
      console.error('Failed to trigger confetti', err)
    }
  }, [])

  // Auto check on mount/streak change
  useEffect(() => {
    if (currentStreak > 0) {
      checkAndCelebrateStreak(currentStreak)
    }
  }, [currentStreak, checkAndCelebrateStreak])

  return {
    streak: currentStreak,
    checkAndCelebrateStreak,
  }
}
