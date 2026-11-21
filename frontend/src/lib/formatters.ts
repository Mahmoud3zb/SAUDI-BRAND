/**
 * Formats a numeric amount in Egyptian Pounds (EGP).
 * Uses clean formatted digits with comma separators followed by 'ج.م'.
 * Avoids browser-dependent Intl ar-EG punctuation and bidi glitches.
 * e.g. 7,000,120 ج.م or 150 ج.م
 */
export function formatEGP(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0 ج.م'
  }
  const formatted = Math.round(amount).toLocaleString('en-US')
  return `${formatted} ج.م`
}
