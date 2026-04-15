# LifeStep — Fase 2: Stores, Hooks y Lógica del Juego

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar los stores de Zustand, hooks de persistencia y lógica del juego que alimentarán todas las pantallas de LifeStep.

**Architecture:** Tres capas: (1) tipos TypeScript en `store/types.ts`; (2) stores de Zustand con persist en `store/` usando un adaptador de localStorage en `hooks/useLocalStorage.ts`; (3) hook de lógica de negocio en `hooks/useGameLogic.ts` que orquesta ambos stores. Para migrar a Supabase en el futuro: solo hay que reemplazar el adaptador en `hooks/useLocalStorage.ts`.

**Tech Stack:** Next.js 16.2.3, TypeScript 5, Zustand v5.0.12, Vitest 3 (testing), jsdom, @testing-library/react

---

## Mapa de archivos (Fase 2)

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `store/types.ts` | Crear | Interfaces TypeScript para PlayerData, QuestData, ShopItemData |
| `hooks/useLocalStorage.ts` | Crear | Adaptador de localStorage para Zustand persist (intercambiable con Supabase) |
| `store/usePlayerStore.ts` | Crear | Store del jugador: HP, EXP, Gold, nivel, stats, racha |
| `store/useQuestStore.ts` | Crear | Store de misiones: lista, completar, resetear diarias |
| `hooks/useGameLogic.ts` | Crear | Lógica del juego: completar misión, penalizaciones, multiplicadores |
| `vitest.config.ts` | Crear | Configuración de Vitest para tests unitarios |
| `tests/setup.ts` | Crear | Setup global de tests (limpiar localStorage) |
| `tests/store/usePlayerStore.test.ts` | Crear | Tests del store del jugador |
| `tests/store/useQuestStore.test.ts` | Crear | Tests del store de misiones |
| `tests/hooks/useGameLogic.test.ts` | Crear | Tests de la lógica del juego |

---

## Tarea 1: Tipos TypeScript

**Archivos:**
- Crear: `store/types.ts`

- [ ] **Paso 1.1: Crear el directorio store y el archivo types.ts**

Crea `store/types.ts` con este contenido:

```typescript
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
```

- [ ] **Paso 1.2: Verificar TypeScript**

```bash
cd "b:/Proyectos IA/LifeStep" && npx tsc --noEmit
```

Resultado esperado: sin output (= sin errores).

- [ ] **Paso 1.3: Commit**

```bash
cd "b:/Proyectos IA/LifeStep" && git add store/types.ts && git commit -m "feat: tipos TypeScript para stores de LifeStep"
```

---

## Tarea 2: Configurar Vitest

**Archivos:**
- Crear: `vitest.config.ts`
- Crear: `tests/setup.ts`
- Modificar: `package.json` (agregar script "test")

- [ ] **Paso 2.1: Instalar dependencias de testing**

```bash
cd "b:/Proyectos IA/LifeStep" && npm install -D vitest @vitejs/plugin-react jsdom
```

Resultado esperado: las 3 librerías aparecen en `devDependencies` en `package.json`.

- [ ] **Paso 2.2: Crear vitest.config.ts**

Crea `vitest.config.ts` en la raíz del proyecto:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

- [ ] **Paso 2.3: Crear tests/setup.ts**

Crea el directorio `tests/` y el archivo `tests/setup.ts`:

```typescript
// tests/setup.ts
// Configuración global ejecutada antes de cada archivo de test.
// Limpia localStorage entre tests para evitar interferencias.

import { beforeEach, afterEach } from 'vitest'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  localStorage.clear()
})
```

- [ ] **Paso 2.4: Agregar script "test" en package.json**

En `package.json`, reemplaza la sección `"scripts"` con:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Paso 2.5: Verificar que Vitest funciona con un test de humo**

Crea un test temporal `tests/smoke.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { expForNextLevel } from '@/lib/constants'

describe('smoke test', () => {
  it('expForNextLevel retorna nivel * 100', () => {
    expect(expForNextLevel(1)).toBe(100)
    expect(expForNextLevel(3)).toBe(300)
    expect(expForNextLevel(10)).toBe(1000)
  })
})
```

