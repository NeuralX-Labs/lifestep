// store/types.ts
// Tipos de datos centrales de LifeStep.
// Todos los stores y hooks usan estas interfaces.

import type { StatKey, DifficultyKey } from '@/lib/constants'

// Progreso de un stat individual (ej: VIT nivel 12 con 40 EXP acumulada)
export interface StatLevel {
  level: number
  exp: number
}

// Racha de días consecutivos
export interface PlayerStreak {
  current: number
  lastCompletedDate: string | null // formato 'YYYY-MM-DD'
}

// Datos completos del jugador guardados en localStorage
export interface PlayerData {
  name: string
  createdAt: string                     // 'YYYY-MM-DD'
  level: number
  exp: number
  expToNextLevel: number                // EXP necesaria para el siguiente nivel
  hp: number                            // 0–100
  gold: number
  isExhausted: boolean
  exhaustedUntil: string | null         // ISO timestamp
  stats: Record<StatKey, StatLevel>
  priorityStats: StatKey[]              // Los 2 pilares elegidos en onboarding
  streak: PlayerStreak
}

// Una misión (diaria o épica)
export interface QuestData {
  id: string
  name: string
  stat: StatKey
  difficulty: DifficultyKey
  isDaily: boolean
  isMandatory: boolean
  completedToday: boolean
  completedDates: string[]              // Últimas 30 fechas 'YYYY-MM-DD'
}

// Un premio en la tienda
export interface ShopItemData {
  id: string
  name: string
  cost: number
  redeemedCount: number
}
