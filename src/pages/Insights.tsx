import { useState, useRef, KeyboardEvent } from 'react'
import { useInsights } from '../hooks/useInsights'
import MoodTrendChart from '../components/insights/MoodTrendChart'
import TriggerChart from '../components/insights/TriggerChart'
import MoodDistribution from '../components/insights/MoodDistribution'
import StressHeatmap from '../components/insights/StressHeatmap'
import Badge from '../components/common/Badge'
import {
  TrendingUp,
  BrainCircuit,
  BarChart3,
  CalendarDays,
  Target,
  Clock,
  Flame,
  Lightbulb,
} from 'lucide-react'

type TabId = 'overview' | 'stress' | 'mood' | 'progress'

export default function Insights() {
  const { entries, stats, triggers, trendDirection, positiveSignals, heatmap } = useInsights()
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({
    overview: null,
    stress: null,
    mood: null,
    progress: null,
  })

  const tabs: { id: TabId; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'stress', label: 'Stress Analysis', icon: BrainCircuit },
    { id: 'mood', label: 'Mood Patterns', icon: TrendingUp },
    { id: 'progress', label: 'Progress Metrics', icon: CalendarDays },
  ]

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const tabIds = tabs.map((t) => t.id)
    let newIndex = index

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      newIndex = (index + 1) % tabs.length
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      newIndex = (index - 1 + tabs.length) % tabs.length
    } else if (e.key === 'Home') {
      newIndex = 0
    } else if (e.key === 'End') {
      newIndex = tabs.length - 1
    } else {
      return
    }

    e.preventDefault()
    const nextTabId = tabIds[newIndex]
    setActiveTab(nextTabId)
    tabRefs.current[nextTabId]?.focus()
  }

  // Helper to determine mood status text & coloring
  const getMoodLevelString = (score: number) => {
    if (score >= 8) return { label: 'Optimal Focus', color: 'low' }
    if (score >= 5) return { label: 'Moderate Coping', color: 'medium' }
    if (score > 0) return { label: 'High Overwhelm', color: 'high' }
    return { label: 'No Data Yet', color: 'info' }
  }

  const moodLevel = getMoodLevelString(stats.avgMood)

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-accent mb-1 tracking-tight">Wellness Insights & Analytics</h2>
          <p className="text-text-secondary text-sm">
            Long-term emotional patterns and stressors calculated from your journal.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-xs text-text-secondary">Overall Status:</span>
          {moodLevel.color !== 'default' ? (
            <Badge variant={moodLevel.color as any} className="font-semibold px-3 py-1">
              {moodLevel.label} ({stats.avgMood}/10)
            </Badge>
          ) : (
            <Badge variant="info">No entries yet</Badge>
          )}
        </div>
      </div>

      {/* Accessible Tab List */}
      <div className="border-b border-border/80">
        <div
          role="tablist"
          aria-label="Insights Sections"
          className="flex flex-wrap gap-2 -mb-px"
        >
          {tabs.map((tab, idx) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[tab.id] = el
                }}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition duration-150 outline-none rounded-t-lg ${
                  isActive
                    ? 'border-accent text-accent bg-accent-soft/20'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Panels */}

      {/* PANEL 1: OVERVIEW */}
      <div
        role="tabpanel"
        id="panel-overview"
        aria-labelledby="tab-overview"
        hidden={activeTab !== 'overview'}
        className="space-y-6 outline-none"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-surface border border-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-primary">Mood & Study Progress</h3>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  Mood Score
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-zen" />
                  Study Hours
                </span>
              </div>
            </div>
            <MoodTrendChart entries={entries} />
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-border space-y-6">
            <h3 className="text-lg font-bold text-text-primary">Trend Outlook</h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-surface-raised border border-border/60 space-y-2">
                <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">
                  Trajectory
                </span>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      trendDirection === 'improving'
                        ? 'low'
                        : trendDirection === 'declining'
                        ? 'high'
                        : 'info'
                    }
                    className="capitalize text-sm font-semibold px-2.5 py-0.5"
                  >
                    {trendDirection}
                  </Badge>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {trendDirection === 'improving'
                    ? 'Your emotional stability has increased compared to the previous week. Keep journaling and practicing mindfulness.'
                    : trendDirection === 'declining'
                    ? 'Your mood averages indicate elevated pressure. Check the "Stress Analysis" tab or schedule a mindfulness exercise.'
                    : 'Your stress states have remained flat. Consistency in journaling will help flag subtle changes.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-raised border border-border/60 space-y-3">
                <div className="flex items-center gap-2 text-zen">
                  <Lightbulb size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Positive Coping Signals</span>
                </div>
                <div className="space-y-2">
                  {positiveSignals.length > 0 ? (
                    positiveSignals.slice(0, 3).map((sig, i) => (
                      <div key={i} className="flex gap-2 text-xs text-text-primary">
                        <span className="text-accent">•</span>
                        <span>{sig}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-text-secondary">
                      Keep writing journal entries. The AI will look for positive resilience triggers in your notes.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PANEL 2: STRESS ANALYSIS */}
      <div
        role="tabpanel"
        id="panel-stress"
        aria-labelledby="tab-stress"
        hidden={activeTab !== 'stress'}
        className="space-y-6 outline-none"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
            <h3 className="text-lg font-bold text-text-primary">Primary Stressors</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Triggers parsed from journal logs. Larger values indicate recurring themes.
            </p>
            <TriggerChart triggers={triggers} />
          </div>

          <div className="lg:col-span-2 p-6 rounded-2xl bg-surface border border-border space-y-4">
            <h3 className="text-lg font-bold text-text-primary">Weekly Stress Calendar</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Shows average stress density over the last 3 weeks. Visualizes exam pressure concentration.
            </p>
            <StressHeatmap heatmap={heatmap} />
          </div>
        </div>
      </div>

      {/* PANEL 3: MOOD PATTERNS */}
      <div
        role="tabpanel"
        id="panel-mood"
        aria-labelledby="tab-mood"
        hidden={activeTab !== 'mood'}
        className="space-y-6 outline-none"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
            <h3 className="text-lg font-bold text-text-primary">Stress Density</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Breakdown of entries matching low, medium, high, and critical stress categories.
            </p>
            <MoodDistribution entries={entries} />
          </div>

          <div className="lg:col-span-2 p-6 rounded-2xl bg-surface border border-border space-y-4">
            <h3 className="text-lg font-bold text-text-primary">CBT Pattern Extraction</h3>
            <p className="text-xs text-text-secondary">
              Underlying cognitive concerns and emotional behaviors flagged by AI analysis.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-surface-raised border border-border/60 space-y-3">
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Hidden Cognitive Concerns
                </h4>
                <div className="space-y-2">
                  {entries.some((e) => e.aiAnalysis?.hiddenConcerns && e.aiAnalysis.hiddenConcerns.length > 0) ? (
                    entries
                      .flatMap((e) => e.aiAnalysis?.hiddenConcerns || [])
                      .filter((val, idx, self) => self.indexOf(val) === idx) // unique
                      .slice(0, 5)
                      .map((concern, idx) => (
                        <div key={idx} className="flex gap-2 text-xs text-text-primary">
                          <span className="text-danger">•</span>
                          <span>{concern}</span>
                        </div>
                      ))
                  ) : (
                    <p className="text-xs text-text-secondary">
                      No concerns flagged yet. AI will identify latent anxieties during journal updates.
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-raised border border-border/60 space-y-3">
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Emotional Patterns
                </h4>
                <div className="space-y-2">
                  {entries.some((e) => e.aiAnalysis?.emotionalPatterns && e.aiAnalysis.emotionalPatterns.length > 0) ? (
                    entries
                      .flatMap((e) => e.aiAnalysis?.emotionalPatterns || [])
                      .filter((val, idx, self) => self.indexOf(val) === idx)
                      .slice(0, 5)
                      .map((pat, idx) => (
                        <div key={idx} className="flex gap-2 text-xs text-text-primary">
                          <span className="text-zen">•</span>
                          <span>{pat}</span>
                        </div>
                      ))
                  ) : (
                    <p className="text-xs text-text-secondary">
                      No emotional patterns flagged yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PANEL 4: PROGRESS METRICS */}
      <div
        role="tabpanel"
        id="panel-progress"
        aria-labelledby="tab-progress"
        hidden={activeTab !== 'progress'}
        className="space-y-6 outline-none"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-surface border border-border flex items-center gap-4">
            <div className="p-3 rounded-lg bg-accent/10 border border-accent/25 text-accent">
              <Target size={24} />
            </div>
            <div>
              <span className="block text-xs text-text-secondary uppercase tracking-wider font-semibold">
                Days to Exam
              </span>
              <span className="text-2xl font-bold text-text-primary">{stats.daysToExam} days</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-border flex items-center gap-4">
            <div className="p-3 rounded-lg bg-zen/10 border border-zen/25 text-zen">
              <Flame size={24} />
            </div>
            <div>
              <span className="block text-xs text-text-secondary uppercase tracking-wider font-semibold">
                Current Streak
              </span>
              <span className="text-2xl font-bold text-text-primary">{stats.streak} Days</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-border flex items-center gap-4">
            <div className="p-3 rounded-lg bg-success/10 border border-success/25 text-success">
              <TrendingUp size={24} />
            </div>
            <div>
              <span className="block text-xs text-text-secondary uppercase tracking-wider font-semibold">
                Average Mood
              </span>
              <span className="text-2xl font-bold text-text-primary">{stats.avgMood}/10</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-border flex items-center gap-4">
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/25 text-warning">
              <Clock size={24} />
            </div>
            <div>
              <span className="block text-xs text-text-secondary uppercase tracking-wider font-semibold">
                Avg Study Time
              </span>
              <span className="text-2xl font-bold text-text-primary">{stats.avgStudyHours} hrs/day</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
          <h3 className="text-lg font-bold text-text-primary">Baseline Comparison Analysis</h3>
          <p className="text-sm text-text-secondary">
            Comparing your daily logs average with the baseline stress levels noted during your onboarding.
          </p>

          <div className="p-4 rounded-xl bg-surface-raised border border-border/60 space-y-4">
            <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider">
              <span className="text-success">Onboarding Stress Baseline: {stats.stressBaseline}/10</span>
              <span className="text-accent">Recent Mood Average (Coping Index): {stats.avgMood}/10</span>
            </div>
            
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-accent-soft text-accent">
                    Coping vs Baseline Margin
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold inline-block text-accent">
                    {Math.round((stats.avgMood / 10) * 100)}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 text-xs flex rounded bg-bg border border-border">
                <div
                  style={{ width: `${Math.max(5, (stats.avgMood / 10) * 100)}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-accent transition-all duration-500"
                />
              </div>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              {stats.avgMood >= 10 - stats.stressBaseline
                ? 'Your wellness logs are positive compared to your baseline. You are demonstrating resilient coping strategies despite study pressure!'
                : 'Your logs suggest a higher levels of academic pressure than your onboarding baseline. Consider engaging in micro-mindfulness reset practices.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