```bash
cd "b:/Proyectos IA/LifeStep" && npm test
```

Resultado esperado:
```
✓ tests/smoke.test.ts (1)
  ✓ smoke test > expForNextLevel retorna nivel * 100
Test Files  1 passed (1)
Tests       1 passed (1)
```

- [ ] **Paso 2.6: Eliminar el test temporal**

```bash
cd "b:/Proyectos IA/LifeStep" && rm tests/smoke.test.ts
```

- [ ] **Paso 2.7: Commit**

```bash
cd "b:/Proyectos IA/LifeStep" && git add vitest.config.ts tests/setup.ts package.json package-lock.json && git commit -m "feat: configurar Vitest para tests unitarios"
```

---

## Tarea 3: Storage adapter

**Archivos:**
- Crear: `hooks/useLocalStorage.ts`

- [ ] **Paso 3.1: Crear el directorio hooks y el archivo useLocalStorage.ts**

Crea `hooks/useLocalStorage.ts`:

```typescript
// hooks/useLocalStorage.ts
// Adaptador de almacenamiento para los stores de Zustand.
//
// ¿Cómo funciona? Zustand necesita un objeto con 3 métodos (getItem, setItem,
// removeItem) para saber dónde guardar y cargar datos. Este archivo provee
// esos métodos usando localStorage del navegador.
//
// ¿Por qué este archivo separado? Para migrar a Supabase en el futuro:
// solo cambia este archivo. El resto del código (stores, componentes) no toca.

export const storageAdapter = {
  // Lee un valor guardado (devuelve null si no existe)
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null  // evita errores en SSR
    return window.localStorage.getItem(name)
  },

  // Guarda un valor (Zustand lo serializa a JSON antes de llamar esta función)
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(name, value)
  },

  // Elimina un valor guardado
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(name)
  },
}
```

- [ ] **Paso 3.2: Verificar TypeScript**

```bash
cd "b:/Proyectos IA/LifeStep" && npx tsc --noEmit
```

Resultado esperado: sin output.

- [ ] **Paso 3.3: Commit**

```bash
cd "b:/Proyectos IA/LifeStep" && git add hooks/useLocalStorage.ts && git commit -m "feat: storage adapter para persistencia (preparado para Supabase)"
```

---

## Tarea 4: usePlayerStore

**Archivos:**
- Crear: `store/usePlayerStore.ts`
- Crear: `tests/store/usePlayerStore.test.ts`

- [ ] **Paso 4.1: Escribir los tests del player store**

