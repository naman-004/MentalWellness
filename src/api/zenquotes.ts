export interface Quote {
  text: string
  author: string
}

export const MOUNT_QUOTES: Quote[] = [
  { text: "Your worth is not defined by a exam score or a rank. You are valuable just as you are.", author: "ZenPath" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Your focus determines your reality.", author: "Qui-Gon Jinn" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Consistency is key. Small efforts repeated day after day lead to success.", author: "Robert Collier" },
  { text: "Do not fear failure but rather fear not trying.", author: "Roy T. Bennett" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "Calm mind brings inner strength and self-confidence, so that's very important for good health.", author: "Dalai Lama" },
  { text: "You are not a percentage or a percentile. You are a whole person with a future.", author: "ZenPath" },
  { text: "Rest is not laziness. It is a vital part of your preparation.", author: "ZenPath" },
  { text: "Your study hours do not define your human value.", author: "ZenPath" },
  { text: "Mistakes are proof that you are trying and learning.", author: "Unknown" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Your potential is infinite, regardless of what any answer key says.", author: "ZenPath" },
  { text: "A single test cannot measure the depth of your character or your intelligence.", author: "ZenPath" },
  { text: "Quiet the mind and the soul will speak.", author: "Ma Jaya Sati Bhagavati" },
  { text: "Be kind to yourself. You are navigating a challenging journey.", author: "ZenPath" },
  { text: "One exam doesn't define a life. Your path is uniquely yours to build.", author: "ZenPath" },
  { text: "Give yourself credit for the effort you put in today, no matter the outcome.", author: "ZenPath" },
  { text: "Growth happens when we step forward, not when we score perfectly.", author: "ZenPath" },
  { text: "You are allowed to make mistakes. You are allowed to be tired.", author: "ZenPath" },
  { text: "It is okay to take a break when things get overwhelming.", author: "ZenPath" },
  { text: "Focus on progress, not perfection.", author: "Bill Gates" },
  { text: "Don't let yesterday take up too much of today.", author: "Will Rogers" },
  { text: "You have survived 100% of your hardest days. You can handle today too.", author: "Unknown" },
  { text: "The best way to predict the future is to create it.", author: "Abraham Lincoln" },
  { text: "Study to learn, not just to clear a cutoff. Curiosity makes study effortless.", author: "ZenPath" },
  { text: "Your grades are a reflection of a moment in time, not your intelligence.", author: "ZenPath" },
  { text: "Self-care is a study strategy. A clear brain retains more.", author: "ZenPath" },
  { text: "A negative result is just feedback, not a dead end.", author: "ZenPath" },
  { text: "You are much more than the sum of your competitive exam attempts.", author: "ZenPath" },
  { text: "Your family and friends value your presence, not your mock test rankings.", author: "ZenPath" },
  { text: "Breathe. You are doing the best you can.", author: "ZenPath" },
  { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
  { text: "Difficulty is a filter. Staying calm during difficulty is your superpower.", author: "ZenPath" },
  { text: "A peaceful mind leads to clear decisions.", author: "ZenPath" },
  { text: "No number on a score sheet can capture your creativity, empathy, and kindness.", author: "ZenPath" },
  { text: "Let go of the need to control the outcome. Focus purely on the present task.", author: "ZenPath" },
  { text: "Do not compare your Chapter 1 to someone else's Chapter 20.", author: "Unknown" },
  { text: "Your speed doesn't matter, forward is forward.", author: "Unknown" },
  { text: "There is life beyond competitive exams, and it is beautiful.", author: "ZenPath" },
  { text: "Trust the process. Every hour of focused effort adds to your growth.", author: "ZenPath" },
  { text: "You are worthy of happiness and peace, regardless of your productivity.", author: "ZenPath" },
  { text: "Your identity is vast. Do not let an exam confine it.", author: "ZenPath" },
  { text: "Be proud of how hard you are trying.", author: "Unknown" },
  { text: "Small progress is still progress.", author: "Unknown" },
  { text: "The goal is understanding, not just scoring.", author: "ZenPath" },
  { text: "Keep your eyes on your own path. Your journey is yours alone.", author: "ZenPath" },
  { text: "You are strong, resilient, and capable of handling whatever comes.", author: "ZenPath" },
  { text: "Your mind is a garden. Plant thoughts of hope and patience.", author: "ZenPath" }
]

interface DailyQuoteCache {
  quote: Quote
  dateString: string
}

/**
 * Returns the quote of the day.
 * Caches the selected quote in localStorage so that it updates exactly once per calendar day.
 */
export function getDailyQuote(): Quote {
  const cacheKey = 'zenpath-daily-quote'
  const todayStr = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const cached = localStorage.getItem(cacheKey)

  if (cached) {
    try {
      const parsed: DailyQuoteCache = JSON.parse(cached)
      if (parsed.dateString === todayStr) {
        return parsed.quote
      }
    } catch (e) {
      console.error('Failed to parse daily quote cache', e)
    }
  }

  // Choose a quote based on the day of the month or a pseudo-random index
  // We can use a combination of day of year or deterministic math to prevent
  // picking the exact same quote if the user refreshes, but keeping it stable for the day.
  const d = new Date()
  const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000)
  const index = dayOfYear % MOUNT_QUOTES.length
  const selectedQuote = MOUNT_QUOTES[index]

  const newCache: DailyQuoteCache = {
    quote: selectedQuote,
    dateString: todayStr
  }

  localStorage.setItem(cacheKey, JSON.stringify(newCache))
  return selectedQuote
}

export function getRandomQuote(): Quote {
  const index = Math.floor(Math.random() * MOUNT_QUOTES.length)
  return MOUNT_QUOTES[index]
}
