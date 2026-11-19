import { BadgeCheck, Quote, Star } from 'lucide-react'

interface Testimonial {
  name: string
  location: string
  rating: number
  review: string
  productBought: string
  date: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'ياسمين الشريف',
    location: 'القاهرة - المعادي',
    rating: 5,
    review:
      'عطر يارا لطافة ريحته وثباته يجنن بجد! وأحلى ميزة إني فتحت الشحنة واتأكدت من المنتج والعلبة قدام المندوب قبل ما أدفع أي مليم. تجربة مريحة جداً.',
    productBought: 'عطر يارا لطافة الزهري',
    date: 'منذ يومين',
  },
  {
    name: 'د. أحمد عبد الرحمن',
    location: 'الإسكندرية - سموحة',
    rating: 5,
    review:
      'طلبت بوكس العناية الملكي كهدية ووصلني خلال يومين بتغليف شيك جداً وراقي. الدفع كان بسهولة عبر انستاباي (InstaPay) والمنتجات كلها أصلية 100%.',
    productBought: 'بوكس العناية الملكي',
    date: 'منذ 4 أيام',
  },
  {
    name: 'مروة فؤاد',
    location: 'الدقهلية - المنصورة',
    rating: 5,
    review:
      'الدعم على الواتساب ممتاز وسريع جداً، ساعدوني أختار العطر المناسب لذوقي والشحن للدلتا كان 80 ج.م بس ومفيش أي مصاريف خفية. شكراً لكم.',
    productBought: 'عطر خمرة لطافة الفاخر',
    date: 'منذ أسبوع',
  },
  {
    name: 'سارة كمال',
    location: 'أسيوط',
    rating: 5,
    review:
      'كنت قلقانة من الشحن للصعيد بس وصل في ميعاده ومصاريف الشحن 60 ج بس وسيروم الشعر خرافة وفرق معايا جداً. شكراً لفريق سعودي براند على الأمانة.',
    productBought: 'سيروم الأرجان للشعر',
    date: 'منذ أسبوعين',
  },
]

export function TestimonialsSection() {
  return (
    <section aria-label="آراء وتجارب العملاء" className="space-y-6 font-sans" dir="rtl">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-2xs">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span>تقييم 4.9 من 5 • أكثر من 1200 طلب ناجح</span>
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900">
          ماذا يقول عملاؤنا في محافظات مصر؟
        </h2>
        <p className="text-xs sm:text-sm text-gray-500">
          تجارب حقيقية تعكس ثقة ورضا عملائنا عن سرعة التوصيل، حق المعاينة، وأصالة المنتجات
        </p>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TESTIMONIALS.map((t, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between p-5 rounded-3xl bg-white border border-gray-100 shadow-2xs hover:shadow-md hover:border-brand-soft-pink transition-all duration-300 relative"
          >
            <div className="space-y-3">
              {/* Quote Icon & Stars */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                  ))}
                </div>
                <Quote className="h-5 w-5 text-brand-primary/20" />
              </div>

              {/* Review Text */}
              <p className="text-xs text-gray-700 leading-relaxed font-medium">
                «{t.review}»
              </p>
            </div>

            {/* Author Info */}
            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs">
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-gray-900">{t.name}</span>
                  <span title="مشترٍ موثق">
                    <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 block">{t.location}</span>
              </div>

              <span className="text-[10px] bg-brand-soft-pink/40 text-brand-primary font-bold px-2 py-0.5 rounded-md">
                {t.date}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
