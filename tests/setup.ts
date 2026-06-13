import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock browser APIs if needed (e.g., crypto.randomUUID)
if (!global.crypto) {
  Object.defineProperty(global, 'crypto', {
    value: {
      randomUUID: () => 'test-uuid-1234',
    },
  })
}
