import { useState, useEffect, useRef } from 'react'

interface BreathingCircleProps {
  type: 'breathing_478' | 'box_breathing'
  onComplete?: () => void
}

type Stage = 'inhale' | 'hold' | 'exhale' | 'holdEmpty'

export default function BreathingCircle({ type, onComplete }: BreathingCircleProps) {
  const [isActive, setIsActive] = useState(false)
  const [stage, setStage] = useState<Stage>('inhale')
  const [secondsLeft, setSecondsLeft] = useState(4)
  const [cycleCount, setCycleCount] = useState(0)
  const [announcement, setAnnouncement] = useState('')
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const maxCycles = type === 'breathing_478' ? 4 : 5

  // Cycle Configuration Timings
  const config = {
    breathing_478: {
      inhale: 4,
      hold: 7,
      exhale: 8,
      holdEmpty: 0,
    },
    box_breathing: {
      inhale: 4,
      hold: 4,
      exhale: 4,
      holdEmpty: 4,
    },
  }[type]

  const startExercise = () => {
    setIsActive(true)
    setStage('inhale')
    setSecondsLeft(config.inhale)
    setCycleCount(0)
    setAnnouncement('Breathe in for 4 seconds')
  }

  const stopExercise = () => {
    setIsActive(false)
    if (timerRef.current) clearInterval(timerRef.current)
    setAnnouncement('Exercise stopped')
  }

  useEffect(() => {
    if (!isActive) return

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) {
          return prev - 1
        }

        // Current stage finished, transition to next stage
        let nextStage: Stage = 'inhale'
        let nextSeconds = 4

        if (stage === 'inhale') {
          nextStage = 'hold'
          nextSeconds = config.hold
          setAnnouncement(`Hold breath for ${nextSeconds} seconds`)
        } else if (stage === 'hold') {
          nextStage = 'exhale'
          nextSeconds = config.exhale
          setAnnouncement(`Breathe out slowly for ${nextSeconds} seconds`)
        } else if (stage === 'exhale') {
          if (config.holdEmpty > 0) {
            nextStage = 'holdEmpty'
            nextSeconds = config.holdEmpty
            setAnnouncement(`Hold empty lungs for ${nextSeconds} seconds`)
          } else {
            nextStage = 'inhale'
            nextSeconds = config.inhale
            setCycleCount((c) => c + 1)
            setAnnouncement(`Breathe in for ${nextSeconds} seconds`)
          }
        } else if (stage === 'holdEmpty') {
          nextStage = 'inhale'
          nextSeconds = config.inhale
          setCycleCount((c) => c + 1)
          setAnnouncement(`Breathe in for ${nextSeconds} seconds`)
        }

        setStage(nextStage)
        return nextSeconds
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isActive, stage, type, config])

  // Monitor total cycles to completion
  useEffect(() => {
    if (cycleCount >= maxCycles) {
      setIsActive(false)
      if (timerRef.current) clearInterval(timerRef.current)
      setAnnouncement('Breathing exercise complete! You did great.')
      if (onComplete) onComplete()
    }
  }, [cycleCount, maxCycles, onComplete])

  // Determine scale and text colors for visual display
  const getVisualStyles = () => {
    switch (stage) {
      case 'inhale':
        return {
          scale: 'scale-[1.25]',
          color: 'text-success',
          border: 'border-success',
          bg: 'bg-success/15',
          label: 'Inhale',
        }
      case 'hold':
        return {
          scale: 'scale-[1.25]',
          color: 'text-warning',
          border: 'border-warning',
          bg: 'bg-warning/15',
          label: 'Hold',
        }
      case 'exhale':
        return {
          scale: 'scale-100',
          color: 'text-accent',
          border: 'border-accent',
          bg: 'bg-accent/15',
          label: 'Exhale',
        }
      case 'holdEmpty':
        return {
          scale: 'scale-[0.85]',
          color: 'text-danger',
          border: 'border-danger',
          bg: 'bg-danger/15',
          label: 'Hold Empty',
        }
    }
  }

  const style = getVisualStyles()

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Screen Reader ARIA Live Alerts */}
      <div className="sr-only" aria-live="polite">
        {announcement}
      </div>

      {isActive ? (
        <div className="space-y-6 flex flex-col items-center">
          {/* Animated Circle Container */}
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Pulsing Backlight Ripple */}
            <div
              className={`absolute inset-0 rounded-full blur-xl opacity-30 transition-all duration-1000 ${
                stage === 'inhale'
                  ? 'bg-success'
                  : stage === 'hold'
                  ? 'bg-warning'
                  : stage === 'exhale'
                  ? 'bg-accent'
                  : 'bg-danger'
              }`}
            />
            {/* Core Circle */}
            <div
              className={`w-40 h-40 rounded-full border-2 ${style.border} ${style.bg} flex flex-col items-center justify-center transition-all duration-1000 ease-in-out transform ${style.scale} shadow-2xl relative z-10`}
            >
              <span className={`text-xs font-bold uppercase tracking-widest ${style.color}`}>
                {style.label}
              </span>
              <span className="text-4xl font-extrabold text-text-primary mt-1">
                {secondsLeft}
              </span>
              <span className="text-[10px] text-text-secondary mt-2">
                Cycle {cycleCount + 1} of {maxCycles}
              </span>
            </div>
          </div>

          <button
            onClick={stopExercise}
            className="px-6 py-2 rounded-xl border border-border bg-surface-raised hover:bg-surface text-xs text-text-primary font-bold transition duration-150"
          >
            End Session
          </button>
        </div>
      ) : (
        <div className="text-center py-6 space-y-4">
          <p className="text-xs text-text-secondary leading-relaxed">
            Ready to begin a {type === 'breathing_478' ? '2-minute (4 cycles)' : '3-minute (5 cycles)'} session?
            Find a comfortable sitting posture.
          </p>
          <button
            onClick={startExercise}
            className="px-6 py-3 rounded-xl bg-accent text-bg hover:bg-accent/80 font-bold transition duration-150 text-sm shadow-lg shadow-accent/20 hover:scale-105"
          >
            Start Breathing
          </button>
        </div>
      )}
    </div>
  )
}
