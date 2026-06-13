/**
 * @module chatCompanion
 * @description Chat companion API layer for ZenPath.
 * Handles message formatting, crisis detection, and streaming responses from Gemini.
 */

import { streamGemini } from './geminiClient'
import { checkRateLimit } from '../utils/rateLimiter'
import { CRISIS_KEYWORDS } from '../utils/constants'
import type { ChatMessage } from '../types/chat'

/**
 * Converts ZenPath's ChatMessage format to Gemini's expected Content format.
 * Caps at the last 10 messages to maintain a sliding window token budget.
 *
 * @param messages - Array of ZenPath chat messages
 * @returns Array of Gemini-formatted content objects
 */
export function toGeminiContents(
  messages: ChatMessage[]
): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  const recent = messages.slice(-10)
  return recent.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }))
}

/**
 * Checks rate limits, translates the chat history, and yields stream content from Gemini.
 *
 * @param apiKey - The user's Gemini API key
 * @param systemInstruction - The personalized system prompt
 * @param conversationHistory - Previous messages in the conversation
 * @param userMessage - The new user message to send
 * @yields Text chunks as they stream from Gemini
 * @throws {Error} If userMessage is empty
 */
export async function* streamZenResponse(
  apiKey: string,
  systemInstruction: string,
  conversationHistory: ChatMessage[],
  userMessage: string
): AsyncGenerator<string> {
  if (!userMessage || !userMessage.trim()) {
    throw new Error('User message cannot be empty.')
  }
  // checkRateLimit() must be called
  checkRateLimit()

  // Build contents: history + new user message
  const contents = [
    ...toGeminiContents(conversationHistory),
    { role: 'user' as const, parts: [{ text: userMessage }] }
  ]

  yield* streamGemini(apiKey, systemInstruction, contents)
}

/**
 * Scans message inputs for student anxiety and acute safety crisis flags.
 * Returns `true` if crisis keywords are detected, signaling the app to show helpline information.
 *
 * @param text - The user's message text to scan
 * @returns `true` if crisis signals are detected, `false` otherwise
 */
export function detectCrisisSignals(text: string): boolean {
  const lower = text.toLowerCase()
  return CRISIS_KEYWORDS.some(keyword => lower.includes(keyword.toLowerCase()))
}
