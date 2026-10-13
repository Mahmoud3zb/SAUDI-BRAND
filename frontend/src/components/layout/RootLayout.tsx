import { useSyncExternalStore } from 'react'
import { Outlet, ScrollRestoration } from 'react-router'
import { Toaster } from 'sonner'
import { CartDrawer } from '../../features/cart/CartDrawer.tsx'
import { Footer } from './Footer.tsx'
import { Header } from './Header.tsx'
import { Navbar } from './Navbar.tsx'
import { TopBar } from './TopBar.tsx'

const MOBILE_QUERY = '(max-width: 639px)'

function subscribeToMobile(callback: () => void) {
  const mediaQuery = window.matchMedia(MOBILE_QUERY)
  mediaQuery.addEventListener('change', callback)
  return () => mediaQuery.removeEventListener('change', callback)
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches
}

function getMobileServerSnapshot() {
  return false
}

function useIsMobile() {
  return useSyncExternalStore(subscribeToMobile, getMobileSnapshot, getMobileServerSnapshot)
}

export function RootLayout() {
  const isMobile = useIsMobile()

  return (
    <div className="flex min-h-screen flex-col bg-brand-background font-sans text-gray-900">
      <ScrollRestoration />
      <TopBar />
      <Header />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <Toaster
        dir="rtl"
        position={isMobile ? 'bottom-center' : 'bottom-left'}
        closeButton
        richColors
        toastOptions={{
          closeButtonAriaLabel: 'إغلاق',
          className: 'font-sans font-medium',
          classNames: {
            toast: 'font-sans rounded-xl border shadow-md text-sm',
            title: 'font-sans text-sm font-medium',
            description: 'font-sans text-xs',
            actionButton:
              '!bg-brand-primary !text-white hover:!bg-brand-secondary font-sans font-medium text-xs px-3 py-1.5 rounded-lg transition-colors',
            closeButton: '!bg-white hover:!bg-gray-100 !text-gray-500 !border-gray-200',
          },
        }}
      />
    </div>
  )
}
