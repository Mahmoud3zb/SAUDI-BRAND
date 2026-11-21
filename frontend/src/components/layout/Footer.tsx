import { useState } from 'react'
import { Link } from 'react-router'
import { MessageCircle, ShieldCheck, Truck } from 'lucide-react'
import { Button } from '../ui/Button.tsx'
import { Input } from '../ui/Input.tsx'
import { useSettingsStore } from '../../features/settings/settings.store.ts'

export function Footer() {
  const [email, setEmail] = useState('')
  const defaultNum = useSettingsStore((state) => state.whatsappNumber)
  const defaultIntl = useSettingsStore((state) => state.whatsappNumberIntl)
  const contactChannels = useSettingsStore((state) => state.contactChannels)

  const supportNumber = contactChannels?.support?.number || defaultNum
  const supportIntl = contactChannels?.support?.intl || defaultIntl

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white text-gray-600 font-sans" dir="rtl">
      {/* Top Highlight Ribbon */}
      <div className="border-b border-gray-100 bg-brand-soft-pink/30 py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-gray-700">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-brand-primary shrink-0" />
              <span>شحن سريع لجميع محافظات مصر (معاينة قبل الدفع)</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-primary shrink-0" />
              <span>استبدال واسترجاع مضمون خلال 14 يوماً</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>خدمة عملاء وطلب سريع عبر الواتساب: {supportNumber}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-3 md:col-span-1">
            <Link to="/" className="inline-block">
              <img
                src="/newLogo2.png"
                alt="سعودي براند | SAUDI BRAND"
                className="h-12 w-auto object-contain"
              />
            </Link>
            <p className="text-xs leading-relaxed text-gray-500">
              وجهتكِ الأولى في مصر لأرقى العطور ومستحضرات العناية بالبشرة والشعر والهدايا الاستثنائية.
            </p>
            
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-900">
              الأقسام الرئيسية
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/products"
                  className="transition-colors hover:text-brand-primary"
                >
                  جميع المنتجات
                </Link>
              </li>
              <li>
                <Link
                  to="/category/perfumes"
                  className="transition-colors hover:text-brand-primary"
                >
                  العطور الفاخرة
                </Link>
              </li>
              <li>
                <Link
                  to="/category/skincare"
                  className="transition-colors hover:text-brand-primary"
                >
                  العناية بالبشرة
                </Link>
              </li>
              <li>
                <Link
                  to="/category/haircare"
                  className="transition-colors hover:text-brand-primary"
                >
                  العناية بالشعر
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support & Policies */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-900">
              خدمة العملاء والسياسات
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/shipping-policy" className="transition-colors hover:text-brand-primary font-medium">
                  الشحن والتوصيل (المحافظات)
                </Link>
              </li>
              <li>
                <Link to="/return-policy" className="transition-colors hover:text-brand-primary font-medium">
                  سياسة الاسترجاع والاستبدال (14 يوم)
                </Link>
              </li>
              <li>
                <Link to="/about-us" className="transition-colors hover:text-brand-primary font-medium">
                  عن سعودي براند
                </Link>
              </li>
              <li>
                <a
                  href={`https://wa.me/${supportIntl}?text=${encodeURIComponent('مرحباً، أود التحدث مع خدمة العملاء.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-emerald-700 text-emerald-600 font-bold"
                >
                  تواصل معنا عبر الواتساب
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              النشرة البريدية
            </h3>
            <p className="text-xs text-gray-500">اشتركي ليصلكِ كل جديد عن أحدث العروض والخصومات في مصر.</p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col gap-2 sm:flex-row sm:items-center"
            >
              <Input
                type="email"
                placeholder="البريد الإلكتروني..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="عنوان البريد الإلكتروني للنشرة البريدية"
                className="w-full text-xs"
              />
              <Button type="submit" variant="primary" size="md" className="shrink-0 text-xs">
                اشتراك
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-gray-100 pt-6 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans">
          {/* Rights & Branding (Right side in RTL) */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-3 text-center sm:text-start text-xs text-gray-500 font-medium">
            <span>© {new Date().getFullYear()} سعودي براند. جميع الحقوق محفوظة.</span>
            <span className="text-gray-300 select-none">•</span>
            <span className="text-[11px] text-gray-400 font-mono tracking-wider transition-colors hover:text-gray-600 select-none">
              powered by <span className="font-semibold text-gray-500">3zb</span>
            </span>
          </div>

          {/* Quick Legal & Policy Links (Left side in RTL) */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs text-gray-500 font-medium">
            <Link to="/shipping-policy" className="hover:text-brand-primary transition-colors py-1">
              الشحن والتوصيل
            </Link>
            <span className="text-gray-300 select-none">•</span>
            <Link to="/return-policy" className="hover:text-brand-primary transition-colors py-1">
              سياسة الاسترجاع
            </Link>
            <span className="text-gray-300 select-none">•</span>
            <Link to="/about-us" className="hover:text-brand-primary transition-colors py-1">
              من نحن
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
