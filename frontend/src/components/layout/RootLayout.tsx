import { Outlet } from 'react-router'
import { CartDrawer } from '../../features/cart/CartDrawer.tsx'
import { Footer } from './Footer.tsx'
import { Header } from './Header.tsx'
import { Navbar } from './Navbar.tsx'
import { TopBar } from './TopBar.tsx'

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-brand-background font-sans text-gray-900">
      <TopBar />
      <Header />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
