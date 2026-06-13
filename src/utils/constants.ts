/**
 * @module constants
 * @description Application-wide constants for ZenPath.
 * Includes exam configurations, mood labels, journal tags, stress triggers, and crisis keywords.
 */

/** Configuration for a supported competitive exam type. */
export interface ExamConfig {
  value: string
  label: string
  typicalMonth: string
}

/** All supported competitive exam types with display labels and typical exam months. */
export const EXAM_TYPES = [
  { value: 'NEET', label: 'NEET (Medical Entrance)', typicalMonth: 'May' },
  { value: 'JEE_MAINS', label: 'JEE Mains (Engineering)', typicalMonth: 'January/April' },
  { value: 'JEE_ADVANCED', label: 'JEE Advanced (Engineering)', typicalMonth: 'May/June' },
  { value: 'CUET', label: 'CUET (University Entrance)', typicalMonth: 'May' },
  { value: 'CAT', label: 'CAT (Management Entrance)', typicalMonth: 'November' },
  { value: 'GATE', label: 'GATE (Postgraduate Engineering)', typicalMonth: 'February' },
  { value: 'UPSC', label: 'UPSC Civil Services', typicalMonth: 'May/June' },
  { value: 'OTHER', label: 'Other Competitive Exams', typicalMonth: 'Variable' },
] as const satisfies readonly ExamConfig[]

/** Display configuration for a single mood score level. */
export interface MoodLabel {
  emoji: string
  label: string
  description: string
}

/** Mood label mapping for scores 1–10 with emoji, label, and student-context description. */
export const MOOD_LABELS: Record<number, MoodLabel> = {
  1: { emoji: '😰', label: 'Drowning', description: 'Completely overwhelmed, unable to study.' },
  2: { emoji: '😫', label: 'Exhausted', description: 'Burnt out, extremely low energy.' },
  3: { emoji: '😟', label: 'Struggling', description: 'Stressing about preparation, falling behind.' },
  4: { emoji: '😕', label: 'Anxious', description: 'Nervous about results or mock tests.' },
  5: { emoji: '😐', label: 'Neutral', description: 'Just getting through the study plan.' },
  6: { emoji: '🥱', label: 'Coping', description: 'Managing the load, making steady progress.' },
  7: { emoji: '🙂', label: 'Managing', description: 'Focus is okay, keeping stress under control.' },
  8: { emoji: '😌', label: 'Balanced', description: 'Feeling calm, routine is working well.' },
  9: { emoji: '🔥', label: 'Focused', description: 'Highly concentrated, productive study session.' },
  10: { emoji: '😄', label: 'Thriving', description: 'Confidence is high, active recall is working.' },
}

/** Predefined tags that students can attach to journal entries. */
export const JOURNAL_TAGS = [
  'Mock Test',
  'Syllabus Backlog',
  'Revision Day',
  'Sleep Deprived',
  'Active Recall',
  'Family Pressure',
  'Peer Comparison',
  'Time Management',
  'Self Doubt',
  'Study Schedule',
  'Burnout Alert',
] as const

/** Common stress trigger categories for competitive exam students. */
export const STRESS_TRIGGERS_LIST = [
  'Poor Mock Test Scores',
  'Syllabus Backlog Accumulation',
  'Parental/Family Expectations',
  'Fear of Failure / Negative Marking',
  'Lack of Peer Support / Isolation',
  'Inability to Focus / Procrastination',
  'Sleep Deprivation / Fatigue',
  'Time Crunch / Speed Anxiety',
] as const

/**
 * Keywords that indicate acute crisis signals in student messages.
 * When detected, the app surfaces professional helpline contact information.
 *
 * @see {@link ../api/chatCompanion.ts#detectCrisisSignals}
 */
export const CRISIS_KEYWORDS: string[] = [
  // Hopelessness about exam
  'give up on exam', 'drop out', 'quit studying', "can't do this anymore",
  "what's the point of studying", 'not worth it anymore',
  // Deeper despair
  'want to disappear', 'wish i was gone', 'no point continuing',
  'failed everyone', 'let everyone down', "can't go on",
  // Self-harm indicators
  'hurt myself', 'end it', "don't want to be here",
  // Exam-specific despair
  'parents will disown me', 'my life is over if i fail',
  'rather die than fail', 'nothing left for me',
  // Standard safeguards
  'suicide', 'suicidal', 'kill myself', 'harm myself',
  'better off dead', 'ending my life', 'nothing matters anymore', 'give up on life'
]
