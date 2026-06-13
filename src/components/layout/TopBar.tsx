import { useLocation } from 'react-router-dom'
import { formatDate } from '../../utils/dateHelpers'

export default function TopBar() {
  const location = useLocation()
  
  const getPageTitle = (pathname: string): string => {
    switch (pathname) {
      case '/':
      case '/dashboard':
        return 'Dashboard'
      case '/journal':
        return 'Wellness Journal'
      case '/chat':
        return 'ZenPath AI Companion'
      case '/insights':
        return 'Stress Insights'
      case '/profile':
        return 'Profile Settings'
      case '/onboarding':
        return 'Onboarding Path'
      default:
        return 'ZenPath'
    }
  }

  const todayIso = new Date().toISOString()

  return (
    <header className="h-16 px-6 border-b border-border flex items-center justify-between bg-surface/50 backdrop-blur-md sticky top-0 z-30">
      <h1 className="text-lg font-bold text-text-primary">
        {getPageTitle(location.pathname)}
      </h1>
      <div className="text-sm text-text-secondary font-medium">
        {formatDate(todayIso)}
      </div>
    </header>
  )
}
