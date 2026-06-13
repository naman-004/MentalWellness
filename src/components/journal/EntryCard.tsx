import React, { useState } from 'react'
import { Calendar, Clock, Trash2, ChevronDown, ChevronUp, AlertTriangle, RefreshCw } from 'lucide-react'
import { JournalEntry } from '../../types/journal'
import { MOOD_LABELS } from '../../utils/constants'
import { formatDate } from '../../utils/dateHelpers'
import Badge from '../common/Badge'
import Skeleton from '../common/Skeleton'

interface EntryCardProps {
  entry: JournalEntry
  onDelete: (id: string) => void
  onRetryAnalysis: (id: string, text: string) => Promise<void>
}

export default function EntryCard({ entry, onDelete, onRetryAnalysis }: EntryCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [retrying, setRetrying] = useState(false)
  const mood = MOOD_LABELS[entry.moodScore] || { emoji: '😐', label: 'Neutral' }

  const handleRetry = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setRetrying(true)
    try {
      await onRetryAnalysis(entry.id, entry.text)
    } finally {
      setRetrying(false)
    }
  }

  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden transition duration-150 hover:border-border/80">
      {/* Header Summary */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 md:p-5 flex items-start justify-between gap-3 cursor-pointer hover:bg-surface-raised/40 transition duration-150 select-none"
      >
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-accent" />
              {formatDate(entry.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-accent" />
              {entry.studyHours}h study
            </span>
            <span className="bg-bg px-2 py-0.5 rounded border border-border/50 font-medium text-text-primary text-[10px]">
              {entry.daysToExam} days to exam
            </span>
          </div>

          <p className="text-sm text-text-primary line-clamp-2 leading-relaxed">
            {entry.text}
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1.5">
            <span className="text-xs bg-bg/50 px-2 py-0.5 rounded border border-border/30 text-text-primary flex items-center gap-1">
              <span>{mood.emoji}</span>
              <span className="font-semibold text-[10px]">{mood.label}</span>
            </span>
            {entry.tags.map((tag) => (
              <span key={tag} className="text-[10px] bg-surface-raised px-2 py-0.5 rounded text-text-secondary border border-border/20">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 self-center flex-shrink-0">
          {/* Analysis indicator badge */}
          {entry.analysisStatus === 'complete' && entry.aiAnalysis && (
            <Badge variant={entry.aiAnalysis.stressLevel} className="text-[10px] font-bold">
              Stress: {entry.aiAnalysis.stressLevel}
            </Badge>
          )}
          {entry.analysisStatus === 'analyzing' && (
            <span className="text-[10px] text-accent font-semibold animate-pulse">Analyzing...</span>
          )}
          {entry.analysisStatus === 'failed' && (
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="p-1 hover:bg-bg rounded border border-border/50 text-warning transition"
              aria-label="Retry AI analysis for this entry"
              title="Analysis failed. Click to retry."
            >
              <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation()
              if (confirm('Delete this entry?')) onDelete(entry.id)
            }}
            className="p-1.5 text-text-secondary hover:text-danger rounded-md hover:bg-surface-raised transition"
            aria-label="Delete entry"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          <div className="text-text-secondary">
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Accordion Detail (Full text + AI Analysis Panel) */}
      {isOpen && (
        <div className="border-t border-border bg-bg/20 p-4 md:p-5 space-y-5">
          {/* Full Text */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Your reflective log</h4>
            <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
              {entry.text}
            </p>
          </div>

          {/* AI Analysis Accordion Panel */}
          <div className="border border-border/60 rounded-lg bg-surface/40 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h5 className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                <span>🧘</span> Zen AI Mood Assessment
              </h5>
              {entry.aiAnalysis?.analysisTimestamp && (
                <span className="text-[10px] text-text-secondary">
                  Analyzed at {new Date(entry.aiAnalysis.analysisTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>

            {entry.analysisStatus === 'pending' || entry.analysisStatus === 'analyzing' ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-1/3 rounded" />
                <Skeleton className="h-16 w-full rounded" />
                <Skeleton className="h-4 w-1/2 rounded" />
              </div>
            ) : entry.analysisStatus === 'failed' ? (
              <div className="flex flex-col items-center justify-center py-4 text-center space-y-2">
                <AlertTriangle className="w-6 h-6 text-warning" />
                <p className="text-xs text-text-secondary">AI was unable to complete the analysis.</p>
                <button
                  onClick={handleRetry}
                  disabled={retrying}
                  className="px-3 py-1 bg-surface-raised border border-border rounded text-xs text-text-primary hover:bg-border transition inline-flex items-center gap-1.5"
                  aria-label="Retry AI analysis for this entry"
                >
                  <RefreshCw className={`w-3 h-3 ${retrying ? 'animate-spin' : ''}`} />
                  Retry Assessment
                </button>
              </div>
            ) : entry.aiAnalysis ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Left col */}
                <div className="space-y-3">
                  <div>
                    <span className="text-text-secondary font-semibold block mb-1">Stress Level & Sentiment</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={entry.aiAnalysis.stressLevel}>
                        Stress: {entry.aiAnalysis.stressLevel.toUpperCase()}
                      </Badge>
                      <span className={`px-2 py-0.5 rounded border font-semibold ${
                        entry.aiAnalysis.sentimentScore >= 0.2
                          ? 'bg-success/10 border-success/30 text-success'
                          : entry.aiAnalysis.sentimentScore <= -0.2
                            ? 'bg-danger/10 border-danger/30 text-danger'
                            : 'bg-text-secondary/15 border-border text-text-secondary'
                      }`}>
                        Sentiment: {entry.aiAnalysis.sentimentScore}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-text-secondary font-semibold block mb-1">Core Triggers Detected</span>
                    {entry.aiAnalysis.stressTriggers.length > 0 ? (
                      <ul className="list-disc pl-4 space-y-1 text-text-primary">
                        {entry.aiAnalysis.stressTriggers.map((t, idx) => (
                          <li key={idx}>{t}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-text-secondary italic">None identified</span>
                    )}
                  </div>

                  <div>
                    <span className="text-text-secondary font-semibold block mb-1">Coping Patterns</span>
                    {entry.aiAnalysis.emotionalPatterns.length > 0 ? (
                      <ul className="list-disc pl-4 space-y-1 text-text-primary">
                        {entry.aiAnalysis.emotionalPatterns.map((p, idx) => (
                          <li key={idx}>{p}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-text-secondary italic">None identified</span>
                    )}
                  </div>
                </div>

                {/* Right col */}
                <div className="space-y-3">
                  <div>
                    <span className="text-text-secondary font-semibold block mb-1">Underlying Concerns</span>
                    {entry.aiAnalysis.hiddenConcerns.length > 0 ? (
                      <ul className="list-disc pl-4 space-y-1 text-text-primary">
                        {entry.aiAnalysis.hiddenConcerns.map((c, idx) => (
                          <li key={idx}>{c}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-text-secondary italic">None identified</span>
                    )}
                  </div>

                  <div>
                    <span className="text-text-secondary font-semibold block mb-1 text-success">Positive Signals / Strengths</span>
                    {entry.aiAnalysis.positiveSignals.length > 0 ? (
                      <ul className="list-disc pl-4 space-y-1 text-success">
                        {entry.aiAnalysis.positiveSignals.map((s, idx) => (
                          <li key={idx} className="font-medium">{s}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-text-secondary italic">None identified</span>
                    )}
                  </div>

                  <div>
                    <span className="text-text-secondary font-semibold block mb-1">Associated Key Themes</span>
                    <div className="flex flex-wrap gap-1">
                      {entry.aiAnalysis.keyThemes.map((theme) => (
                        <span key={theme} className="bg-accent-soft/20 text-accent border border-accent/25 px-1.5 py-0.5 rounded text-[10px]">
                          {theme.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <span className="text-text-secondary italic text-xs">No analysis data. Click retry to run.</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
