import { Search, ShoppingBag } from 'lucide-react'
import { Badge } from './components/ui/Badge.tsx'
import { Button } from './components/ui/Button.tsx'
import { Input } from './components/ui/Input.tsx'

function App() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6 sm:p-12">
      <section className="w-full max-w-md space-y-5 rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-md">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary">سعودي براند | SAUDI BRAND</h1>
          <p className="mt-2 text-sm text-gray-600">المتجر الإلكتروني للعناية والجمال والعطور</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge variant="soft">المرحلة الرابعة</Badge>
          <Badge variant="primary">هيكل المتجر المشترك</Badge>
          <Badge variant="gold">عروض حصرية</Badge>
        </div>

        <Input
          placeholder="ابحث عن منتجك المفضل..."
          startIcon={<Search className="h-4 w-4" aria-hidden="true" />}
        />

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            leftIcon={<ShoppingBag className="h-4 w-4" aria-hidden="true" />}
          >
            تسوقي الآن
          </Button>
          <Button variant="outline">استكشفي المزيد</Button>
        </div>
      </section>
    </div>
  )
}

export default App
