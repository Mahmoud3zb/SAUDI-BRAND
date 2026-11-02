import { createBrowserRouter } from 'react-router'
import App from '../App.tsx'
import { RootLayout } from '../components/layout/RootLayout.tsx'
import { CatalogPage } from '../features/products/pages/CatalogPage.tsx'
import { ProductDetailPage } from '../features/products/pages/ProductDetailPage.tsx'
import { AdminRoute } from '../features/admin/components/AdminRoute.tsx'
import { AdminLayout } from '../features/admin/components/AdminLayout.tsx'
import { AdminLoginPage } from '../features/admin/pages/AdminLoginPage.tsx'
import { AdminOverviewPage } from '../features/admin/pages/AdminOverviewPage.tsx'
import { AdminProductsPage } from '../features/admin/pages/AdminProductsPage.tsx'
import { AdminCategoriesPage } from '../features/admin/pages/AdminCategoriesPage.tsx'
import { AdminOrdersPage } from '../features/admin/pages/AdminOrdersPage.tsx'

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
        ],
      },
    ],
  },
])