Crea el directorio `tests/store/` y el archivo `tests/store/usePlayerStore.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { usePlayerStore } from '@/store/usePlayerStore'
import { GAME_RULES } from '@/lib/constants'

// Helper para resetear el store antes de cada test
const resetStore = () => usePlayerStore.setState({ player: null })

describe('usePlayerStore', () => {
  beforeEach(() => {
    resetStore()
    localStorage.clear()
  })

  describe('initPlayer', () => {
    it('crea un jugador con los valores iniciales correctos', () => {
      usePlayerStore.getState().initPlayer('Jorge', ['VIT', 'WIS'])
      const { player } = usePlayerStore.getState()

      expect(player).not.toBeNull()
      expect(player?.name).toBe('Jorge')
      expect(player?.level).toBe(1)
      expect(player?.exp).toBe(0)
      expect(player?.expToNextLevel).toBe(100)
      expect(player?.hp).toBe(GAME_RULES.MAX_HP)
      expect(player?.gold).toBe(0)
      expect(player?.isExhausted).toBe(false)
      expect(player?.priorityStats).toEqual(['VIT', 'WIS'])
    })

    it('inicializa todos los stats en nivel 1 con 0 EXP', () => {
      usePlayerStore.getState().initPlayer('Jorge', ['VIT', 'WIS'])
      const { player } = usePlayerStore.getState()

      expect(player?.stats.VIT).toEqual({ level: 1, exp: 0 })
      expect(player?.stats.WIS).toEqual({ level: 1, exp: 0 })
      expect(player?.stats.WIL).toEqual({ level: 1, exp: 0 })
      expect(player?.stats.SOC).toEqual({ level: 1, exp: 0 })
      expect(player?.stats.FOR).toEqual({ level: 1, exp: 0 })
    })
  })

  describe('gainExp', () => {
    it('acumula EXP sin subir de nivel', () => {
      usePlayerStore.getState().initPlayer('Jorge', ['VIT'])
      usePlayerStore.getState().gainExp(50)
      const { player } = usePlayerStore.getState()

      expect(player?.exp).toBe(50)
      expect(player?.level).toBe(1)
    })

    it('sube de nivel cuando acumula EXP suficiente', () => {
      usePlayerStore.getState().initPlayer('Jorge', ['VIT'])
      usePlayerStore.getState().gainExp(100) // nivel 1→2 necesita 100 EXP
      const { player } = usePlayerStore.getState()

      expect(player?.level).toBe(2)
      expect(player?.exp).toBe(0)
      expect(player?.expToNextLevel).toBe(200) // nivel 2 necesita 200
    })

    it('sube varios niveles de golpe con mucha EXP', () => {
      usePlayerStore.getState().initPlayer('Jorge', ['VIT'])
      usePlayerStore.getState().gainExp(300) // 100 + 200 = sube 2 niveles
      const { player } = usePlayerStore.getState()

      expect(player?.level).toBe(3)
      expect(player?.exp).toBe(0)
    })
  })

  describe('loseHP', () => {
    it('reduce HP correctamente', () => {
      usePlayerStore.getState().initPlayer('Jorge', ['VIT'])
      usePlayerStore.getState().loseHP(20)
      const { player } = usePlayerStore.getState()

      expect(player?.hp).toBe(80)
    })

    it('no baja de 0 HP', () => {
      usePlayerStore.getState().initPlayer('Jorge', ['VIT'])
      usePlayerStore.getState().loseHP(200)
      const { player } = usePlayerStore.getState()

      expect(player?.hp).toBe(0)
    })

    it('activa estado Agotado cuando HP llega a 0', () => {
      usePlayerStore.getState().initPlayer('Jorge', ['VIT'])
      usePlayerStore.getState().loseHP(100)
      const { player } = usePlayerStore.getState()

      expect(player?.isExhausted).toBe(true)
      expect(player?.exhaustedUntil).not.toBeNull()
    })
  })

  describe('spendGold', () => {
    it('descuenta gold y devuelve true si hay suficiente', () => {
      usePlayerStore.getState().initPlayer('Jorge', ['VIT'])
      usePlayerStore.getState().gainGold(100)
      const result = usePlayerStore.getState().spendGold(50)
      const { player } = usePlayerStore.getState()

      expect(result).toBe(true)
      expect(player?.gold).toBe(50)
    })

    it('no descuenta y devuelve false si no hay suficiente gold', () => {
      usePlayerStore.getState().initPlayer('Jorge', ['VIT'])
      usePlayerStore.getState().gainGold(30)
      const result = usePlayerStore.getState().spendGold(50)
      const { player } = usePlayerStore.getState()

      expect(result).toBe(false)
      expect(player?.gold).toBe(30)
    })
  })
})
```

- [ ] **Paso 4.2: Ejecutar los tests para verificar que fallan**

```bash
cd "b:/Proyectos IA/LifeStep" && npm test
```

Resultado esperado: FAIL — "Cannot find module '@/store/usePlayerStore'"

- [ ] **Paso 4.3: Crear store/usePlayerStore.ts**

Crea `store/usePlayerStore.ts`:

```typescript
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
```

- [ ] **Paso 4.4: Ejecutar los tests para verificar que pasan**

```bash
cd "b:/Proyectos IA/LifeStep" && npm test
```

Resultado esperado:
```
✓ tests/store/usePlayerStore.test.ts (10)
Test Files  1 passed (1)
Tests  10 passed (10)
```

Si algún test falla, revisa el mensaje de error y corrige el store antes de continuar.

- [ ] **Paso 4.5: Verificar TypeScript**

```bash
cd "b:/Proyectos IA/LifeStep" && npx tsc --noEmit
```

