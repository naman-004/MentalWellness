/**
 * @module responseParser
 * @description Parses and validates JSON responses from Google Gemini's journal analysis feature.
 *
 * Gemini sometimes wraps its JSON output in markdown code fences (```json ... ```) despite
 * explicit instructions not to. This module handles fence stripping, JSON extraction,
 * field validation, range clamping, and output sanitization.
 */

import type { AIAnalysis, StressLevel, KeyTheme } from '../types/journal'
import { sanitizeAIOutput } from './security'

/** Maximum allowed length for a raw Gemini response before parsing. */
const MAX_RESPONSE_LENGTH = 50_000

/**
 * Custom error thrown when Gemini's response cannot be parsed into valid JSON.
 *
 * @property {string} raw - The original raw response text for debugging
 */
export class ParseError extends Error {
  constructor(message: string, public raw: string) {
    super(message)
    this.name = 'ParseError'
    Object.setPrototypeOf(this, ParseError.prototype)
  }
}

/**
 * Parses a raw Gemini response string into a validated `AIAnalysis` object.
 *
 * Processing pipeline:
 * 1. Input length validation
 * 2. Markdown fence stripping (```json ... ```)
 * 3. JSON extraction (handles text-wrapped JSON)
 * 4. Field validation and normalization
 * 5. Output string sanitization
 *
 * @param raw - The raw text response from Gemini
 * @returns A validated and sanitized `AIAnalysis` object
 * @throws {ParseError} If no valid JSON can be extracted from the response
 *
 * @example
 * ```ts
 * const analysis = parseAnalysisResponse('```json\n{"stressLevel": "high"}\n```')
 * console.log(analysis.stressLevel)  // 'high'
 * ```
 */
export function parseAnalysisResponse(raw: string): AIAnalysis {
  // Guard: reject excessively long responses
  if (raw && raw.length > MAX_RESPONSE_LENGTH) {
    throw new ParseError(`Response exceeds maximum length of ${MAX_RESPONSE_LENGTH}`, raw.slice(0, 200))
  }

  // Strip markdown fences if Gemini adds them despite instructions
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    // Try to extract JSON object if surrounded by text
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (!match) throw new ParseError('No JSON found in Gemini response', raw)
    try {
      parsed = JSON.parse(match[0])
    } catch {
      throw new ParseError('Failed to parse extracted JSON block', raw)
    }
  }

  // Validate and normalize required fields
  const stressLevel = validateStressLevel(parsed.stressLevel)
  const sentimentScore = typeof parsed.sentimentScore === 'number'
    ? Math.max(-1, Math.min(1, parsed.sentimentScore))
    : 0

  return {
    stressTriggers: sanitizeStringArray(toStringArray(parsed.stressTriggers)),
    emotionalPatterns: sanitizeStringArray(toStringArray(parsed.emotionalPatterns)),
    sentimentScore: parseFloat(sentimentScore.toFixed(1)), // 1 decimal place as requested in system prompt
    stressLevel,
    keyThemes: toKeyThemeArray(parsed.keyThemes),
    hiddenConcerns: sanitizeStringArray(toStringArray(parsed.hiddenConcerns)),
    positiveSignals: sanitizeStringArray(toPositiveSignalsArray(parsed.positiveSignals)),
    analysisTimestamp: typeof parsed.analysisTimestamp === 'string'
      ? parsed.analysisTimestamp
      : new Date().toISOString(),
  }
}

/**
 * Validates that a value is a recognized stress level, defaulting to 'medium'.
 * @param val - The value to validate
 * @returns A valid StressLevel
 */
function validateStressLevel(val: unknown): StressLevel {
  const valid: StressLevel[] = ['low', 'medium', 'high', 'critical']
  return valid.includes(val as StressLevel) ? (val as StressLevel) : 'medium'
}

/**
 * Safely converts an unknown value to a string array, filtering non-strings.
 * @param val - The value to convert
 * @returns An array of strings
 */
function toStringArray(val: unknown): string[] {
  if (!Array.isArray(val)) return []
  return val.filter((v): v is string => typeof v === 'string')
}

/**
 * Ensures positiveSignals never returns an empty array.
 * The act of journaling is itself a positive signal — if Gemini returns none,
 * we inject a default to maintain morale indicator guidelines.
 *
 * @param val - The raw positiveSignals value from Gemini
 * @returns A non-empty string array
 */
function toPositiveSignalsArray(val: unknown): string[] {
  const arr = toStringArray(val)
  if (arr.length === 0) {
    return ['Took proactive time to reflect and journal thoughts']
  }
  return arr
}

/** Valid key theme identifiers recognized by the system. */
const VALID_THEMES: KeyTheme[] = [
  'exam_pressure', 'family_pressure', 'self_doubt', 'burnout',
  'fear_of_failure', 'time_anxiety', 'peer_comparison', 'health_sleep'
]

/**
 * Filters an unknown value to only include valid KeyTheme values.
 * @param val - The raw keyThemes value from Gemini
 * @returns An array of valid KeyTheme values
 */
function toKeyThemeArray(val: unknown): KeyTheme[] {
  if (!Array.isArray(val)) return []
  return val.filter((v): v is KeyTheme => VALID_THEMES.includes(v as KeyTheme))
}

/**
 * Sanitizes all string elements in an array using the AI output sanitizer.
 * Removes any potentially dangerous content from Gemini-generated text before
 * it reaches the DOM.
 *
 * @param arr - The string array to sanitize
 * @returns The sanitized string array
 */
function sanitizeStringArray(arr: string[]): string[] {
  return arr.map(s => sanitizeAIOutput(s))
}
