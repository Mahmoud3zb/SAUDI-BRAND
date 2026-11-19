import { Heart, MessageCircle, ShieldCheck, Sparkles, Star } from 'lucide-react'
import { Link } from 'react-router'
import { STORE_WHATSAPP_INTL, STORE_WHATSAPP_NUMBER } from '../checkout/constants/egypt-regions.ts'

export function AboutUsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 font-sans" dir="rtl">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-xs text-gray-500">
        <Link to="/" className="hover:text-brand-primary">
          الرئيسية
        </Link>
        <span>/</span>
        <span className="font-bold text-gray-900">عن سعودي براند</span>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-xs space-y-8">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-soft-pink text-brand-primary rounded-full text-xs font-bold mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>الجودة والأصالة في مصر</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">من نحن - سعودي براند</h1>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            علامتكِ المميزة التي تجمع بين الفخامة والأصالة في عالم العطور، العناية الشخصية، والهدايا الاستثنائية.
          </p>
        </div>

        {/* Our Story */}
        <div className="space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <h2 className="text-base font-bold text-gray-900">قصتنا ورؤيتنا:</h2>
          <p>
            انطلق متجر <strong>سعودي براند</strong> ليكون الوجهة الأولى في السوق المصري لكل سيدة ورجل يبحث عن أرقى مستحضرات العناية والعطور الفاخرة التي تلبي أعلى معايير الجودة والمقاييس العالمية.
          </p>
          <p>
            نحرص على انتقاء المنتجات بعناية متناهية لتلبي ذوق العميل المصري الراقي، مع توفير تجربة تسوق مريحة تتسم بالسرعة، الأمان، والتواصل المباشر والإنساني عبر الواتساب.
          </p>
        </div>

        {/* Core Values */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 pt-6">
          <div className="p-4 rounded-2xl bg-brand-soft-pink/20 border border-brand-soft-pink/60 space-y-2">
            <Star className="h-6 w-6 text-brand-primary" />
            <h3 className="font-bold text-gray-900 text-xs">جودة لا مساومة عليها</h3>
            <p className="text-[11px] text-gray-500">مكونات نقية ومستحضرات آمنة وفعالة تم اختبارها بعناية.</p>
          </div>

          <div className="p-4 rounded-2xl bg-brand-soft-pink/20 border border-brand-soft-pink/60 space-y-2">
            <Heart className="h-6 w-6 text-brand-primary" />
            <h3 className="font-bold text-gray-900 text-xs">خدمة تليق بكِ</h3>
            <p className="text-[11px] text-gray-500">فريق دعم متفانٍ للرد السريع عبر الواتساب ومتابعة شحنتك خطوة بخطوة.</p>
          </div>

          <div className="p-4 rounded-2xl bg-brand-soft-pink/20 border border-brand-soft-pink/60 space-y-2">
            <ShieldCheck className="h-6 w-6 text-brand-primary" />
            <h3 className="font-bold text-gray-900 text-xs">شفافية وأمان تام</h3>
            <p className="text-[11px] text-gray-500">حق المعاينة قبل الاستلام والدفع، وسياسة استبدال مرنة 14 يوماً.</p>
          </div>
        </div>

        {/* Contact Info Callout */}
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-emerald-950 text-sm">يسعدنا دائماً تواصلكِ معنا!</h4>
            <p className="text-xs text-emerald-900">
              خدمة العملاء متوفرة يومياً من الساعة 10 صباحاً حتى 11 مساءً عبر الواتساب.
            </p>
          </div>
          <a
            href={`https://wa.me/${STORE_WHATSAPP_INTL}?text=${encodeURIComponent('مرحباً، أود التواصل مع إدارة سعودي براند.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
          >
            <MessageCircle className="h-4 w-4" />
            <span>تحدثي معنا: {STORE_WHATSAPP_NUMBER}</span>
          </a>
        </div>
      </div>
    </div>
  )
}
