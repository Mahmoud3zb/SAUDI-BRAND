import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Package, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../../../components/ui/Button.tsx'
import { adminApi, type AdminProduct } from '../api/admin.api.ts'
import { useAdminAuthStore } from '../../auth/admin-auth.store.ts'
import { DeleteProductModal } from '../components/products/DeleteProductModal.tsx'
import {
  ProductFormModal,
  type ProductModalMode,
} from '../components/products/ProductFormModal.tsx'
import { ProductsPagination } from '../components/products/ProductsPagination.tsx'
import { ProductsTable } from '../components/products/ProductsTable.tsx'

interface ProductModalState {
  mode: ProductModalMode
  product: AdminProduct | null
}

export function AdminProductsPage() {
  const isSuperAdmin = useAdminAuthStore((state) => state.isSuperAdmin)
  const hasPermission = useAdminAuthStore((state) => state.hasPermission)

  const [modalState, setModalState] = useState<ProductModalState | null>(null)
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

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

  const handleOpenAdd = () => {
    setModalState({ mode: 'add', product: null })
  }

  const handleOpenEdit = (product: AdminProduct) => {
    setModalState({ mode: 'edit', product })
  }

  const handleDuplicate = (product: AdminProduct) => {
    setModalState({ mode: 'duplicate', product })
    toast.info('تم نسخ بيانات المنتج، يمكنك تعديل ما يلزم ثم حفظه كمنتج جديد ✨')
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
      <ProductsTable
        products={paginatedProducts}
        categories={categories}
        isLoading={isLoading}
        onDuplicate={handleDuplicate}
        onEdit={handleOpenEdit}
        onDelete={setProductToDelete}
      />

      {/* Pagination Controls */}
      <ProductsPagination
        totalProducts={totalProducts}
        startIndex={startIndex}
        endIndex={endIndex}
        pageSize={pageSize}
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize)
          setCurrentPage(1)
        }}
        onPageChange={setCurrentPage}
      />

      {/* Add / Edit / Duplicate Product Modal */}
      {modalState && (
        <ProductFormModal
          key={`${modalState.mode}-${modalState.product?._id ?? 'new'}`}
          mode={modalState.mode}
          initialProduct={modalState.product}
          categories={categories}
          onClose={() => setModalState(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <DeleteProductModal product={productToDelete} onClose={() => setProductToDelete(null)} />
      )}
    </div>
  )
}
