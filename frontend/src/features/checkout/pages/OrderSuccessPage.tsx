import { CheckCircle2, Copy, Home, MessageCircle, PackageCheck, ShoppingBag, Wallet } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router'
import { toast } from 'sonner'
import { Button } from '../../../components/ui/Button.tsx'
import { formatEGP } from '../../../lib/formatters.ts'
import type { PlacedOrder } from '../api/checkout.api.ts'
import { useSettingsStore } from '../../settings/settings.store.ts'
import { buildWhatsAppLink } from '../utils/whatsapp.ts'

export function OrderSuccessPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const location = useLocation()
  const defaultNum = useSettingsStore((state) => state.whatsappNumber)
  const defaultIntl = useSettingsStore((state) => state.whatsappNumberIntl)
  const contactChannels = useSettingsStore((state) => state.contactChannels)

  const ordersNumber = contactChannels?.orders?.number || defaultNum
  const ordersIntl = contactChannels?.orders?.intl || defaultIntl
  const walletNumber = contactChannels?.wallet?.number || defaultNum
  const walletHolder = contactChannels?.wallet?.accountName || 'سعودي براند'

  const copyToClipboard = (text: string, label: string) => {
    try {
      navigator.clipboard.writeText(text)
      toast.success(`تم نسخ ${label} بنجاح 📋: ${text}`)
    } catch {
      toast.info(`${label}: ${text}`)
    }
  }

  const state = location.state as { order?: PlacedOrder; waLink?: string; waMessage?: string } | undefined
  const order = state?.order
  const waLink =
    state?.waLink ||
    (orderId
      ? buildWhatsAppLink(
          `مرحباً، أود الاستفسار ومتابعة حالة طلبي رقم: #${orderId.slice(-6).toUpperCase()} من المتجر.`,
          ordersIntl
        )
      : undefined)

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 font-sans" dir="rtl">
      {/* Celebration Header */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 text-center shadow-xs space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 animate-bounce">
          <CheckCircle2 className="h-10 w-10 stroke-[1.8]" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
            تم تسجيل طلبك بنجاح!
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            شكراً لطلبكِ من سعودي براند 👋
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            تم استلام تفاصيل الأوردر في النظام، ويسعدنا دائماً خدمتك وتأكيد الشحن معك عبر الواتساب فوراً.
          </p>
        </div>

        {/* Order Reference Number */}
        <div className="bg-brand-soft-pink/30 rounded-2xl p-4 max-w-sm mx-auto border border-brand-soft-pink/70 text-center">
          <span className="text-[11px] text-gray-500 block">رقم الأوردر المرجعي:</span>
          <span className="text-base sm:text-lg font-black text-brand-primary tracking-wider font-mono">
            #{orderId?.slice(-8).toUpperCase()}
          </span>
        </div>

        {/* Big WhatsApp Confirmation Action */}
        {waLink && (
          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold text-sm">
              <MessageCircle className="h-5 w-5 text-emerald-600" />
              <span>محادثة الواتساب لتأكيد الأوردر</span>
            </div>
            <p className="text-xs text-emerald-900/80 max-w-md mx-auto">
              إذا لم تفتح نافذة الواتساب تلقائياً، يمكنك الضغط على الزر التالي لإرسال تفاصيل الأوردر لفريق خدمة العملاء مباشرة.
            </p>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              <MessageCircle className="h-4 w-4" />
              <span>فتح المحادثة على الواتساب ({ordersNumber})</span>
            </a>
          </div>
        )}

        {/* Payment Instructions if Vodafone Cash or InstaPay */}
        {order?.paymentMethod === 'vodafone_cash' && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-start space-y-2 text-xs text-amber-900">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Wallet className="h-4 w-4 text-amber-600" />
              <span>تعليمات التحويل عبر فودافون كاش:</span>
            </div>
            <p className="flex flex-wrap items-center gap-1.5 pt-1">
              <span>1. يرجى تحويل المبلغ الإجمالي <strong>({formatEGP(order.totalPrice)})</strong> إلى محفظة فودافون كاش على الرقم:</span>
              <button
                type="button"
                onClick={() => copyToClipboard(walletNumber, 'رقم فودافون كاش')}
                className="inline-flex items-center gap-1 font-mono font-bold text-amber-950 px-2.5 py-1 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors cursor-pointer"
                title="اضغط لنسخ الرقم"
              >
                <span>{walletNumber}</span>
                <Copy className="h-3.5 w-3.5 text-amber-700" />
              </button>
              <span className="text-[11px] text-amber-800">(باسم: {walletHolder})</span>
            </p>
            <p>
              2. بعد إتمام التحويل، يرجى إرسال لقطة شاشة (سكرين شوت) للتحويل في شات الواتساب لتأكيد خروج الأوردر فوراً.
            </p>
          </div>
        )}

        {order?.paymentMethod === 'instapay' && (
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-start space-y-2 text-xs text-purple-900">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Wallet className="h-4 w-4 text-purple-600" />
              <span>تعليمات التحويل عبر انستاباي (InstaPay):</span>
            </div>
            <p className="flex flex-wrap items-center gap-1.5 pt-1">
              <span>1. يرجى تحويل المبلغ الإجمالي <strong>({formatEGP(order.totalPrice)})</strong> عبر تطبيق InstaPay إلى رقم الموبايل:</span>
              <button
                type="button"
                onClick={() => copyToClipboard(walletNumber, 'رقم انستاباي')}
                className="inline-flex items-center gap-1 font-mono font-bold text-purple-950 px-2.5 py-1 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors cursor-pointer"
                title="اضغط لنسخ الرقم"
              >
                <span>{walletNumber}</span>
                <Copy className="h-3.5 w-3.5 text-purple-700" />
              </button>
              <span className="text-[11px] text-purple-800">(حساب: {walletHolder})</span>
            </p>
            <p>
              2. يرجى إرسال إشعار أو سكرين شوت بالتحويل على الواتساب لتأكيد خروج الشحنة مع المندوب.
            </p>
          </div>
        )}

        {/* Details Card */}
        {order && (
          <div className="border-t border-gray-100 pt-6 text-start space-y-4">
            <h3 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <PackageCheck className="h-4 w-4 text-brand-primary" />
              <span>تفاصيل الطلب والعنوان:</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
              <div>
                <span className="text-gray-400 block text-[11px]">المستلم:</span>
                <span className="font-bold text-gray-800">{order.customerName}</span>
              </div>

              <div>
                <span className="text-gray-400 block text-[11px]">رقم الموبايل:</span>
                <span className="font-bold text-gray-800 font-mono">{order.customerPhone}</span>
              </div>

              <div>
                <span className="text-gray-400 block text-[11px]">المحافظة والعنوان:</span>
                <span className="font-bold text-gray-800">
                  {order.shippingAddress.city} - {order.shippingAddress.street}
                  {order.shippingAddress.district ? ` (${order.shippingAddress.district})` : ''}
                </span>
              </div>

              <div>
                <span className="text-gray-400 block text-[11px]">طريقة الدفع:</span>
                <span className="font-bold text-brand-primary">
                  {order.paymentMethod === 'vodafone_cash'
                    ? 'فودافون كاش'
                    : order.paymentMethod === 'instapay'
                    ? 'انستاباي InstaPay'
                    : 'الدفع عند الاستلام (نقداً)'}
                </span>
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-gray-200/60 flex justify-between items-center text-sm">
                <span className="font-bold text-gray-700">المبلغ الإجمالي (شاملاً الشحن):</span>
                <span className="font-black text-brand-primary">{formatEGP(order.totalPrice)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Home className="h-4 w-4" />}
              className="w-full font-bold px-6 rounded-full"
            >
              العودة للرئيسية
            </Button>
          </Link>

          <Link to="/products" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="md"
              leftIcon={<ShoppingBag className="h-4 w-4" />}
              className="w-full font-bold px-6 rounded-full"
            >
              تصفح المزيد من المنتجات
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
