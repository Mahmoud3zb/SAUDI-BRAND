import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, FolderPlus, Link as LinkIcon, Star, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../../../../components/ui/Button.tsx'
import { Input } from '../../../../components/ui/Input.tsx'
import { adminApi, type AdminCategory, type AdminProduct } from '../../api/admin.api.ts'
import { QuickAddCategoryBox } from './QuickAddCategoryBox.tsx'

export type ProductModalMode = 'add' | 'edit' | 'duplicate'

interface ProductFormModalProps {
  mode: ProductModalMode
  initialProduct: AdminProduct | null
  categories: AdminCategory[]
  onClose: () => void
}

function getCategoryIdFromProduct(product: AdminProduct | null, fallbackId: string): string {
  if (!product) return fallbackId
  return typeof product.categoryID === 'object' && product.categoryID !== null
    ? product.categoryID._id
    : product.categoryID
}

export function ProductFormModal({
  mode,
  initialProduct,
  categories,
  onClose,
}: ProductFormModalProps) {
  const queryClient = useQueryClient()
  const isEditing = mode === 'edit' && initialProduct !== null

  const [name, setName] = useState(() => {
    if (!initialProduct) return ''
    return mode === 'duplicate' ? `${initialProduct.name} (نسخة)` : initialProduct.name
  })
  const [price, setPrice] = useState(() => (initialProduct ? String(initialProduct.price) : ''))
  const [originalPrice, setOriginalPrice] = useState(() =>
    initialProduct?.originalPrice ? String(initialProduct.originalPrice) : '',
  )
  const [costPrice, setCostPrice] = useState(() =>
    initialProduct?.costPrice !== undefined ? String(initialProduct.costPrice) : '',
  )
  const [stockQuantity, setStockQuantity] = useState(() =>
    initialProduct?.stockQuantity !== undefined ? String(initialProduct.stockQuantity) : '20',
  )
  const [isFeatured, setIsFeatured] = useState(() => Boolean(initialProduct?.isFeatured))
  const [description, setDescription] = useState(() => initialProduct?.description || '')
  const [categoryID, setCategoryID] = useState(() =>
    getCategoryIdFromProduct(initialProduct, categories[0]?._id || ''),
  )
  const [imageUrlText, setImageUrlText] = useState(() => initialProduct?.imageUrl || '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [showNewCategoryBox, setShowNewCategoryBox] = useState(false)

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

      if (isEditing && initialProduct) {
        return adminApi.updateProduct(initialProduct._id, fd)
      }
      if (!imageFile && !imageUrlText.trim()) {
        throw new Error('يرجى رفع صورة للمنتج أو وضع رابط صورة مباشر')
      }
      return adminApi.addProduct(fd)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(isEditing ? 'تم تعديل المنتج بنجاح' : 'تمت إضافة المنتج بنجاح')
      onClose()
    },
    onError: (err: Error) => toast.error(err.message || 'حدث خطأ أثناء حفظ المنتج'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !price || !categoryID) {
      toast.error('يرجى ملء الاسم، السعر، والقسم')
      return
    }
    saveMutation.mutate()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs">
      <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">
            {isEditing ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}
          </h2>
          <button
            onClick={onClose}
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-gray-700">القسم *</label>
                <button
                  type="button"
                  onClick={() => setShowNewCategoryBox((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-primary hover:text-brand-secondary transition-colors cursor-pointer"
                >
                  <FolderPlus className="h-3.5 w-3.5" />
                  <span>{showNewCategoryBox ? 'إغلاق' : '+ قسم جديد'}</span>
                </button>
              </div>
              <select
                required
                value={categoryID}
                onChange={(e) => setCategoryID(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-800 focus:border-brand-primary focus:outline-none cursor-pointer"
              >
                <option value="">اختر القسم...</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Inline Quick-Add Category Box */}
          {showNewCategoryBox && (
            <QuickAddCategoryBox
              categories={categories}
              onCategorySelected={setCategoryID}
              onClose={() => setShowNewCategoryBox(false)}
            />
          )}

          {/* Is Featured Checkbox */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
            <input
              type="checkbox"
              id="isFeatured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded text-brand-primary focus:ring-brand-primary cursor-pointer"
            />
            <label
              htmlFor="isFeatured"
              className="text-xs font-bold text-gray-700 cursor-pointer flex items-center gap-1"
            >
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span>تثبيت كمنتج مميز في الصفحة الرئيسية (Featured Product)</span>
            </label>
          </div>

          {/* Image Input Options */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700">صورة المنتج</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <Button type="button" variant="secondary" size="md" onClick={onClose}>
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
  )
}

