import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return

    // Handle Escape key close
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    // Prevent body scrolling behind modal
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (typeof window === 'undefined' || !isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      {/* Click-outside backdrop closer */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      
      {/* Modal Dialog Card */}
      <div 
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md p-6 rounded-lg bg-surface border border-border shadow-2xl animate-scale-in text-text-primary"
      >
        <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
          <h3 className="font-bold text-base text-accent">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 text-text-secondary hover:text-text-primary hover:bg-surface-raised rounded-md transition duration-150"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="text-sm">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
