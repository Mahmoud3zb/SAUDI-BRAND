import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  CheckCircle2,
  CheckSquare,
  KeyRound,
  Loader2,
  Mail,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Square,
  Trash2,
  User,
  UserCheck,
  X,
} from 'lucide-react'
import { adminApi, type AdminUser } from '../api/admin.api.ts'
import { useAdminAuthStore } from '../../auth/admin-auth.store.ts'

const AVAILABLE_PERMISSIONS = [
  {
    id: 'manage_products',
    label: 'إدارة وتعديل المنتجات والمخزون',
    description: 'إضافة منتجات جديدة، تعديل الأسعار، تغيير الصور، ومتابعة كميات المخزون',
    badge: 'المنتجات',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'manage_categories',
    label: 'إدارة وتصنيف أقسام المتجر',
    description: 'إضافة وتعديل الأقسام وتفعيلها أو إيقافها',
    badge: 'الأقسام',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    id: 'manage_orders',
    label: 'إدارة وتأكيد الطلبات والشحن',
    description: 'متابعة طلبات العملاء في محافظات مصر، مراجعة العناوين، وتحديث حالات التوصيل',
    badge: 'الطلبات',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 'view_overview',
    label: 'الاطلاع على الإحصائيات والمبيعات',
    description: 'عرض صفحة النظرة العامة والمؤشرات البيعية للمتجر',
    badge: 'الإحصائيات',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    id: 'manage_settings',
    label: 'التحكم برقم الواتساب وإعدادات المتجر',
    description: 'تغيير رقم الواتساب الرسمي وقنوات التواصل المعتمدة للمتجر',
    badge: 'الإعدادات',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
]

export function AdminUsersPage() {
  const queryClient = useQueryClient()
  const currentAdmin = useAdminAuthStore((state) => state.admin)
  const isSuperAdmin = useAdminAuthStore((state) => state.isSuperAdmin)

  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)

  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'manage_products',
    'manage_orders',
  ])
  const [formError, setFormError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  // Fetch users/admins
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminApi.getAdmins,
    enabled: isSuperAdmin(),
  })

  // Add Admin Mutation
  const addMutation = useMutation({
    mutationFn: () =>
      adminApi.addAdmin({
        name,
        email,
        password,
        role: 'admin',
        permissions: selectedPermissions,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      setIsModalOpen(false)
      setName('')
      setEmail('')
      setPassword('')
      setSelectedPermissions(['manage_products', 'manage_orders'])
      setFormError(null)
      setActionSuccess(res?.message || 'تمت إضافة المشرف بالصلاحيات المحددة بنجاح!')
      setTimeout(() => setActionSuccess(null), 4000)
    },
    onError: (err: unknown) => {
      setFormError(err instanceof Error ? err.message : 'حدث خطأ أثناء إضافة المشرف')
    },
  })

  // Delete Admin Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      setDeleteTarget(null)
      setActionSuccess('تم حذف المشرف بنجاح')
      setTimeout(() => setActionSuccess(null), 4000)
    },
    onError: (err: unknown) => {
      alert(err instanceof Error ? err.message : 'فشل حذف المشرف')
      setDeleteTarget(null)
    },
  })

  // Security guard for non-super admins
  if (!isSuperAdmin()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white rounded-3xl border border-gray-200">
        <div className="h-16 w-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">هذه الصفحة مخصصة للمدير العام فقط</h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-md">
          عفواً، لا يملك حسابك صلاحية إدارة المشرفين وفريق العمل. هذه الصلاحية محصورة حصرياً بالحساب
          الأساسي لمالك المتجر.
        </p>
      </div>
    )
  }

  const users = data?.data || []
  const filteredAdmins = users.filter((u) => {
    return (
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    )
  })

  const handleOpenModal = () => {
    setName('')
    setEmail('')
    setPassword('')
    setSelectedPermissions(['manage_products', 'manage_orders'])
    setFormError(null)
    setIsModalOpen(true)
  }

  const togglePermission = (permId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId],
    )
  }

  const selectAllPermissions = () => {
    setSelectedPermissions(AVAILABLE_PERMISSIONS.map((p) => p.id))
  }

  const setPresetOrdersOnly = () => {
    setSelectedPermissions(['manage_orders'])
  }

  const setPresetProductsOnly = () => {
    setSelectedPermissions(['manage_products', 'manage_categories'])
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!name.trim()) {
      setFormError('يرجى إدخال اسم المشرف الكامل')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('يرجى إدخال بريد إلكتروني صحيح')
      return
    }
    if (!password || password.length < 6) {
      setFormError('كلمة المرور يجب ألا تقل عن 6 أحرف')
      return
    }
    if (selectedPermissions.length === 0) {
      setFormError('يجب تحديد صلاحية واحدة على الأقل للمشرف الجديد')
      return
    }

    addMutation.mutate()
  }

  return (
    <div className="space-y-6 font-sans" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-brand-primary" />
            <span>إدارة المشرفين وتوزيع الصلاحيات</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            إضافة المشرفين الجدد وتحديد الصلاحيات الدقيقة الممنوحة لكل منهم (منتجات، أقسام، طلبات)
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-secondary text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>إضافة مشرف وتحديد صلاحياته</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {actionSuccess && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm animate-in fade-in duration-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{actionSuccess}</span>
        </div>
      )}

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-brand-soft-pink/50 flex items-center justify-center text-brand-primary">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">إجمالي فريق العمل</p>
            <p className="text-xl font-black text-gray-900 mt-0.5">
              {users.filter((u) => u.role === 'admin' || u.role === 'super_admin').length} مشرف
            </p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">المدير العام (Super Admin)</p>
            <p className="text-sm font-bold text-gray-800 mt-0.5">admin@saudibrand.com</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">نظام الصلاحيات المطبّق</p>
            <p className="text-sm font-bold text-gray-800 mt-0.5">صلاحيات دقيقة متعددة (RBAC)</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث بالاسم أو البريد الإلكتروني..."
          className="w-full ps-10 pe-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
        />
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs sm:text-sm">
            <thead className="bg-gray-50/75 border-b border-gray-200 text-gray-600 font-bold">
              <tr>
                <th className="py-3.5 px-4 text-start">المشرف</th>
                <th className="py-3.5 px-4 text-start">البريد الإلكتروني</th>
                <th className="py-3.5 px-4 text-start">الرتبة</th>
                <th className="py-3.5 px-4 text-start">الصلاحيات الممنوحة</th>
                <th className="py-3.5 px-4 text-start">تاريخ الإنشاء</th>
                <th className="py-3.5 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-brand-primary" />
                    <span>جاري تحميل المشرفين...</span>
                  </td>
                </tr>
              )}

              {isError && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-red-500">
                    <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                    <span>تعذر تحميل قائمة المشرفين</span>
                  </td>
                </tr>
              )}

              {!isLoading && filteredAdmins.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <User className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="font-bold text-gray-600">لا يوجد مشرفين مطابقين للبحث</p>
                  </td>
                </tr>
              )}

              {!isLoading &&
                filteredAdmins.map((item) => {
                  const isPrimaryAdmin =
                    item.email === 'admin@saudibrand.com' || item.role === 'super_admin'
                  const isSelf = currentAdmin?.email === item.email
                  const permissions = item.permissions || []

                  return (
                    <tr key={item._id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-9 w-9 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${
                              isPrimaryAdmin
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-brand-soft-pink text-brand-primary'
                            }`}
                          >
                            {isPrimaryAdmin ? '👑' : item.name ? item.name.charAt(0).toUpperCase() : 'م'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{item.name}</p>
                            {isSelf && (
                              <span className="text-[10px] text-brand-primary font-semibold">
                                (أنت)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 font-mono text-xs text-gray-600">
                        {item.email}
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        {isPrimaryAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <span>👑 المدير العام (Super Admin)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700">
                            <span>مشرف متجر</span>
                          </span>
                        )}
                      </td>

                      {/* Assigned Permissions Badges */}
                      <td className="py-3.5 px-4">
                        {isPrimaryAdmin ? (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            كامل الصلاحيات دون قيود
                          </span>
                        ) : permissions.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-1 max-w-xs">
                            {permissions.map((pId) => {
                              const match = AVAILABLE_PERMISSIONS.find((ap) => ap.id === pId)
                              return (
                                <span
                                  key={pId}
                                  className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                    match?.color || 'bg-gray-100 text-gray-700 border-gray-200'
                                  }`}
                                >
                                  {match?.badge || pId}
                                </span>
                              )
                            })}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">بدون صلاحيات محددة</span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="py-3.5 px-4 text-xs text-gray-500">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString('ar-EG', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        {isPrimaryAdmin ? (
                          <span className="text-[11px] text-gray-400 font-semibold cursor-not-allowed">
                            حساب رئيسي محمي
                          </span>
                        ) : isSelf ? (
                          <span className="text-[11px] text-gray-400 font-semibold cursor-not-allowed">
                            لا يمكن حذف نفسك
                          </span>
                        ) : (
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="حذف هذا المشرف"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal with Granular Multi-Select Permissions */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-xl space-y-5 animate-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Plus className="h-5 w-5 text-brand-primary" />
                <span>إضافة مشرف جديد وتحديد الصلاحيات</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  اسم المشرف الكامل *
                </label>
                <div className="relative">
                  <User className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: محمود عزب (مسؤول الشحن والطلبات)"
                    className="w-full ps-9 pe-3 py-2 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  البريد الإلكتروني للمشرف *
                </label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@saudibrand.com"
                    className="w-full ps-9 pe-3 py-2 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-brand-primary font-mono text-start"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  كلمة المرور * (6 خانات أو أكثر)
                </label>
                <div className="relative">
                  <KeyRound className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="اكتب كلمة مرور قوية للمشرف"
                    className="w-full ps-9 pe-3 py-2 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-brand-primary font-mono text-start"
                  />
                </div>
              </div>

              {/* Granular Permissions Selection */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-xs font-bold text-gray-800">
                    الصلاحيات الممنوحة للمشرف (اختر الصلاحيات المطلوبة):
                  </label>
                  {/* Presets */}
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={selectAllPermissions}
                      className="px-2 py-0.5 rounded bg-brand-soft-pink text-brand-primary font-bold hover:bg-brand-primary hover:text-white transition-colors cursor-pointer"
                    >
                      تحديد الكل
                    </button>
                    <button
                      type="button"
                      onClick={setPresetOrdersOnly}
                      className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      طلبات فقط
                    </button>
                    <button
                      type="button"
                      onClick={setPresetProductsOnly}
                      className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      منتجات فقط
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-1">
                  {AVAILABLE_PERMISSIONS.map((perm) => {
                    const isChecked = selectedPermissions.includes(perm.id)
                    return (
                      <div
                        key={perm.id}
                        onClick={() => togglePermission(perm.id)}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                          isChecked
                            ? 'bg-brand-soft-pink/30 border-brand-primary/40 shadow-xs'
                            : 'bg-gray-50/60 border-gray-200 hover:bg-gray-100/60'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0 text-brand-primary">
                          {isChecked ? (
                            <CheckSquare className="h-5 w-5" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900">{perm.label}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                            {perm.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <p className="text-[11px] text-amber-700 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200 mt-2">
                  🔒 <strong>ملاحظة أمان:</strong> إدارة المشرفين والإحصائيات الحساسة محصورة حصرياً
                  لك كمدير عام، ولن يتمكن هذا المشرف من رؤية أو تعديل المشرفين الآخرين أبداً.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={addMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {addMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>جاري حفظ المشرف...</span>
                    </>
                  ) : (
                    <span>تأكيد إضافة المشرف بالصلاحيات المحددة</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-150 text-center">
            <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>

            <h3 className="text-base font-bold text-gray-900">تأكيد حذف المشرف</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف حساب المشرف{' '}
              <strong className="text-gray-800">«{deleteTarget.name}»</strong> (
              {deleteTarget.email})؟ سيفقد كافة صلاحيات الوصول إلى المتجر فوراً.
            </p>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
              >
                تراجع
              </button>

              <button
                onClick={() => deleteMutation.mutate(deleteTarget._id)}
                disabled={deleteMutation.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>جاري الحذف...</span>
                  </>
                ) : (
                  <span>نعم، حذف الحساب</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
