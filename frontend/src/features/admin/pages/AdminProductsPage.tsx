import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Edit2, Package, Plus, Power, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../../../components/ui/Button.tsx'
import { Input } from '../../../components/ui/Input.tsx'
import { formatEGP } from '../../../lib/formatters.ts'
import { adminApi, type AdminCategory, type AdminProduct } from '../api/admin.api.ts'

export function AdminProductsPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null)

  // Form State
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [categoryID, setCategoryID] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)

  // Fetch Products & Categories
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: adminApi.getProducts,
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: adminApi.getCategories,
  })

  const products = productsData?.data || []
  const categories = categoriesData?.data || []

  // Toggle status mutation
  const toggleMutation = useMutation({
    mutationFn: adminApi.toggleProductStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('تم تحديث حالة المنتج بنجاح')
    },
    onError: (err: Error) => toast.error(err.message || 'فشل تحديث الحالة'),
  })

  // Add / Edit mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData()
      fd.append('name', name)
      fd.append('price', price)
      if (description) fd.append('description', description)
      if (categoryID) fd.append('categoryID', categoryID)
      if (imageFile) fd.append('imageUrl', imageFile)

      if (editingProduct) {
        return adminApi.updateProduct(editingProduct._id, fd)
      } else {
        if (!imageFile) throw new Error('صورة المنتج مطلوبة للإضافة الجديدة')
        return adminApi.addProduct(fd)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(editingProduct ? 'تم تعديل المنتج بنجاح' : 'تمت إضافة المنتج بنجاح')
      handleCloseModal()
    },
    onError: (err: Error) => toast.error(err.message || 'حدث خطأ أثناء حفظ المنتج'),
  })

  const handleOpenAdd = () => {
    setEditingProduct(null)
    setName('')
    setPrice('')
    setDescription('')
    setCategoryID(categories[0]?._id || '')
    setImageFile(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (p: AdminProduct) => {
    setEditingProduct(p)
    setName(p.name)
    setPrice(String(p.price))
    setDescription(p.description || '')
    const catId =
      typeof p.categoryID === 'object' && p.categoryID !== null ? p.categoryID._id : p.categoryID
    setCategoryID(catId)
    setImageFile(null)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingProduct(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !price || !categoryID) {
      toast.error('يرجى ملء الاسم، السعر، والقسم')
      return
    }
    saveMutation.mutate()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">إدارة المنتجات</h1>
          <p className="text-xs text-gray-500 mt-1">إضافة وتعديل وحذف وتفعيل منتجات المتجر</p>
        </div>
        <Button
          onClick={handleOpenAdd}
          variant="primary"
          size="md"
          leftIcon={<Plus className="h-4 w-4" />}
          className="font-bold self-start sm:self-auto"
        >
          إضافة منتج جديد
        </Button>
      </div>

      {/* Products Table */}
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
                            className="h-10 w-10 rounded-xl object-cover bg-gray-100 border border-gray-100"
                          />
                          <div>
                            <p className="font-bold text-gray-900">{p.name}</p>
                            {p.description && (
                              <p className="text-[11px] text-gray-400 truncate max-w-xs">
                                {p.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-brand-primary">
                        {formatEGP(p.price)}
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
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-brand-primary hover:bg-brand-soft-pink/50 transition-colors"
                          title="تعديل"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleMutation.mutate(p._id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            p.isActive !== false
                              ? 'text-amber-600 hover:bg-amber-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={p.isActive !== false ? 'تعطيل المنتج' : 'تفعيل المنتج'}
                        >
                          <Power className="h-4 w-4" />
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

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">
                {editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">اسم المنتج</label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: عطر مسك الختام الفاخر"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">السعر (ج.م)</label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="350"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">القسم</label>
                <select
                  required
                  value={categoryID}
                  onChange={(e) => setCategoryID(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-medium text-gray-800 focus:border-brand-primary focus:outline-none"
                >
                  <option value="">اختر القسم...</option>
                  {categories.map((c: AdminCategory) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">صورة المنتج</label>
                <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:border-brand-primary transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-1.5 text-gray-500">
                    <Upload className="h-5 w-5 text-brand-primary" />
                    <span className="text-xs font-medium">
                      {imageFile ? imageFile.name : 'اضغط لاختيار صورة من جهازك'}
                    </span>
                    <span className="text-[10px] text-gray-400">JPG, PNG, WebP (بحد أقصى 5MB)</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الوصف</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف تفصيلي ومزايا المنتج..."
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs text-gray-800 focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button type="button" variant="secondary" size="md" onClick={handleCloseModal}>
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={saveMutation.isPending}
                  leftIcon={<Check className="h-4 w-4" />}
                  className="font-bold"
                >
                  حفظ
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
