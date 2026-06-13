import { useEffect, useRef } from 'react'
import { useChat } from '../hooks/useChat'
import { useChatStore } from '../store/chatStore'
import ChatBubble from '../components/chat/ChatBubble'
import ChatInput from '../components/chat/ChatInput'
import QuickPrompts from '../components/chat/QuickPrompts'
import TypingIndicator from '../components/chat/TypingIndicator'
import { MessageSquare, Plus, Trash2, ShieldAlert } from 'lucide-react'

export default function Chat() {
  const {
    conversations,
    activeConversationId,
    sendMessage,
    startNewConversation,
    setActive,
    isStreaming,
    streamingContent
  } = useChat()

  const { deleteConversation } = useChatStore()
  
  const activeConversation = conversations.find(c => c.id === activeConversationId)
  const messages = activeConversation?.messages ?? []

  // Check if any message in active conversation contains crisis signals
  const hasCrisisMsg = messages.some(m => m.isCrisis === true)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on new message or stream chunk
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, streamingContent])

  const handleSelectQuickPrompt = (prompt: string) => {
    sendMessage(prompt).catch(console.error)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-120px)] items-stretch">
      {/* Sidebar - Conversation List (Left Column) */}
      <div className="md:col-span-3 flex flex-col gap-4 border-r border-border/60 pr-4 h-full overflow-y-auto">
        <button
          onClick={startNewConversation}
          className="w-full flex items-center justify-center gap-2 p-2.5 bg-accent hover:bg-accent/80 text-bg font-bold rounded-md text-xs transition duration-150 flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> New Chat
        </button>

        <div className="flex-1 space-y-2">
          <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider px-2">
            Recent Sessions
          </span>
          {conversations.length === 0 ? (
            <span className="block text-xs text-text-secondary italic px-2">No active sessions</span>
          ) : (
            <div className="space-y-1">
              {conversations.map((c) => {
                const isActive = c.id === activeConversationId
                // Get last message text as subtitle
                const lastMsg = c.messages[c.messages.length - 1]?.content || 'Empty conversation'

                return (
                  <div
                    key={c.id}
                    onClick={() => setActive(c.id)}
                    className={`group flex items-center justify-between p-2.5 rounded-md text-left cursor-pointer transition ${
                      isActive 
                        ? 'bg-accent-soft/20 text-accent border border-accent/20' 
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised/40'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0 text-text-secondary group-hover:text-text-primary" />
                      <div className="min-w-0">
                        <span className="block text-xs font-bold truncate">{c.title === 'New conversation' ? `Chat session` : c.title}</span>
                        <span className="block text-[10px] text-text-secondary truncate mt-0.5">{lastMsg}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('Delete this chat?')) deleteConversation(c.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-text-secondary hover:text-danger rounded transition"
                      aria-label="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat Log Window (Right Column) */}
      <div className="md:col-span-9 flex flex-col h-full bg-surface/30 border border-border/50 rounded-lg overflow-hidden relative">
        {/* Crisis Alert Banner */}
        {hasCrisisMsg && (
          <div 
            role="alert" 
            className="flex items-start gap-3 p-4 bg-danger/10 border-b border-danger/30 text-danger animate-scale-in"
          >
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold block text-sm">Zen Safety Guide</span>
              <p className="leading-relaxed">
                It sounds like you are carrying a massive amount of pressure right now. Remember that you do not have to carry this alone. Please take a break and reach out to someone who can listen and support you:
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1.5 font-bold">
                <span>📞 iCall Helpline: <a href="tel:9152987821" className="underline hover:text-danger/80">9152987821</a></span>
                <span>📞 Vandrevala Foundation: <a href="tel:18602662345" className="underline hover:text-danger/80">1860-2662-345</a> (24/7, Free)</span>
              </div>
            </div>
          </div>
        )}

        {/* Message Scroll Area */}
        <div 
          role="log" 
          aria-live="polite" 
          className="flex-1 p-4 md:p-5 overflow-y-auto space-y-4 flex flex-col"
        >
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col justify-center items-center text-center p-6 space-y-4">
              <span className="text-4xl">🧘</span>
              <h3 className="text-md font-extrabold text-accent">Connect with Zen AI</h3>
              <p className="text-xs text-text-secondary max-w-sm leading-relaxed">
                I am your calm space. Reflect on exam pressures, sleep routines, revision blocks, or how you felt after a mock test. Zen is here to listen and help you guide.
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
              
              {/* Typewriter Stream Bubble */}
              {isStreaming && streamingContent && (
                <ChatBubble 
                  message={{
                    id: 'streaming-zen-node',
                    role: 'assistant',
                    content: streamingContent,
                    timestamp: new Date().toISOString()
                  }} 
                />
              )}

              {/* Pulsing indicator when starting to fetch chunks */}
              {isStreaming && !streamingContent && <TypingIndicator />}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat input and shortcuts footer */}
        <div className="p-4 border-t border-border bg-surface/20 space-y-4 flex-shrink-0">
          {messages.length === 0 && (
            <QuickPrompts onSelect={handleSelectQuickPrompt} disabled={isStreaming} />
          )}
          <ChatInput onSend={sendMessage} disabled={isStreaming} />
        </div>
      </div>
    </div>
  )
}
