export interface GovernorateInfo {
  name: string
  region: 'cairo' | 'delta' | 'said'
  shippingFee: number
}

export const EGYPT_GOVERNORATES: GovernorateInfo[] = [
  // القاهرة الكبرى (100 ج.م)
  { name: 'القاهرة', region: 'cairo', shippingFee: 100 },
  { name: 'الجيزة', region: 'cairo', shippingFee: 100 },

  // الدلتا ومدن القناة والساحل (80 ج.م)
  { name: 'الإسكندرية', region: 'delta', shippingFee: 80 },
  { name: 'القليوبية', region: 'delta', shippingFee: 80 },
  { name: 'الدقهلية (المنصورة)', region: 'delta', shippingFee: 80 },
  { name: 'الشرقية (الزقازيق)', region: 'delta', shippingFee: 80 },
  { name: 'الغربية (طنطا)', region: 'delta', shippingFee: 80 },
  { name: 'المنوفية', region: 'delta', shippingFee: 80 },
  { name: 'دمياط', region: 'delta', shippingFee: 80 },
  { name: 'كفر الشيخ', region: 'delta', shippingFee: 80 },
  { name: 'البحيرة (دمنهور)', region: 'delta', shippingFee: 80 },
  { name: 'بورسعيد', region: 'delta', shippingFee: 80 },
  { name: 'الإسماعيلية', region: 'delta', shippingFee: 80 },
  { name: 'السويس', region: 'delta', shippingFee: 80 },

  // الصعيد والوجه القبلي والمحافظات الحدودية (60 ج.م)
  { name: 'الفيوم', region: 'said', shippingFee: 60 },
  { name: 'بني سويف', region: 'said', shippingFee: 60 },
  { name: 'المنيا', region: 'said', shippingFee: 60 },
  { name: 'أسيوط', region: 'said', shippingFee: 60 },
  { name: 'سوهاج', region: 'said', shippingFee: 60 },
  { name: 'قنا', region: 'said', shippingFee: 60 },
  { name: 'الأقصر', region: 'said', shippingFee: 60 },
  { name: 'أسوان', region: 'said', shippingFee: 60 },
  { name: 'البحر الأحمر (الغردقة)', region: 'said', shippingFee: 60 },
  { name: 'الوادي الجديد', region: 'said', shippingFee: 60 },
  { name: 'مطروح والساحل الشمالي', region: 'said', shippingFee: 60 },
  { name: 'شمال سيناء', region: 'said', shippingFee: 60 },
  { name: 'جنوب سيناء (شرم الشيخ)', region: 'said', shippingFee: 60 },
]

export const STORE_WHATSAPP_NUMBER = '01006488707'
export const STORE_WHATSAPP_INTL = '201006488707'

export function getGovernorateShippingFee(
  govName: string,
  customRates?: { cairoGiza: number; delta: number; said: number }
): number {
  const match =
    EGYPT_GOVERNORATES.find((g) => g.name === govName) ||
    EGYPT_GOVERNORATES.find((g) => govName.includes(g.name) || g.name.includes(govName))

  const region = match?.region || 'cairo'
  if (customRates) {
    if (region === 'said') return customRates.said
    if (region === 'delta') return customRates.delta
    return customRates.cairoGiza
  }

  if (match) return match.shippingFee
  return 100
}

