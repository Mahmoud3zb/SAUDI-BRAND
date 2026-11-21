import { useEffect, useState } from 'react'
import {
  Copy,
  CreditCard,
  ExternalLink,
  Headphones,
  Megaphone,
  MessageCircle,
  Package,
  Phone,
  RefreshCw,
  Save,
  Settings,
  ShieldAlert,
  Smartphone,
  Sparkles,
  Truck,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../../../components/ui/Button.tsx'
import { Input } from '../../../components/ui/Input.tsx'
import { useSettingsStore } from '../../settings/settings.store.ts'
import { useAdminAuthStore } from '../../auth/admin-auth.store.ts'

type SettingsTab = 'whatsapp' | 'announcement' | 'shipping'

function cleanPhone(raw: string): string {
  let clean = raw.trim().replace(/[\s\-()]/g, '')
  if (clean.startsWith('+20')) {
    clean = '0' + clean.slice(3)
  } else if (clean.startsWith('0020')) {
    clean = '0' + clean.slice(4)
  } else if (clean.length === 10 && /^[1][0125]/.test(clean)) {
    clean = '0' + clean
  }
  return clean
}

function toIntl(clean: string): string {
  return '2' + (clean.startsWith('0') ? clean : '0' + clean)
}

export function AdminSettingsPage() {
  const isSuperAdmin = useAdminAuthStore((state) => state.isSuperAdmin)
  const hasPermission = useAdminAuthStore((state) => state.hasPermission)

  const {
    whatsappNumber,
    contactChannels,
    storeName,
    announcementText,
    isAnnouncementEnabled,
    shippingRates,
    isLoading,
    fetchSettings,
    updateSettings,
  } = useSettingsStore()

  const [activeTab, setActiveTab] = useState<SettingsTab>('whatsapp')

  // Channels form states
  const [ordersNum, setOrdersNum] = useState<string | null>(null)
  const [supportNum, setSupportNum] = useState<string | null>(null)
  const [walletNum, setWalletNum] = useState<string | null>(null)
  const [walletName, setWalletName] = useState<string | null>(null)
  const [customStoreName, setCustomStoreName] = useState<string | null>(null)

  // Announcement form states
  const [customAnnouncementText, setCustomAnnouncementText] = useState<string | null>(null)
  const [customAnnouncementEnabled, setCustomAnnouncementEnabled] = useState<boolean | null>(null)

  // Shipping form states
  const [customCairoRate, setCustomCairoRate] = useState<number | null>(null)
  const [customDeltaRate, setCustomDeltaRate] = useState<number | null>(null)
  const [customSaidRate, setCustomSaidRate] = useState<number | null>(null)

  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // Values resolution
  const inputOrdersNum = ordersNum !== null ? ordersNum : (contactChannels?.orders?.number || whatsappNumber)
  const inputSupportNum = supportNum !== null ? supportNum : (contactChannels?.support?.number || whatsappNumber)
  const inputWalletNum = walletNum !== null ? walletNum : (contactChannels?.wallet?.number || whatsappNumber)
  const inputWalletName = walletName !== null ? walletName : (contactChannels?.wallet?.accountName || 'سعودي براند')
  const inputStoreName = customStoreName !== null ? customStoreName : storeName

  const inputAnnouncementText =
    customAnnouncementText !== null ? customAnnouncementText : announcementText
  const inputAnnouncementEnabled =
    customAnnouncementEnabled !== null ? customAnnouncementEnabled : isAnnouncementEnabled

  const inputCairoRate = customCairoRate !== null ? customCairoRate : (shippingRates?.cairoGiza ?? 100)
  const inputDeltaRate = customDeltaRate !== null ? customDeltaRate : (shippingRates?.delta ?? 80)
  const inputSaidRate = customSaidRate !== null ? customSaidRate : (shippingRates?.said ?? 60)

  // Auto-fill all numbers from Orders number
  const handleCopyOrdersToAll = () => {
    const target = cleanPhone(inputOrdersNum)
    setSupportNum(target)
    setWalletNum(target)
    toast.success('تم نسخ رقم الطلبات إلى كافة الأقسام! اضغط "حفظ كافة التغييرات" لتثبيتها.')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    const egyptianPhoneRegex = /^01[0125][0-9]{8}$/

    const cleanedOrders = cleanPhone(inputOrdersNum)
    const cleanedSupport = cleanPhone(inputSupportNum)
    const cleanedWallet = cleanPhone(inputWalletNum)

    if (!egyptianPhoneRegex.test(cleanedOrders)) {
      toast.error('يرجى التأكد من صحة رقم تأكيد الطلبات (11 رقماً مصرياً)')
      return
    }
    if (!egyptianPhoneRegex.test(cleanedSupport)) {
      toast.error('يرجى التأكد من صحة رقم خدمة العملاء والدعم (11 رقماً مصرياً)')
      return
    }
    if (!egyptianPhoneRegex.test(cleanedWallet)) {
      toast.error('يرجى التأكد من صحة رقم محفظة فودافون كاش (11 رقماً مصرياً)')
      return
    }

    setIsSaving(true)
    try {
      await updateSettings({
        whatsappNumber: cleanedOrders,
        whatsappNumberIntl: toIntl(cleanedOrders),
        contactChannels: {
          orders: {
            number: cleanedOrders,
            intl: toIntl(cleanedOrders),
          },
          support: {
            number: cleanedSupport,
            intl: toIntl(cleanedSupport),
          },
          wallet: {
            number: cleanedWallet,
            intl: toIntl(cleanedWallet),
            accountName: inputWalletName.trim(),
          },
          advisor: {
            number: cleanedSupport,
            intl: toIntl(cleanedSupport),
          },
        },
        storeName: inputStoreName.trim(),
        announcementText: inputAnnouncementText.trim(),
        isAnnouncementEnabled: inputAnnouncementEnabled,
        announcementLink: '/products',
        shippingRates: {
          cairoGiza: Number(inputCairoRate) || 100,
          delta: Number(inputDeltaRate) || 80,
          said: Number(inputSaidRate) || 60,
        },
        freeShippingThreshold: 0,
      })

      // Reset local modifications & reload fresh from server
      setOrdersNum(null)
      setSupportNum(null)
      setWalletNum(null)
      setWalletName(null)
      setCustomStoreName(null)
      setCustomAnnouncementText(null)
      setCustomAnnouncementEnabled(null)
      setCustomCairoRate(null)
      setCustomDeltaRate(null)
      setCustomSaidRate(null)

      // Re-fetch immediately to ensure UI is 100% synchronized with DB
      await fetchSettings()

      toast.success('تم حفظ وتحديث قنوات التواصل وإعدادات المتجر بنجاح!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'فشل تحديث الإعدادات، يرجى المحاولة مرة أخرى'
      toast.error(msg)
    } finally {
      setIsSaving(false)
    }
  }

  // Permission Guard
  if (!isSuperAdmin() && !hasPermission('manage_settings')) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[360px] text-center p-8 bg-white rounded-3xl border border-gray-200 font-sans"
        dir="rtl"
      >
        <ShieldAlert className="h-12 w-12 text-gray-300 mb-3" />
        <h2 className="text-lg font-bold text-gray-800">صلاحية إعدادات المتجر غير مفعلة لحسابك</h2>
        <p className="text-xs text-gray-500 mt-1 max-w-sm">
          يرجى مراجعة المدير العام للمتجر لمنحك صلاحية التحكم في أرقام الواتساب وإعدادات النظام.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 font-sans max-w-5xl" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-soft-pink text-brand-primary">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900">إعدادات المتجر</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                إدارة أرقام وقنوات التواصل، الشريط الترويجي، وأسعار الشحن لمتجر سعودي براند
              </p>
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => fetchSettings()}
          leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          className="self-start sm:self-auto text-xs"
        >
          تحديث البيانات
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('whatsapp')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'whatsapp'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
          }`}
        >
          <MessageCircle className="h-4 w-4" />
          <span>أرقام التواصل والواتساب</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('announcement')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'announcement'
              ? 'bg-brand-primary text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
          }`}
        >
          <Megaphone className="h-4 w-4" />
          <span>شريط الإعلانات العلوي</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('shipping')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'shipping'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
          }`}
        >
          <Truck className="h-4 w-4" />
          <span>أسعار الشحن والمحافظات</span>
        </button>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: MULTI-CHANNEL WHATSAPP & CONTACT */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-6">
            {/* Quick Sync Banner */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-center sm:text-start">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shrink-0">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                    نظام قنوات الاتصال المنفصلة (Multi-Channel Numbers)
                  </h4>
                  <p className="text-[11px] text-emerald-800/80 mt-0.5">
                    يمكنك تحديد رقم مخصص لكل قسم لتنظيم العمل ومنع تداخل المحادثات، أو تطبيق رقم واحد للكل بنقرة واحدة.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyOrdersToAll}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold shadow-2xs hover:bg-emerald-100 transition-all cursor-pointer shrink-0"
              >
                <Copy className="h-3.5 w-3.5 text-emerald-600" />
                <span>نسخ رقم الطلبات لكافة الأقسام</span>
              </button>
            </div>

            {/* General Store Name */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs">
              <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-brand-primary" />
                <span>اسم المتجر الرسمي (يظهر في الرسائل والتواصل)</span>
              </label>
              <Input
                type="text"
                value={inputStoreName}
                onChange={(e) => setCustomStoreName(e.target.value)}
                placeholder="سعودي براند"
                className="w-full text-xs max-w-md"
              />
            </div>

            {/* 3 Cards Grid for Channels */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* 1. Orders Channel */}
              <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-4 hover:border-emerald-200 transition-all flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">1. تأكيد الطلبات</h3>
                        <p className="text-[11px] text-gray-400">صفحة الشراء (Checkout)</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      رئيسي
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      رقم الواتساب لاستقبال الأوردرات *
                    </label>
                    <Input
                      type="text"
                      required
                      value={inputOrdersNum}
                      onChange={(e) => setOrdersNum(e.target.value)}
                      placeholder="01012345678"
                      startIcon={<Phone className="h-4 w-4 text-gray-400" />}
                      className="w-full font-mono text-xs"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-[11px]">
                  <span className="text-gray-400 font-mono">+{toIntl(cleanPhone(inputOrdersNum))}</span>
                  <a
                    href={`https://wa.me/${toIntl(cleanPhone(inputOrdersNum))}?text=${encodeURIComponent(
                      'مرحباً، هذه رسالة تجريبية لفحص رقم استقبال وتأكيد الطلبات في سعودي براند.'
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:underline"
                  >
                    <span>اختبار الشات</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* 2. Customer Support Channel */}
              <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-4 hover:border-blue-200 transition-all flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                        <Headphones className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">2. خدمة العملاء والدعم</h3>
                        <p className="text-[11px] text-gray-400">الزر العائم وروابط الفوتر</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      دعم فوري
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      رقم خدمة العملاء (الزر العائم) *
                    </label>
                    <Input
                      type="text"
                      required
                      value={inputSupportNum}
                      onChange={(e) => setSupportNum(e.target.value)}
                      placeholder="01012345678"
                      startIcon={<Phone className="h-4 w-4 text-gray-400" />}
                      className="w-full font-mono text-xs"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-[11px]">
                  <span className="text-gray-400 font-mono">+{toIntl(cleanPhone(inputSupportNum))}</span>
                  <a
                    href={`https://wa.me/${toIntl(cleanPhone(inputSupportNum))}?text=${encodeURIComponent(
                      'مرحباً، هذه رسالة تجريبية لفحص رقم خدمة العملاء والاستفسارات.'
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-700 font-bold hover:underline"
                  >
                    <span>اختبار الشات</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* 3. Wallet & Financial Channel */}
              <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-4 hover:border-amber-200 transition-all flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                        <Wallet className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">3. محفظة التحويل (كاش)</h3>
                        <p className="text-[11px] text-gray-400">فودافون كاش وإنستاباي</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      معاملات مالية
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        رقم المحفظة (الكاش) *
                      </label>
                      <Input
                        type="text"
                        required
                        value={inputWalletNum}
                        onChange={(e) => setWalletNum(e.target.value)}
                        placeholder="01012345678"
                        startIcon={<CreditCard className="h-4 w-4 text-gray-400" />}
                        className="w-full font-mono text-xs"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        اسم صاحب المحفظة
                      </label>
                      <Input
                        type="text"
                        value={inputWalletName}
                        onChange={(e) => setWalletName(e.target.value)}
                        placeholder="مثال: سعودي براند"
                        className="w-full text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">يظهر في الشيك أوت</span>
                  <span className="text-amber-800 font-bold font-mono">{cleanPhone(inputWalletNum)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ANNOUNCEMENT BAR */}
        {activeTab === 'announcement' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">تفعيل شريط الإعلانات العلوي</h3>
                  <p className="text-xs text-gray-500">يظهر كشريط مميز في أعلى الموقع لجذب انتباه الزوار</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inputAnnouncementEnabled}
                    onChange={(e) => setCustomAnnouncementEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center gap-1.5">
                  <Megaphone className="h-4 w-4 text-brand-primary" />
                  <span>نص الإعلان الترويجي *</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={inputAnnouncementText}
                  onChange={(e) => setCustomAnnouncementText(e.target.value)}
                  placeholder="مثال: توصيل لجميع محافظات مصر • معاينة قبل الاستلام • عطور وعناية أصلية 100%"
                  className="w-full rounded-2xl border border-gray-200 p-3 text-xs text-gray-800 focus:border-brand-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Announcement Preview Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs space-y-3">
                <span className="text-xs font-bold text-gray-700">معاينة حية لشكل الشريط في الموقع:</span>
                <div className="rounded-2xl border border-[#ebe1d5] bg-brand-soft-pink p-3 text-center">
                  <p className="text-xs font-bold text-brand-secondary">
                    ✨ {inputAnnouncementText || 'نص الإعلان سيظهر هنا...'}
                  </p>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  يساعدك هذا الشريط على الترويج الفوري لعروض الجمعة البيضاء، الأعياد، وأكواد الخصم.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SHIPPING RATES */}
        {activeTab === 'shipping' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-xs space-y-5">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <span>تكاليف الشحن حسب المناطق المصرية</span>
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  حدد تسعيرة الشحن لكل قطاع جغرافي بالجنيه المصري (تُطبق تلقائياً على صفحة الدفع).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      القاهرة والجيزة (ج.م)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={inputCairoRate}
                      onChange={(e) => setCustomCairoRate(Number(e.target.value))}
                      className="w-full font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      محافظات الدلتا والقناة (ج.م)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={inputDeltaRate}
                      onChange={(e) => setCustomDeltaRate(Number(e.target.value))}
                      className="w-full font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      الصعيد والحدودية (ج.م)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={inputSaidRate}
                      onChange={(e) => setCustomSaidRate(Number(e.target.value))}
                      className="w-full font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Info Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-blue-50 text-blue-900 rounded-3xl p-5 border border-blue-100 shadow-2xs space-y-3">
                <h4 className="font-bold text-xs flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <span>كيف تُحسب تكلفة الشحن؟</span>
                </h4>
                <ul className="text-xs text-blue-800/90 space-y-2 leading-relaxed">
                  <li>• عند اختيار العميل لمحافظته في الشيك أوت، يُحسب السعر المعين لمنطقته تلقائياً.</li>
                  <li>• تُطبق الأسعار فورياً على جميع الأوردرات الجديدة في المتجر.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Global Save Button Bar */}
        <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-gray-200/90 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-center sm:text-start">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              تأكد من مراجعة البيانات قبل الحفظ، التعديل ينعكس فورياً ومباشرة على كامل النظام.
            </p>
          </div>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSaving}
            leftIcon={<Save className="h-4 w-4" />}
            className="w-full sm:w-auto font-bold text-xs sm:text-sm px-9 py-3 rounded-2xl shadow-md hover:shadow-lg cursor-pointer bg-brand-primary hover:bg-brand-secondary text-white transition-all active:scale-[0.98]"
          >
            {isSaving ? 'جاري الحفظ والتطبيق...' : 'حفظ وتطبيق التغييرات'}
          </Button>
        </div>
      </form>
    </div>
  )
}
