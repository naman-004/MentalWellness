import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Conversation, ChatMessage } from '../types/chat'

interface ChatState {
  conversations: Conversation[]
  activeConversationId: string | null
  createConversation: (title: string, customId?: string) => string
  addMessage: (conversationId: string, message: ChatMessage) => void
  updateLastMessage: (conversationId: string, content: string) => void // update content for streaming
  setActive: (id: string | null) => void
  deleteConversation: (id: string) => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      conversations: [],
      activeConversationId: null,
      createConversation: (title, customId) => {
        const id = customId || crypto.randomUUID()
        const now = new Date().toISOString()
        const newConversation: Conversation = {
          id,
          title,
          messages: [],
          createdAt: now,
          lastMessageAt: now,
        }
        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          activeConversationId: id,
        }))
        return id
      },
      addMessage: (conversationId, message) =>
        set((state) => ({
          conversations: state.conversations.map((c) => {
            if (c.id === conversationId) {
              const updatedMessages = [...c.messages, message]
              return {
                ...c,
                messages: updatedMessages,
                lastMessageAt: message.timestamp,
              }
            }
            return c
          }),
        })),
      updateLastMessage: (conversationId, content) =>
        set((state) => ({
          conversations: state.conversations.map((c) => {
            if (c.id === conversationId) {
              const messages = [...c.messages]
              if (messages.length > 0) {
                const lastIdx = messages.length - 1
                messages[lastIdx] = {
                  ...messages[lastIdx],
                  content,
                }
              }
              return {
                ...c,
                messages,
                lastMessageAt: new Date().toISOString(),
              }
            }
            return c
          }),
        })),
      setActive: (id) => set({ activeConversationId: id }),
      deleteConversation: (id) =>
        set((state) => {
          const updatedConversations = state.conversations.filter((c) => c.id !== id)
          const nextActiveId =
            state.activeConversationId === id
              ? updatedConversations[0]?.id || null
              : state.activeConversationId
          return {
            conversations: updatedConversations,
            activeConversationId: nextActiveId,
          }
        }),
    }),
    {
      name: 'zenpath-chat',
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
      }),
    }
  )
)
