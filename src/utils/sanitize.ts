/**
 * Sanitizes user-entered text before passing it to Claude or processing it locally.
 * Strips HTML tags, removes script content/patterns, and enforces length limits.
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
  
  return sanitized.trim()
}
