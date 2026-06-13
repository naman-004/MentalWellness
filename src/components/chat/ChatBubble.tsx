import { ChatMessage } from '../../types/chat'
import { Compass, User } from 'lucide-react'
import { clsx } from 'clsx'

interface ChatBubbleProps {
  message: ChatMessage
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={clsx("flex gap-3 max-w-2xl", isUser ? "ml-auto flex-row-reverse" : "mr-auto")}>
      {/* Avatar Icon */}
      <div className={clsx(
        "w-8 h-8 rounded-full flex items-center justify-center border flex-shrink-0",
        isUser ? "bg-accent/15 border-accent/30 text-accent" : "bg-zen/15 border-zen/30 text-zen"
      )}>
        {isUser ? <User className="w-4 h-4" /> : <Compass className="w-4 h-4" />}
      </div>

      {/* Bubble Panel */}
      <div className="space-y-1">
        <div className={clsx(
          "p-3.5 rounded-lg border text-sm leading-relaxed whitespace-pre-wrap shadow-sm",
          isUser 
            ? "bg-accent-soft/30 border-accent/20 text-text-primary rounded-tr-none" 
            : "bg-surface border-border text-text-primary rounded-tl-none"
        )}>
          {message.content}
        </div>
        <div className={clsx("text-[10px] text-text-secondary font-medium px-1", isUser ? "text-right" : "text-left")}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}
