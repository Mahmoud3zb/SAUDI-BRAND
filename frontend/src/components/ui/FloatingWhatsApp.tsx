import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { STORE_WHATSAPP_INTL, STORE_WHATSAPP_NUMBER } from '../../features/checkout/constants/egypt-regions.ts'

export function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(true)

  const defaultGreeting = encodeURIComponent('مرحباً، أود الاستفسار عن منتجات وعروض المتجر ✨')
  const waUrl = `https://wa.me/${STORE_WHATSAPP_INTL}?text=${defaultGreeting}`

  return (
    <div className="fixed bottom-18 sm:bottom-6 start-4 sm:start-6 z-40 flex flex-col items-start gap-2 font-sans" dir="rtl">
      {/* Welcome Tooltip / Bubble */}
      {showTooltip && (
        <div className="relative flex items-center gap-2 rounded-2xl bg-white px-3 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs font-bold text-gray-800 shadow-xl border border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span>تحدث معنا مباشرة على الواتساب 💬</span>
          <button
            onClick={() => setShowTooltip(false)}
            className="ms-1 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5 rounded-full hover:bg-gray-100"
            aria-label="إغلاق الإشعار"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Main Floating Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`تواصل عبر الواتساب على ${STORE_WHATSAPP_NUMBER}`}
        className="group relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer ring-4 ring-emerald-500/20"
      >
        <span className="absolute -top-1 -end-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white"></span>
        </span>
        <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 fill-white/10 stroke-[2.2]" />
      </a>
    </div>
  )
}

