

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 mr-auto bg-surface border border-border p-3.5 rounded-lg rounded-tl-none max-w-xs shadow-sm">
      <div className="flex gap-1">
        <span className="w-2 h-2 rounded-full bg-zen animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-zen animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-zen animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">Zen is writing...</span>
    </div>
  )
}
