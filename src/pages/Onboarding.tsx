import { useReducer, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import { ExamType } from '../types/user'
import { testGeminiKey } from '../api/geminiClient'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import {
  User,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shield,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react'

// 1. Reducer State Interface
interface OnboardingState {
  step: number
  name: string
  examType: ExamType
  examDate: string
  stressBaseline: number
  topWorries: string[]
  apiKey: string
  journalTimePreference: 'morning' | 'evening' | 'anytime'
}

// 2. Action Union Types
type Action =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_FIELD'; field: keyof OnboardingState; value: any }

const initialState: OnboardingState = {
  step: 1,
  name: '',
  examType: 'JEE_MAINS',
  examDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  stressBaseline: 5,
  topWorries: [],
  apiKey: '',
  journalTimePreference: 'evening',
}

function onboardingReducer(state: OnboardingState, action: Action): OnboardingState {
  switch (action.type) {
    case 'NEXT_STEP':
      return { ...state, step: Math.min(state.step + 1, 5) }
    case 'PREV_STEP':
      return { ...state, step: Math.max(state.step - 1, 1) }
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    default:
      return state
  }
}

export default function Onboarding() {
  const [state, dispatch] = useReducer(onboardingReducer, initialState)
  const { setProfile, setApiKey } = useUserStore()
  const navigate = useNavigate()

  // Testing API key local state
  const [testingKey, setTestingKey] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'failed' | null>(null)

  const examOptions: { value: ExamType; label: string }[] = [
    { value: 'JEE_MAINS', label: 'JEE Mains' },
    { value: 'JEE_ADVANCED', label: 'JEE Advanced' },
    { value: 'NEET', label: 'NEET' },
    { value: 'CAT', label: 'CAT (Management)' },
    { value: 'GATE', label: 'GATE' },
    { value: 'UPSC', label: 'UPSC Civil Services' },
    { value: 'CUET', label: 'CUET' },
    { value: 'OTHER', label: 'Other Competitive Exams' },
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

  const handleFieldChange = (field: keyof OnboardingState, value: any) => {
    dispatch({ type: 'SET_FIELD', field, value })
  }

  const handleWorryToggle = (worry: string) => {
    const isSelected = state.topWorries.includes(worry)
    const newWorries = isSelected
      ? state.topWorries.filter((w) => w !== worry)
      : [...state.topWorries, worry]
    handleFieldChange('topWorries', newWorries)
  }

  const handleTestKey = async () => {
    if (!state.apiKey) return
    setTestingKey(true)
    setTestResult(null)
    const isValid = await testGeminiKey(state.apiKey)
    setTestingKey(false)
    setTestResult(isValid ? 'success' : 'failed')
  }

  const handleNext = () => {
    // Validations per step
    if (state.step === 1) {
      if (!state.name.trim()) {
        alert('Please enter your name.')
        return
      }
    }
    if (state.step === 5) {
      // Complete Onboarding & Save
      setProfile({
        id: crypto.randomUUID(),
        name: state.name.trim(),
        examType: state.examType,
        examDate: new Date(state.examDate).toISOString(),
        stressBaseline: state.stressBaseline,
        journalTimePreference: state.journalTimePreference,
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
        topWorries: state.topWorries,
      })
      if (state.apiKey) {
        setApiKey(state.apiKey.trim())
      }
      navigate('/')
      return
    }
    dispatch({ type: 'NEXT_STEP' })
  }

  const handlePrev = () => {
    dispatch({ type: 'PREV_STEP' })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg text-text-primary px-4 py-8">
      <div className="w-full max-w-lg p-8 rounded-3xl glass-panel relative overflow-hidden space-y-6">
        
        {/* Progress header */}
        <div className="flex justify-between items-center text-xs text-text-secondary border-b border-border pb-4">
          <span className="font-bold uppercase tracking-widest text-accent">ZenPath Setup</span>
          <span className="font-semibold">Step {state.step} of 5</span>
        </div>

        {/* Step dots */}
        <div className="flex gap-1.5 justify-center">
          {[1, 2, 3, 4, 5].map((s) => (
            <span
              key={s}
              className={`h-1.5 rounded-full transition-all duration-350 ${
                s <= state.step ? 'w-8 bg-accent' : 'w-2 bg-border'
              }`}
            />
          ))}
        </div>

        {/* STEP 1: NAME & EXAM TYPE */}
        {state.step === 1 && (
          <div className="space-y-5 animate-scale-in">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-accent flex items-center justify-center gap-2">
                <User size={24} />
                Tell us about yourself
              </h1>
              <p className="text-xs text-text-secondary">
                We will personalize your mindfulness triggers and exam counts.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-secondary" htmlFor="student-name">
                  What is your name?
                </label>
                <Input
                  id="student-name"
                  type="text"
                  placeholder="e.g. Aarav Sharma"
                  value={state.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-secondary" htmlFor="exam-select">
                  Which competitive exam are you preparing for?
                </label>
                <select
                  id="exam-select"
                  value={state.examType}
                  onChange={(e) => handleFieldChange('examType', e.target.value as ExamType)}
                  className="w-full p-2.5 bg-bg border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-accent"
                >
                  {examOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: EXAM DATE */}
        {state.step === 2 && (
          <div className="space-y-5 animate-scale-in">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-accent flex items-center justify-center gap-2">
                <Calendar size={24} />
                Target Exam Date
              </h1>
              <p className="text-xs text-text-secondary">
                Allows ZenPath to track the days remaining and adjust CBT urgency alerts.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-secondary" htmlFor="exam-date">
                  Expected Exam Date
                </label>
                <Input
                  id="exam-date"
                  type="date"
                  value={state.examDate}
                  onChange={(e) => handleFieldChange('examDate', e.target.value)}
                />
              </div>
              <div className="p-4 bg-surface rounded-xl border border-border text-center text-xs text-text-secondary leading-relaxed">
                Exam target date will feed the timeline urgency meters shown on the wellness dashboards.
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: STRESS BASELINE & WORRIES */}
        {state.step === 3 && (
          <div className="space-y-5 animate-scale-in">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-accent flex items-center justify-center gap-2">
                <Activity size={24} />
                Stress Profile & Triggers
              </h1>
              <p className="text-xs text-text-secondary">
                Set a baseline stress level so we can compare logs and suggest mindful breathing offsets.
              </p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-text-secondary">
                  <span>Current Stress Baseline</span>
                  <span className="text-accent font-bold">{state.stressBaseline} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={state.stressBaseline}
                  onChange={(e) => handleFieldChange('stressBaseline', parseInt(e.target.value))}
                  className="w-full accent-accent bg-bg h-1.5 rounded-lg appearance-none cursor-pointer"
                  aria-label="Stress baseline score slider"
                />
                <div className="flex justify-between text-[10px] text-text-secondary">
                  <span>Low Pressure</span>
                  <span>Extreme Panic</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="block text-xs font-semibold text-text-secondary">
                  What are your top worries right now? (Select all that apply)
                </span>
                <div className="flex flex-wrap gap-2">
                  {worryOptions.map((worry) => {
                    const isSelected = state.topWorries.includes(worry)
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
            </div>
          </div>
        )}

        {/* STEP 4: GEMINI KEY SETUP (SKIPPABLE) */}
        {state.step === 4 && (
          <div className="space-y-5 animate-scale-in">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-accent flex items-center justify-center gap-2">
                <Shield size={24} />
                Gemini API Key (Skippable)
              </h1>
              <p className="text-xs text-text-secondary leading-relaxed">
                We use Google Gemini to perform client-side CBT journal analysis and reflections. 
                Your key is stored only on this device.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-text-secondary" htmlFor="api-key">
                    Google Gemini API Key
                  </label>
                  <a
                    href="https://aistudio.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-accent underline hover:text-accent/80 font-medium"
                  >
                    Get free key →
                  </a>
                </div>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="AIzaSy..."
                  value={state.apiKey}
                  onChange={(e) => {
                    handleFieldChange('apiKey', e.target.value)
                    setTestResult(null)
                  }}
                />
              </div>

              {state.apiKey && (
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleTestKey}
                    disabled={testingKey}
                  >
                    {testingKey ? 'Validating...' : 'Test Connection'}
                  </Button>

                  {testResult === 'success' && (
                    <div className="flex items-center gap-1 text-xs text-success font-semibold">
                      <CheckCircle size={14} />
                      <span>Success! Connection established.</span>
                    </div>
                  )}

                  {testResult === 'failed' && (
                    <div className="flex items-center gap-1 text-xs text-danger font-semibold">
                      <AlertCircle size={14} />
                      <span>Connection failed. Check key limits.</span>
                    </div>
                  )}
                </div>
              )}

              <div className="p-4 bg-surface-raised rounded-xl border border-border/80 text-[11px] text-text-secondary leading-relaxed space-y-1">
                <p className="font-semibold text-text-primary">Why is this skippable?</p>
                <p>
                  You can proceed without a key. Daily journaling, mood tracking, and mindfulness routines work fully offline. You can configure a key in Profile settings later.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: JOURNAL TIME PREFERENCE */}
        {state.step === 5 && (
          <div className="space-y-5 animate-scale-in">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-accent flex items-center justify-center gap-2">
                <Clock size={24} />
                Journaling Preference
              </h1>
              <p className="text-xs text-text-secondary">
                Select your preferred daily schedule for writing reflections.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'morning', label: 'Morning Desk', desc: 'Focus target intent' },
                  { value: 'evening', label: 'Evening Review', desc: 'Settle down study strain' },
                  { value: 'anytime', label: 'Anytime Reflex', desc: 'Log whenever free' },
                ].map((pref) => {
                  const isSelected = state.journalTimePreference === pref.value
                  return (
                    <button
                      key={pref.value}
                      type="button"
                      onClick={() => handleFieldChange('journalTimePreference', pref.value)}
                      className={`p-4 rounded-2xl border text-center transition duration-150 flex flex-col items-center justify-center space-y-2 ${
                        isSelected
                          ? 'bg-accent/15 border-accent text-accent'
                          : 'bg-surface border-border text-text-secondary hover:text-text-primary hover:border-border/80'
                      }`}
                    >
                      <span className="text-xs font-bold">{pref.label}</span>
                      <span className="text-[10px] opacity-70 leading-tight">{pref.desc}</span>
                    </button>
                  )
                })}
              </div>

              <div className="p-4 bg-surface rounded-xl border border-border text-center text-xs text-text-secondary leading-relaxed">
                By setting a preference, you build a steady mental routine to offload student syndrome anxieties.
              </div>
            </div>
          </div>
        )}

        {/* Navigation Action Buttons */}
        <div className="flex justify-between pt-4 border-t border-border/60">
          {state.step > 1 ? (
            <Button size="sm" variant="secondary" onClick={handlePrev} className="flex items-center gap-1.5">
              <ChevronLeft size={16} />
              Back
            </Button>
          ) : (
            <div />
          )}

          <Button size="sm" variant="primary" onClick={handleNext} className="flex items-center gap-1.5">
            {state.step === 5 ? (
              <>
                Let's Start
                <Sparkles size={16} className="ml-1" />
              </>
            ) : (
              <>
                Next
                <ChevronRight size={16} />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
