/**
 * @module userStore
 * @description Zustand store for managing User Profile and Gemini API Key.
 * Persisted to localStorage under the `zenpath-user` namespace.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserProfile } from '../types/user'
import { validateApiKeyFormat, securityLog } from '../utils/security'

/** Zustand state interface for user profile and API key management. */
interface UserState {
  profile: UserProfile | null
  apiKey: string // Obfuscated via btoa when stored
  setProfile: (profile: UserProfile | null) => void
  updateProfile: (profile: Partial<UserProfile>) => void
  setApiKey: (key: string) => void
  clearAll: () => void
}

/**
 * Zustand store for managing User Profile and Gemini API Key.
 *
 * SECURITY NOTE & LIMITATION:
 * The API key is stored in localStorage obfuscated using the browser's native `btoa` function.
 * This is a basic, weak obfuscation technique to prevent casual plaintext inspection of
 * localStorage or shoulder-surfing. It does NOT provide cryptographic security. Anyone with
 * access to the device or executing malicious scripts could easily decrypt it via `atob`.
 */
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: null,
      apiKey: '',
      setProfile: (profile) => set({ profile }),
      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        })),
      setApiKey: (key) => {
        // Validate format before storing
        if (key && !validateApiKeyFormat(key)) {
          securityLog('KEY_VALIDATION_FAILURE', { keyLength: key.length })
        }
        // Obfuscate with btoa. If empty, keep empty.
        set({ apiKey: key ? btoa(key) : '' })
      },
      clearAll: () => set({ profile: null, apiKey: '' }),
    }),
    {
      name: 'zenpath-user',
    }
  )
)

/**
 * Selector helper to get the decrypted (decoded) API Key from the store.
 *
 * @returns The plain-text API key, or empty string if not set or decryption fails
 */
export const getDecryptedApiKey = (): string => {
  const apiKey = useUserStore.getState().apiKey
  if (!apiKey) return ''
  try {
    return atob(apiKey)
  } catch (e) {
    console.error('Failed to decrypt API Key', e)
    return ''
  }
}
