import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useUserStore, getDecryptedApiKey } from '../store/userStore'
import { useInsights } from '../hooks/useInsights'
import { generateWeeklySummary, WeeklySummaryFallbackError } from '../api/weeklySummary'
import { useMoodStore } from '../store/moodStore'
import { useStreak } from '../hooks/useStreak'
import { getDailyQuote } from '../api/zenquotes'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import {
  Flame,
  CalendarDays,
  Smile,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Compass,
  ArrowRight,
} from 'lucide-react'

export default function Dashboard() {
  const profile = useUserStore((state) => state.profile)
  const apiKey = getDecryptedApiKey()
  const { stats, positiveSignals, entries } = useInsights()
  const addMoodLog = useMoodStore((state) => state.addLog)
  
  // Activate streak checking and milestone celebrations
  useStreak()

  // Weekly summary state
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState('')
  const [cachedAt, setCachedAt] = useState<number | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [isCachedFallback, setIsCachedFallback] = useState(false)
  const [countdownText, setCountdownText] = useState('')

  // Check-in helper state
  const [loggedToday, setLoggedToday] = useState(false)

  // Fetch initial cache or status of weekly summary
  useEffect(() => {
    const cached = localStorage.getItem('zenpath-weekly-summary')
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        setSummary(parsed.summary)
        setCachedAt(parsed.timestamp)
      } catch (e) {
        console.error('Failed to parse summary cache', e)
      }
    }
  }, [])

  // Calculate refresh cooldown countdown
  useEffect(() => {
    if (!cachedAt) return

    const updateCountdown = () => {
      const msDiff = Date.now() - cachedAt
      const cooldown = 24 * 60 * 60 * 1000 // 24 hours
      if (msDiff < cooldown) {
        const remaining = cooldown - msDiff
        const hours = Math.floor(remaining / (1000 * 60 * 60))
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
        setCountdownText(`Next refresh available in ${hours}h ${minutes}m`)
      } else {
        setCountdownText('')
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000) // update every minute
    return () => clearInterval(interval)
  }, [cachedAt])

  const handleFetchWeeklySummary = async (force = false) => {
    if (!profile) return
    if (!apiKey) {
      setErrorMsg('Google Gemini API Key is missing. Add it in Onboarding/Profile to fetch reflections.')
      return
    }

    // If attempting to refresh but within 24h, block unless forcing it (or handle cooldown validation here)
    const msDiff = Date.now() - (cachedAt || 0)
    const isUnderCooldown = cachedAt && msDiff < 24 * 60 * 60 * 1000
    if (isUnderCooldown && !force) {
      return
    }

    setLoading(true)
    setErrorMsg('')
    setIsCachedFallback(false)

    try {
      // Build metrics object
      const topTriggers = entries
        .flatMap((e) => e.aiAnalysis?.stressTriggers || [])
        .slice(0, 3)

      const topPositiveSignal = positiveSignals[0] || 'Actively writing in journal'

      const metrics = {
        avgMood: stats.avgMood,
        topTriggers,
        daysToExam: stats.daysToExam,
        entriesThisWeek: entries.filter((e) => {
          const diff = (Date.now() - new Date(e.createdAt).getTime()) / (1000 * 60 * 60 * 24)
          return diff <= 7
        }).length,
        topPositiveSignal,
      }

      const res = await generateWeeklySummary(apiKey, profile, metrics, force)
      setSummary(res.summary)
      setCachedAt(res.cachedAt)
    } catch (err) {
      if (err instanceof WeeklySummaryFallbackError) {
        setSummary(err.cachedSummary)
        setCachedAt(err.cachedAt)
        setIsCachedFallback(true)
        setErrorMsg(err.message)
      } else {
        setErrorMsg(err instanceof Error ? err.message : 'An error occurred while generating summary.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Quick check-in log helper
  const handleQuickMoodCheck = (emoji: string, score: number) => {
    addMoodLog({
      id: Math.random().toString(36).substring(7),
      score,
      emotion: score >= 9 ? 'MOTIVATED' : score >= 7 ? 'CALM' : score >= 5 ? 'FOCUSED' : 'ANXIOUS',
      note: `Quick dashboard logging: ${emoji}`,
      createdAt: new Date().toISOString(),
    })
    setLoggedToday(true)
  }

  // Determine border urgency style
  const getExamBorderColor = (days: number) => {
    if (days < 30) return 'border-danger/80 border-2' // Urgent - high pressure
    if (days <= 90) return 'border-warning/80 border-2' // Warning - moderate pressure
    return 'border-success/80 border-2' // Optimal/Safe - low immediate pressure
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">
            Hi, <span className="text-accent">{profile?.name || 'Student'}</span> 👋
          </h2>
          <p className="text-text-secondary text-sm">
            Focus your energy. Prepare with a steady mind for your targeting exam: <span className="text-zen font-bold">{profile?.examType || 'Goal'}</span>.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/journal">
            <Button size="sm" variant="primary">
              Write Daily Journal
            </Button>
          </Link>
          <Link to="/chat">
            <Button size="sm" variant="secondary">
              Talk to Zen
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Days to Exam Card with Urgency border */}
        <div className={`p-5 rounded-2xl bg-surface border ${getExamBorderColor(stats.daysToExam)} transition duration-200 shadow-lg relative overflow-hidden`}>
          <div className="absolute right-3 top-3 text-text-secondary opacity-15">
            <CalendarDays size={48} />
          </div>
          <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
            Days Until Exam
          </span>
          <span className="text-3xl font-extrabold text-text-primary">{stats.daysToExam} Days</span>
          <div className="mt-2 text-xs">
            {stats.daysToExam < 30 ? (
              <span className="text-danger font-medium">Final sprint. Prioritize stress relief and breaks.</span>
            ) : stats.daysToExam <= 90 ? (
              <span className="text-warning font-medium">Midway mark. Keep a structured, sustainable study load.</span>
            ) : (
              <span className="text-success font-medium">Plenty of time. Steady pace, build core conceptual wellness.</span>
            )}
          </div>
        </div>

        {/* Streak Counter Card */}
        <div className="p-5 rounded-2xl bg-surface border border-border relative overflow-hidden">
          <div className="absolute right-3 top-3 text-text-secondary opacity-15">
            <Flame size={48} />
          </div>
          <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
            Journaling Streak
          </span>
          <span className="text-3xl font-extrabold text-text-primary flex items-center gap-2">
            {stats.streak} Days
            {stats.streak > 0 && (
              <Flame className="text-warning animate-pulse fill-warning" size={24} />
            )}
          </span>
          <div className="mt-2 text-xs text-text-secondary">
            {stats.streak > 0
              ? 'Excellent consistency! Reflecting daily clears exam fatigue.'
              : 'Start your streak today. Write a short note to get started.'}
          </div>
        </div>

        {/* Average Mood Card */}
        <div className="p-5 rounded-2xl bg-surface border border-border relative overflow-hidden">
          <div className="absolute right-3 top-3 text-text-secondary opacity-15">
            <Smile size={48} />
          </div>
          <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
            Focus & Coping Index
          </span>
          <span className="text-3xl font-extrabold text-text-primary">{stats.avgMood || '—'}/10</span>
          <div className="mt-2 text-xs">
            {stats.avgMood >= 8 ? (
              <span className="text-success font-medium">Healthy mind state. Keep utilizing positive habits.</span>
            ) : stats.avgMood >= 5 ? (
              <span className="text-warning font-medium">Coping moderately. Take short micro-breaks.</span>
            ) : stats.avgMood > 0 ? (
              <span className="text-danger font-medium">Elevated stress detected. Talk to Zen or box-breathe.</span>
            ) : (
              <span className="text-text-secondary">No entries recorded in the last 30 days.</span>
            )}
          </div>
        </div>
      </div>

      {/* Daily Motivation Quote */}
      {(() => {
        const dailyQuote = getDailyQuote();
        return (
          <div className="p-5 rounded-2xl bg-surface/50 border border-border/80 text-center space-y-2 relative overflow-hidden glass-panel">
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Daily Focus Quote</span>
            <p className="text-sm text-text-primary italic font-serif leading-relaxed max-w-3xl mx-auto">
              "{dailyQuote.text}"
            </p>
            <span className="block text-xs text-text-secondary font-medium">— {dailyQuote.author}</span>
          </div>
        );
      })()}

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: AI Weekly Summary Reflection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="text-zen fill-zen/20" size={20} />
                <h3 className="text-lg font-bold text-text-primary">Weekly Wellness reflection</h3>
              </div>
              
              {apiKey && (
                <div className="flex flex-col items-end gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleFetchWeeklySummary(true)}
                    disabled={loading || !!countdownText}
                    className="flex items-center gap-1.5"
                  >
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                    Refresh Reflection
                  </Button>
                  {countdownText && (
                    <span className="text-[10px] text-text-secondary">{countdownText}</span>
                  )}
                </div>
              )}
            </div>

            {/* Reflection Content display */}
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="animate-spin text-zen" size={32} />
                <p className="text-sm text-text-secondary">Zen is generating your weekly reflection note...</p>
              </div>
            ) : errorMsg && !isCachedFallback ? (
              <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 flex gap-3 text-text-primary text-sm">
                <AlertTriangle className="text-danger shrink-0" size={20} />
                <div>
                  <h4 className="font-semibold text-danger">Reflection Unavailable</h4>
                  <p className="text-xs text-text-secondary mt-1">{errorMsg}</p>
                  {!apiKey && (
                    <Link to="/profile">
                      <Button size="sm" variant="secondary" className="mt-3">
                        Set API Key in Profile
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ) : summary ? (
              <div className="space-y-4">
                {isCachedFallback && (
                  <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 flex gap-2 text-xs text-text-secondary">
                    <AlertTriangle className="text-warning shrink-0" size={16} />
                    <span>{errorMsg}</span>
                  </div>
                )}
                <div className="prose prose-invert max-w-none text-sm leading-relaxed text-text-primary font-serif italic bg-bg/50 p-5 rounded-xl border border-border/40">
                  {summary.split('\n').map((para, i) => (
                    <p key={i} className="mb-2 last:mb-0">
                      {para}
                    </p>
                  ))}
                </div>
                {cachedAt && (
                  <div className="text-[10px] text-text-secondary text-right">
                    Reflection compiled at: {new Date(cachedAt).toLocaleString()}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center space-y-4">
                <p className="text-sm text-text-secondary">
                  Create wellness logs and trigger your first AI weekly reflection.
                </p>
                {apiKey ? (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleFetchWeeklySummary(false)}
                    disabled={loading}
                  >
                    Generate Reflection Letter
                  </Button>
                ) : (
                  <Link to="/profile">
                    <Button size="sm" variant="secondary">
                      Configure API Connection to Enable
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Actions & Coping Strengths */}
        <div className="space-y-6">
          {/* Quick Mood Log widget */}
          <div className="p-5 rounded-2xl bg-surface border border-border space-y-4">
            <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider border-b border-border/60 pb-2">
              How is study coping today?
            </h4>
            {loggedToday ? (
              <div className="text-center py-4 space-y-2">
                <span className="text-success text-xs font-semibold">Mood logged successfully!</span>
                <p className="text-[11px] text-text-secondary">
                  Good work check-in. Consistent journaling maps anxiety patterns.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-text-secondary">Select an emoji representing your mindset right now:</p>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { emoji: '😰', label: 'Overwhelmed', val: 2 },
                    { emoji: '😟', label: 'Anxious', val: 4 },
                    { emoji: '😐', label: 'Neutral', val: 6 },
                    { emoji: '🙂', label: 'Focused', val: 8 },
                    { emoji: '😄', label: 'Motivated', val: 10 },
                  ].map((item) => (
                    <button
                      key={item.label}
                      title={item.label}
                      onClick={() => handleQuickMoodCheck(item.emoji, item.val)}
                      className="text-2xl p-2 rounded-xl bg-bg/50 border border-border/80 hover:border-accent hover:bg-accent-soft/10 transition duration-150 flex items-center justify-center hover:scale-110"
                    >
                      {item.emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Coping Strengths Observed */}
          <div className="p-5 rounded-2xl bg-surface border border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                Resilience & Coping Patterns
              </h4>
              <Badge variant="low">AI Identified</Badge>
            </div>
            
            <div className="space-y-3">
              {positiveSignals.length > 0 ? (
                positiveSignals.slice(0, 4).map((sig, i) => (
                  <div key={i} className="flex gap-2.5 items-start text-xs text-text-primary bg-bg/40 p-2.5 rounded-lg border border-border/40">
                    <span className="text-accent text-sm shrink-0 leading-none">✔</span>
                    <span>{sig}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-text-secondary leading-relaxed">
                  Zen AI hasn't noted specific positive patterns in your logs yet. Complete daily reflections to track mental health metrics.
                </p>
              )}
            </div>

            <div className="pt-2">
              <Link to="/insights" className="text-xs text-accent hover:underline flex items-center gap-1 justify-end font-semibold">
                View detailed stress charts
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Quick Breathing Box */}
          <div className="p-5 rounded-2xl bg-accent-soft/20 border border-accent/20 space-y-3">
            <div className="flex items-center gap-2 text-accent">
              <Compass size={18} />
              <h4 className="text-xs font-bold uppercase tracking-wider">Mindfulness Exercise</h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Take a short breathing break to calm exam pacing and clear syllabus fatigue.
            </p>
            <div className="flex justify-end pt-1">
              <Link to="/profile">
                <Button size="sm" variant="primary" className="flex items-center gap-1">
                  Start breathing reset
                  <ArrowRight size={12} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
