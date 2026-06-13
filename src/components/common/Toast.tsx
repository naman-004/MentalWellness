/* eslint-disable react-refresh/only-export-components */
import { createPortal } from 'react-dom'
import { create } from 'zustand'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  message: string
  type: ToastType
}

interface ToastState {
  toasts: ToastItem[]
  addToast: (message: string, type?: ToastType) => void
  removeToast: (id: string) => void
}

const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = crypto.randomUUID()
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 4000)
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

export function useToast() {
  const addToast = useToastStore((state) => state.addToast)
  return {
    success: (msg: string) => addToast(msg, 'success'),
    error: (msg: string) => addToast(msg, 'error'),
    info: (msg: string) => addToast(msg, 'info'),
  }
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  if (typeof window === 'undefined' || toasts.length === 0) return null

  const iconMap = {
    success: <CheckCircle className="w-5 h-5 text-success" />,
    error: <AlertCircle className="w-5 h-5 text-danger" />,
    info: <Info className="w-5 h-5 text-accent" />,
  }

  const borderColors = {
    success: 'border-success/30 bg-surface',
    error: 'border-danger/30 bg-surface',
    info: 'border-accent/30 bg-surface',
  }

  return createPortal(
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full p-4 md:p-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-lg border shadow-xl ${borderColors[toast.type]} animate-scale-in`}
        >
          <div className="flex-shrink-0 mt-0.5">{iconMap[toast.type]}</div>
          <div className="flex-1 text-sm text-text-primary font-medium leading-tight">
            {toast.message}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-text-secondary hover:text-text-primary transition duration-150"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>,
    document.body
  )
}
