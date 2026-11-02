import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Edit2, FolderTree, Loader2, Plus, Search, XCircle } from 'lucide-react'
import { adminApi, type AdminCategory } from '../api/admin.api.ts'

export function AdminCategoriesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: adminApi.getCategories,
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingCategory) {
        return adminApi.updateCategory(editingCategory._id, { name, description })
      }
      return adminApi.addCategory({ name, description })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
      setIsModalOpen(false)
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء حفظ القسم')
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (id: string) => adminApi.toggleCategoryStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
    },
  })

  const openModal = (cat?: AdminCategory) => {
    setEditingCategory(cat || null)
    setName(cat?.name || '')
    setDescription(cat?.description || '')
    setError(null)
    setIsModalOpen(true)
  }

  const categories = data?.data || []
  const filtered = categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">إدارة الأقسام</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            إضافة وتعديل أقسام وتصنيفات المنتجات في المتجر
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>إضافة قسم جديد</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-100 flex items-center gap-2 shadow-2xs">
        <Search className="h-4 w-4 text-gray-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث باسم القسم..."
          className="w-full text-xs sm:text-sm bg-transparent outline-hidden text-gray-800 placeholder-gray-400"
        />
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />
            <span className="text-xs">جاري تحميل الأقسام...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-2">
            <FolderTree className="h-8 w-8 text-gray-300" />
            <span className="text-xs">لا توجد أقسام مسجلة</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50/75 border-b border-gray-100 text-gray-500 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">اسم القسم</th>
                  <th className="py-3.5 px-4">الوصف</th>
                  <th className="py-3.5 px-4">الحالة</th>
                  <th className="py-3.5 px-4 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((cat) => (
                  <tr key={cat._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900">{cat.name}</td>
                    <td className="py-3.5 px-4 text-gray-500 max-w-xs truncate">
                      {cat.description || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          cat.isActive !== false
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {cat.isActive !== false ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            <span>نشط</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            <span>معطل</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-left">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => openModal(cat)}
                          className="p-1.5 text-gray-500 hover:text-brand-primary hover:bg-brand-soft-pink/40 rounded-lg transition-colors cursor-pointer"
                          title="تعديل"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => toggleMutation.mutate(cat._id)}
                          disabled={toggleMutation.isPending}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer disabled:opacity-50 ${
                            cat.isActive !== false
                              ? 'border-gray-200 text-gray-600 hover:bg-gray-50'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {cat.isActive !== false ? 'تعطيل' : 'تفعيل'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-gray-900">
              {editingCategory ? 'تعديل القسم' : 'إضافة قسم جديد'}
            </h2>

            {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl">{error}</div>}

            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (name.trim()) saveMutation.mutate()
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-gray-700 mb-1">اسم القسم *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: عطور، هاند ميد..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-hidden focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">الوصف</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف مختصر للقسم..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-hidden focus:border-brand-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {saveMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingCategory ? 'حفظ التعديلات' : 'إضافة'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
