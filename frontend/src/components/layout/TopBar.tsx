import { Headphones, ShieldCheck, Truck } from 'lucide-react'

export function TopBar() {
  return (
    <aside
      aria-label="إعلانات المتجر"
      className="border-b border-[#f3ddd3] bg-brand-soft-pink py-1.5 text-xs text-brand-secondary"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1.5 font-medium">
          <Truck className="h-3.5 w-3.5 text-brand-primary" aria-hidden="true" />
          <span>توصيل سريع لجميع المحافظات</span>
        </div>

        <div className="hidden items-center gap-6 sm:flex">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-primary" aria-hidden="true" />
            <span>منتجات أصلية ومضمونة</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Headphones className="h-3.5 w-3.5 text-brand-primary" aria-hidden="true" />
            <span>خدمة عملاء ودعم مستمر</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
