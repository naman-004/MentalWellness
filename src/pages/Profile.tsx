import { useState, useEffect } from 'react'
import { useUserStore, getDecryptedApiKey } from '../store/userStore'
import { useJournalStore } from '../store/journalStore'
import { useMoodStore } from '../store/moodStore'
import { useChatStore } from '../store/chatStore'
import { useInsights } from '../hooks/useInsights'
import { testGeminiKey } from '../api/geminiClient'
import { getRemainingRequests } from '../utils/rateLimiter'
import MindfulnessCard from '../components/mindfulness/MindfulnessCard'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { ExamType } from '../types/user'
import {
  User,
  Shield,
  Activity,
  Download,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react'

export default function Profile() {
  const { profile, updateProfile, setApiKey, clearAll } = useUserStore()
  const { stats } = useInsights()

  // Form states
  const [name, setName] = useState(profile?.name || '')
  const [examType, setExamType] = useState<ExamType>(profile?.examType || 'JEE_MAINS')
  const [examDate, setExamDate] = useState(
    profile?.examDate ? profile.examDate.split('T')[0] : ''
  )
  const [stressBaseline, setStressBaseline] = useState(profile?.stressBaseline || 5)
  const [topWorries, setTopWorries] = useState<string[]>(profile?.topWorries || [])
  const [apiKeyInput, setApiKeyInput] = useState(getDecryptedApiKey())

  // Status indicators
  const [testingKey, setTestingKey] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'failed' | null>(null)
  const [profileSaved, setProfileSaved] = useState(false)
  const [apiKeySaved, setApiKeySaved] = useState(false)

  // Rate Limiter monitoring widget state
  const [remainingReqs, setRemainingReqs] = useState(getRemainingRequests())

  // Periodically refresh the rate limit state
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingReqs(getRemainingRequests())
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const examOptions: { value: ExamType; label: string }[] = [
    { value: 'JEE_MAINS', label: 'JEE Mains' },
    { value: 'JEE_ADVANCED', label: 'JEE Advanced' },
    { value: 'NEET', label: 'NEET' },
    { value: 'CAT', label: 'CAT' },
    { value: 'GATE', label: 'GATE' },
    { value: 'UPSC', label: 'UPSC Civil Services' },
    { value: 'CUET', label: 'CUET' },
    { value: 'OTHER', label: 'Other Exam' },
  ]

  const worryOptions = [
    'Syllabus Backlog',
    'Time Management & Schedules',
    'Mock Test Performance',
    'Peer Comparison & Ranks',
    'Family Expectations',
    'Fear of Exam Failure',
    'Lack of Sleep & Exam Fatigue',
    'General Focus & Concentration',
  ]

  const handleWorryToggle = (worry: string) => {
    setTopWorries((prev) =>
      prev.includes(worry) ? prev.filter((w) => w !== worry) : [...prev, worry]
    )
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('Please enter your name.')
      return
    }
    updateProfile({
      name: name.trim(),
      examType,
      examDate: new Date(examDate).toISOString(),
      stressBaseline,
      topWorries,
    })
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2000)
  }

  const handleSaveApiKey = () => {
    setApiKey(apiKeyInput.trim())
    setApiKeySaved(true)
    setTestResult(null)
    setTimeout(() => setApiKeySaved(false), 2000)
  }

  const handleTestKey = async () => {
    if (!apiKeyInput) return
    setTestingKey(true)
    setTestResult(null)
    const isValid = await testGeminiKey(apiKeyInput.trim())
    setTestingKey(false)
    setTestResult(isValid ? 'success' : 'failed')
  }

  const handleExportData = () => {
    const exportObj = {
      profile: useUserStore.getState().profile,
      apiKeyObfuscated: useUserStore.getState().apiKey,
      journalEntries: useJournalStore.getState().entries,
      moodLogs: useMoodStore.getState().logs,
      chatHistory: useChatStore.getState().conversations,
      exportedAt: new Date().toISOString(),
      app: 'ZenPath',
    }

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObj, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `zenpath_backup_${new Date().toISOString().split('T')[0]}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const handleClearAllData = () => {
    const confirmed = window.confirm(
      'Are you absolutely sure you want to reset ZenPath? This will wipe your profile, daily journal entries, chat history, and API keys. This action is irreversible.'
    )
    if (confirmed) {
      clearAll()
      localStorage.clear()
      // Reload page to force the onboarding guard to run
      window.location.href = '/onboarding'
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Settings Form Column */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Profile Settings */}
        <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <User className="text-accent" size={20} />
            <h3 className="text-lg font-bold text-text-primary">Exam Profile Settings</h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-text-secondary" htmlFor="profile-name">
                  Full Name
                </label>
                <Input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-text-secondary" htmlFor="profile-exam-type">
                  Exam Type
                </label>
                <select
                  id="profile-exam-type"
                  value={examType}
                  onChange={(e) => setExamType(e.target.value as ExamType)}
                  className="w-full p-2.5 bg-bg border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-accent"
                >
                  {examOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-text-secondary" htmlFor="profile-exam-date">
                  Exam Date
                </label>
                <Input
                  id="profile-exam-date"
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-text-secondary">
                    Stress Baseline
                  </label>
                  <span className="text-xs font-bold text-accent">{stressBaseline}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stressBaseline}
                  onChange={(e) => setStressBaseline(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-bg border border-border rounded-lg appearance-none cursor-pointer accent-accent mt-3"
                  aria-label="Edit stress baseline slider"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-text-secondary">
                Top Worries Checklist
              </label>
              <div className="flex flex-wrap gap-2">
                {worryOptions.map((worry) => {
                  const isSelected = topWorries.includes(worry)
                  return (
                    <button
                      key={worry}
                      type="button"
                      onClick={() => handleWorryToggle(worry)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition duration-150 ${
                        isSelected
                          ? 'bg-accent/15 border-accent text-accent'
                          : 'bg-bg/50 border-border text-text-secondary hover:text-text-primary hover:border-border'
                      }`}
                    >
                      {worry}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary">
                {profileSaved ? 'Profile Updated!' : 'Save Profile Details'}
              </Button>
            </div>
          </form>
        </div>

        {/* API Credentials */}
        <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Shield className="text-accent" size={20} />
            <h3 className="text-lg font-bold text-text-primary">Google Gemini API Credentials</h3>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed">
            Configure your free Gemini connection key. It remains stored strictly inside this browser context.
            Obtain a key from <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-accent underline font-semibold">aistudio.google.com</a>.
          </p>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKeyInput}
                onChange={(e) => {
                  setApiKeyInput(e.target.value)
                  setTestResult(null)
                }}
                className="flex-1 p-2.5 bg-bg border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-accent"
                aria-label="Edit Gemini API Key"
              />
              <Button onClick={handleSaveApiKey} variant="secondary">
                {apiKeySaved ? 'Saved!' : 'Save Key'}
              </Button>
            </div>

            {apiKeyInput && (
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleTestKey}
                  disabled={testingKey}
                >
                  {testingKey ? 'Testing Connection...' : 'Test Connection'}
                </Button>

                {testResult === 'success' && (
                  <div className="flex items-center gap-1 text-xs text-success font-semibold">
                    <CheckCircle size={14} />
                    <span>Connection Verified!</span>
                  </div>
                )}

                {testResult === 'failed' && (
                  <div className="flex items-center gap-1 text-xs text-danger font-semibold">
                    <AlertCircle size={14} />
                    <span>Connection Failed. Check key or rate limits.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Export & Reset Admin Panel */}
        <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Activity className="text-accent" size={20} />
            <h3 className="text-lg font-bold text-text-primary">Data Administration</h3>
          </div>

          <p className="text-xs text-text-secondary">
            Manage your local database records. Download full JSON backups or delete all records.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              onClick={handleExportData}
              variant="secondary"
              className="flex items-center gap-2 text-xs font-semibold"
            >
              <Download size={14} />
              Export Backup (JSON)
            </Button>
            
            <Button
              onClick={handleClearAllData}
              variant="danger"
              className="flex items-center gap-2 text-xs font-semibold"
            >
              <Trash2 size={14} />
              Wipe All Records (Reset App)
            </Button>
          </div>
        </div>

      </div>

      {/* Right Mindfulness Sidebar & Limiter Widget */}
      <div className="space-y-6">
        
        {/* Rate Limiter usage widget */}
        <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Clock className="text-accent" size={20} />
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Gemini Quota Status
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary">Requests Remaining:</span>
              <span className="font-bold text-text-primary">{remainingReqs} / 8</span>
            </div>
            
            <div className="overflow-hidden h-2 text-xs flex rounded bg-bg border border-border">
              <div
                style={{ width: `${(remainingReqs / 8) * 100}%` }}
                className={`shadow-none flex flex-col text-center whitespace-nowrap justify-center transition-all duration-300 ${
                  remainingReqs > 4
                    ? 'bg-success'
                    : remainingReqs > 1
                    ? 'bg-warning'
                    : 'bg-danger'
                }`}
              />
            </div>
            
            <p className="text-[10px] text-text-secondary leading-relaxed">
              Calculated dynamically over a 1-minute sliding window. Refreshes automatically as requests age.
            </p>
          </div>
        </div>

        {/* Adaptive Mindfulness Reset Widget */}
        <MindfulnessCard
          avgMood={stats.avgMood}
          examType={profile?.examType || 'OTHER'}
          daysToExam={stats.daysToExam}
          topWorries={profile?.topWorries || []}
        />

      </div>

    </div>
  )
}
