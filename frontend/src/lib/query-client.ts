import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes: catalog cache
      gcTime: 1000 * 60 * 30, // 30 minutes in inactive cache
      refetchOnWindowFocus: false, // avoids refetches on tab switching
      refetchOnReconnect: true, // revalidates upon connection recovery
      retry: 1, // single retry for transient network glitches
    },
    mutations: {
      retry: 0, // never auto-retry mutations (orders, cart, auth)
    },
  },
})
