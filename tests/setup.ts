import '@testing-library/jest-dom'


// Mock browser APIs if needed (e.g., crypto.randomUUID)
if (!global.crypto) {
  Object.defineProperty(global, 'crypto', {
    value: {
      randomUUID: () => 'test-uuid-1234',
    },
  })
}
