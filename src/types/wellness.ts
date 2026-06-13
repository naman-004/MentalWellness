export type ExerciseType = 'breathing_478' | 'box_breathing' | 'grounding_54321' | 
                           'pomodoro_reset' | 'gratitude_micro' | 'affirmation'

export interface MindfulnessExercise {
  id: ExerciseType
  name: string
  durationMinutes: number
  description: string
  steps: string[]
  reasonForSelection: string
}
