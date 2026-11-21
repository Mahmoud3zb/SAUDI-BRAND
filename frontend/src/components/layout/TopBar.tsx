import { Link } from 'react-router'
import { Sparkles } from 'lucide-react'
import { useSettingsStore } from '../../features/settings/settings.store.ts'

export function TopBar() {
  const isAnnouncementEnabled = useSettingsStore((state) => state.isAnnouncementEnabled)
  const announcementText = useSettingsStore((state) => state.announcementText)

  if (!isAnnouncementEnabled || !announcementText) {
    return null
  }

  const content = (
    <div className="mx-auto flex max-w-7xl items-center justify-center sm:justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 font-bold text-[11px] sm:text-xs">
        <Sparkles className="h-3.5 w-3.5 text-brand-primary shrink-0 animate-pulse" aria-hidden="true" />
        <span>{announcementText}</span>
      </div>
      <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-brand-primary">
        <span>تسوقي الآن</span>
        <span>←</span>
      </div>
    </div>
  )

  return (
    <aside
      aria-label="إعلانات المتجر"
      className="border-b border-[#ebe1d5] bg-brand-soft-pink/70 py-1.5 text-xs text-brand-secondary font-sans transition-all hover:bg-brand-soft-pink"
      dir="rtl"
    >
      <Link to="/products" className="block hover:opacity-90">
        {content}
      </Link>
    </aside>
  )
}
