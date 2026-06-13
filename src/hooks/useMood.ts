import { useMoodStore } from '../store/moodStore'
import { MoodLog } from '../types/journal'
import { isSameDay } from '../utils/dateHelpers'

export function useMood() {
  const { logs, addLog, getLast30Days } = useMoodStore()

  function logMood(score: number, emotion: MoodLog['emotion'], note: string): MoodLog {
    const newLog: MoodLog = {
      id: crypto.randomUUID(),
      score,
      emotion,
      note,
      createdAt: new Date().toISOString(),
    }
    addLog(newLog)
    return newLog
  }

  function getTodaysMood(): MoodLog | null {
    const today = new Date().toISOString()
    // Find if there is any log from today
    const match = logs.find((l) => isSameDay(l.createdAt, today))
    return match || null
  }

  return {
    logs,
    logMood,
    getTodaysMood,
    getLast30Days: () => getLast30Days(),
  }
}
