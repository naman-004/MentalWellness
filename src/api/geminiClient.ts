/**
 * SECURITY NOTE: This uses the Gemini API directly from the browser.
 * The API key is stored in the user's localStorage.
 * Acceptable for a personal-use app (each user provides their own key).
 * For a multi-user production app, move API calls to a server-side proxy.
 */

import { GoogleGenAI } from '@google/genai'
import { checkRateLimit } from '../utils/rateLimiter'

// Model to use across all features
// gemini-2.5-flash: free tier, 10 RPM, 250 RPD, no credit card
export const GEMINI_MODEL = 'gemini-2.5-flash'

export function getGeminiClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({ apiKey })
}

/**
 * Single non-streaming call — returns full text response.
 * Used for: journal analysis, weekly summary.
 */
export async function callGemini(
  apiKey: string,
  systemInstruction: string,
  userMessage: string,
  maxOutputTokens = 1000
): Promise<string> {
  checkRateLimit()
  const ai = getGeminiClient(apiKey)
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    config: {
      systemInstruction,
      maxOutputTokens,
      temperature: 0.7,
    },
    contents: userMessage,
  })
  const text = response.text
  if (!text) throw new Error('Empty response from Gemini')
  return text
}

/**
 * Streaming call — yields text chunks as they arrive.
 * Used for: chat companion (typewriter effect).
 */
export async function* streamGemini(
  apiKey: string,
  systemInstruction: string,
  contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>
): AsyncGenerator<string> {
  checkRateLimit()
  const ai = getGeminiClient(apiKey)
  const responseStream = await ai.models.generateContentStream({
    model: GEMINI_MODEL,
    config: {
      systemInstruction,
      maxOutputTokens: 1000,
      temperature: 0.8,
    },
    contents,
  })
  for await (const chunk of responseStream) {
    const text = chunk.text
    if (text) yield text
  }
}

/**
 * Test if an API key is valid — call with minimal tokens.
 * Returns true if key works, false if invalid/quota exceeded.
 */
export async function testGeminiKey(apiKey: string): Promise<boolean> {
  // We call checkRateLimit here too
  checkRateLimit()
  try {
    await callGemini(apiKey, 'Reply with one word.', 'Hi', 5)
    return true
  } catch {
    return false
  }
}
