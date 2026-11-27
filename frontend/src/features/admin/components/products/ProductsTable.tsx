import { Copy, Edit2, Package, Star, Trash2 } from 'lucide-react'
import { formatEGP } from '../../../../lib/formatters.ts'
import type { AdminCategory, AdminProduct } from '../../api/admin.api.ts'

interface ProductsTableProps {
  products: AdminProduct[]
  categories: AdminCategory[]
  isLoading: boolean
  onDuplicate: (product: AdminProduct) => void
  onEdit: (product: AdminProduct) => void
  onDelete: (product: AdminProduct) => void
}

export function ProductsTable({
  products,
  categories,
  isLoading,
  onDuplicate,
  onEdit,
  onDelete,
}: ProductsTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
      {isLoading ? (
        <div className="p-8 text-center text-xs text-gray-400">جاري تحميل المنتجات...</div>
      ) : products.length === 0 ? (
        <div className="p-12 text-center text-gray-400">
          <Package className="h-12 w-12 mx-auto stroke-1 text-gray-300 mb-2" />
          <p className="text-xs">لا توجد منتجات مسجلة في قاعدة البيانات حالياً.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
              <tr>
                <th className="py-3 px-4 text-start font-bold">المنتج</th>
                <th className="py-3 px-4 text-start font-bold">السعر</th>
                <th className="py-3 px-4 text-start font-bold">المخزون</th>
                <th className="py-3 px-4 text-start font-bold">القسم</th>
                <th className="py-3 px-4 text-start font-bold">الحالة</th>
                <th className="py-3 px-4 text-end font-bold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => {
                const catName =
                  typeof p.categoryID === 'object' && p.categoryID !== null
                    ? p.categoryID.name
                    : categories.find((c) => c._id === p.categoryID)?.name || 'غير محدد'

                return (
                  <tr key={p._id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl || '/products/prod-1.jpg'}
                          alt={p.name}
                          className="h-11 w-11 rounded-xl object-cover bg-gray-100 border border-gray-100 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-gray-900">{p.name}</p>
                            {p.isFeatured && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[9px] font-bold bg-amber-50 text-amber-700 rounded-md border border-amber-200">
                                <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                                مميز
                              </span>
                            )}
                          </div>
                          {p.description && (
                            <p className="text-[11px] text-gray-400 truncate max-w-xs mt-0.5">
                              {p.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-bold text-brand-primary">{formatEGP(p.price)}</span>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <span className="text-[10px] text-gray-400 line-through">
                            {formatEGP(p.originalPrice)}
                          </span>
                        )}
                      </div>
                      {p.costPrice !== undefined && p.costPrice > 0 && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          التكلفة:{' '}
                          <span className="font-semibold text-gray-600">
                            {formatEGP(p.costPrice)}
                          </span>
                          {p.price > p.costPrice && (
                            <span className="text-emerald-600 mr-1 font-bold">
                              (+{formatEGP(p.price - p.costPrice)})
                            </span>
                          )}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold ${
                          (p.stockQuantity ?? 0) <= 5
                            ? 'text-red-600 font-bold'
                            : 'text-gray-700'
                        }`}
                      >
                        {p.stockQuantity ?? 0} قطعة
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-medium">{catName}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.isActive !== false
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            p.isActive !== false ? 'bg-emerald-500' : 'bg-gray-400'
                          }`}
                        />
                        {p.isActive !== false ? 'نشط' : 'معطل'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-end space-x-1 space-x-reverse">
                      <button
                        onClick={() => onDuplicate(p)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        title="تكرار / نسخ المنتج"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEdit(p)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-brand-primary hover:bg-brand-soft-pink/50 transition-colors cursor-pointer"
                        title="تعديل"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(p)}
                        className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                        title="حذف المنتج"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

