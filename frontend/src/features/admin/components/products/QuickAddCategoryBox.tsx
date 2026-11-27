import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FolderPlus, Loader2, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '../../../../components/ui/Input.tsx'
import { adminApi, type AdminCategory } from '../../api/admin.api.ts'

interface QuickAddCategoryBoxProps {
  categories: AdminCategory[]
  onCategorySelected: (categoryId: string) => void
  onClose: () => void
}

export function QuickAddCategoryBox({
  categories,
  onCategorySelected,
  onClose,
}: QuickAddCategoryBoxProps) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const createCategoryMutation = useMutation({
    mutationFn: () =>
      adminApi.addCategory({
        name: name.trim(),
        description: description.trim() || undefined,
      }),
    onSuccess: (res) => {
      const created = res?.data
      if (created?._id) {
        queryClient.setQueryData<{ data: AdminCategory[] }>(['admin', 'categories'], (old) => {
          const prev = old?.data || []
          const exists = prev.some((c) => c._id === created._id)
          return { data: exists ? prev : [...prev, created] }
        })
        onCategorySelected(created._id)
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success(`تمت إضافة قسم «${created?.name || name.trim()}» واختياره تلقائياً`)
      onClose()
    },
    onError: (err: Error) => toast.error(err.message || 'فشل إضافة القسم الجديد'),
  })

  const handleQuickAdd = () => {
    const trimmed = name.trim()
    if (trimmed.length < 2) {
      toast.error('يرجى إدخال اسم قسم صحيح (حرفين على الأقل)')
      return
    }
    const existing = categories.find(
      (c) => c.name.trim().toLowerCase() === trimmed.toLowerCase(),
    )
    if (existing) {
      onCategorySelected(existing._id)
      toast.info(`القسم «${existing.name}» موجود بالفعل، تم اختياره لك`)
      onClose()
      return
    }
    createCategoryMutation.mutate()
  }

  return (
    <div className="p-3.5 rounded-2xl bg-brand-soft-pink/50 border border-brand-primary/25 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-brand-secondary flex items-center gap-1.5">
          <FolderPlus className="h-3.5 w-3.5" />
          <span>إضافة قسم جديد مباشرة</span>
        </span>
        <button
          type="button"
          onClick={onClose}
          className="p-0.5 text-gray-400 hover:text-gray-600 cursor-pointer"
          aria-label="إغلاق إضافة القسم"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleQuickAdd()
            }
          }}
          placeholder="اسم القسم الجديد * (مثال: عناية بالشعر)"
          className="w-full text-xs bg-white"
          autoFocus
        />
        <Input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleQuickAdd()
            }
          }}
          placeholder="وصف مختصر (اختياري)"
          className="w-full text-xs bg-white"
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={createCategoryMutation.isPending}
          className="px-3 py-1.5 text-[11px] font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
        >
          إلغاء
        </button>
        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={createCategoryMutation.isPending}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-bold text-white bg-brand-primary hover:bg-brand-secondary rounded-xl transition-colors cursor-pointer disabled:opacity-50"
        >
          {createCategoryMutation.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          <span>حفظ واختيار القسم</span>
        </button>
      </div>
    </div>
  )
}

