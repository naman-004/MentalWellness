import React, { Suspense, lazy, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useUserStore } from './store/userStore'
import AppLayout from './components/layout/AppLayout'
import Skeleton from './components/common/Skeleton'
import ErrorBoundary from './components/common/ErrorBoundary'

// Lazy load pages for efficient bundle splitting
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Journal = lazy(() => import('./pages/Journal'))
const Chat = lazy(() => import('./pages/Chat'))
const Insights = lazy(() => import('./pages/Insights'))
const Profile = lazy(() => import('./pages/Profile'))
const Onboarding = lazy(() => import('./pages/Onboarding'))

// UI Shimmer placeholder for loading screens
const PageFallback = () => (
  <div className="space-y-6">
    <Skeleton className="h-10 w-1/3 rounded-md" />
    <Skeleton className="h-32 w-full rounded-md" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Skeleton className="h-48 w-full rounded-md" />
      <Skeleton className="h-48 w-full rounded-md" />
    </div>
  </div>
)

// Onboarding Gate: redirects users to /onboarding if they haven't set up a profile
function OnboardingGuard() {
  const profile = useUserStore((state) => state.profile)
  if (!profile || !profile.onboardingComplete) {
    return <Navigate to="/onboarding" replace />
  }
  return <Outlet />
}

// AI Feature Gate: Intercepts AI pages if no Gemini API Key is found
function ApiKeyGate({ children }: { children: React.ReactNode }) {
  const apiKey = useUserStore((state) => state.apiKey)
  const [showModal, setShowModal] = useState(false)
  const [tempKey, setTempKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const { setApiKey } = useUserStore()
  const location = useLocation()

  useEffect(() => {
    // If accessing chat or journal and apiKey is empty, show the modal
    if (!apiKey && (location.pathname === '/chat' || location.pathname === '/journal')) {
      setShowModal(true)
    } else {
      setShowModal(false)
    }
  }, [apiKey, location.pathname])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = tempKey.trim()
    if (trimmed.startsWith('AIzaSy') && trimmed.length >= 20) {
      setApiKey(trimmed)
      setShowModal(false)
    } else {
      alert('Please enter a valid Gemini API key starting with "AIzaSy" (min 20 characters)')
    }
  }

  return (
    <>
      {children}
      
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-6 rounded-lg bg-surface border border-border shadow-2xl animate-scale-in text-text-primary">
            <h3 className="text-lg font-bold text-accent mb-2">Gemini API Key Required</h3>
            <p className="text-xs text-text-secondary mb-4 leading-relaxed">
              ZenPath uses Google Gemini to analyze your wellness journal and power the chat companion.
              Please provide your own API key. It is stored locally in your browser's memory and is never sent to our servers.
            </p>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-text-secondary" htmlFor="api-key-input">
                    Gemini API Key
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
                <div className="relative flex items-center">
                  <input
                    id="api-key-input"
                    type={showKey ? 'text' : 'password'}
                    placeholder="AIzaSy..."
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    className="w-full pr-14 p-2.5 bg-bg border border-border rounded-md text-text-primary text-sm focus:outline-none focus:border-accent"
                    aria-label="Gemini API key"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    aria-pressed={showKey}
                    className="absolute right-2 px-2.5 py-1.5 text-[10px] text-text-secondary hover:text-text-primary font-bold transition rounded hover:bg-surface-raised"
                  >
                    {showKey ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 justify-end text-xs">
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent hover:bg-accent/80 text-bg font-bold rounded-md transition duration-150"
                >
                  Save API Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Public onboarding route */}
            <Route path="/onboarding" element={<Onboarding />} />
            
            {/* Main application paths protected by onboarding completion */}
            <Route element={<OnboardingGuard />}>
              <Route
                path="/*"
                element={
                  <AppLayout>
                    <ApiKeyGate>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/dashboard" element={<Navigate to="/" replace />} />
                        <Route path="/journal" element={<Journal />} />
                        <Route path="/chat" element={<Chat />} />
                        <Route path="/insights" element={<Insights />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </ApiKeyGate>
                  </AppLayout>
                }
              />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
