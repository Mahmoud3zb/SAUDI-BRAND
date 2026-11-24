import { useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Copy,
  HelpCircle,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Truck,
  User,
  Wallet,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Button } from '../../../components/ui/Button.tsx'
import { Input } from '../../../components/ui/Input.tsx'
import { useCartStore, useCartSubtotal } from '../../cart/cart.store.ts'
import { formatEGP } from '../../../lib/formatters.ts'
import { checkoutApi } from '../api/checkout.api.ts'
import {
  EGYPT_GOVERNORATES,
  getGovernorateShippingFee,
} from '../constants/egypt-regions.ts'
import { useSettingsStore } from '../../settings/settings.store.ts'
import { buildWhatsAppLink, formatWhatsAppMessage } from '../utils/whatsapp.ts'

export function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)
  const subtotal = useCartSubtotal()
  const defaultNum = useSettingsStore((state) => state.whatsappNumber)
  const defaultIntl = useSettingsStore((state) => state.whatsappNumberIntl)
  const contactChannels = useSettingsStore((state) => state.contactChannels)

  const ordersWhatsappIntl = contactChannels?.orders?.intl || defaultIntl
  const walletNumber = contactChannels?.wallet?.number || defaultNum
  const walletHolder = contactChannels?.wallet?.accountName || 'سعودي براند'
  const supportNumber = contactChannels?.support?.number || defaultNum

  // Form State
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [city, setCity] = useState(EGYPT_GOVERNORATES[0].name)
  const [district, setDistrict] = useState('')
  const [street, setStreet] = useState('')
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'vodafone_cash' | 'instapay'>('cod')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const copyToClipboard = (text: string, label: string) => {
    try {
      navigator.clipboard.writeText(text)
      toast.success(`تم نسخ ${label} بنجاح 📋: ${text}`)
    } catch {
      toast.info(`${label}: ${text}`)
    }
  }

  // Dynamic Shipping Fee based on Settings & Egyptian Governorate
  const shippingRates = useSettingsStore((state) => state.shippingRates)
  const shippingFee = getGovernorateShippingFee(city, shippingRates)
  const grandTotal = subtotal + shippingFee

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 text-center font-sans" dir="rtl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-soft-pink text-brand-primary mb-5">
          <ShoppingBag className="h-10 w-10 stroke-[1.4]" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">سلة المشتريات فارغة</h2>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-8">
          لم تقومي بإضافة أي منتجات للسلة بعد. استكشفي تشكيلتنا الفاخرة واختاري ما يناسبكِ لإتمام طلبك.
        </p>
        <Link to="/products">
          <Button variant="primary" size="lg" className="rounded-full px-8 font-bold">
            ابدأي التسوق الآن
          </Button>
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerName.trim() || customerName.trim().length < 2) {
      toast.error('يرجى إدخال اسم المستلم ثنائياً على الأقل')
      return
    }

    // Validate Egyptian phone number (11 digits, starts with 010, 011, 012, or 015)
    let cleanPhone = customerPhone.trim().replace(/[\s\-()]/g, '')
    if (cleanPhone.startsWith('+20')) {
      cleanPhone = '0' + cleanPhone.slice(3)
    } else if (cleanPhone.startsWith('0020')) {
      cleanPhone = '0' + cleanPhone.slice(4)
    } else if (cleanPhone.length === 10 && /^[1][0125]/.test(cleanPhone)) {
      cleanPhone = '0' + cleanPhone
    }

    const egyptianPhoneRegex = /^01[0125][0-9]{8}$/
    if (!egyptianPhoneRegex.test(cleanPhone)) {
      toast.error('يرجى إدخال رقم موبايل مصري صحيح مكون من 11 رقماً يبدأ بـ 01')
      return
    }

    if (!street.trim() || street.trim().length < 5) {
      toast.error('يرجى إدخال تفاصيل العنوان والشارع بدقة (5 أحرف على الأقل)')
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        shippingAddress: {
          city,
          district: district.trim(),
          street: street.trim(),
          notes: notes.trim(),
        },
        paymentMethod,
        items: items.map((it) => ({
          productID: it.product.id,
          quantity: it.quantity,
        })),
      }

      // 1. Save in backend database (updates inventory and admin dashboard)
      const res = await checkoutApi.createOrder(payload)
      const order = res.order

      // 2. Prepare detailed WhatsApp message
      const waMessage = formatWhatsAppMessage({
        orderId: order._id,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        city,
        district: district.trim(),
        street: street.trim(),
        notes: notes.trim(),
        items: items.map((it) => ({
          name: it.product.name,
          quantity: it.quantity,
          price: it.product.price,
        })),
        subtotal,
        shippingFee,
        totalAmount: grandTotal,
        paymentMethod,
      })

      const waLink = buildWhatsAppLink(waMessage, ordersWhatsappIntl)

      // 3. Clear customer cart
      clearCart()

      // 4. Open WhatsApp directly in new tab
      try {
        window.open(waLink, '_blank')
      } catch {
        // Pop-up might be blocked by browser; will be accessible on the success page
      }

      toast.success(res.message || 'تم تسجيل طلبك بنجاح!')
      navigate(`/order-success/${order._id}`, {
        state: { order, waMessage, waLink },
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء إتمام الطلب، يرجى المحاولة مرة أخرى'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-sans" dir="rtl">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-xs text-gray-500">
        <Link to="/" className="hover:text-brand-primary">
          الرئيسية
        </Link>
        <span>/</span>
        <Link to="/products" className="hover:text-brand-primary">
          المنتجات
        </Link>
        <span>/</span>
        <span className="font-bold text-gray-900">إتمام الطلب عبر الواتساب</span>
      </div>

      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">إتمام وتأكيد الطلب</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            سجلي بياناتك وسيتم توجيهك فوراً للواتساب لتأكيد الشحن مع فريق خدمة العملاء 💬
          </p>
        </div>

        {/* WhatsApp Notice Pill */}
        <div className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-800 border border-emerald-200">
          <MessageCircle className="h-4 w-4 text-emerald-600" />
          <span>خدمة العملاء: {supportNumber}</span>
        </div>
      </div>

      <form noValidate onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Right Column: Customer Info & Shipping Address (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Customer Contact Info */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
                <div className="h-8 w-8 rounded-full bg-brand-soft-pink flex items-center justify-center text-brand-primary font-bold text-xs">
                  1
                </div>
                <h2 className="text-base font-bold text-gray-900">بيانات المستلم</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    الاسم بالكامل <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="اكتب اسمك بالكامل"
                    startIcon={<User className="h-4 w-4 text-gray-400" />}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    رقم الموبايل (واتساب) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    required
                    dir="ltr"
                    placeholder="01xxxxxxxxx"
                    startIcon={<Phone className="h-4 w-4 text-gray-400" />}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    يجب أن يكون رقم مصري متاح عليه خدمة الواتساب لتأكيد الشحن
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Address & Egyptian Governorate */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
                <div className="h-8 w-8 rounded-full bg-brand-soft-pink flex items-center justify-center text-brand-primary font-bold text-xs">
                  2
                </div>
                <h2 className="text-base font-bold text-gray-900">عنوان التوصيل (مصر)</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Governorate */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      المحافظة <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs sm:text-sm text-gray-800 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 cursor-pointer"
                      >
                        {EGYPT_GOVERNORATES.map((gov) => {
                          const fee = getGovernorateShippingFee(gov.name, shippingRates)
                          return (
                            <option key={gov.name} value={gov.name}>
                              {gov.name} (شحن: {fee} ج.م)
                            </option>
                          )
                        })}
                      </select>
                    </div>
                  </div>

                  {/* District / City */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      المنطقة / الحي / المركز <span className="text-gray-400 font-normal">(اختياري)</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="اسم المنطقة أو الحي أو المركز..."
                      startIcon={<MapPin className="h-4 w-4 text-gray-400" />}
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                    />
                  </div>
                </div>

                {/* Street details */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    العنوان بالتفصيل <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="اسم الشارع، رقم العمارة، رقم الشقة، علامة مميزة..."
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  />
                </div>

                {/* Delivery Notes */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    ملاحظات التوصيل للمندوب <span className="text-gray-400 font-normal">(اختياري)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="أي تعليمات إضافية مثل ميعاد التسليم المفضل أو التوصيل لحارس العقار..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method Options */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
                <div className="h-8 w-8 rounded-full bg-brand-soft-pink flex items-center justify-center text-brand-primary font-bold text-xs">
                  3
                </div>
                <h2 className="text-base font-bold text-gray-900">طريقة الدفع المفضلة</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Cash on Delivery (COD) */}
                <label
                  className={`flex flex-col justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-brand-primary bg-brand-soft-pink/30 shadow-xs ring-1 ring-brand-primary/30'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900">
                      <Truck className="h-4 w-4 text-brand-primary" />
                      <span>الدفع عند الاستلام</span>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="text-brand-primary focus:ring-brand-primary"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-2">
                    ادفعي نقداً للمندوب عند وصول الشحنة لباب بيتك
                  </p>
                </label>

                {/* 2. Vodafone Cash */}
                <label
                  className={`flex flex-col justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'vodafone_cash'
                      ? 'border-brand-primary bg-brand-soft-pink/30 shadow-xs ring-1 ring-brand-primary/30'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900">
                      <Wallet className="h-4 w-4 text-brand-primary" />
                      <span>فودافون كاش</span>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="vodafone_cash"
                      checked={paymentMethod === 'vodafone_cash'}
                      onChange={() => setPaymentMethod('vodafone_cash')}
                      className="text-brand-primary focus:ring-brand-primary"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2">
                    <span>تحويل لمحفظة {walletHolder}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(walletNumber, 'رقم فودافون كاش')
                      }}
                      className="inline-flex items-center gap-1 font-mono font-bold text-brand-primary px-1.5 py-0.5 rounded bg-brand-soft-pink/60 hover:bg-brand-soft-pink transition-colors cursor-pointer"
                      title="نسخ رقم المحفظة"
                    >
                      <span>{walletNumber}</span>
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </label>

                {/* 3. InstaPay */}
                <label
                  className={`flex flex-col justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'instapay'
                      ? 'border-brand-primary bg-brand-soft-pink/30 shadow-xs ring-1 ring-brand-primary/30'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900">
                      <HelpCircle className="h-4 w-4 text-brand-primary" />
                      <span>انستاباي (InstaPay)</span>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="instapay"
                      checked={paymentMethod === 'instapay'}
                      onChange={() => setPaymentMethod('instapay')}
                      className="text-brand-primary focus:ring-brand-primary"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2">
                    <span>تحويل لحساب {walletHolder}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(walletNumber, 'رقم انستاباي')
                      }}
                      className="inline-flex items-center gap-1 font-mono font-bold text-brand-primary px-1.5 py-0.5 rounded bg-brand-soft-pink/60 hover:bg-brand-soft-pink transition-colors cursor-pointer"
                      title="نسخ رقم انستاباي"
                    >
                      <span>{walletNumber}</span>
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </label>
              </div>

              {/* Payment Note Box */}
              {(paymentMethod === 'vodafone_cash' || paymentMethod === 'instapay') && (
                <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
                  💡 <strong>ملاحظة التحويل:</strong> عند الضغط على تأكيد الطلب، سيتم فتح محادثة الواتساب مباشرة مع فريق المتجر لمساعدتك في إتمام التحويل وتأكيد شحن طلبك فوراً.
                </div>
              )}
            </div>
          </div>

          {/* Left Column: Order Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center justify-between">
                <span>ملخص الأوردر</span>
                <span className="text-xs text-gray-500">{items.length} منتجات</span>
              </h3>

              {/* Items List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 pr-1">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="py-3 flex items-center gap-3 first:pt-0 last:pb-0">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-brand-soft-pink/30">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-brand-primary/40">
                          <Package className="h-6 w-6 stroke-[1.2]" />
                        </div>
                      )}
                      <span className="absolute -top-1 -end-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-primary px-1 text-[10px] font-bold text-white shadow-xs">
                        {quantity}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">{product.name}</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {quantity} × {formatEGP(product.price)}
                      </p>
                    </div>

                    <span className="text-xs font-bold text-gray-900 shrink-0">
                      {formatEGP(product.price * quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals Breakdown */}
              <div className="border-t border-gray-100 pt-4 space-y-2.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span className="font-bold text-gray-900">{formatEGP(subtotal)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>مصاريف الشحن ({city}):</span>
                  <span className="font-bold text-gray-900">{formatEGP(shippingFee)}</span>
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-sm font-black text-gray-900">
                  <span>المبلغ الإجمالي للدفع:</span>
                  <span className="text-lg text-brand-primary">{formatEGP(grandTotal)}</span>
                </div>
              </div>

              {/* Submit CTA - Direct WhatsApp Order Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                className="w-full font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-4 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isSubmitting ? (
                  <span>جاري تسجيل الطلب وفتح الواتساب...</span>
                ) : (
                  <>
                    <MessageCircle className="h-5 w-5 fill-white/20" />
                    <span>تأكيد الطلب وإرسال عبر الواتساب</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-[11px] text-center text-gray-400 leading-tight">
                * عند الضغط سيتم تسجيل الأوردر وفتح محادثة الواتساب فوراً مع المتجر لإتمام الشحن.
              </p>

              <div className="text-center pt-1">
                <Link
                  to="/products"
                  className="text-xs text-gray-400 hover:text-brand-primary transition-colors"
                >
                  العودة لمتابعة التسوق
                </Link>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-brand-soft-pink/20 rounded-2xl p-4 border border-brand-soft-pink/60 flex items-center justify-around text-center text-[11px] text-gray-600 font-semibold">
              <div className="flex flex-col items-center gap-1">
                <Clock className="h-4 w-4 text-brand-primary" />
                <span>شحن وتوصيل سريع</span>
              </div>
              <div className="h-6 w-px bg-brand-soft-pink" />
              <div className="flex flex-col items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-brand-primary" />
                <span>معاينة قبل الاستلام</span>
              </div>
              <div className="h-6 w-px bg-brand-soft-pink" />
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-brand-primary" />
                <span>دعم فوري على الواتساب</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
