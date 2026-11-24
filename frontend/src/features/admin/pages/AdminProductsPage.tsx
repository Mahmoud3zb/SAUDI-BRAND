import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Copy, Edit2, Link as LinkIcon, Package, Plus, Star, Trash2, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../../../components/ui/Button.tsx'
import { Input } from '../../../components/ui/Input.tsx'
import { formatEGP } from '../../../lib/formatters.ts'
import { adminApi, type AdminCategory, type AdminProduct } from '../api/admin.api.ts'
import { useAdminAuthStore } from '../../auth/admin-auth.store.ts'

export function AdminProductsPage() {
  const isSuperAdmin = useAdminAuthStore((state) => state.isSuperAdmin)
  const hasPermission = useAdminAuthStore((state) => state.hasPermission)

  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null)
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Form State
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [costPrice, setCostPrice] = useState('')
  const [stockQuantity, setStockQuantity] = useState('20')
  const [isFeatured, setIsFeatured] = useState(false)
  const [description, setDescription] = useState('')
  const [categoryID, setCategoryID] = useState('')
  const [imageUrlText, setImageUrlText] = useState('')
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

  const totalProducts = products.length
  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalProducts)
  const paginatedProducts = products.slice(startIndex, endIndex)

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('تم حذف المنتج بنجاح')
      setProductToDelete(null)
    },
    onError: (err: Error) => toast.error(err.message || 'فشل حذف المنتج'),
  })

  // Add / Edit mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData()
      fd.append('name', name.trim())
      fd.append('price', price)
      if (originalPrice) fd.append('originalPrice', originalPrice)
      if (costPrice) fd.append('costPrice', costPrice)
      if (stockQuantity) fd.append('stockQuantity', stockQuantity)
      fd.append('isFeatured', String(isFeatured))
      if (description) fd.append('description', description.trim())
      if (categoryID) fd.append('categoryID', categoryID)

      if (imageFile) {
        fd.append('imageUrl', imageFile)
      } else if (imageUrlText.trim()) {
        fd.append('imageUrl', imageUrlText.trim())
      }

      if (editingProduct) {
        return adminApi.updateProduct(editingProduct._id, fd)
      } else {
        if (!imageFile && !imageUrlText.trim()) {
          throw new Error('يرجى رفع صورة للمنتج أو وضع رابط صورة مباشر')
        }
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
    setOriginalPrice('')
    setCostPrice('')
    setStockQuantity('20')
    setIsFeatured(false)
    setDescription('')
    setCategoryID(categories[0]?._id || '')
    setImageUrlText('')
    setImageFile(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (p: AdminProduct) => {
    setEditingProduct(p)
    setName(p.name)
    setPrice(String(p.price))
    setOriginalPrice(p.originalPrice ? String(p.originalPrice) : '')
    setCostPrice(p.costPrice !== undefined ? String(p.costPrice) : '')
    setStockQuantity(p.stockQuantity !== undefined ? String(p.stockQuantity) : '20')
    setIsFeatured(Boolean(p.isFeatured))
    setDescription(p.description || '')
    const catId =
      typeof p.categoryID === 'object' && p.categoryID !== null ? p.categoryID._id : p.categoryID
    setCategoryID(catId)
    setImageUrlText(p.imageUrl || '')
    setImageFile(null)
    setModalOpen(true)
  }

  const handleDuplicate = (p: AdminProduct) => {
    setEditingProduct(null) // creates a new product
    setName(`${p.name} (نسخة)`)
    setPrice(String(p.price))
    setOriginalPrice(p.originalPrice ? String(p.originalPrice) : '')
    setCostPrice(p.costPrice !== undefined ? String(p.costPrice) : '')
    setStockQuantity(p.stockQuantity !== undefined ? String(p.stockQuantity) : '20')
    setIsFeatured(Boolean(p.isFeatured))
    setDescription(p.description || '')
    const catId =
      typeof p.categoryID === 'object' && p.categoryID !== null ? p.categoryID._id : p.categoryID
    setCategoryID(catId)
    setImageUrlText(p.imageUrl || '')
    setImageFile(null)
    setModalOpen(true)
    toast.info('تم نسخ بيانات المنتج، يمكنك تعديل ما يلزم ثم حفظه كمنتج جديد ✨')
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

  // Check permission guard after all hooks
  if (!isSuperAdmin() && !hasPermission('manage_products')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] text-center p-8 bg-white rounded-3xl border border-gray-200">
        <Package className="h-12 w-12 text-gray-300 mb-3" />
        <h2 className="text-lg font-bold text-gray-800">صلاحية إدارة المنتجات غير مفعلة لحسابك</h2>
        <p className="text-xs text-gray-500 mt-1 max-w-sm">
          يرجى مراجعة المدير العام للمتجر لمنحك صلاحية إدارة وتعديل المنتجات والمخزون.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 font-sans" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">إدارة المنتجات والمخزون</h1>
          <p className="text-xs text-gray-500 mt-1">إضافة وتعديل وحذف وتفعيل منتجات المتجر في مصر</p>
        </div>
        <Button
          onClick={handleOpenAdd}
          variant="primary"
          size="md"
          leftIcon={<Plus className="h-4 w-4" />}
          className="font-bold self-start sm:self-auto cursor-pointer"
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
                  <th className="py-3 px-4 text-start font-bold">المخزون</th>
                  <th className="py-3 px-4 text-start font-bold">القسم</th>
                  <th className="py-3 px-4 text-start font-bold">الحالة</th>
                  <th className="py-3 px-4 text-end font-bold">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedProducts.map((p) => {
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
                            التكلفة: <span className="font-semibold text-gray-600">{formatEGP(p.costPrice)}</span>
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
                          onClick={() => handleDuplicate(p)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="تكرار / نسخ المنتج"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-brand-primary hover:bg-brand-soft-pink/50 transition-colors cursor-pointer"
                          title="تعديل"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setProductToDelete(p)}
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

      {/* Pagination Controls */}
      {totalProducts > 0 && (
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
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1 text-xs font-bold text-gray-700 outline-none focus:border-brand-primary cursor-pointer"
              >
                <option value={10}>10 منتجات</option>
                <option value={20}>20 منتج</option>
                <option value={50}>50 منتج</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1}
                className="p-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="الصفحة السابقة"
                aria-label="الصفحة السابقة"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <span className="px-3 py-1 font-bold text-xs bg-brand-soft-pink text-brand-primary rounded-xl">
                صفحة {safeCurrentPage} من {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages}
                className="p-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="الصفحة التالية"
                aria-label="الصفحة التالية"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">
                {editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">اسم المنتج *</label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: عطر مسك الختام الفاخر"
                  className="w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">سعر البيع (ج.م) *</label>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="350"
                    className="w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    سعر التكلفة (ج.م)
                    <span className="text-[10px] text-gray-400 block font-normal">لحساب صافي الأرباح</span>
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="150"
                    className="w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    السعر قبل الخصم
                    <span className="text-[10px] text-gray-400 block font-normal">اختياري</span>
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="450"
                    className="w-full text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">الكمية في المخزون</label>
                  <Input
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    placeholder="20"
                    className="w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">القسم *</label>
                  <select
                    required
                    value={categoryID}
                    onChange={(e) => setCategoryID(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-800 focus:border-brand-primary focus:outline-none cursor-pointer"
                  >
                    <option value="">اختر القسم...</option>
                    {categories.map((c: AdminCategory) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Is Featured Checkbox */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-brand-primary focus:ring-brand-primary cursor-pointer"
                />
                <label htmlFor="isFeatured" className="text-xs font-bold text-gray-700 cursor-pointer flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  <span>تثبيت كمنتج مميز في الصفحة الرئيسية (Featured Product)</span>
                </label>
              </div>

              {/* Image Input Options */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700">صورة المنتج</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option A: Upload File */}
                  <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-3 text-center hover:border-brand-primary transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-1 text-gray-500">
                      <Upload className="h-4 w-4 text-brand-primary" />
                      <span className="text-[11px] font-bold text-gray-700 truncate max-w-[150px]">
                        {imageFile ? imageFile.name : 'رفع صورة من جهازك'}
                      </span>
                      <span className="text-[9px] text-gray-400">JPG, PNG (حد أقصى 5MB)</span>
                    </div>
                  </div>

                  {/* Option B: Direct URL */}
                  <div>
                    <Input
                      type="url"
                      placeholder="أو ضع رابط صورة مباشر..."
                      value={imageUrlText}
                      onChange={(e) => setImageUrlText(e.target.value)}
                      className="w-full text-xs"
                      startIcon={<LinkIcon className="h-3.5 w-3.5 text-gray-400" />}
                    />
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      مثال: https://.../image.jpg أو /products/prod-1.jpg
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الوصف</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف تفصيلي ومزايا المنتج..."
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs text-gray-800 focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                <Button type="button" variant="secondary" size="md" onClick={handleCloseModal}>
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={saveMutation.isPending}
                  leftIcon={<Check className="h-4 w-4" />}
                  className="font-bold cursor-pointer"
                >
                  حفظ المنتج
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">تأكيد حذف المنتج</h3>
                <p className="text-xs text-gray-500 mt-0.5">عملية الحذف نهائية ولا يمكن التراجع عنها</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed mb-6 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
              هل أنت متأكد من رغبتك في حذف المنتج{' '}
              <span className="font-bold text-gray-900">«{productToDelete.name}»</span>؟ سيتم مسحه
              بالكامل من قاعدة البيانات والمتجر.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setProductToDelete(null)}
                disabled={deleteMutation.isPending}
                className="text-xs font-semibold px-4 cursor-pointer"
              >
                إلغاء
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => deleteMutation.mutate(productToDelete._id)}
                isLoading={deleteMutation.isPending}
                className="text-xs font-bold px-5 bg-red-600 hover:bg-red-700 text-white border-transparent cursor-pointer"
              >
                نعم، احذف المنتج
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
