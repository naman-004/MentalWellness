import { streamGemini } from './geminiClient'
import { checkRateLimit } from '../utils/rateLimiter'
import { CRISIS_KEYWORDS } from '../utils/constants'
import type { ChatMessage } from '../types/chat'

/**
 * Converts ZenPath's ChatMessage format to Gemini's expected Content format.
 * Caps at the last 10 messages to maintain a sliding window token budget.
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
 */
export async function* streamZenResponse(
  apiKey: string,
  systemInstruction: string,
  conversationHistory: ChatMessage[],
  userMessage: string
): AsyncGenerator<string> {
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
 */
export function detectCrisisSignals(text: string): boolean {
  const lower = text.toLowerCase()
  return CRISIS_KEYWORDS.some(keyword => lower.includes(keyword.toLowerCase()))
}
