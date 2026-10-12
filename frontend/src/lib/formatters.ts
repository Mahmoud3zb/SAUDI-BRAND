/**
 * Formats a numeric amount in Egyptian Pounds (EGP) using the Arabic locale.
 */
export function formatEGP(amount: number): string {
  try {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${amount} ج.م`
  }
}
