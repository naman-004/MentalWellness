import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { JournalEntry, AIAnalysis } from '../types/journal'

interface JournalState {
  entries: JournalEntry[]
  addEntry: (entry: JournalEntry) => void
  updateEntry: (id: string, updates: Partial<JournalEntry>) => void
  deleteEntry: (id: string) => void // soft delete: sets deletedAt
  updateAnalysis: (id: string, analysis: AIAnalysis | null, status: JournalEntry['analysisStatus']) => void
  getActiveEntries: () => JournalEntry[]
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: (entry) =>
        set((state) => {
          // Security requirement: NEVER console.log journal text — log only entry IDs
          console.log(`[JournalStore] Adding entry with ID: ${entry.id}`)
          return { entries: [entry, ...state.entries] }
        }),
      updateEntry: (id, updates) =>
        set((state) => {
          console.log(`[JournalStore] Updating entry with ID: ${id}`)
          return {
            entries: state.entries.map((entry) =>
              entry.id === id ? { ...entry, ...updates } : entry
            ),
          }
        }),
      deleteEntry: (id) =>
        set((state) => {
          console.log(`[JournalStore] Soft deleting entry with ID: ${id}`)
          return {
            entries: state.entries.map((entry) =>
              entry.id === id
                ? { ...entry, deletedAt: new Date().toISOString() }
                : entry
            ),
          }
        }),
      updateAnalysis: (id, aiAnalysis, analysisStatus) =>
        set((state) => {
          console.log(`[JournalStore] Updating AI analysis for entry: ${id}, status: ${analysisStatus}`)
          return {
            entries: state.entries.map((entry) =>
              entry.id === id ? { ...entry, aiAnalysis, analysisStatus } : entry
            ),
          }
        }),
      getActiveEntries: () => {
        return get().entries.filter((entry) => entry.deletedAt === null)
      },
    }),
    {
      name: 'zenpath-journal',
      // Explicitly partialize to persist only the entries state (excluding methods/computed data if any)
      partialize: (state) => ({ entries: state.entries }),
    }
  )
)
