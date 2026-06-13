import React from 'react'
import { clsx } from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'low' | 'medium' | 'high' | 'critical' | 'info' | 'zen'
  className?: string
}

export default function Badge({ children, variant = 'info', className }: BadgeProps) {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border'
  
  const variants = {
    low: 'bg-success/10 text-success border-success/35',
    medium: 'bg-warning/10 text-warning border-warning/35',
    high: 'bg-danger/10 text-danger border-danger/35',
    critical: 'bg-danger text-bg border-danger/50 font-bold',
    info: 'bg-accent/10 text-accent border-accent/35',
    zen: 'bg-zen/10 text-zen border-zen/35',
  }

  return (
    <span className={clsx(baseStyles, variants[variant], className)}>
      {children}
    </span>
  )
}
