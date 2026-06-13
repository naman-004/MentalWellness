import { describe, it, expect, beforeEach } from 'vitest'
import { useUserStore, getDecryptedApiKey } from '../src/store/userStore'
import { useJournalStore, MAX_JOURNAL_ENTRIES } from '../src/store/journalStore'
import type { JournalEntry } from '../src/types/journal'

describe('Zustand Stores Tests', () => {
  beforeEach(() => {
    useUserStore.getState().clearAll()
    // Reset journalStore manually
    useJournalStore.setState({ entries: [] })
  })

  describe('User Store', () => {
    it('initializes with null profile and empty apiKey', () => {
      const state = useUserStore.getState()
      expect(state.profile).toBeNull()
      expect(state.apiKey).toBe('')
    })

    it('sets profile successfully', () => {
      const profile = {
        id: 'user-123',
        name: 'John Doe',
        examType: 'NEET' as const,
        examDate: '2024-06-13T10:00:00Z',
        stressBaseline: 6,
        journalTimePreference: 'evening' as const,
        onboardingComplete: true,
        createdAt: '2024-06-13T10:00:00Z',
        topWorries: ['syllabus'],
      }

      useUserStore.getState().setProfile(profile)
      expect(useUserStore.getState().profile).toEqual(profile)
    })

    it('updates profile fields', () => {
      const profile = {
        id: 'user-123',
        name: 'John Doe',
        examType: 'NEET' as const,
        examDate: '2024-06-13T10:00:00Z',
        stressBaseline: 6,
        journalTimePreference: 'evening' as const,
        onboardingComplete: true,
        createdAt: '2024-06-13T10:00:00Z',
        topWorries: ['syllabus'],
      }

      useUserStore.getState().setProfile(profile)
      useUserStore.getState().updateProfile({ name: 'Jane Doe', stressBaseline: 8 })

      expect(useUserStore.getState().profile?.name).toBe('Jane Doe')
      expect(useUserStore.getState().profile?.stressBaseline).toBe(8)
      expect(useUserStore.getState().profile?.examType).toBe('NEET')
    })

    it('sets and decrypts the API Key', () => {
      const plainKey = 'AIzaSyTestApiKey123'
      useUserStore.getState().setApiKey(plainKey)
      
      expect(useUserStore.getState().apiKey).toBe(btoa(plainKey))
      expect(getDecryptedApiKey()).toBe(plainKey)
    })

    it('returns empty string if API key is invalid or absent', () => {
      useUserStore.getState().setApiKey('')
      expect(getDecryptedApiKey()).toBe('')
    })
  })

  describe('Journal Store', () => {
    const createMockEntry = (id: string): JournalEntry => ({
      id,
      text: 'My study log.',
      moodScore: 6,
      studyHours: 8,
      daysToExam: 10,
      tags: ['Revision'],
      aiAnalysis: null,
      analysisStatus: 'pending',
      createdAt: '2024-06-13T12:00:00',
      deletedAt: null,
    })

    it('starts with empty entries', () => {
      expect(useJournalStore.getState().entries).toEqual([])
    })

    it('adds a new entry and enforces max limit', () => {
      const entry = createMockEntry('entry-1')
      useJournalStore.getState().addEntry(entry)

      expect(useJournalStore.getState().entries).toHaveLength(1)
      expect(useJournalStore.getState().entries[0]).toEqual(entry)

      // Test maximum entry capping
      const manyEntries = Array.from({ length: MAX_JOURNAL_ENTRIES + 10 }, (_, i) => createMockEntry(`entry-${i}`))
      manyEntries.forEach((e) => useJournalStore.getState().addEntry(e))

      expect(useJournalStore.getState().entries).toHaveLength(MAX_JOURNAL_ENTRIES)
    })

    it('updates an existing entry', () => {
      const entry = createMockEntry('entry-1')
      useJournalStore.getState().addEntry(entry)
      useJournalStore.getState().updateEntry('entry-1', { moodScore: 9, text: 'Improved.' })

      const updated = useJournalStore.getState().entries.find((e) => e.id === 'entry-1')
      expect(updated?.moodScore).toBe(9)
      expect(updated?.text).toBe('Improved.')
    })

    it('soft deletes an entry', () => {
      const entry = createMockEntry('entry-1')
      useJournalStore.getState().addEntry(entry)
      useJournalStore.getState().deleteEntry('entry-1')

      const deleted = useJournalStore.getState().entries[0]
      expect(deleted.deletedAt).toBeTruthy()
      expect(useJournalStore.getState().getActiveEntries()).toHaveLength(0)
    })

    it('updates AI analysis for an entry', () => {
      const entry = createMockEntry('entry-1')
      useJournalStore.getState().addEntry(entry)

      const mockAnalysis = {
        stressTriggers: ['Mock Tests'],
        emotionalPatterns: ['Anxious'],
        sentimentScore: 0.1,
        stressLevel: 'medium' as const,
        keyThemes: ['exam_pressure' as const],
        hiddenConcerns: [],
        positiveSignals: [],
        analysisTimestamp: '2024-06-13T12:00:00',
      }

      useJournalStore.getState().updateAnalysis('entry-1', mockAnalysis, 'completed')

      const updated = useJournalStore.getState().entries[0]
      expect(updated.aiAnalysis).toEqual(mockAnalysis)
      expect(updated.analysisStatus).toBe('completed')
    })
  })
})
