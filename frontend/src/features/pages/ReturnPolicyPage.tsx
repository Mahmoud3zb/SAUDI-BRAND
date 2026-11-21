import { CheckCircle2, MessageCircle, RefreshCw, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router'
import { useSettingsStore } from '../settings/settings.store.ts'

export function ReturnPolicyPage() {
  const whatsappNumberIntl = useSettingsStore((state) => state.whatsappNumberIntl)
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 font-sans" dir="rtl">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-xs text-gray-500">
        <Link to="/" className="hover:text-brand-primary">
          الرئيسية
        </Link>
        <span>/</span>
        <span className="font-bold text-gray-900">سياسة الاستبدال والاسترجاع</span>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-xs space-y-8">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-soft-pink text-brand-primary rounded-full text-xs font-bold mb-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>ضمان رضا العملاء 100%</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">سياسة الاستبدال والاسترجاع</h1>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            رضاكِ هو أولويتنا المطلقة في سعودي براند. نوفر سياسة استبدال واسترجاع مرنة وسهلة وفقاً لقوانين التجارة وحماية المستهلك في مصر.
          </p>
        </div>

        {/* 14 Days Guarantee Banner */}
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-4">
          <div className="p-2.5 bg-amber-500 text-white rounded-xl shrink-0">
            <RefreshCw className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-amber-950 text-base">حق الاستبدال أو الاسترجاع خلال 14 يوماً 🛡️</h3>
            <p className="text-xs sm:text-sm text-amber-900 mt-1 leading-relaxed">
              يمكنكِ طلب استبدال أو استرجاع المنتج خلال 14 يوماً من تاريخ استلام الشحنة، طالما كان المنتج بحالته الأصلية غير مستخدم وفي عبوته الكاملة.
            </p>
          </div>
        </div>

        {/* Return Conditions */}
        <div className="space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed border-t border-gray-100 pt-6">
          <h2 className="text-base font-bold text-gray-900">شروط الاسترجاع والاستبدال:</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
              <span>أن يكون المنتج غير مستخدم، وفي غلافه الأصلي مع كافة الملحقات والملصقات الخاصة به.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
              <span>في حالة وجود عيب مصنعي أو تلف أثناء النقل، يتحمل المتجر كافة تكاليف الشحن لاستبدال المنتج بآخر جديد فوراً.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
              <span>في حالة الرغبة في التبديل بدون وجود عيب في المنتج، يتحمل العميل فقط مصاريف شحن الاستبدال.</span>
            </li>
          </ul>
        </div>

        {/* How to Request */}
        <div className="space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed border-t border-gray-100 pt-6">
          <h2 className="text-base font-bold text-gray-900">خطوات طلب الاستبدال أو الاسترجاع:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
              <span className="h-6 w-6 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xs">1</span>
              <h4 className="font-bold text-gray-900 text-xs">تواصل عبر الواتساب</h4>
              <p className="text-[11px] text-gray-500">أرسلي رسالة على رقم الواتساب موضحاً بها رقم الطلب والمشكلة.</p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
              <span className="h-6 w-6 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xs">2</span>
              <h4 className="font-bold text-gray-900 text-xs">إرسال صورة المنتج</h4>
              <p className="text-[11px] text-gray-500">التقاط صورة واضحة لحالة المنتج وغلافه لتأكيد الطلب مع خدمة العملاء.</p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
              <span className="h-6 w-6 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xs">3</span>
              <h4 className="font-bold text-gray-900 text-xs">إرسال المندوب</h4>
              <p className="text-[11px] text-gray-500">يصلكِ مندوب الشحن لاستلام أو استبدال المنتج وإعادة المبلغ المستحق.</p>
            </div>
          </div>
        </div>

        {/* WhatsApp CTA */}
        <div className="p-5 rounded-2xl bg-brand-soft-pink/30 border border-brand-soft-pink flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-gray-900 text-sm">تحتاجين مساعدة بخصوص طلب سابق؟</h4>
            <p className="text-xs text-gray-500 mt-0.5">فريق خدمة العملاء جاهز للرد على استفسارك خلال دقائق.</p>
          </div>
          <a
            href={`https://wa.me/${whatsappNumberIntl}?text=${encodeURIComponent('مرحباً، أود طلب استبدال أو استرجاع لطلب سابق.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
          >
            <MessageCircle className="h-4 w-4" />
            <span>تواصل مع خدمة العملاء</span>
          </a>
        </div>
      </div>
    </div>
  )
}
