import { createBrowserRouter } from 'react-router'
import App from '../App.tsx'
import { RootLayout } from '../components/layout/RootLayout.tsx'
import { CatalogPage } from '../features/products/pages/CatalogPage.tsx'
import { ProductDetailPage } from '../features/products/pages/ProductDetailPage.tsx'

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
])
