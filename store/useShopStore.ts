// store/useShopStore.ts
// Store de premios personales usando Zustand con persistencia en localStorage.

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/lib/constants'
import { storageAdapter } from '@/hooks/useLocalStorage'
import type { ShopItemData } from '@/store/types'

type NewItemInput = { name: string; cost: number }

interface ShopStore {
  items: ShopItemData[]
  addItem: (input: NewItemInput) => void
  removeItem: (id: string) => void
}

export const useShopStore = create<ShopStore>()(
  persist(
    (set) => ({
      items: [],

      addItem: (input) => {
        const newItem: ShopItemData = {
          id: crypto.randomUUID(),
          name: input.name,
          cost: input.cost,
          redeemedCount: 0,
        }
        set((state) => ({ items: [...state.items, newItem] }))
      },

      removeItem: (id) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== id) }))
      },
    }),
    {
      name: STORAGE_KEYS.SHOP,
      storage: createJSONStorage(() => storageAdapter),
    }
  )
)
