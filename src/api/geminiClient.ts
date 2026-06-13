/**
 * @module geminiClient
 * @description Core Google Gemini API client for ZenPath.
 *
 * SECURITY NOTE: This uses the Gemini API directly from the browser.
 * The API key is stored in the user's localStorage.
 * Acceptable for a personal-use app (each user provides their own key).
 * For a multi-user production app, move API calls to a server-side proxy.
 */

import { GoogleGenAI } from '@google/genai'
import { checkRateLimit } from '../utils/rateLimiter'

/**
 * The Gemini model used across all features.
 * gemini-2.5-flash: free tier, 10 RPM, 250 RPD, no credit card required.
 */
export const GEMINI_MODEL = 'gemini-2.5-flash'

/**
 * Creates a new GoogleGenAI client instance.
 *
 * @param apiKey - The user's Gemini API key
 * @returns A configured GoogleGenAI client instance
 * @throws {Error} If apiKey is empty
 */
export function getGeminiClient(apiKey: string): GoogleGenAI {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('API key is required to create a Gemini client.')
  }
  return new GoogleGenAI({ apiKey })
}

/**
 * Makes a single non-streaming call to Gemini and returns the full text response.
 * Used for: journal analysis, weekly summary.
 *
 * @param apiKey - The user's Gemini API key
 * @param systemInstruction - The system prompt for the model
 * @param userMessage - The user's message to analyze
 * @param maxOutputTokens - Maximum output tokens (default: 1000)
 * @returns The full text response from Gemini
 * @throws {Error} If apiKey or userMessage is empty, or if the response is empty
 */
export async function callGemini(
  apiKey: string,
  systemInstruction: string,
  userMessage: string,
  maxOutputTokens = 1000
): Promise<string> {
  if (!userMessage || !userMessage.trim()) {
    throw new Error('User message cannot be empty.')
  }
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
 * Makes a streaming call to Gemini, yielding text chunks as they arrive.
 * Used for: chat companion (typewriter effect).
 *
 * @param apiKey - The user's Gemini API key
 * @param systemInstruction - The system prompt for the model
 * @param contents - Array of conversation messages in Gemini format
 * @yields Text chunks as they arrive from the stream
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
 * Tests if an API key is valid by making a minimal API call.
 * Returns `true` if the key works, `false` if invalid or quota exceeded.
 *
 * @param apiKey - The API key to test
 * @returns `true` if the key is valid, `false` otherwise
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
