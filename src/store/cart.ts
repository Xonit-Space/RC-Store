import { create } from "zustand"
import { persist } from "zustand/middleware"
import { addCartItem, updateCartItemQty, deleteCartItem } from "@/actions/cart"

export interface CartProduct {
  id: string
  name: string
  price: number
  imageUrl: string
  size: string
  color: string
}

export interface LocalCartItem {
  id: string          // unique line identifier
  variantId?: string
  addonId?: string
  parentProductId?: string
  quantity: number
  product: CartProduct
}

interface CartStore {
  items: LocalCartItem[]
  isLoading: boolean
  guestSessionId: string | null
  
  initializeGuestSession: () => void
  addItem: (item: Omit<LocalCartItem, "id">, userId?: string) => Promise<void>
  removeItem: (id: string, userId?: string) => Promise<void>
  updateQuantity: (id: string, qty: number, userId?: string) => Promise<void>
  clearCart: () => void
  
  // Computed values
  getSubtotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      guestSessionId: null,

      initializeGuestSession: () => {
        if (!get().guestSessionId) {
          const session = `gs_${Date.now()}_${Math.floor(100000 + Math.random() * 900000)}`
          set({ guestSessionId: session })
        }
      },

      addItem: async (newItem, userId) => {
        set({ isLoading: true })
        const { items, guestSessionId } = get()
        const key = `${newItem.variantId}`

        if (userId || guestSessionId) {
          // Sync with database asynchronously
          await addCartItem(
            newItem.variantId,
            newItem.addonId,
            newItem.parentProductId,
            newItem.quantity,
            userId,
            guestSessionId || undefined
          )
        }

        const existingItemIndex = items.findIndex((i) => 
          i.variantId === newItem.variantId && 
          i.addonId === newItem.addonId && 
          i.parentProductId === newItem.parentProductId
        )

        if (existingItemIndex > -1) {
          const updatedItems = [...items]
          updatedItems[existingItemIndex].quantity += newItem.quantity
          set({ items: updatedItems, isLoading: false })
        } else {
          const id = `li_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`
          set({
            items: [...items, { ...newItem, id }],
            isLoading: false,
          })
        }
      },

      removeItem: async (id, userId) => {
        set({ isLoading: true })
        const { items } = get()
        const item = items.find((i) => i.id === id)

        if (item && userId) {
          // If synced, delete from database too. For local items, we map variantId on database side
          await deleteCartItem(item.id)
        }

        set({
          items: items.filter((i) => i.id !== id),
          isLoading: false,
        })
      },

      updateQuantity: async (id, qty, userId) => {
        set({ isLoading: true })
        const { items } = get()
        const item = items.find((i) => i.id === id)

        if (item && userId) {
          await updateCartItemQty(item.id, qty)
        }

        if (qty <= 0) {
          set({
            items: items.filter((i) => i.id !== id),
            isLoading: false,
          })
        } else {
          set({
            items: items.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
            isLoading: false,
          })
        }
      },

      clearCart: () => set({ items: [] }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: "neoshop-cart-storage",
      skipHydration: true, // Manually hydrate in React layout to prevent server hydration mismatches
    }
  )
)
