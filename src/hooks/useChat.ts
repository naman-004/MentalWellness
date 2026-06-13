import { useState, useRef, useEffect } from 'react'
import { useChatStore } from '../store/chatStore'
import { useUserStore } from '../store/userStore'
import { useJournalStore } from '../store/journalStore'
import { useMoodStore } from '../store/moodStore'
import { useToast } from '../components/common/Toast'
import { sanitizeText } from '../utils/sanitize'
import { streamZenResponse, detectCrisisSignals } from '../api/chatCompanion'
import { buildChatSystemPrompt } from '../utils/promptTemplates'
import { computeCurrentStreak } from '../utils/streakHelpers'
import { daysFromNow } from '../utils/dateHelpers'
import { RateLimitError } from '../utils/rateLimiter'
import type { ChatMessage } from '../types/chat'
import type { JournalEntry, MoodLog, KeyTheme } from '../types/journal'

/**
 * Calculates a summary of the student's recent wellness logs.
 */
export function computeRecentJournalSummary(entries: JournalEntry[], moodLogs: MoodLog[]) {
  const active = entries.filter((e) => !e.deletedAt)
  const allScores = [...active.map((e) => e.moodScore), ...moodLogs.map((m) => m.score)]
  
  // 1. Average Mood
  const avgMood = allScores.length > 0 
    ? parseFloat((allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1))
    : 5 // Default neutral mood

  // 2. Mood Trend
  let moodTrend: 'improving' | 'declining' | 'stable' = 'stable'
  if (allScores.length >= 4) {
    const half = Math.floor(allScores.length / 2)
    const recentHalf = allScores.slice(0, half)
    const olderHalf = allScores.slice(half)
    const recentAvg = recentHalf.reduce((a, b) => a + b, 0) / recentHalf.length
    const olderAvg = olderHalf.reduce((a, b) => a + b, 0) / olderHalf.length
    
    if (recentAvg - olderAvg > 0.5) moodTrend = 'improving'
    else if (olderAvg - recentAvg > 0.5) moodTrend = 'declining'
  }

  // 3. Top Themes
  const themeCounts: Record<KeyTheme, number> = {} as any
  active.forEach((e) => {
    if (e.aiAnalysis?.keyThemes) {
      e.aiAnalysis.keyThemes.forEach((t) => {
        themeCounts[t] = (themeCounts[t] || 0) + 1
      })
    }
  })
  const topThemes = (Object.keys(themeCounts) as KeyTheme[])
    .sort((a, b) => themeCounts[b] - themeCounts[a])
    .slice(0, 3)

  // 4. Positive Signals
  const positiveSignals: string[] = []
  active.forEach((e) => {
    if (e.aiAnalysis?.positiveSignals) {
      e.aiAnalysis.positiveSignals.forEach((s) => {
        if (!positiveSignals.includes(s)) positiveSignals.push(s)
      })
    }
  })

  // 5. Last Journaled (Days Ago)
  let lastEntryDaysAgo = 999
  if (active.length > 0) {
    const sorted = [...active].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const diff = daysFromNow(sorted[0].createdAt)
    lastEntryDaysAgo = Math.max(0, -diff)
  }

  return {
    avgMood,
    moodTrend,
    topThemes,
    positiveSignals,
    lastEntryDaysAgo,
  }
}

export function useChat() {
  const { 
    conversations, 
    activeConversationId, 
    addMessage, 
    createConversation, 
    setActive 
  } = useChatStore()

  const { profile, apiKey } = useUserStore()
  const { entries } = useJournalStore()
  const { logs: moodLogs } = useMoodStore()
  const toast = useToast()

  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  
  const streamBuffer = useRef('')
  const flushInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  // Memoized journal summary: useRef + 5-minute TTL
  const cacheRef = useRef<{
    timestamp: number
    data: ReturnType<typeof computeRecentJournalSummary>
  } | null>(null)

  function getMemoizedSummary(entriesList: JournalEntry[], logsList: MoodLog[]) {
    const now = Date.now()
    if (cacheRef.current && now - cacheRef.current.timestamp < 5 * 60 * 1000) {
      return cacheRef.current.data
    }
    const data = computeRecentJournalSummary(entriesList, logsList)
    cacheRef.current = { timestamp: now, data }
    return data
  }

  function startNewConversation(): string {
    return createConversation('New conversation')
  }

  async function sendMessage(userMessage: string): Promise<void> {
    const decryptedKey = apiKey ? atob(apiKey) : ''
    if (!decryptedKey) {
      toast.error('Add your Gemini API key in Profile first')
      return
    }
    if (isStreaming) return

    const clean = sanitizeText(userMessage)
    const isCrisis = detectCrisisSignals(clean)

    // Ensure active conversation exists
    let convId = activeConversationId
    if (!convId) {
      convId = startNewConversation()
    }

    // Add user message to store
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: clean,
      timestamp: new Date().toISOString(),
      isCrisis,
    }
    addMessage(convId, userMsg)

    // Build system prompt from current data (memoized)
    const recentSummary = getMemoizedSummary(entries, moodLogs)
    const streak = computeCurrentStreak(entries)
    const systemInstruction = buildChatSystemPrompt(profile!, recentSummary, streak)

    // Get history (exclude the message just added)
    const history = (conversations.find(c => c.id === convId)?.messages ?? [])
      .filter(m => m.id !== userMsg.id)

    setIsStreaming(true)
    streamBuffer.current = ''
    setStreamingContent('')

    // Flush buffer to state every 50ms (smoother than per-token)
    flushInterval.current = setInterval(() => {
      setStreamingContent(streamBuffer.current)
    }, 50)

    try {
      for await (const chunk of streamZenResponse(decryptedKey, systemInstruction, history, clean)) {
        streamBuffer.current += chunk
      }
    } catch (err) {
      if (err instanceof RateLimitError) {
        toast.info(`Zen needs a moment. Try again in ${Math.ceil(err.waitMs / 1000)} seconds.`)
      } else {
        toast.error("Zen couldn't respond. Check your API key.")
      }
      streamBuffer.current = streamBuffer.current || 
        "I'm having trouble connecting right now. Please try again in a moment."
    } finally {
      if (flushInterval.current) {
        clearInterval(flushInterval.current)
      }
      const finalContent = streamBuffer.current

      // Add Zen's response to store
      addMessage(convId, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: finalContent,
        timestamp: new Date().toISOString(),
      })

      // SECURITY RULE: Never log message content — log only conversationId + message count
      const updatedConv = useChatStore.getState().conversations.find(c => c.id === convId)
      console.log(`[ChatHook] Message complete. Conv ID: ${convId}, message count: ${updatedConv?.messages.length || 0}`)

      setStreamingContent('')
      streamBuffer.current = ''
      setIsStreaming(false)
    }
  }

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (flushInterval.current) {
        clearInterval(flushInterval.current)
      }
    }
  }, [])

  return {
    conversations,
    activeConversationId,
    sendMessage,
    startNewConversation,
    setActive,
    isStreaming,
    streamingContent
  }
}
