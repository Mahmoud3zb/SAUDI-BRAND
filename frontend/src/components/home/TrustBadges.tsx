import { Eye, MessageCircle, RefreshCw, Truck } from 'lucide-react'
import { STORE_WHATSAPP_NUMBER } from '../../features/checkout/constants/egypt-regions.ts'

const TRUST_FEATURES = [
  {
    icon: <Eye className="h-6 w-6 text-brand-primary" aria-hidden="true" />,
    title: 'حق المعاينة قبل الدفع',
    description: 'افتحي الشحنة وتأكدي من كل منتج أمام المندوب قبل سداد أي مليم.',
    tag: 'راحة وأمان 100%',
  },
  {
    icon: <Truck className="h-6 w-6 text-brand-primary" aria-hidden="true" />,
    title: 'توصيل لجميع المحافظات',
    tag: 'تسليم حتى باب البيت',
  },
  {
    icon: <RefreshCw className="h-6 w-6 text-brand-primary" aria-hidden="true" />,
    title: 'استبدال واسترجاع 14 يوم',
    description: 'ضمان كامل لحقوقكِ في الاستبدال أو الاسترجاع بكل سهولة ويسر.',
    tag: 'ضمان حماية المستهلك',
  },
  {
    icon: <MessageCircle className="h-6 w-6 text-emerald-600" aria-hidden="true" />,
    title: 'دعم ومتابعة واتساب',
    description: `فريق خدمة العملاء متواجد لمساعدتكِ يومياً على ${STORE_WHATSAPP_NUMBER}.`,
    tag: 'رد فوري خلال دقائق',
  },
]

export function TrustBadges() {
  return (
    <section aria-label="ضمانات ومميزات المتجر" className="py-4 font-sans" dir="rtl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TRUST_FEATURES.map((item, index) => (
          <div
            key={index}
            className="group flex flex-col justify-between rounded-3xl border border-gray-100 bg-white p-5 sm:p-6 shadow-2xs hover:shadow-md hover:border-brand-soft-pink transition-all duration-300 relative overflow-hidden"
          >
            {/* Ambient accent top bar */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft-pink/60 transition-transform duration-300 group-hover:scale-110">
                  {item.icon}
                </div>
                <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                  {item.tag}
                </span>
              </div>

              <h3 className="text-xs sm:text-sm font-black text-gray-900 group-hover:text-brand-primary transition-colors">
                {item.title}
              </h3>
              <p className="mt-1.5 text-[11px] sm:text-xs text-gray-500 leading-relaxed font-medium">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
