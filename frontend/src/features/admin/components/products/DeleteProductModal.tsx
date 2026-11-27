import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../../../../components/ui/Button.tsx'
import { adminApi, type AdminProduct } from '../../api/admin.api.ts'

interface DeleteProductModalProps {
  product: AdminProduct
  onClose: () => void
}

export function DeleteProductModal({ product, onClose }: DeleteProductModalProps) {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('تم حذف المنتج بنجاح')
      onClose()
    },
    onError: (err: Error) => toast.error(err.message || 'فشل حذف المنتج'),
  })

  return (
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
          <span className="font-bold text-gray-900">«{product.name}»</span>؟ سيتم مسحه بالكامل من
          قاعدة البيانات والمتجر.
        </p>

        <div className="flex items-center justify-end gap-2.5">
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="text-xs font-semibold px-4 cursor-pointer"
          >
            إلغاء
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => deleteMutation.mutate(product._id)}
            isLoading={deleteMutation.isPending}
            className="text-xs font-bold px-5 bg-red-600 hover:bg-red-700 text-white border-transparent cursor-pointer"
          >
            نعم، احذف المنتج
          </Button>
        </div>
      </div>
    </div>
  )
}

