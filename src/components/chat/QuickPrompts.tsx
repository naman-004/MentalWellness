

interface QuickPromptsProps {
  onSelect: (prompt: string) => void
  disabled: boolean
}

export default function QuickPrompts({ onSelect, disabled }: QuickPromptsProps) {
  const prompts = [
    { text: "I failed my mock test", emoji: "📉", description: "Dealing with score shocks" },
    { text: "I have a massive syllabus backlog and feel paralyzed", emoji: "📚", description: "Overcoming backlog anxiety" },
    { text: "My parents have huge expectations, it's pressing me", emoji: "🏠", description: "Handling family pressure" },
    { text: "Everyone else seems to be scoring higher than me", emoji: "👥", description: "Coping with peer comparison" },
    { text: "I feel burnt out and can't focus on reading anymore", emoji: "🥱", description: "Managing burnout" },
    { text: "Let's do a quick 4-7-8 breathing exercise", emoji: "🧘", description: "Mindfulness breathing break" },
    { text: "How do I manage study hours vs mock revisions?", emoji: "⏱️", description: "Time management tips" },
    { text: "I'm terrified of negative marking on exam day", emoji: "😰", description: "Fear of negative marks" },
  ]

  return (
    <div className="space-y-2">
      <span className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
        Quick Topics
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {prompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(p.text)}
            className="flex flex-col text-left p-3 rounded-lg bg-surface border border-border hover:border-accent/50 hover:bg-surface-raised transition duration-150 disabled:opacity-55 disabled:cursor-not-allowed group"
          >
            <span className="text-xl mb-1">{p.emoji}</span>
            <span className="text-xs font-semibold text-text-primary group-hover:text-accent transition duration-150 mb-0.5 line-clamp-1">
              {p.text}
            </span>
            <span className="text-[10px] text-text-secondary line-clamp-1">
              {p.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
