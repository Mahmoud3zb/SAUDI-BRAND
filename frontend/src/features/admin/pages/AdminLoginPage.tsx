import { useState } from 'react'
import { Lock, Mail, Store } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Button } from '../../../components/ui/Button.tsx'
import { Input } from '../../../components/ui/Input.tsx'
import { useAdminAuthStore } from '../../auth/admin-auth.store.ts'

export function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const login = useAdminAuthStore((state) => state.login)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast.error('يرجى ملء جميع الحقول')
      return
    }

    setIsLoading(true)
    try {
      await login(email.trim(), password)
      toast.success('تم تسجيل الدخول بنجاح')
      navigate('/admin')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'فشل تسجيل الدخول، تأكد من صحة البيانات'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans"
      dir="rtl"
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-block transition-transform hover:scale-105">
          <img src="/newLogo2.png" alt="سعودي براند" className="h-16 w-auto mx-auto" />
        </Link>
        <h2 className="mt-4 text-2xl font-black text-gray-900">تسجيل دخول الإدارة</h2>
        <p className="mt-1 text-xs text-gray-500">لوحة تحكم وإدارة متجر سعودي براند</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-gray-100 sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                البريد الإلكتروني
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@saudibrand.com"
                startIcon={<Mail className="h-4 w-4 text-gray-400" />}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">كلمة المرور</label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                startIcon={<Lock className="h-4 w-4 text-gray-400" />}
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 font-bold"
              isLoading={isLoading}
            >
              تسجيل الدخول
            </Button>
          </form>

          {/* Quick Demo Fill */}
          <div className="mt-4 p-3 bg-brand-soft-pink/40 border border-brand-primary/20 rounded-xl text-center">
            <p className="text-[11px] text-gray-600 mb-1.5">
              بيانات الدخول للتجربة:{' '}
              <span className="font-mono font-bold text-gray-800">admin@saudibrand.com</span> /{' '}
              <span className="font-mono font-bold text-gray-800">admin123</span>
            </p>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@saudibrand.com')
                setPassword('admin123')
              }}
              className="text-[11px] font-bold text-brand-primary hover:underline cursor-pointer"
            >
              اضغط هنا لتعبئة البيانات تلقائياً
            </button>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-4 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:underline"
            >
              <Store className="h-3.5 w-3.5" />
              <span>العودة إلى المتجر الرئيسي</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
