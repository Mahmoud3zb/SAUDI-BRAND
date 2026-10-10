import { createBrowserRouter } from 'react-router'
import App from '../App.tsx'
import { RootLayout } from '../components/layout/RootLayout.tsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <App />,
      },
    ],
  },
])
