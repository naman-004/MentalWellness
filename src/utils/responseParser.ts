import type { AIAnalysis, StressLevel, KeyTheme } from '../types/journal'

export class ParseError extends Error {
  constructor(message: string, public raw: string) {
    super(message)
    this.name = 'ParseError'
    Object.setPrototypeOf(this, ParseError.prototype)
  }
}

export function parseAnalysisResponse(raw: string): AIAnalysis {
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
    stressTriggers: toStringArray(parsed.stressTriggers),
    emotionalPatterns: toStringArray(parsed.emotionalPatterns),
    sentimentScore: parseFloat(sentimentScore.toFixed(1)), // 1 decimal place as requested in system prompt
    stressLevel,
    keyThemes: toKeyThemeArray(parsed.keyThemes),
    hiddenConcerns: toStringArray(parsed.hiddenConcerns),
    positiveSignals: toPositiveSignalsArray(parsed.positiveSignals),
    analysisTimestamp: typeof parsed.analysisTimestamp === 'string'
      ? parsed.analysisTimestamp
      : new Date().toISOString(),
  }
}

function validateStressLevel(val: unknown): StressLevel {
  const valid: StressLevel[] = ['low', 'medium', 'high', 'critical']
  return valid.includes(val as StressLevel) ? (val as StressLevel) : 'medium'
}

function toStringArray(val: unknown): string[] {
  if (!Array.isArray(val)) return []
  return val.filter((v): v is string => typeof v === 'string')
}

// positiveSignals must ALWAYS look for these, even in very negative entries. Never return an empty array.
function toPositiveSignalsArray(val: unknown): string[] {
  const arr = toStringArray(val)
  if (arr.length === 0) {
    return ['Took proactive time to reflect and journal thoughts']
  }
  return arr
}

const VALID_THEMES: KeyTheme[] = [
  'exam_pressure', 'family_pressure', 'self_doubt', 'burnout',
  'fear_of_failure', 'time_anxiety', 'peer_comparison', 'health_sleep'
]

function toKeyThemeArray(val: unknown): KeyTheme[] {
  if (!Array.isArray(val)) return []
  return val.filter((v): v is KeyTheme => VALID_THEMES.includes(v as KeyTheme))
}
