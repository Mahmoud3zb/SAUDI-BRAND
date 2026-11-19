import { Truck } from 'lucide-react'

export function TopBar() {
  return (
    <aside
      aria-label="إعلانات المتجر"
      className="border-b border-[#ebe1d5] bg-brand-soft-pink py-1.5 text-xs text-brand-secondary font-sans"
      dir="rtl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1.5 font-medium">
          <Truck className="h-3.5 w-3.5 text-brand-primary shrink-0" aria-hidden="true" />
          <span>توصيل لجميع محافظات مصر • معاينة قبل الاستلام</span>
        </div>
      </div>
    </aside>
  )
}
