import { NavLink, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  BookOpen, 
  MessageSquare, 
  BarChart2, 
  User, 
  Flame, 
  X,
  Compass
} from 'lucide-react'
import { useUserStore } from '../../store/userStore'
import { useJournalStore } from '../../store/journalStore'
import { computeCurrentStreak } from '../../utils/streakHelpers'
import { daysFromNow } from '../../utils/dateHelpers'

interface SidebarProps {
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
}

export default function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const { profile } = useUserStore()
  const { entries } = useJournalStore()
  const location = useLocation()

  // Calculate streak & countdown
  const streak = computeCurrentStreak(entries)
  const daysLeft = profile?.examDate ? daysFromNow(profile.examDate) : 0
  const isUrgent = daysLeft < 30

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/journal', label: 'Journal', icon: BookOpen },
    { to: '/chat', label: 'ZenAI Chat', icon: MessageSquare },
    { to: '/insights', label: 'Insights', icon: BarChart2 },
    { to: '/profile', label: 'Profile', icon: User },
  ]

  const formatExamLabel = (type: string) => {
    switch (type) {
      case 'JEE_MAINS':
        return 'JEE'
      case 'JEE_ADVANCED':
        return 'JEE Adv'
      default:
        return type
    }
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-surface border-r border-border w-[240px] text-text-primary">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Compass className="w-6 h-6 text-accent" />
          <span className="font-extrabold text-lg tracking-wider text-text-primary bg-gradient-to-r from-accent to-zen bg-clip-text text-transparent">
            ZenPath
          </span>
        </div>
        <button 
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1 text-text-secondary hover:text-text-primary rounded-md"
          aria-label="Close navigation menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Links */}
      <nav role="navigation" aria-label="Main navigation" className="flex-1 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          // Handle dashboard as root matching or explicit dashboard
          const isActive = location.pathname === item.to || (item.to === '/dashboard' && location.pathname === '/')

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all duration-150 border-l-4 ${
                isActive
                  ? 'border-accent text-accent bg-accent-soft/20'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-raised'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Footer Indicators */}
      <div className="p-4 border-t border-border space-y-3">
        {/* Streak Counter */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-bg border border-border">
          <div className="flex items-center gap-2">
            <Flame className={`w-5 h-5 ${streak > 0 ? 'text-amber-500 fill-amber-500' : 'text-text-secondary'}`} />
            <span className="text-xs text-text-secondary font-medium">Daily Streak</span>
          </div>
          <span className="text-sm font-bold text-text-primary">
            {streak} {streak === 1 ? 'day' : 'days'}
          </span>
        </div>

        {/* Countdown Pill */}
        {profile && (
          <div 
            className={`p-3 rounded-lg border text-center text-xs font-semibold ${
              isUrgent
                ? 'bg-danger/10 border-danger/30 text-danger'
                : 'bg-accent-soft/20 border-accent/20 text-accent'
            }`}
          >
            {formatExamLabel(profile.examType)} in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed top-0 bottom-0 left-0 z-20 w-[240px]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer body */}
          <aside className="relative z-50 flex flex-col h-full animate-slide-in">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
