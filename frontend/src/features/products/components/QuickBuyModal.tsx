import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  CheckCircle2,
  Loader2,
  MapPin,
  Minus,
  Phone,
  Plus,
  ShieldCheck,
  Truck,
  User,
  X,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatEGP } from '../../../lib/formatters.ts'
import { checkoutApi } from '../../checkout/api/checkout.api.ts'
import {
  EGYPT_GOVERNORATES,
  getGovernorateShippingFee,
} from '../../checkout/constants/egypt-regions.ts'
import type { Product } from '../../../types/product.ts'

interface QuickBuyModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product
  initialQuantity?: number
}

export function QuickBuyModal({
  isOpen,
  onClose,
  product,
  initialQuantity = 1,
}: QuickBuyModalProps) {
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(initialQuantity)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [city, setCity] = useState(EGYPT_GOVERNORATES[0]?.name || 'القاهرة')
  const [street, setStreet] = useState('')
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'vodafone_cash' | 'instapay'>('cod')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const maxStock = product.stockQuantity !== undefined ? product.stockQuantity : 999
  const subtotal = product.price * quantity
  const shippingFee = getGovernorateShippingFee(city)
  const total = subtotal + shippingFee

  const handleDecrement = () => setQuantity((q) => Math.max(1, q - 1))
  const handleIncrement = () => {
    if (quantity >= maxStock) {
      toast.warning(`الكمية المتاحة هي ${maxStock} فقط`)
      return
    }
    setQuantity((q) => q + 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedName = customerName.trim()
    let cleanPhone = customerPhone.trim().replace(/[\s\-()]/g, '')
    const trimmedStreet = street.trim()

    if (!trimmedName || trimmedName.length < 2) {
      toast.error('يرجى إدخال اسم المستلم بالكامل')
      return
    }

    // Standardize Egyptian phone number (handles +20, 0020, 20, or 10-digit formats)
    if (cleanPhone.startsWith('+20')) {
      cleanPhone = '0' + cleanPhone.slice(3)
    } else if (cleanPhone.startsWith('0020')) {
      cleanPhone = '0' + cleanPhone.slice(4)
    } else if (cleanPhone.startsWith('20') && cleanPhone.length === 12) {
      cleanPhone = '0' + cleanPhone.slice(2)
    } else if (cleanPhone.length === 10 && /^[1][0125]/.test(cleanPhone)) {
      cleanPhone = '0' + cleanPhone
    }

    const egyptianPhoneRegex = /^01[0125][0-9]{8}$/
    if (!egyptianPhoneRegex.test(cleanPhone)) {
      toast.error('يرجى إدخال رقم موبايل مصري صحيح مكون من 11 رقماً يبدأ بـ 01')
      return
    }

    if (!trimmedStreet || trimmedStreet.length < 4) {
      toast.error('يرجى إدخال تفاصيل العنوان والشارع بدقة للتوصيل')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await checkoutApi.createOrder({
        customerName: trimmedName,
        customerPhone: cleanPhone,
        shippingAddress: {
          city,
          street: trimmedStreet,
          notes: notes.trim() || undefined,
        },
        paymentMethod,
        items: [
          {
            productID: product.id,
            quantity,
          },
        ],
      })

      const placedOrder = res?.order
      toast.success('تم تأكيد طلبك بنجاح! سيتم التواصل معك للتسليم')
      onClose()

      if (placedOrder?._id) {
        navigate(`/order-success/${placedOrder._id}`, {
          state: { order: placedOrder },
        })
      } else {
        navigate('/')
      }
    } catch (err: unknown) {
      const errMsg =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'حدث خطأ أثناء إتمام الطلب، يرجى المحاولة مرة أخرى'
      toast.error(errMsg || 'تعذر تسجيل الطلب')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-brand-soft-pink/30">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-primary text-white rounded-xl shadow-xs">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-gray-900">
                شراء سريع بنقرة واحدة
              </h2>
              <p className="text-[11px] text-gray-500">
                اطلب الآن وادفع عند الاستلام بضمان المعاينة
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-white/80 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form noValidate onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1 text-xs">
          {/* Product Mini Preview & Quantity */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-3">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded-xl border border-gray-200 bg-white shrink-0"
                />
              ) : null}
              <div>
                <h4 className="font-bold text-gray-900 line-clamp-1">{product.name}</h4>
                <span className="font-black text-brand-primary font-sans">
                  {formatEGP(product.price)}
                </span>
              </div>
            </div>

            {/* Quantity Controller */}
            <div className="inline-flex items-center rounded-xl border border-gray-200 bg-white p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={quantity <= 1}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-600 hover:bg-brand-soft-pink hover:text-brand-primary disabled:opacity-30 cursor-pointer"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-8 text-center text-xs font-bold text-gray-900 font-mono">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={quantity >= maxStock}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-600 hover:bg-brand-soft-pink hover:text-brand-primary disabled:opacity-30 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Customer Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                الاسم بالكامل *
              </label>
              <div className="relative">
                <User className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="اكتب اسم المستلم بالكامل"
                  className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-xs outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                رقم الموبايل (واتساب متاح عليه) *
              </label>
              <div className="relative">
                <Phone className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  dir="ltr"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-xs outline-hidden text-right font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  المحافظة *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-xs outline-hidden bg-white cursor-pointer"
                >
                  {EGYPT_GOVERNORATES.map((gov) => (
                    <option key={gov.name} value={gov.name}>
                      {gov.name} ({gov.shippingFee} ج.م شحن)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  العنوان بالتفصيل *
                </label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="اسم الشارع، رقم العمارة، الشقة أو علامة مميزة"
                    className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-xs outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                ملاحظات للتوصيل (اختياري)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أي تعليمات إضافية للتوصيل وميعاد الاستلام"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-xs outline-hidden"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
              طريقة الدفع
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'cod'
                    ? 'border-brand-primary bg-brand-primary/5 text-brand-primary font-bold shadow-2xs'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Truck className="h-4 w-4 mx-auto mb-1" />
                <span className="block text-[10px]">عند الاستلام (كاش)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('vodafone_cash')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'vodafone_cash'
                    ? 'border-rose-500 bg-rose-50 text-rose-700 font-bold shadow-2xs'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Phone className="h-4 w-4 mx-auto mb-1 text-rose-600" />
                <span className="block text-[10px]">فودافون كاش</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('instapay')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'instapay'
                    ? 'border-purple-500 bg-purple-50 text-purple-700 font-bold shadow-2xs'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                <span className="block text-[10px]">إنستاباي InstaPay</span>
              </button>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-1.5 font-sans">
            <div className="flex justify-between text-gray-500 text-[11px]">
              <span>قيمة المنتجات ({quantity} قطع):</span>
              <span>{formatEGP(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-500 text-[11px]">
              <span>مصاريف الشحن ({city}):</span>
              <span>{formatEGP(shippingFee)}</span>
            </div>
            <div className="flex justify-between text-gray-900 font-bold text-xs pt-1 border-t border-gray-200">
              <span>المجموع الكلي المطلوب:</span>
              <span className="text-brand-primary font-black text-sm">{formatEGP(total)}</span>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="flex items-center justify-around py-1 text-[10px] text-gray-500 border-t border-gray-100">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>معاينة قبل الاستلام</span>
            </span>
            <span className="flex items-center gap-1">
              <Truck className="h-3.5 w-3.5 text-brand-primary" />
              <span>توصيل سريع لكافة مصر</span>
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-black text-sm shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>جارٍ تأكيد الطلب فوراً...</span>
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                <span>تأكيد وشحن الأوردر الآن ({formatEGP(total)})</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

