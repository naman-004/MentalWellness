import { useState, useRef, useEffect } from 'react'
import { useJournalStore } from '../store/journalStore'
import { useUserStore } from '../store/userStore'
import { useToast } from '../components/common/Toast'
import { sanitizeText } from '../utils/sanitize'
import { daysFromNow } from '../utils/dateHelpers'
import { analyzeJournalEntry } from '../api/journalAnalysis'
import { RateLimitError } from '../utils/rateLimiter'
import type { JournalEntry } from '../types/journal'

export interface CreateEntryInput {
  text: string
  moodScore: number
  studyHours: number
  tags: string[]
}

// Custom debounce callback hook to save draft edits
function useDebouncedCallback<T extends (...args: any[]) => any>(callback: T, delay: number) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const callbackRef = useRef(callback)
  
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return (...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args)
    }, delay)
  }
}

export function computeRecentMoodAvg(entries: JournalEntry[]): number {
  const active = entries.filter((e) => !e.deletedAt)
  if (active.length === 0) return 5 // Default neutral
  const sum = active.reduce((acc, e) => acc + e.moodScore, 0)
  return parseFloat((sum / active.length).toFixed(1))
}

export function useJournal() {
  const { entries, addEntry, updateAnalysis } = useJournalStore()
  const { profile, apiKey } = useUserStore()
  const toast = useToast()

  // Draft persistence
  const [draftText, setDraftText] = useState(() => 
    localStorage.getItem('zenpath-draft') ?? ''
  )
  
  const saveDraft = useDebouncedCallback((text: string) => {
    localStorage.setItem('zenpath-draft', text)
  }, 1500)

  function clearDraft() {
    localStorage.removeItem('zenpath-draft')
    setDraftText('')
  }

  async function triggerAnalysis(entryId: string, text: string): Promise<void> {
    const decryptedKey = apiKey ? atob(apiKey) : ''
    if (!decryptedKey) return // silently skip — no API key configured
    
    updateAnalysis(entryId, null, 'analyzing')
    
    try {
      const recentMoodAvg = computeRecentMoodAvg(entries)
      const analysis = await analyzeJournalEntry(decryptedKey, text, {
        examType: profile!.examType,
        daysToExam: daysFromNow(profile!.examDate),
        recentMoodAvg,
        stressBaseline: profile!.stressBaseline,
      })
      updateAnalysis(entryId, analysis, 'complete')
    } catch (err) {
      if (err instanceof RateLimitError) {
        toast.info(`Analysis will retry in ${Math.ceil(err.waitMs / 1000)}s`)
        // Auto-retry on rate limit: use the exact waitMs from RateLimitError
        setTimeout(() => {
          triggerAnalysis(entryId, text).catch(console.error)
        }, err.waitMs + 500)
      } else {
        updateAnalysis(entryId, null, 'failed')
        toast.error('Analysis unavailable. You can retry from the entry.')
      }
    }
  }

  async function createEntry(data: CreateEntryInput): Promise<JournalEntry> {
    // 1. Sanitize
    const cleanText = sanitizeText(data.text)
    
    // 2. Build entry with pending status
    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      text: cleanText,
      moodScore: data.moodScore,
      studyHours: data.studyHours,
      daysToExam: profile?.examDate ? daysFromNow(profile.examDate) : 0,
      tags: data.tags,
      aiAnalysis: null,
      analysisStatus: 'pending',
      createdAt: new Date().toISOString(),
      deletedAt: null,
    }
    
    // 3. Save immediately — don't wait for AI
    addEntry(entry)
    toast.success('Entry saved ✓ Zen is analyzing your mood...')
    
    // 4. Fire-and-forget analysis
    triggerAnalysis(entry.id, cleanText).catch(console.error)
    
    return entry
  }

  const recentMoodAvg = computeRecentMoodAvg(entries)
  const activeEntries = entries.filter(e => !e.deletedAt)

  return { 
    entries: activeEntries, 
    createEntry, 
    triggerAnalysis,
    draftText, 
    setDraftText: (t: string) => { setDraftText(t); saveDraft(t) },
    clearDraft, 
    recentMoodAvg
  }
}
