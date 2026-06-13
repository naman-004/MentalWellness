import React, { useState } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import OfflineBanner from '../common/OfflineBanner'
import { Menu } from 'lucide-react'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bg text-text-primary flex">
      {/* Sidebar - Handles both desktop and mobile drawer views */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main content pane */}
      <div className="flex-1 flex flex-col md:pl-[240px] min-h-screen">
        {/* Mobile Toggle bar */}
        <div className="md:hidden h-14 border-b border-border bg-surface flex items-center px-4 gap-3 sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-raised rounded-md transition duration-150"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-extrabold tracking-wider text-accent text-sm">ZenPath</span>
        </div>

        {/* Connectivity Status Banner */}
        <OfflineBanner />

        {/* Global Page Header */}
        <TopBar />

        {/* Scrollable page body */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
