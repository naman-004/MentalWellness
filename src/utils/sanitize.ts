/**
 * @module sanitize
 * @description Input sanitization utilities for ZenPath.
 *
 * Sanitizes user-entered text before passing it to Google Gemini or processing it locally.
 * Strips HTML tags, removes script content/patterns, blocks dangerous URI schemes,
 * and enforces length limits.
 *
 * @see {@link ../utils/security.ts} for additional prompt injection defenses.
 */

import { sanitizeForPromptInjection } from './security'

/**
 * Sanitizes user-entered text by stripping HTML, event handlers, dangerous URI schemes,
 * and applying prompt injection defenses.
 *
 * Processing pipeline:
 * 1. Length validation (throws on overflow)
 * 2. Script tag removal (including content)
 * 3. Inline event handler removal (onclick, onerror, etc.)
 * 4. HTML tag stripping (preserves text content)
 * 5. Dangerous URI scheme removal (javascript:, data:text/html, vbscript:)
 * 6. Prompt injection pattern neutralization
 *
 * @param input - The raw user text to sanitize
 * @param maxLength - Maximum allowed character length (default: 5000)
 * @returns The sanitized, trimmed text
 * @throws {Error} If `input` exceeds `maxLength`
 *
 * @example
 * ```ts
 * sanitizeText('<script>alert(1)</script>hello')  // 'hello'
 * sanitizeText('<b>bold</b>')                     // 'bold'
 * sanitizeText('a'.repeat(6000), 5000)            // throws Error
 * ```
 */
export function sanitizeText(input: string, maxLength = 5000): string {
  if (!input) return ''
  
  if (input.length > maxLength) {
    throw new Error(`Input exceeds maximum allowed length of ${maxLength} characters.`)
  }

  let sanitized = input
  
  // 1. Remove script tags and all content inside them
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // 2. Remove common inline event handlers (e.g., onload, onclick, onerror)
  sanitized = sanitized.replace(/on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '')
  
  // 3. Strip all other HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '')

  // 4. Remove javascript: pseudo-protocol patterns
  sanitized = sanitized.replace(/javascript\s*:/gi, '')

  // 5. Remove data:text/html URI scheme (XSS vector)
  sanitized = sanitized.replace(/data\s*:\s*text\/html/gi, '')

  // 6. Remove vbscript: pseudo-protocol patterns
  sanitized = sanitized.replace(/vbscript\s*:/gi, '')

  // 7. Apply prompt injection defense
  sanitized = sanitizeForPromptInjection(sanitized)
  
  return sanitized.trim()
}
