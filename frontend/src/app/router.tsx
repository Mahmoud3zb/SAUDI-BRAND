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
    lazy: () =>
      import('../features/admin/pages/AdminLoginPage.tsx').then((m) => ({
        Component: m.AdminLoginPage,
      })),
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
            lazy: () =>
              import('../features/admin/pages/AdminOverviewPage.tsx').then((m) => ({
                Component: m.AdminOverviewPage,
              })),
          },
          {
            path: 'finance',
            lazy: () =>
              import('../features/admin/pages/AdminFinancePage.tsx').then((m) => ({
                Component: m.AdminFinancePage,
              })),
          },
          {
            path: 'products',
            lazy: () =>
              import('../features/admin/pages/AdminProductsPage.tsx').then((m) => ({
                Component: m.AdminProductsPage,
              })),
          },
          {
            path: 'categories',
            lazy: () =>
              import('../features/admin/pages/AdminCategoriesPage.tsx').then((m) => ({
                Component: m.AdminCategoriesPage,
              })),
          },
          {
            path: 'orders',
            lazy: () =>
              import('../features/admin/pages/AdminOrdersPage.tsx').then((m) => ({
                Component: m.AdminOrdersPage,
              })),
          },
          {
            path: 'admins',
            lazy: () =>
              import('../features/admin/pages/AdminUsersPage.tsx').then((m) => ({
                Component: m.AdminUsersPage,
              })),
          },
          {
            path: 'settings',
            lazy: () =>
              import('../features/admin/pages/AdminSettingsPage.tsx').then((m) => ({
                Component: m.AdminSettingsPage,
              })),
          },
        ],
      },
    ],
  },
])