Resultado esperado: sin output.

- [ ] **Paso 4.6: Commit**

```bash
cd "b:/Proyectos IA/LifeStep" && git add store/usePlayerStore.ts tests/store/usePlayerStore.test.ts && git commit -m "feat: usePlayerStore con tests — HP, EXP, Gold, stats y racha"
```

---

## Tarea 5: useQuestStore

**Archivos:**
- Crear: `store/useQuestStore.ts`
- Crear: `tests/store/useQuestStore.test.ts`

- [ ] **Paso 5.1: Escribir los tests del quest store**

Crea `tests/store/useQuestStore.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { useQuestStore } from '@/store/useQuestStore'
import { GAME_RULES } from '@/lib/constants'

const resetStore = () => useQuestStore.setState({ quests: [] })

describe('useQuestStore', () => {
  beforeEach(() => {
    resetStore()
    localStorage.clear()
  })

  describe('addQuest', () => {
    it('agrega una misión con id generado automáticamente', () => {
      useQuestStore.getState().addQuest({
        name: 'Correr 30 min',
        stat: 'VIT',
        difficulty: 'easy',
        isDaily: true,
        isMandatory: true,
      })
      const { quests } = useQuestStore.getState()

      expect(quests).toHaveLength(1)
      expect(quests[0].name).toBe('Correr 30 min')
      expect(quests[0].id).toBeTruthy()
      expect(quests[0].completedToday).toBe(false)
      expect(quests[0].completedDates).toEqual([])
    })

    it('genera IDs únicos para cada misión', () => {
      useQuestStore.getState().addQuest({ name: 'Quest 1', stat: 'VIT', difficulty: 'easy', isDaily: true, isMandatory: false })
      useQuestStore.getState().addQuest({ name: 'Quest 2', stat: 'WIS', difficulty: 'medium', isDaily: true, isMandatory: false })
      const { quests } = useQuestStore.getState()

      expect(quests[0].id).not.toBe(quests[1].id)
    })
  })

  describe('markCompleted', () => {
    it('marca la misión como completada hoy', () => {
      useQuestStore.getState().addQuest({ name: 'Leer', stat: 'WIS', difficulty: 'easy', isDaily: true, isMandatory: false })
      const questId = useQuestStore.getState().quests[0].id

      useQuestStore.getState().markCompleted(questId)
      const quest = useQuestStore.getState().quests[0]

      expect(quest.completedToday).toBe(true)
      expect(quest.completedDates).toHaveLength(1)
    })

    it('no duplica la fecha si se llama dos veces el mismo día', () => {
      useQuestStore.getState().addQuest({ name: 'Leer', stat: 'WIS', difficulty: 'easy', isDaily: true, isMandatory: false })
      const questId = useQuestStore.getState().quests[0].id

      useQuestStore.getState().markCompleted(questId)
      useQuestStore.getState().markCompleted(questId)
      const quest = useQuestStore.getState().quests[0]

      expect(quest.completedDates).toHaveLength(1)
    })

    it('no guarda más de MAX_COMPLETED_DATES fechas', () => {
      useQuestStore.getState().addQuest({ name: 'Leer', stat: 'WIS', difficulty: 'easy', isDaily: true, isMandatory: false })
      const questId = useQuestStore.getState().quests[0].id

      // Forzar muchas fechas directamente en el store
      const manyDates = Array.from(
        { length: GAME_RULES.MAX_COMPLETED_DATES + 5 },
        (_, i) => `2026-01-${String(i + 1).padStart(2, '0')}`
      )
      useQuestStore.setState({
        quests: [{ ...useQuestStore.getState().quests[0], completedDates: manyDates }],
      })

      useQuestStore.getState().markCompleted(questId)
      const quest = useQuestStore.getState().quests[0]

      expect(quest.completedDates.length).toBeLessThanOrEqual(GAME_RULES.MAX_COMPLETED_DATES)
    })
  })

  describe('removeQuest', () => {
    it('elimina la misión por id', () => {
      useQuestStore.getState().addQuest({ name: 'Quest A', stat: 'VIT', difficulty: 'easy', isDaily: true, isMandatory: false })
      useQuestStore.getState().addQuest({ name: 'Quest B', stat: 'WIS', difficulty: 'easy', isDaily: true, isMandatory: false })
      const idA = useQuestStore.getState().quests[0].id

      useQuestStore.getState().removeQuest(idA)
      const { quests } = useQuestStore.getState()

      expect(quests).toHaveLength(1)
      expect(quests[0].name).toBe('Quest B')
    })
  })

  describe('resetDailyCompletions', () => {
    it('pone completedToday en false para todas las misiones', () => {
      useQuestStore.getState().addQuest({ name: 'Q1', stat: 'VIT', difficulty: 'easy', isDaily: true, isMandatory: false })
      useQuestStore.getState().addQuest({ name: 'Q2', stat: 'WIS', difficulty: 'easy', isDaily: true, isMandatory: false })
      const [id1, id2] = useQuestStore.getState().quests.map((q) => q.id)

      useQuestStore.getState().markCompleted(id1)
      useQuestStore.getState().markCompleted(id2)
      useQuestStore.getState().resetDailyCompletions()

      const { quests } = useQuestStore.getState()
      expect(quests.every((q) => !q.completedToday)).toBe(true)
    })
  })
})
```

