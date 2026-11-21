import { createBrowserRouter } from 'react-router'
import App from '../App.tsx'
import { RootLayout } from '../components/layout/RootLayout.tsx'
import { CatalogPage } from '../features/products/pages/CatalogPage.tsx'
import { ProductDetailPage } from '../features/products/pages/ProductDetailPage.tsx'
import { CheckoutPage } from '../features/checkout/pages/CheckoutPage.tsx'
import { OrderSuccessPage } from '../features/checkout/pages/OrderSuccessPage.tsx'
import { ShippingPolicyPage } from '../features/pages/ShippingPolicyPage.tsx'
import { ReturnPolicyPage } from '../features/pages/ReturnPolicyPage.tsx'
import { AboutUsPage } from '../features/pages/AboutUsPage.tsx'
import { AdminRoute } from '../features/admin/components/AdminRoute.tsx'
import { AdminLayout } from '../features/admin/components/AdminLayout.tsx'
import { AdminLoginPage } from '../features/admin/pages/AdminLoginPage.tsx'
import { AdminOverviewPage } from '../features/admin/pages/AdminOverviewPage.tsx'
import { AdminProductsPage } from '../features/admin/pages/AdminProductsPage.tsx'
import { AdminCategoriesPage } from '../features/admin/pages/AdminCategoriesPage.tsx'
import { AdminOrdersPage } from '../features/admin/pages/AdminOrdersPage.tsx'
import { AdminUsersPage } from '../features/admin/pages/AdminUsersPage.tsx'
import { AdminSettingsPage } from '../features/admin/pages/AdminSettingsPage.tsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <App />,
      },
      {
        path: 'products',
        element: <CatalogPage />,
      },
      {
        path: 'products/:productId',
        element: <ProductDetailPage />,
      },
      {
        path: 'category/:categorySlug',
        element: <CatalogPage />,
      },
      {
        path: 'checkout',
        element: <CheckoutPage />,
      },
      {
        path: 'order-success/:orderId',
        element: <OrderSuccessPage />,
      },
      {
        path: 'shipping-policy',
        element: <ShippingPolicyPage />,
      },
      {
        path: 'return-policy',
        element: <ReturnPolicyPage />,
      },
      {
        path: 'about-us',
        element: <AboutUsPage />,
      },
    ],
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/admin',
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <AdminOverviewPage />,
          },
          {
            path: 'products',
            element: <AdminProductsPage />,
          },
          {
            path: 'categories',
            element: <AdminCategoriesPage />,
          },
          {
            path: 'orders',
            element: <AdminOrdersPage />,
          },
          {
            path: 'admins',
            element: <AdminUsersPage />,
          },
          {
            path: 'settings',
            element: <AdminSettingsPage />,
          },
        ],
      },
    ],
  },
])
