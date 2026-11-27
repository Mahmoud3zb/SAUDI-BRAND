import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductsPaginationProps {
  totalProducts: number
  startIndex: number
  endIndex: number
  pageSize: number
  currentPage: number
  totalPages: number
  onPageSizeChange: (newSize: number) => void
  onPageChange: (newPage: number) => void
}

export function ProductsPagination({
  totalProducts,
  startIndex,
  endIndex,
  pageSize,
  currentPage,
  totalPages,
  onPageSizeChange,
  onPageChange,
}: ProductsPaginationProps) {
  if (totalProducts === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs">
      <div className="text-gray-500 font-medium">
        عرض <strong className="text-gray-900 font-bold">{startIndex + 1}</strong> إلى{' '}
        <strong className="text-gray-900 font-bold">{endIndex}</strong> من إجمالي{' '}
        <strong className="text-gray-900 font-bold">{totalProducts}</strong> منتج
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-gray-500">
          <span>عرض:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1 text-xs font-bold text-gray-700 outline-none focus:border-brand-primary cursor-pointer"
          >
            <option value={10}>10 منتجات</option>
            <option value={20}>20 منتج</option>
            <option value={50}>50 منتج</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="الصفحة السابقة"
            aria-label="الصفحة السابقة"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <span className="px-3 py-1 font-bold text-xs bg-brand-soft-pink text-brand-primary rounded-xl">
            صفحة {currentPage} من {totalPages}
          </span>

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="الصفحة التالية"
            aria-label="الصفحة التالية"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