- [ ] **Paso 5.2: Ejecutar los tests para verificar que fallan**

```bash
cd "b:/Proyectos IA/LifeStep" && npm test
```

Resultado esperado: FAIL — "Cannot find module '@/store/useQuestStore'"

- [ ] **Paso 5.3: Crear store/useQuestStore.ts**

Crea `store/useQuestStore.ts`:

```typescript
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
```

- [ ] **Paso 5.4: Ejecutar los tests para verificar que pasan**

```bash
cd "b:/Proyectos IA/LifeStep" && npm test
```

Resultado esperado:
```
✓ tests/store/usePlayerStore.test.ts (10)
✓ tests/store/useQuestStore.test.ts (7)
Test Files  2 passed (2)
Tests  17 passed (17)
```

Si algún test falla, revisa el error y corrige el store antes de continuar.

- [ ] **Paso 5.5: Verificar TypeScript**

```bash
cd "b:/Proyectos IA/LifeStep" && npx tsc --noEmit
```

Resultado esperado: sin output.

- [ ] **Paso 5.6: Commit**

```bash
cd "b:/Proyectos IA/LifeStep" && git add store/useQuestStore.ts tests/store/useQuestStore.test.ts && git commit -m "feat: useQuestStore con tests — misiones, completitud y reseteo diario"
```

---

## Tarea 6: useGameLogic

**Archivos:**
- Crear: `hooks/useGameLogic.ts`
- Crear: `tests/hooks/useGameLogic.test.ts`

- [ ] **Paso 6.1: Instalar @testing-library/react para tests de hooks React**

```bash
cd "b:/Proyectos IA/LifeStep" && npm install -D @testing-library/react
```

- [ ] **Paso 6.2: Escribir los tests de useGameLogic**

