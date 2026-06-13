import React, { useState, useRef } from 'react'
import { Send } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled: boolean
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || disabled) return
    onSend(input.trim())
    setInput('')
    
    // Auto-focus back to textarea after sending
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2.5 items-end bg-surface p-3.5 rounded-lg border border-border">
      <textarea
        ref={textareaRef}
        rows={1}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? "Zen is responding..." : "Talk about preparation stress, revision limits, mock scores..."}
        aria-label="Message Zen"
        aria-disabled={disabled}
        disabled={disabled}
        className="flex-1 max-h-24 min-h-[40px] p-2.5 bg-bg border border-border/80 rounded-md text-text-primary text-sm focus:outline-none focus:border-accent resize-none disabled:opacity-55 disabled:cursor-not-allowed"
      />
      <button
        type="submit"
        disabled={disabled || !input.trim()}
        aria-label="Send message"
        className="h-10 w-10 flex items-center justify-center rounded-md bg-accent hover:bg-accent/80 disabled:bg-surface-raised disabled:text-text-secondary disabled:cursor-not-allowed text-bg transition duration-150 flex-shrink-0"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  )
}
