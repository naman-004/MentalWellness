import { useState, useEffect } from 'react'
import { WifiOff } from 'lucide-react'

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div
      role="alert"
      className="bg-warning/10 border-b border-warning/30 text-warning px-4 py-2.5 text-center text-xs font-semibold flex items-center justify-center gap-2 animate-slide-in relative z-50"
    >
      <WifiOff size={14} className="shrink-0" />
      <span>
        Offline Mode Active. Your local entries and breathing exercises continue to work fully, but AI analysis will resume once reconnected.
      </span>
    </div>
  )
}
