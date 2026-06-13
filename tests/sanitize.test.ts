import { describe, it, expect } from 'vitest'
import { sanitizeText } from '../src/utils/sanitize'

describe('sanitizeText Tests', () => {
  it('removes script tags and everything inside them', () => {
    expect(sanitizeText('<script>alert(1)</script>hello')).toBe('hello')
  })

  it('strips HTML elements but keeps text contents', () => {
    expect(sanitizeText('<b>bold</b>')).toBe('bold')
  })

  it('handles nested HTML and trims whitespace', () => {
    const input = '   <div><span>Nested text</span></div>   '
    expect(sanitizeText(input)).toBe('Nested text')
  })

  it('removes inline event handlers like onclick and javascript: links', () => {
    const inputClick = '<div onclick="hack()">Safe Text</div>'
    const inputLink = '<a href="javascript:alert(1)">Click Here</a>'
    
    expect(sanitizeText(inputClick)).toBe('Safe Text')
    expect(sanitizeText(inputLink)).toBe('Click Here')
  })

  it('throws an error if string length exceeds maximum bounds', () => {
    const hugeText = 'a'.repeat(20)
    expect(() => sanitizeText(hugeText, 10)).toThrow()
  })

  it('returns empty string on empty input', () => {
    expect(sanitizeText('')).toBe('')
  })
})
