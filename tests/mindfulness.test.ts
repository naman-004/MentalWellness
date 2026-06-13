import { describe, it, expect } from 'vitest'
import { selectExercise } from '../src/utils/mindfulnessEngine'

describe('Adaptive Mindfulness Selector Engine', () => {
  it('selects 4-7-8 breathing if mood average is under 4.5 (high stress)', () => {
    const ex = selectExercise(3.5, 'JEE_MAINS', 40, [])
    expect(ex.id).toBe('breathing_478')
    expect(ex.reasonForSelection).toContain('physiological alarm')
  })

  it('selects 5-4-3-2-1 grounding if exam is less than 15 days away (immediate panic)', () => {
    // Mood is fine (8.0), but days to exam is 10 days
    const ex = selectExercise(8.0, 'NEET', 10, [])
    expect(ex.id).toBe('grounding_54321')
    expect(ex.reasonForSelection).toContain('grounding')
  })

  it('selects pomodoro micro-reset for heavy exams (UPSC/GATE/CAT) or syllabus worries', () => {
    const ex1 = selectExercise(7.0, 'UPSC', 120, [])
    expect(ex1.id).toBe('pomodoro_reset')

    const ex2 = selectExercise(7.0, 'JEE_MAINS', 60, ['syllabus backlog'])
    expect(ex2.id).toBe('pomodoro_reset')
  })

  it('selects gratitude micro-reframe for peer/family comparison worries', () => {
    const ex = selectExercise(7.0, 'JEE_ADVANCED', 65, ['peer comparison', 'family expectations'])
    expect(ex.id).toBe('gratitude_micro')
  })

  it('selects box breathing for moderate stress (mood between 4.5 and 7.0)', () => {
    const ex = selectExercise(5.5, 'OTHER', 100, [])
    expect(ex.id).toBe('box_breathing')
  })

  it('defaults to affirmation intentions under stable settings', () => {
    const ex = selectExercise(8.5, 'OTHER', 150, [])
    expect(ex.id).toBe('affirmation')
  })
})
