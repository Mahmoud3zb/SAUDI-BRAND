import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '../ui/Button.tsx'
import { Input } from '../ui/Input.tsx'

export function Footer() {
  const [email, setEmail] = useState('')

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white text-gray-600">
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
              وجهتكِ الأولى لأرقى العطور ومستحضرات العناية بالبشرة والشعر والهاند ميد والهدايا.
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
                  to="/category/perfumes"
                  className="transition-colors hover:text-brand-primary"
                >
                  العطور
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
              <li>
                <Link to="/category/gifts" className="transition-colors hover:text-brand-primary">
                  الهدايا والعروض
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-900">
              خدمة العملاء
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="transition-colors hover:text-brand-primary">
                  الأسئلة الشائعة
                </Link>
              </li>
              <li>
                <Link to="/" className="transition-colors hover:text-brand-primary">
                  الشحن والتوصيل
                </Link>
              </li>
              <li>
                <Link to="/" className="transition-colors hover:text-brand-primary">
                  سياسة الاسترجاع
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              النشرة البريدية
            </h3>
            <p className="text-xs text-gray-500">اشتركي ليصلكِ كل جديد عن أحدث العروض والمنتجات.</p>
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
        <div className="mt-10 border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
          <p>© {new Date().getFullYear()} سعودي براند. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  )
}
