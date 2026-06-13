/**
 * @module journalAnalysis
 * @description Journal entry analysis API layer for ZenPath.
 * Sends journal entries to Gemini for CBT-based stress and sentiment analysis.
 */

import { callGemini } from './geminiClient'
import { checkRateLimit } from '../utils/rateLimiter'
import { JOURNAL_ANALYSIS_SYSTEM_PROMPT } from '../utils/promptTemplates'
import { parseAnalysisResponse } from '../utils/responseParser'
import { sanitizeText } from '../utils/sanitize'
import type { AIAnalysis } from '../types/journal'
import type { ExamType } from '../types/user'

/**
 * Analyzes a journal entry using Google Gemini and returns structured AI analysis.
 *
 * @param apiKey - The user's Gemini API key
 * @param entryText - The raw journal entry text to analyze
 * @param userContext - Contextual information about the student
 * @returns A validated {@link AIAnalysis} object with stress triggers, sentiment, and themes
 * @throws {Error} If entryText is empty
 */
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
  // Validate and sanitize input
  if (!entryText || !entryText.trim()) {
    throw new Error('Journal entry text cannot be empty.')
  }
  const sanitizedText = sanitizeText(entryText)

  // checkRateLimit() must be the FIRST line inside analyzeJournalEntry
  checkRateLimit()

  const userMessage = `
    Student context:
    - Exam: ${userContext.examType}
    - Days to exam: ${userContext.daysToExam}
    - Recent mood average: ${userContext.recentMoodAvg}/10
    - Stress baseline: ${userContext.stressBaseline}/10
    
    Journal entry to analyze:
    "${sanitizedText}"
  `.trim()

  const raw = await callGemini(
    apiKey,
    JOURNAL_ANALYSIS_SYSTEM_PROMPT,
    userMessage,
    600 // keep output tokens lean (not 1000 — save quota)
  )

  return parseAnalysisResponse(raw)
}