Crea el directorio `tests/hooks/` y el archivo `tests/hooks/useGameLogic.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGameLogic } from '@/hooks/useGameLogic'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useQuestStore } from '@/store/useQuestStore'
import { GAME_RULES, DIFFICULTIES } from '@/lib/constants'

const resetStores = () => {
  usePlayerStore.setState({ player: null })
  useQuestStore.setState({ quests: [] })
}

describe('useGameLogic', () => {
  beforeEach(() => {
    resetStores()
    localStorage.clear()
  })

  describe('getRewardMultiplier', () => {
    it('devuelve 1 cuando no hay racha ni agotamiento', () => {
      usePlayerStore.getState().initPlayer('Jorge', ['VIT'])
      const { result } = renderHook(() => useGameLogic())
      expect(result.current.getRewardMultiplier()).toBe(1)
    })

    it('devuelve EXHAUSTED_MULTIPLIER cuando el jugador está agotado', () => {
      usePlayerStore.getState().initPlayer('Jorge', ['VIT'])
      usePlayerStore.getState().loseHP(100) // activa agotamiento (HP → 0)
      const { result } = renderHook(() => useGameLogic())
      expect(result.current.getRewardMultiplier()).toBe(GAME_RULES.EXHAUSTED_MULTIPLIER)
    })

    it('devuelve STREAK_MULTIPLIER cuando hay racha activa (>= 3 días)', () => {
      usePlayerStore.getState().initPlayer('Jorge', ['VIT'])
      // Forzar racha de 5 días directamente
      usePlayerStore.setState((state) => ({
        player: state.player
          ? { ...state.player, streak: { current: 5, lastCompletedDate: '2026-04-10' } }
          : null,
      }))
      const { result } = renderHook(() => useGameLogic())
      expect(result.current.getRewardMultiplier()).toBe(GAME_RULES.STREAK_MULTIPLIER)
    })
  })

  describe('completeQuest', () => {
    it('completa la misión y da EXP y Gold al jugador', () => {
      usePlayerStore.getState().initPlayer('Jorge', ['VIT'])
      useQuestStore.getState().addQuest({
        name: 'Correr',
        stat: 'VIT',
        difficulty: 'easy',
        isDaily: true,
        isMandatory: false,
      })
      const questId = useQuestStore.getState().quests[0].id

      const { result } = renderHook(() => useGameLogic())
      act(() => { result.current.completeQuest(questId) })

      const { player } = usePlayerStore.getState()
      const quest = useQuestStore.getState().quests[0]

      expect(quest.completedToday).toBe(true)
      expect(player?.exp).toBe(DIFFICULTIES.easy.exp)   // 10
      expect(player?.gold).toBe(DIFFICULTIES.easy.gold) // 5
    })

    it('no completa una misión ya completada hoy', () => {
      usePlayerStore.getState().initPlayer('Jorge', ['VIT'])
      useQuestStore.getState().addQuest({
        name: 'Correr',
        stat: 'VIT',
        difficulty: 'easy',
        isDaily: true,
        isMandatory: false,
      })
      const questId = useQuestStore.getState().quests[0].id

      const { result } = renderHook(() => useGameLogic())
      act(() => { result.current.completeQuest(questId) })
      act(() => { result.current.completeQuest(questId) }) // segunda vez → no debe sumar

      const { player } = usePlayerStore.getState()
      expect(player?.exp).toBe(DIFFICULTIES.easy.exp) // solo 10, no 20
    })
  })

  describe('applyDailyPenalties', () => {
    it('descuenta HP por cada misión obligatoria no completada', () => {
      usePlayerStore.getState().initPlayer('Jorge', ['VIT'])
      useQuestStore.getState().addQuest({ name: 'Correr', stat: 'VIT', difficulty: 'easy', isDaily: true, isMandatory: true })
      useQuestStore.getState().addQuest({ name: 'Leer', stat: 'WIS', difficulty: 'easy', isDaily: true, isMandatory: true })

      const { result } = renderHook(() => useGameLogic())
      act(() => { result.current.applyDailyPenalties() })

      const { player } = usePlayerStore.getState()
      const expectedHP = GAME_RULES.MAX_HP - 2 * GAME_RULES.HP_PENALTY_PER_MISS
      expect(player?.hp).toBe(expectedHP) // 100 - 20 = 80
    })

    it('no descuenta HP por misiones obligatorias completadas', () => {
      usePlayerStore.getState().initPlayer('Jorge', ['VIT'])
      useQuestStore.getState().addQuest({ name: 'Correr', stat: 'VIT', difficulty: 'easy', isDaily: true, isMandatory: true })
      const questId = useQuestStore.getState().quests[0].id

      const { result } = renderHook(() => useGameLogic())
      act(() => { result.current.completeQuest(questId) })
      act(() => { result.current.applyDailyPenalties() })

      const { player } = usePlayerStore.getState()
      expect(player?.hp).toBe(GAME_RULES.MAX_HP) // sin penalización
    })

    it('resetea completedToday después de aplicar penalizaciones', () => {
      usePlayerStore.getState().initPlayer('Jorge', ['VIT'])
      useQuestStore.getState().addQuest({ name: 'Correr', stat: 'VIT', difficulty: 'easy', isDaily: true, isMandatory: true })
      const questId = useQuestStore.getState().quests[0].id

      const { result } = renderHook(() => useGameLogic())
      act(() => { result.current.completeQuest(questId) })
      act(() => { result.current.applyDailyPenalties() })

      const { quests } = useQuestStore.getState()
      expect(quests.every((q) => !q.completedToday)).toBe(true)
    })
  })

  describe('recoverWithGold', () => {
    it('cura al jugador y quita el estado agotado si hay gold suficiente', () => {
      usePlayerStore.getState().initPlayer('Jorge', ['VIT'])
      usePlayerStore.getState().loseHP(100)    // activa agotamiento
      usePlayerStore.getState().gainGold(100)  // da suficiente gold

      const { result } = renderHook(() => useGameLogic())
      let recovered!: boolean
      act(() => { recovered = result.current.recoverWithGold() })

      const { player } = usePlayerStore.getState()
      expect(recovered).toBe(true)
      expect(player?.isExhausted).toBe(false)
      expect(player?.hp).toBe(GAME_RULES.MAX_HP)
      expect(player?.gold).toBe(100 - GAME_RULES.RECOVERY_GOLD_COST) // 50
    })

    it('devuelve false si no hay suficiente gold', () => {
      usePlayerStore.getState().initPlayer('Jorge', ['VIT'])
      usePlayerStore.getState().loseHP(100)
      usePlayerStore.getState().gainGold(10) // menos de RECOVERY_GOLD_COST (50)

      const { result } = renderHook(() => useGameLogic())
      let recovered!: boolean
      act(() => { recovered = result.current.recoverWithGold() })

      const { player } = usePlayerStore.getState()
      expect(recovered).toBe(false)
      expect(player?.isExhausted).toBe(true) // sigue agotado
    })
  })
})
```

