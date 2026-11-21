import { STORE_WHATSAPP_INTL } from '../constants/egypt-regions.ts'
import { useSettingsStore } from '../../settings/settings.store.ts'

export interface WhatsAppOrderDetails {
  orderId?: string
  customerName: string
  customerPhone: string
  city: string
  district?: string
  street: string
  notes?: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  subtotal: number
  shippingFee: number
  totalAmount: number
  paymentMethod: string
}

export function formatWhatsAppMessage(data: WhatsAppOrderDetails): string {
  let paymentTitle = 'الدفع عند الاستلام (نقداً للمندوب)'
  if (data.paymentMethod === 'vodafone_cash') {
    paymentTitle = 'فودافون كاش (Vodafone Cash)'
  } else if (data.paymentMethod === 'instapay') {
    paymentTitle = 'انستاباي (InstaPay)'
  }

  const itemsFormatted = data.items
    .map(
      (item, idx) =>
        `▪️ ${idx + 1}. *${item.name}*\n   الكمية: ${item.quantity} × السعر: ${item.price} ج.م = *${item.quantity * item.price} ج.م*`
    )
    .join('\n\n')

  return `مرحباً، أود تأكيد الطلب التالي من المتجر: 🛍️✨

${data.orderId ? `📌 *رقم الأوردر:* #${data.orderId.slice(-6).toUpperCase()}\n` : ''}👤 *اسم المستلم:* ${data.customerName}
📱 *رقم الموبايل:* ${data.customerPhone}
📍 *المحافظة:* ${data.city}
🏠 *العنوان بالتفصيل:* ${data.street}${data.district ? ` (حي: ${data.district})` : ''}
${data.notes ? `📝 *ملاحظات التوصيل:* ${data.notes}\n` : ''}
📦 *المنتجات المطلوبة:*
-----------------------------
${itemsFormatted}
-----------------------------

💵 *المجموع الفرعي:* ${data.subtotal} ج.م
🚚 *مصاريف الشحن (${data.city}):* ${data.shippingFee} ج.م
💰 *المبلغ الإجمالي المطلوب:* *${data.totalAmount} ج.م*
💳 *طريقة الدفع:* ${paymentTitle}

يرجى تأكيد تجهيز الأوردر وميعاد الشحن، شكراً لكم! 🤍`
}

export function buildWhatsAppLink(message: string, phoneIntl?: string): string {
  const activeIntl = phoneIntl || useSettingsStore.getState().whatsappNumberIntl || STORE_WHATSAPP_INTL
  return `https://wa.me/${activeIntl}?text=${encodeURIComponent(message)}`
}

