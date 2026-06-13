import { describe, it, expect } from 'vitest'
import { detectCrisisSignals, toGeminiContents } from '../src/api/chatCompanion'
import { ChatMessage } from '../src/types/chat'

describe('chatCompanion Tests', () => {
  describe('detectCrisisSignals', () => {
    it('returns true when a message contains acute stress or exam crisis keywords', () => {
      expect(detectCrisisSignals('I want to give up on exam')).toBe(true)
      expect(detectCrisisSignals("I just feel like I can't do this anymore")).toBe(true)
      expect(detectCrisisSignals("rather die than fail this JEE")).toBe(true)
    })

    it('returns false for typical non-crisis inputs containing partial words', () => {
      expect(detectCrisisSignals('I gave up sugar today')).toBe(false)
      expect(detectCrisisSignals('I want to work on my exam backlog')).toBe(false)
      expect(detectCrisisSignals('parents want me to do well')).toBe(false)
    })
  })

  describe('toGeminiContents', () => {
    const createMessage = (role: 'user' | 'assistant', content: string): ChatMessage => ({
      id: Math.random().toString(),
      role,
      content,
      timestamp: new Date().toISOString(),
    })

    it('translates assistant role to model for the Gemini SDK adapter requirements', () => {
      const messages = [
        createMessage('user', 'Help me study.'),
        createMessage('assistant', 'Sure! Let us start.'),
      ]
      const geminiFormat = toGeminiContents(messages)
      
      expect(geminiFormat[0].role).toBe('user')
      expect(geminiFormat[1].role).toBe('model')
      expect(geminiFormat[1].parts[0].text).toBe('Sure! Let us start.')
    })

    it('caps history messages list at the last 10 items for context window efficiency', () => {
      const messages: ChatMessage[] = Array.from({ length: 15 }, (_, i) => 
        createMessage(i % 2 === 0 ? 'user' : 'assistant', `Message ${i}`)
      )
      
      const geminiFormat = toGeminiContents(messages)
      expect(geminiFormat.length).toBe(10)
      // First item in 10-cap should be the 5th message (index 5)
      expect(geminiFormat[0].parts[0].text).toBe('Message 5')
      expect(geminiFormat[9].parts[0].text).toBe('Message 14')
    })
  })
})
