import React from 'react'
import { MOOD_LABELS } from '../../utils/constants'
import { clsx } from 'clsx'

interface MoodPickerProps {
  value: number
  onChange: (val: number) => void
}

export default function MoodPicker({ value, onChange }: MoodPickerProps) {
  const moods = Array.from({ length: 10 }, (_, i) => i + 1)

  const handleKeyDown = (e: React.KeyboardEvent, val: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      const next = val === 10 ? 1 : val + 1
      onChange(next)
      setTimeout(() => {
        const el = document.getElementById(`mood-btn-${next}`)
        el?.focus()
      }, 0)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = val === 1 ? 10 : val - 1
      onChange(prev)
      setTimeout(() => {
        const el = document.getElementById(`mood-btn-${prev}`)
        el?.focus()
      }, 0)
    }
  }

  return (
    <div className="space-y-3">
      <span className="block text-xs font-semibold text-text-secondary" id="mood-picker-label">
        How is your mood and coping level today? (1 is drowning, 10 is thriving)
      </span>
      <div 
        role="radiogroup" 
        aria-labelledby="mood-picker-label" 
        className="flex justify-between items-center bg-bg p-3 rounded-lg border border-border gap-1 overflow-x-auto"
      >
        {moods.map((val) => {
          const mood = MOOD_LABELS[val]
          const isSelected = value === val

          return (
            <button
              id={`mood-btn-${val}`}
              key={val}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected || (value === 0 && val === 5) ? 0 : -1}
              onClick={() => onChange(val)}
              onKeyDown={(e) => handleKeyDown(e, val)}
              className={clsx(
                "flex flex-col items-center p-2 rounded-md transition duration-150 flex-1 min-w-[36px] focus:outline-none focus:ring-2 focus:ring-accent/50",
                isSelected ? "bg-accent-soft/40 border border-accent" : "border border-transparent hover:bg-surface-raised"
              )}
              aria-label={`Mood score ${val}: ${mood.label}. ${mood.description}`}
            >
              <span className="text-xl sm:text-2xl mb-1">{mood.emoji}</span>
              <span className={clsx("text-[10px] font-bold", isSelected ? "text-accent" : "text-text-secondary")}>
                {val}
              </span>
            </button>
          )
        })}
      </div>
      
      {/* Selected Mood Description */}
      {value > 0 && MOOD_LABELS[value] && (
        <div className="text-xs text-center text-text-secondary bg-surface/50 p-2.5 rounded border border-border/50 animate-scale-in">
          <span className="font-bold text-text-primary mr-1">
            {MOOD_LABELS[value].emoji} {MOOD_LABELS[value].label}:
          </span>
          {MOOD_LABELS[value].description}
        </div>
      )}
    </div>
  )
}
