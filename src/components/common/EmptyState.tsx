import React from 'react'
import Button from './Button'
import { FolderOpen } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ReactNode
  actionText?: string
  onAction?: () => void
}

export default function EmptyState({
  title,
  description,
  icon,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="w-full text-center py-12 px-4 border border-dashed border-border/80 rounded-2xl bg-surface/30 space-y-4 flex flex-col items-center justify-center">
      <div className="p-3 bg-surface-raised border border-border text-text-secondary rounded-full">
        {icon || <FolderOpen size={32} />}
      </div>
      
      <div className="space-y-1 max-w-sm">
        <h4 className="font-bold text-text-primary text-sm tracking-tight">{title}</h4>
        <p className="text-xs text-text-secondary leading-relaxed">{description}</p>
      </div>

      {actionText && onAction && (
        <div className="pt-2">
          <Button size="sm" variant="primary" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  )
}
