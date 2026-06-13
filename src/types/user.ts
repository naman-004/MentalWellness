export type ExamType = 'NEET' | 'JEE_MAINS' | 'JEE_ADVANCED' | 'CUET' | 
                       'CAT' | 'GATE' | 'UPSC' | 'OTHER'

export interface UserProfile {
  id: string
  name: string
  examType: ExamType
  examDate: string          // ISO date string
  stressBaseline: number    // 1-10, set during onboarding
  journalTimePreference: 'morning' | 'evening' | 'anytime'
  onboardingComplete: boolean
  createdAt: string
  topWorries: string[]      // selected during onboarding
}
