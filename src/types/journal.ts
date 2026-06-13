export type StressLevel = 'low' | 'medium' | 'high' | 'critical'
export type KeyTheme = 'exam_pressure' | 'family_pressure' | 'self_doubt' | 
                       'burnout' | 'fear_of_failure' | 'time_anxiety' | 
                       'peer_comparison' | 'health_sleep'

export interface AIAnalysis {
  stressTriggers: string[]
  emotionalPatterns: string[]
  sentimentScore: number     // -1 to 1
  stressLevel: StressLevel
  keyThemes: KeyTheme[]
  hiddenConcerns: string[]
  positiveSignals: string[]
  analysisTimestamp: string
}

export interface JournalEntry {
  id: string
  text: string
  moodScore: number          // 1-10
  studyHours: number
  daysToExam: number
  tags: string[]
  aiAnalysis: AIAnalysis | null
  analysisStatus: 'pending' | 'analyzing' | 'complete' | 'failed'
  createdAt: string
  deletedAt: string | null
}

export interface MoodLog {
  id: string
  score: number
  emotion: 'CALM' | 'ANXIOUS' | 'FOCUSED' | 'OVERWHELMED' | 
           'HOPEFUL' | 'EXHAUSTED' | 'MOTIVATED' | 'NUMB'
  note: string
  createdAt: string
}