- [ ] **Paso 6.3: Ejecutar los tests para verificar que fallan**

```bash
cd "b:/Proyectos IA/LifeStep" && npm test
```

Resultado esperado: FAIL — "Cannot find module '@/hooks/useGameLogic'"

- [ ] **Paso 6.4: Crear hooks/useGameLogic.ts**

Crea `hooks/useGameLogic.ts`:

```typescript
// hooks/useGameLogic.ts
// Hook de lógica de negocio del juego.
// Orquesta el usePlayerStore y useQuestStore para implementar las reglas del juego:
// completar misiones, aplicar penalizaciones diarias y recuperar de estado agotado.

import { usePlayerStore } from '@/store/usePlayerStore'
import { useQuestStore } from '@/store/useQuestStore'
import { GAME_RULES, DIFFICULTIES } from '@/lib/constants'

export function useGameLogic() {
  const playerActions = usePlayerStore()
  const questActions = useQuestStore()

  // Calcula el multiplicador de recompensas según el estado del jugador:
  // - Agotado → ×0.5 (penalización)
  // - Racha activa (≥3 días) → ×1.2 (bonus)
  // - Sin ninguna condición → ×1 (normal)
  const getRewardMultiplier = (): number => {
    const { player } = playerActions
    if (!player) return 1
    if (player.isExhausted) return GAME_RULES.EXHAUSTED_MULTIPLIER
    if (player.streak.current >= GAME_RULES.STREAK_MIN_DAYS) return GAME_RULES.STREAK_MULTIPLIER
    return 1
  }

  // Completa una misión: la marca como completada y entrega EXP, Gold y EXP de stat
  const completeQuest = (questId: string): void => {
    const quest = questActions.quests.find((q) => q.id === questId)
    if (!quest || quest.completedToday) return

    const difficulty = DIFFICULTIES[quest.difficulty]
    const multiplier = getRewardMultiplier()

    // Aplicar multiplicador a las recompensas (redondeado hacia abajo)
    const expReward = Math.floor(difficulty.exp * multiplier)
    const goldReward = Math.floor(difficulty.gold * multiplier)

    questActions.markCompleted(questId)
    playerActions.gainExp(expReward)
    playerActions.gainGold(goldReward)
    playerActions.gainStatExp(quest.stat, expReward)

    // Actualizar racha al completar una misión
    const today = new Date().toISOString().split('T')[0]
    playerActions.updateStreak(today)
  }

  // Aplica las penalizaciones del fin del día:
  // - Descuenta HP por misiones obligatorias no completadas
  // - Resetea el estado "completada hoy" de todas las misiones
  const applyDailyPenalties = (): void => {
    const missedMandatory = questActions.quests.filter(
      (q) => q.isMandatory && !q.completedToday
    )
    if (missedMandatory.length > 0) {
      playerActions.loseHP(missedMandatory.length * GAME_RULES.HP_PENALTY_PER_MISS)
    }
    questActions.resetDailyCompletions()
  }

  // Recupera al jugador del estado Agotado pagando RECOVERY_GOLD_COST gold.
  // Devuelve true si tuvo éxito, false si no había suficiente gold.
  const recoverWithGold = (): boolean => {
    const { player } = playerActions
    if (!player?.isExhausted) return false

    const spent = playerActions.spendGold(GAME_RULES.RECOVERY_GOLD_COST)
    if (spent) {
      playerActions.clearExhausted()
      playerActions.gainHP(GAME_RULES.MAX_HP) // restaurar HP al máximo
    }
    return spent
  }

  return { completeQuest, applyDailyPenalties, recoverWithGold, getRewardMultiplier }
}
```

