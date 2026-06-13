import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MoodLog } from '../types/journal'
import { subDays } from 'date-fns'

interface MoodState {
  logs: MoodLog[]
  addLog: (log: MoodLog) => void
  getLast30Days: () => MoodLog[]
}

export const useMoodStore = create<MoodState>()(
  persist(
    (set, get) => ({
      logs: [],
      addLog: (log) =>
        set((state) => ({
          logs: [log, ...state.logs],
        })),
      getLast30Days: () => {
        const thirtyDaysAgo = subDays(new Date(), 30)
        return get().logs.filter((log) => {
          const logDate = new Date(log.createdAt)
          return logDate >= thirtyDaysAgo
        })
      },
    }),
    {
      name: 'zenpath-mood',
      partialize: (state) => ({ logs: state.logs }),
    }
  )
)
