// store/usePlayerStore.ts
// Store global del jugador usando Zustand con persistencia en localStorage.
// Contiene todo el estado del jugador y las acciones para modificarlo.

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { STORAGE_KEYS, GAME_RULES, expForNextLevel } from '@/lib/constants'
import type { StatKey } from '@/lib/constants'
import { storageAdapter } from '@/hooks/useLocalStorage'
import type { PlayerData } from '@/store/types'

// Estado inicial de un stat (nivel 1, sin EXP acumulada)
const INITIAL_STAT = { level: 1, exp: 0 }

// Crea los datos iniciales para un jugador nuevo
function createInitialPlayer(name: string, priorityStats: StatKey[]): PlayerData {
  return {
    name,
    createdAt: new Date().toISOString().split('T')[0],
    level: 1,
    exp: 0,
    expToNextLevel: expForNextLevel(1), // 100
    hp: GAME_RULES.MAX_HP,
    gold: 0,
    isExhausted: false,
    exhaustedUntil: null,
    stats: {
      VIT: { ...INITIAL_STAT },
      WIS: { ...INITIAL_STAT },
      WIL: { ...INITIAL_STAT },
      SOC: { ...INITIAL_STAT },
      FOR: { ...INITIAL_STAT },
    },
    priorityStats,
    streak: {
      current: 0,
      lastCompletedDate: null,
    },
  }
}

// Interfaz del store: qué datos y qué acciones expone
interface PlayerStore {
  player: PlayerData | null

  // Crea un jugador nuevo (solo se llama en el Onboarding)
  initPlayer: (name: string, priorityStats: StatKey[]) => void

  // Recompensas de misiones
  gainExp: (amount: number) => void
  gainGold: (amount: number) => void
  gainStatExp: (stat: StatKey, amount: number) => void

  // HP
  loseHP: (amount: number) => void
  gainHP: (amount: number) => void

  // Gastar gold (devuelve false si no hay suficiente)
  spendGold: (amount: number) => boolean

  // Estado Agotado
  setExhausted: (until: string) => void
  clearExhausted: () => void

  // Racha
  updateStreak: (today: string) => void

  // Resetea el jugador (útil para tests y "nueva partida")
  resetPlayer: () => void
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      player: null,

      initPlayer: (name, priorityStats) => {
        set({ player: createInitialPlayer(name, priorityStats) })
      },

      gainExp: (amount) => {
        set((state) => {
          if (!state.player) return state

          let { exp, expToNextLevel, level } = state.player
          exp += amount

          // Procesar subidas de nivel (puede subir varios a la vez)
          while (exp >= expToNextLevel) {
            exp -= expToNextLevel
            level += 1
            expToNextLevel = expForNextLevel(level)
          }

          return { player: { ...state.player, exp, expToNextLevel, level } }
        })
      },

      gainGold: (amount) => {
        set((state) => {
          if (!state.player) return state
          return { player: { ...state.player, gold: state.player.gold + amount } }
        })
      },

      gainStatExp: (stat, amount) => {
        set((state) => {
          if (!state.player) return state

          const statData = { ...state.player.stats[stat] }
          statData.exp += amount

          // Subir nivel del stat cuando acumula suficiente EXP (misma fórmula que el jugador)
          const threshold = statData.level * 100
          if (statData.exp >= threshold) {
            statData.exp -= threshold
            statData.level += 1
          }

          return {
            player: {
              ...state.player,
              stats: { ...state.player.stats, [stat]: statData },
            },
          }
        })
      },

      loseHP: (amount) => {
        set((state) => {
          if (!state.player) return state

          const hp = Math.max(0, state.player.hp - amount)
          const updates: Partial<PlayerData> = { hp }

          // Activar estado Agotado si HP llega a 0 por primera vez
          if (hp === 0 && !state.player.isExhausted) {
            const exhaustedUntil = new Date(
              Date.now() + GAME_RULES.EXHAUSTED_DURATION_H * 60 * 60 * 1000
            ).toISOString()
            updates.isExhausted = true
            updates.exhaustedUntil = exhaustedUntil
          }

          return { player: { ...state.player, ...updates } }
        })
      },

      gainHP: (amount) => {
        set((state) => {
          if (!state.player) return state
          const hp = Math.min(GAME_RULES.MAX_HP, state.player.hp + amount)
          return { player: { ...state.player, hp } }
        })
      },

      spendGold: (amount) => {
        const { player } = get()
        if (!player || player.gold < amount) return false

        set((state) => {
          if (!state.player) return state
          return { player: { ...state.player, gold: state.player.gold - amount } }
        })
        return true
      },

      setExhausted: (until) => {
        set((state) => {
          if (!state.player) return state
          return { player: { ...state.player, isExhausted: true, exhaustedUntil: until } }
        })
      },

      clearExhausted: () => {
        set((state) => {
          if (!state.player) return state
          return { player: { ...state.player, isExhausted: false, exhaustedUntil: null } }
        })
      },

      updateStreak: (today) => {
        set((state) => {
          if (!state.player) return state

          const { current, lastCompletedDate } = state.player.streak

          // Ya se actualizó hoy → no hacer nada
          if (lastCompletedDate === today) return state

          // Si ayer era el último día de racha → continuar; si no → resetear a 1
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
          const newCurrent = lastCompletedDate === yesterday ? current + 1 : 1

          return {
            player: {
              ...state.player,
              streak: { current: newCurrent, lastCompletedDate: today },
            },
          }
        })
      },

      resetPlayer: () => {
        set({ player: null })
      },
    }),
    {
      name: STORAGE_KEYS.PLAYER,
      storage: createJSONStorage(() => storageAdapter),
    }
  )
)