- [ ] **Paso 6.5: Ejecutar todos los tests**

```bash
cd "b:/Proyectos IA/LifeStep" && npm test
```

Resultado esperado:
```
✓ tests/store/usePlayerStore.test.ts (10)
✓ tests/store/useQuestStore.test.ts (7)
✓ tests/hooks/useGameLogic.test.ts (9)
Test Files  3 passed (3)
Tests  26 passed (26)
```

Si algún test falla, corrige el error antes de continuar.

- [ ] **Paso 6.6: Verificar TypeScript**

```bash
cd "b:/Proyectos IA/LifeStep" && npx tsc --noEmit
```

Resultado esperado: sin output.

- [ ] **Paso 6.7: Commit**

```bash
cd "b:/Proyectos IA/LifeStep" && git add hooks/useGameLogic.ts tests/hooks/useGameLogic.test.ts package.json package-lock.json && git commit -m "feat: useGameLogic con tests — completar misiones, penalizaciones y recuperación"
```

---

## Tarea 7: Verificación final de Fase 2

- [ ] **Paso 7.1: Ejecutar todos los tests**

```bash
cd "b:/Proyectos IA/LifeStep" && npm test
```

Resultado esperado: todos los tests pasan.

- [ ] **Paso 7.2: Build de producción limpio**

```bash
cd "b:/Proyectos IA/LifeStep" && npm run build
```

Resultado esperado: compilación exitosa con las 6 rutas (`/`, `/dashboard`, `/onboarding`, `/profile`, `/quests`, `/shop`).

- [ ] **Paso 7.3: Commit final si hay cambios pendientes**

```bash
cd "b:/Proyectos IA/LifeStep" && git status
```

Si hay archivos sin commitear, agrégalos:

```bash
cd "b:/Proyectos IA/LifeStep" && git add . && git commit -m "feat: Fase 2 completa — stores, hooks y lógica del juego"
```

Si no hay cambios pendientes (todo ya está commiteado), no hacer nada.

---

## Resumen de la Fase 2

Al terminar esta fase tienes:

- ✅ `store/types.ts` — interfaces TypeScript para toda la app
- ✅ `hooks/useLocalStorage.ts` — capa de persistencia intercambiable con Supabase
- ✅ `store/usePlayerStore.ts` — estado del jugador persistido en localStorage
- ✅ `store/useQuestStore.ts` — misiones persistidas en localStorage
- ✅ `hooks/useGameLogic.ts` — lógica de negocio: multiplicadores, penalizaciones, recuperación
- ✅ 26 tests unitarios pasando
- ✅ TypeScript sin errores
- ✅ Build limpio

**Siguiente paso:** Fase 3 — Dashboard con Emblema de anillos SVG, stats y Framer Motion.
