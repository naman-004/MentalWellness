
import { useJournal } from '../hooks/useJournal'
import { useJournalStore } from '../store/journalStore'
import JournalEditor from '../components/journal/JournalEditor'
import EntryCard from '../components/journal/EntryCard'
import { BookOpen } from 'lucide-react'

export default function Journal() {
  const { 
    entries, 
    createEntry, 
    triggerAnalysis,
    draftText, 
    setDraftText, 
    clearDraft, 
    recentMoodAvg 
  } = useJournal()

  const { deleteEntry } = useJournalStore()

  return (
    <div className="space-y-6">
      {/* Overview header banner */}
      <div className="p-6 rounded-lg bg-surface border border-border flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-accent mb-1 flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> Wellness Journal
          </h2>
          <p className="text-text-secondary text-xs">
            Write reflective entries about your preparation, backlogs, and mock test scores. Zen AI will analyze your emotional load.
          </p>
        </div>
        <div className="bg-bg px-4 py-2 rounded-md border border-border flex flex-col items-center md:items-end flex-shrink-0">
          <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">Recent Mood Avg</span>
          <span className="text-xl font-black text-accent">{recentMoodAvg} <span className="text-xs text-text-secondary">/ 10</span></span>
        </div>
      </div>

      {/* Two column workspace layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Editor column */}
        <div className="lg:col-span-5">
          <JournalEditor
            onSubmit={createEntry}
            draftText={draftText}
            setDraftText={setDraftText}
            clearDraft={clearDraft}
          />
        </div>

        {/* Logs Listing column */}
        <div className="lg:col-span-7 space-y-4 max-h-[80vh] overflow-y-auto pr-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Journal History ({entries.length})
            </h3>
          </div>

          {entries.length === 0 ? (
            <div className="text-center py-12 bg-surface p-6 rounded-lg border border-border">
              <span className="text-3xl block mb-2">✍️</span>
              <h4 className="text-sm font-semibold text-text-primary mb-1">Your Journal is Empty</h4>
              <p className="text-xs text-text-secondary max-w-xs mx-auto leading-relaxed">
                Start logging your study routines and thoughts in the editor. Reflections help clarify your focus and reduce exam stress!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onDelete={deleteEntry}
                  onRetryAnalysis={triggerAnalysis}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
