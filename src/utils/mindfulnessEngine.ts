import { ExerciseType, MindfulnessExercise } from '../types/wellness'

export const EXERCISES_DATABASE: Record<ExerciseType, Omit<MindfulnessExercise, 'reasonForSelection'>> = {
  breathing_478: {
    id: 'breathing_478',
    name: '4-7-8 Breathing Calm',
    durationMinutes: 2,
    description: 'A deep breathing technique that acts as a natural tranquilizer for the nervous system, helpful for immediate anxiety reduction.',
    steps: [
      'Exhale completely through your mouth, making a whoosh sound.',
      'Close your mouth and inhale quietly through your nose to a mental count of 4.',
      'Hold your breath for a count of 7.',
      'Exhale completely through your mouth, making a whoosh sound to a count of 8.',
      'Repeat this cycle 4 times.'
    ]
  },
  box_breathing: {
    id: 'box_breathing',
    name: 'Box Breathing Reset',
    durationMinutes: 4,
    description: 'Used by high-performance individuals to clear the mind, settle the nerves, and improve concentration under pressure.',
    steps: [
      'Inhale slowly through your nose for 4 seconds.',
      'Hold your breath for 4 seconds.',
      'Exhale completely through your mouth for 4 seconds.',
      'Hold your lungs empty for 4 seconds.',
      'Repeat this box cycle 4-6 times.'
    ]
  },
  grounding_54321: {
    id: 'grounding_54321',
    name: '5-4-3-2-1 Grounding',
    durationMinutes: 5,
    description: 'A cognitive grounding exercise that shifts focus away from exam panic by connecting you to your physical surroundings.',
    steps: [
      'Identify 5 things you can see around you.',
      'Identify 4 things you can physically touch.',
      'Identify 3 things you can hear in your environment.',
      'Identify 2 things you can smell.',
      'Identify 1 thing you can taste.'
    ]
  },
  pomodoro_reset: {
    id: 'pomodoro_reset',
    name: 'Study Micro-Reset',
    durationMinutes: 5,
    description: 'A physical and mental recharge sequence to break syllabus exhaustion and restore cognitive clarity.',
    steps: [
      'Step away from your study desk completely.',
      'Do a gentle shoulder roll and stretch your lower back.',
      'Drink a slow glass of water, focusing entirely on the coolness.',
      'Look out a window at a distant object for 30 seconds to relax eye focus.',
      'Sit comfortably, take three deep breaths, and resume your next study block.'
    ]
  },
  gratitude_micro: {
    id: 'gratitude_micro',
    name: 'Gratitude Reframe',
    durationMinutes: 3,
    description: 'Counteracts exam imposter syndrome and self-doubt by reinforcing intrinsic worth separate from scores.',
    steps: [
      'Write down or visualize one small progress step you made today (even reading one page).',
      'Name one person or support system you are grateful to have.',
      'Acknowledge one strength you possess that has nothing to do with test scores.',
      'Sit with these three reflections for a minute.'
    ]
  },
  affirmation: {
    id: 'affirmation',
    name: 'Mindful Intentions',
    durationMinutes: 2,
    description: 'Reinforces positive self-concept and reduces cognitive tension before study sessions.',
    steps: [
      'Read this slowly: "My worth is not defined by an exam rank. I am learning and growing."',
      'Inhale deeply, repeating: "I am prepared to do my best."',
      'Exhale, repeating: "I release the pressure of outcomes."',
      'Sit quietly in this relaxed posture for 30 seconds.'
    ]
  }
}

/**
 * Adaptive engine that selects the best suited mindfulness exercise based on the student's current state.
 */
export function selectExercise(
  avgMood: number,
  examType: string,
  daysToExam: number,
  topWorries: string[] = []
): MindfulnessExercise {
  let selectedId: ExerciseType = 'affirmation'
  let reason = 'Daily general focus reset.'

  const hasWorry = (kw: string) => topWorries.some(w => w.toLowerCase().includes(kw))

  if (avgMood > 0 && avgMood < 4.5) {
    // High emotional distress / panic
    selectedId = 'breathing_478'
    reason = `Your focus/mood index (${avgMood}/10) is low. 4-7-8 breathing is selected to help calm physiological alarm systems.`
  } else if (daysToExam > 0 && daysToExam < 15) {
    // Extreme exam proximity panic
    selectedId = 'grounding_54321'
    reason = `Your exam (${examType}) is only ${daysToExam} days away. The 5-4-3-2-1 grounding exercise will anchor your focus to counter outcomes anxiety.`
  } else if (hasWorry('syllabus') || hasWorry('time') || ['UPSC', 'GATE', 'CAT'].includes(examType)) {
    // High workload, syllabus worry, or heavy syllabus exam
    selectedId = 'pomodoro_reset'
    reason = `High study load detected for your ${examType} preparation. This micro-reset will clear cognitive strain.`
  } else if (hasWorry('peer') || hasWorry('family') || hasWorry('expectations')) {
    // Social / comparison worries
    selectedId = 'gratitude_micro'
    reason = 'Social or self-worth worries detected. This gratitude reframe helps separate personal value from exam comparisons.'
  } else if (avgMood >= 4.5 && avgMood < 7.0) {
    // Moderate stress
    selectedId = 'box_breathing'
    reason = 'Moderate stress check-in. Box breathing will help re-stabilize focus for your study sessions.'
  } else {
    // Doing well
    selectedId = 'affirmation'
    reason = 'A short grounding affirmation to maintain your healthy study momentum!'
  }

  const baseExercise = EXERCISES_DATABASE[selectedId]
  return {
    ...baseExercise,
    reasonForSelection: reason
  }
}
