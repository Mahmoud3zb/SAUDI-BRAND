import { CheckCircle2, Eye, MessageCircle, Truck } from 'lucide-react'
import { Link } from 'react-router'
import { useSettingsStore } from '../settings/settings.store.ts'

export function ShippingPolicyPage() {
  const whatsappNumber = useSettingsStore((state) => state.whatsappNumber)
  const whatsappNumberIntl = useSettingsStore((state) => state.whatsappNumberIntl)
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 font-sans" dir="rtl">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-xs text-gray-500">
        <Link to="/" className="hover:text-brand-primary">
          الرئيسية
        </Link>
        <span>/</span>
        <span className="font-bold text-gray-900">سياسة الشحن والتوصيل</span>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-xs space-y-8">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-soft-pink text-brand-primary rounded-full text-xs font-bold mb-3">
            <Truck className="h-3.5 w-3.5" />
            <span>شحن سريع لجميع محافظات مصر</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">سياسة الشحن والتوصيل</h1>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            نحرص في سعودي براند على تقديم أسرع وأرقى تجربة توصيل حتى باب منزلك في كافة أنحاء جمهورية مصر العربية.
          </p>
        </div>

        {/* Highlight Banner: Inspection before Payment */}
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-4">
          <div className="p-2.5 bg-emerald-500 text-white rounded-xl shrink-0">
            <Eye className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-emerald-950 text-base">حق المعاينة قبل الاستلام والدفع 🔍</h3>
            <p className="text-xs sm:text-sm text-emerald-900 mt-1 leading-relaxed">
              يحق لكِ بالكامل فتح الشحنة ومعاينة كافة المنتجات المطلوبة والتأكد من سلامتها ومطابقتها أمام مندوب شركة الشحن قبل دفع أي مبلغ.
            </p>
          </div>
        </div>

        {/* Shipping Rates Table */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-gray-900">تسعيرة الشحن حسب المحافظات:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/70 space-y-1.5">
              <span className="text-xs text-gray-500 block">القاهرة والجيزة</span>
              <span className="text-xl font-black text-brand-primary block">100 ج.م</span>
              <span className="text-[11px] text-gray-400 block">التوصيل خلال 1-2 يوم عمل</span>
            </div>

            <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/70 space-y-1.5">
              <span className="text-xs text-gray-500 block">محافظات الدلتا ومدن القناة</span>
              <span className="text-xl font-black text-brand-primary block">80 ج.م</span>
              <span className="text-[11px] text-gray-400 block">التوصيل خلال 2-3 أيام عمل</span>
            </div>

            <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/70 space-y-1.5">
              <span className="text-xs text-gray-500 block">الصعيد والمحافظات الحدودية</span>
              <span className="text-xl font-black text-brand-primary block">60 ج.م</span>
              <span className="text-[11px] text-gray-400 block">التوصيل خلال 3-4 أيام عمل</span>
            </div>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed border-t border-gray-100 pt-6">
          <h2 className="text-base font-bold text-gray-900">تفاصيل ومواعيد الاستلام:</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
              <span>يقوم مندوب الشحن بالتواصل معكِ هاتفياً أو عبر الواتساب لتنسيق الموعد المناسب قبل الوصول.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
              <span>يتم تغليف المنتجات بعناية فائقة ضد الصدمات لضمان وصول العطور والمستحضرات بحالة ممتازة.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
              <span>طرق الدفع عند الاستلام تشمل: نقداً للمندوب، فودافون كاش، أو عبر انستاباي (InstaPay).</span>
            </li>
          </ul>
        </div>

        {/* WhatsApp Support Callout */}
        <div className="p-5 rounded-2xl bg-brand-soft-pink/30 border border-brand-soft-pink flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-gray-900 text-sm">لديكِ أي استفسار حول شحنتك؟</h4>
            <p className="text-xs text-gray-500 mt-0.5">فريق المتابعة متاح يومياً لمساعدتكِ وتتبع شحنتك فورياً.</p>
          </div>
          <a
            href={`https://wa.me/${whatsappNumberIntl}?text=${encodeURIComponent('مرحباً، أود الاستفسار عن حالة شحنتي.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
          >
            <MessageCircle className="h-4 w-4" />
            <span>تواصل مع الشحن: {whatsappNumber}</span>
          </a>
        </div>
      </div>
    </div>
  )
}
