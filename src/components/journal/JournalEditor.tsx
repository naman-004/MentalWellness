import React, { useState, useEffect } from 'react'
import MoodPicker from './MoodPicker'
import Button from '../common/Button'
import { JOURNAL_TAGS } from '../../utils/constants'
import { clsx } from 'clsx'

interface JournalEditorProps {
  onSubmit: (data: { text: string; moodScore: number; studyHours: number; tags: string[] }) => Promise<unknown>
  draftText: string
  setDraftText: (val: string) => void
  clearDraft: () => void
}

export default function JournalEditor({ onSubmit, draftText, setDraftText, clearDraft }: JournalEditorProps) {
  const [moodScore, setMoodScore] = useState(5)
  const [studyHours, setStudyHours] = useState(6)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [text, setText] = useState(draftText)

  useEffect(() => {
    setText(draftText)
  }, [draftText])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value
    setText(newVal)
    setDraftText(newVal)
  }

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        text,
        moodScore,
        studyHours,
        tags: selectedTags,
      })
      clearDraft()
      setText('')
      setSelectedTags([])
      setMoodScore(5)
      setStudyHours(6)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmitForm} className="space-y-5 bg-surface p-5 rounded-lg border border-border">
      <h3 className="text-sm font-bold text-accent uppercase tracking-wider">Log Today's Preparation</h3>

      {/* Mood Rating */}
      <MoodPicker value={moodScore} onChange={setMoodScore} />

      {/* Study Load */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-1.5" htmlFor="study-hours">
          Study Hours Today
        </label>
        <input
          id="study-hours"
          type="number"
          min={0}
          max={24}
          value={studyHours}
          onChange={(e) => setStudyHours(Math.max(0, Math.min(24, parseInt(e.target.value) || 0)))}
          className="w-full md:w-1/3 p-2 bg-bg border border-border rounded-md text-text-primary text-sm focus:outline-none focus:border-accent"
        />
      </div>

      {/* Tags Selector */}
      <div className="space-y-2">
        <span className="block text-xs font-semibold text-text-secondary">Study / Stress Context Tags</span>
        <div className="flex flex-wrap gap-1.5">
          {JOURNAL_TAGS.map((tag) => {
            const isSelected = selectedTags.includes(tag)
            return (
              <button
                key={tag}
                type="button"
                onClick={() => handleToggleTag(tag)}
                className={clsx(
                  "px-2.5 py-1 text-xs rounded-full border transition duration-150",
                  isSelected
                    ? "bg-accent/15 border-accent text-accent"
                    : "bg-bg border-border text-text-secondary hover:text-text-primary hover:border-text-secondary"
                )}
              >
                {tag}
              </button>
            )
          })}
        </div>
      </div>

      {/* Writing Textarea */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <label className="font-semibold text-text-secondary" htmlFor="journal-textarea">
            Reflective Journal Log
          </label>
          <span id="draft-status" className="text-text-secondary text-[10px] italic">
            {text ? 'Draft autosaved' : 'Empty draft'}
          </span>
        </div>
        <textarea
          id="journal-textarea"
          rows={5}
          value={text}
          onChange={handleTextChange}
          aria-describedby="char-count draft-status"
          placeholder="Write down your mock test experiences, backlog anxiety, or study achievements today..."
          className="w-full p-3 bg-bg border border-border rounded-md text-text-primary text-sm focus:outline-none focus:border-accent"
          maxLength={5000}
          required
        />
        <div className="flex justify-between text-[10px] text-text-secondary" id="char-count">
          <span>{text.length} / 5000 characters</span>
          <span>Sanitization checks applied at submission</span>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={isSubmitting} disabled={!text.trim()}>
          Save Entry
        </Button>
      </div>
    </form>
  )
}
