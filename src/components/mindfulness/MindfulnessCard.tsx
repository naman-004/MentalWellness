import { useState, useMemo } from 'react'
import { selectExercise, EXERCISES_DATABASE } from '../../utils/mindfulnessEngine'
import BreathingCircle from './BreathingCircle'
import Button from '../common/Button'
import Badge from '../common/Badge'
import { Compass, Sparkles, BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react'
import { ExerciseType, MindfulnessExercise } from '../../types/wellness'

interface MindfulnessCardProps {
  avgMood: number
  examType: string
  daysToExam: number
  topWorries?: string[]
  onExerciseComplete?: (exerciseId: string) => void
}

export default function MindfulnessCard({
  avgMood,
  examType,
  daysToExam,
  topWorries = [],
  onExerciseComplete,
}: MindfulnessCardProps) {
  // Recommendation state
  const recommendedExercise = useMemo(() => {
    return selectExercise(avgMood, examType, daysToExam, topWorries)
  }, [avgMood, examType, daysToExam, topWorries])

  const [activeExercise, setActiveExercise] = useState<MindfulnessExercise>(recommendedExercise)
  const [sessionActive, setSessionActive] = useState(false)
  const [currentStepIdx, setCurrentStepIdx] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  // Choose a manual exercise from dropdown/list
  const handleSelectExercise = (typeId: ExerciseType) => {
    const baseEx = EXERCISES_DATABASE[typeId]
    setActiveExercise({
      ...baseEx,
      reasonForSelection: `Manually chosen from wellness registry. Recommended alternative was: ${recommendedExercise.name}.`,
    })
    setSessionActive(false)
    setCurrentStepIdx(0)
    setIsCompleted(false)
  }

  const handleStartSession = () => {
    setSessionActive(true)
    setCurrentStepIdx(0)
    setIsCompleted(false)
  }

  const handleNextStep = () => {
    if (currentStepIdx < activeExercise.steps.length - 1) {
      setCurrentStepIdx((prev) => prev + 1)
    } else {
      // Completed last step of guide
      handleCompleteSession()
    }
  }

  const handleCompleteSession = () => {
    setSessionActive(false)
    setIsCompleted(true)
    if (onExerciseComplete) {
      onExerciseComplete(activeExercise.id)
    }
  }

  const isBreathingType = activeExercise.id === 'breathing_478' || activeExercise.id === 'box_breathing'

  return (
    <div className="p-6 rounded-2xl bg-surface border border-border space-y-6">
      {/* Visual Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Compass className="text-accent" size={24} />
          <div>
            <h3 className="text-lg font-bold text-text-primary">Adaptive Mindfulness Reset</h3>
            <p className="text-xs text-text-secondary">Exercises tailored to your current cognitive exam stress</p>
          </div>
        </div>
        {!sessionActive && !isCompleted && (
          <Badge variant="zen" className="flex items-center gap-1">
            <Sparkles size={10} />
            Recommended for you
          </Badge>
        )}
      </div>

      {/* Manual Selection Dropdown */}
      {!sessionActive && !isCompleted && (
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
            Switch Exercise Option
          </label>
          <select
            value={activeExercise.id}
            onChange={(e) => handleSelectExercise(e.target.value as ExerciseType)}
            className="w-full p-2.5 bg-bg border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-accent"
          >
            {Object.values(EXERCISES_DATABASE).map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name} ({ex.durationMinutes} min)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Main card views */}
      {isCompleted ? (
        // Session Complete view
        <div className="text-center py-8 space-y-4 animate-scale-in">
          <div className="flex justify-center">
            <CheckCircle2 className="text-success" size={48} />
          </div>
          <div>
            <h4 className="font-bold text-text-primary text-md">Excellent Work!</h4>
            <p className="text-xs text-text-secondary max-w-xs mx-auto mt-2 leading-relaxed">
              You've successfully finished the "{activeExercise.name}" routine. 
              Letting your breathing settle improves focus stability.
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setIsCompleted(false)
              setActiveExercise(recommendedExercise)
            }}
          >
            Refocus Study Desk
          </Button>
        </div>
      ) : sessionActive ? (
        // Active Session View
        <div className="border border-border/80 rounded-xl p-5 bg-bg/50 space-y-4">
          <div className="flex justify-between items-center text-xs text-text-secondary border-b border-border/60 pb-2 mb-2">
            <span className="font-bold text-text-primary">{activeExercise.name}</span>
            <span>{activeExercise.durationMinutes} Min session</span>
          </div>

          {isBreathingType ? (
            <BreathingCircle type={activeExercise.id as 'breathing_478' | 'box_breathing'} onComplete={handleCompleteSession} />
          ) : (
            // Static Step-by-Step guides
            <div className="space-y-6 min-h-[160px] flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-accent tracking-wider">
                    Step {currentStepIdx + 1} of {activeExercise.steps.length}
                  </span>
                  <div className="flex gap-1">
                    {activeExercise.steps.map((_, idx) => (
                      <span
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx === currentStepIdx ? 'w-4 bg-accent' : 'w-1.5 bg-border'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-text-primary leading-relaxed bg-surface-raised p-4 rounded-xl border border-border">
                  {activeExercise.steps[currentStepIdx]}
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                {currentStepIdx > 0 && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setCurrentStepIdx((prev) => prev - 1)}
                  >
                    Back
                  </Button>
                )}
                <Button size="sm" variant="primary" onClick={handleNextStep}>
                  {currentStepIdx === activeExercise.steps.length - 1 ? 'Finish' : 'Next Step'}
                  <ChevronRight size={14} className="inline ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Initial exercise overview screen
        <div className="space-y-4">
          <div className="space-y-2 p-4 border border-border/60 bg-bg/40 rounded-xl leading-relaxed">
            <h4 className="font-bold text-text-primary text-sm flex items-center gap-1.5">
              <BookOpen size={16} className="text-accent" />
              {activeExercise.name}
            </h4>
            <p className="text-xs text-text-secondary">{activeExercise.description}</p>
            
            {activeExercise.reasonForSelection && (
              <div className="mt-3 pt-2.5 border-t border-border/40 text-[11px] text-accent/90 italic flex gap-1.5 items-start">
                <span className="font-bold">Recommendation Focus:</span>
                <span>{activeExercise.reasonForSelection}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button size="sm" variant="primary" onClick={handleStartSession}>
              Begin Exercise
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
