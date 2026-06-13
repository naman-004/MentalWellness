import { callGemini } from './geminiClient'
import { checkRateLimit } from '../utils/rateLimiter'
import { JOURNAL_ANALYSIS_SYSTEM_PROMPT } from '../utils/promptTemplates'
import { parseAnalysisResponse } from '../utils/responseParser'
import type { AIAnalysis } from '../types/journal'
import type { ExamType } from '../types/user'

export async function analyzeJournalEntry(
  apiKey: string,
  entryText: string,
  userContext: {
    examType: ExamType
    daysToExam: number
    recentMoodAvg: number
    stressBaseline: number
  }
): Promise<AIAnalysis> {
  // checkRateLimit() must be the FIRST line inside analyzeJournalEntry
  checkRateLimit()

  const userMessage = `
    Student context:
    - Exam: ${userContext.examType}
    - Days to exam: ${userContext.daysToExam}
    - Recent mood average: ${userContext.recentMoodAvg}/10
    - Stress baseline: ${userContext.stressBaseline}/10
    
    Journal entry to analyze:
    "${entryText}"
  `.trim()

  const raw = await callGemini(
    apiKey,
    JOURNAL_ANALYSIS_SYSTEM_PROMPT,
    userMessage,
    600 // keep output tokens lean (not 1000 — save quota)
  )

  return parseAnalysisResponse(raw)
}
