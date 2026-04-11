// store/useQuestStore.ts
// Store de misiones usando Zustand con persistencia en localStorage.
// Gestiona la lista de misiones, su completitud diaria e historial.

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { STORAGE_KEYS, GAME_RULES } from '@/lib/constants'
import { storageAdapter } from '@/hooks/useLocalStorage'
import type { QuestData } from '@/store/types'

// Campos requeridos al crear una misión (id y completitud se generan automáticamente)
type NewQuestInput = Omit<QuestData, 'id' | 'completedToday' | 'completedDates'>

interface QuestStore {
  quests: QuestData[]

  // Añade una nueva misión a la lista
  addQuest: (quest: NewQuestInput) => void

  // Elimina una misión por su id
  removeQuest: (id: string) => void

  // Marca una misión como completada hoy
  markCompleted: (id: string) => void

  // Desmarca una misión completada hoy (por error del usuario)
  markUncompleted: (id: string) => void

  // Resetea el estado "completada hoy" de todas las misiones (inicio del día)
  resetDailyCompletions: () => void
}

export const useQuestStore = create<QuestStore>()(
  persist(
    (set) => ({
      quests: [],

      addQuest: (questInput) => {
        const newQuest: QuestData = {
          ...questInput,
          id: crypto.randomUUID(),
          completedToday: false,
          completedDates: [],
        }
        set((state) => ({ quests: [...state.quests, newQuest] }))
      },

      removeQuest: (id) => {
        set((state) => ({
          quests: state.quests.filter((q) => q.id !== id),
        }))
      },

      markCompleted: (id) => {
        const today = new Date().toISOString().split('T')[0]
        set((state) => ({
          quests: state.quests.map((q) => {
            if (q.id !== id) return q

            // Añadir la fecha de hoy (evitar duplicados) y limitar a MAX_COMPLETED_DATES
            const updatedDates = [
              today,
              ...q.completedDates.filter((d) => d !== today),
            ].slice(0, GAME_RULES.MAX_COMPLETED_DATES)

            return { ...q, completedToday: true, completedDates: updatedDates }
          }),
        }))
      },

      markUncompleted: (id) => {
        set((state) => ({
          quests: state.quests.map((q) =>
            q.id === id ? { ...q, completedToday: false } : q
          ),
        }))
      },

      resetDailyCompletions: () => {
        set((state) => ({
          quests: state.quests.map((q) => ({ ...q, completedToday: false })),
        }))
      },
    }),
    {
      name: STORAGE_KEYS.QUESTS,
      storage: createJSONStorage(() => storageAdapter),
    }
  )
)
