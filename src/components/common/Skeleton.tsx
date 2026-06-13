import { clsx } from 'clsx'

interface SkeletonProps {
  className?: string
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div 
      className={clsx('bg-surface-raised animate-pulse', className)} 
      aria-hidden="true"
    />
  )
}
