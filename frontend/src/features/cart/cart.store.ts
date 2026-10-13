import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { CartItem, CartState, Product } from '../../types/index.ts'

function isValidCartItem(item: unknown): item is CartItem {
  if (!item || typeof item !== 'object') return false
  const candidate = item as Partial<CartItem>
  if (typeof candidate.quantity !== 'number' || candidate.quantity <= 0) return false
  if (!candidate.product || typeof candidate.product !== 'object') return false
  const prod = candidate.product as Partial<Product>
  return (
    typeof prod.id === 'string' &&
    typeof prod.name === 'string' &&
    typeof prod.price === 'number' &&
    prod.price >= 0 &&
    prod.stockStatus !== 'out_of_stock'
  )
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product: Product, quantity = 1) => {
        if (!product || product.stockStatus === 'out_of_stock' || quantity <= 0) {
          return false
        }

        set((state) => {
          const existingIndex = state.items.findIndex((item) => item.product.id === product.id)
          if (existingIndex > -1) {
            const nextItems = [...state.items]
            const existingItem = nextItems[existingIndex]
            nextItems[existingIndex] = {
              ...existingItem,
              quantity: existingItem.quantity + quantity,
            }
            return { items: nextItems }
          }
          return { items: [...state.items, { product, quantity }] }
        })

        return true
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }))
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item,
          ),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      openCart: () => {
        set({ isOpen: true })
      },

      closeCart: () => {
        set({ isOpen: false })
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }))
      },

      getTotalQuantity: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      },
    }),
    {
      name: 'saudi-brand-cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist items; defensively filter out invalid items; never persist isOpen
        items: Array.isArray(state.items) ? state.items.filter(isValidCartItem) : [],
      }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.items)) {
          // Defensively sanitize items after rehydration
          state.items = state.items.filter(isValidCartItem)
          state.isOpen = false
        }
      },
    },
  ),
)

/**
 * Reactive selector hook for total cart item quantity.
 */
export const useCartTotalQuantity = (): number =>
  useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0))

/**
 * Reactive selector hook for cart subtotal.
 */
export const useCartSubtotal = (): number =>
  useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  )
