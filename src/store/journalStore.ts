/**
 * @module journalStore
 * @description Zustand store for managing journal entries with soft-delete support.
 * Persisted to localStorage under the `zenpath-journal` namespace.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { JournalEntry, AIAnalysis } from '../types/journal'

/**
 * Maximum number of journal entries to retain in localStorage.
 * Prevents unbounded growth of the persistent store.
 */
export const MAX_JOURNAL_ENTRIES = 500

/** Zustand state interface for journal entry management. */
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
          const newEntries = [entry, ...state.entries]
          // Enforce entry count limit to prevent unbounded localStorage growth
          return { entries: newEntries.slice(0, MAX_JOURNAL_ENTRIES) }
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
