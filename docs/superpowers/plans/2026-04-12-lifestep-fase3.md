# LifeStep — Fase 3: Dashboard

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el placeholder de `/dashboard` con la pantalla principal del juego: anillo SVG animado con stats, barras de HP/EXP y resumen de misiones del día.

**Architecture:** Tres componentes visuales (PlayerRing, StatsPanel, QuestSummary) montados desde `app/dashboard/page.tsx`. Los datos fluyen de los stores de Zustand hacia los componentes vía props, excepto QuestSummary que lee el store directamente. No se escriben unit tests — son componentes puramente presentacionales; la validación es visual con el dev server.

**Tech Stack:** Next.js 16.2.3, TypeScript 5, React 19, Framer Motion 12.38 (ya instalado), Tailwind v4, Zustand v5.

---

## Mapa de archivos

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `components/dashboard/PlayerRing.tsx` | Crear | SVG con 5 arcos animados, uno por stat |
| `components/dashboard/StatsPanel.tsx` | Crear | Barras HP/EXP + fila Gold/racha + chips de stats |
| `components/dashboard/QuestSummary.tsx` | Crear | Lista de misiones de hoy (solo lectura) |
| `app/dashboard/page.tsx` | Modificar | Orquesta los 3 componentes, redirige si no hay jugador |

### Contexto del codebase

**Stores ya implementados (Fase 2):**
- `store/usePlayerStore.ts` — `usePlayerStore((s) => s.player)` devuelve `PlayerData | null`
- `store/useQuestStore.ts` — `useQuestStore((s) => s.quests)` devuelve `QuestData[]`

**Tipos (ya en `store/types.ts`):**
```typescript
interface StatLevel { level: number; exp: number }
interface PlayerStreak { current: number; lastCompletedDate: string | null }
interface PlayerData {
  name: string; createdAt: string; level: number; exp: number; expToNextLevel: number
  hp: number; gold: number; isExhausted: boolean; exhaustedUntil: string | null
  stats: Record<StatKey, StatLevel>; priorityStats: StatKey[]; streak: PlayerStreak
}
interface QuestData {
  id: string; name: string; stat: StatKey; difficulty: DifficultyKey
  isDaily: boolean; isMandatory: boolean; completedToday: boolean; completedDates: string[]
}
```

**Constantes (ya en `lib/constants.ts`):**
```typescript
// STATS[key] tiene: color, light, emoji, name, key, description
// Ejemplo: STATS.VIT = { color: '#10b981', light: '#dcfce7', emoji: '💪', ... }
export const STATS = { VIT, WIS, WIL, SOC, FOR } as const
export type StatKey = keyof typeof STATS  // 'VIT' | 'WIS' | 'WIL' | 'SOC' | 'FOR'
export function expForNextLevel(level: number): number { return level * 100 }
export const GAME_RULES = { MAX_HP: 100, RECOVERY_GOLD_COST: 50, ... }
```

**Persistencia en localStorage:**
- Clave del jugador: `'lifestep_player'`
- Clave de misiones: `'lifestep_quests'`
- Formato Zustand persist: `{ state: { player: {...} }, version: 0 }`

---

## Tarea 1: `PlayerRing` — Anillo SVG animado

**Archivos:**
- Crear: `components/dashboard/PlayerRing.tsx`

### Cómo funciona el SVG

El círculo tiene circunferencia `C = 2 * π * r`. Se dividen los 360° en 5 sectores de 72° cada uno (68° de arco + 4° de hueco). Para cada stat `i` (0–4):
- `sectorLength = C * (68/360)` — longitud del arco del sector
- `dashOffset = -(C * i * (72/360))` — desplaza el patrón para posicionar el arco
- Track (fondo): `strokeDasharray = "${sectorLength} ${C - sectorLength}"`
- Fill (progreso): animado de `"0 ${C}"` a `"${sectorLength * progress} ${C - sectorLength * progress}"`
- El SVG tiene `style={{ transform: 'rotate(-90deg)' }}` para que el primer arco empiece a las 12h

- [ ] **Paso 1.1: Crear el directorio y el archivo**

Crea `components/dashboard/PlayerRing.tsx`:

```typescript
// components/dashboard/PlayerRing.tsx
// Anillo SVG con 5 arcos animados (uno por stat).
// Los arcos se dibujan desde 0 hasta el progreso real al montar.

'use client'

import { motion } from 'framer-motion'
import { STATS, expForNextLevel } from '@/lib/constants'
import type { StatKey } from '@/lib/constants'
import type { StatLevel } from '@/store/types'

interface PlayerRingProps {
  level: number
  stats: Record<StatKey, StatLevel>
  size?: number
}

// Orden de aparición de los stats en el anillo (sentido horario desde las 12h)
const STAT_ORDER: StatKey[] = ['VIT', 'WIS', 'WIL', 'SOC', 'FOR']

const SECTOR_DEG = 68  // grados del arco visible por stat
const TOTAL_DEG  = 72  // grados del sector completo (68 + 4 de hueco)

export default function PlayerRing({ level, stats, size = 200 }: PlayerRingProps) {
  const cx = size / 2
  const cy = size / 2
  const strokeWidth = 14
  const r = (size - strokeWidth) / 2 - 4
  const circumference = 2 * Math.PI * r
  const sectorLength  = circumference * (SECTOR_DEG / 360)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* SVG rotado -90° para que el primer arco empiece arriba (12h) */}
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {STAT_ORDER.map((key, i) => {
          const stat       = stats[key]
          const progress   = Math.min(1, stat.exp / (expForNextLevel(stat.level) || 1))
          const fillLength = sectorLength * progress
          const dashOffset = -(circumference * i * (TOTAL_DEG / 360))

          return (
            <g key={key}>
              {/* Track (fondo del arco) */}
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={STATS[key].light}
                strokeWidth={strokeWidth}
                strokeDasharray={`${sectorLength} ${circumference - sectorLength}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
              />
              {/* Fill animado */}
              <motion.circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={STATS[key].color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDashoffset={dashOffset}
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{
                  strokeDasharray: `${fillLength} ${circumference - fillLength}`,
                }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.05 }}
              />
            </g>
          )
        })}
      </svg>

      {/* Texto central: nivel */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] font-semibold text-slate-400 tracking-widest">
          NIVEL
        </span>
        <span className="text-4xl font-extrabold text-slate-900 leading-none">
          {level}
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Paso 1.2: Verificar TypeScript**

```bash
cd "b:/Proyectos IA/LifeStep" && npx tsc --noEmit
```

Resultado esperado: sin salida (0 errores).

- [ ] **Paso 1.3: Commit**

```bash
cd "b:/Proyectos IA/LifeStep" && git add components/dashboard/PlayerRing.tsx && git commit -m "feat: PlayerRing — anillo SVG animado con arcos por stat"
```

---

## Tarea 2: `StatsPanel` — Barras HP/EXP y chips de stats

**Archivos:**
- Crear: `components/dashboard/StatsPanel.tsx`

- [ ] **Paso 2.1: Crear el archivo**

Crea `components/dashboard/StatsPanel.tsx`:

```typescript
// components/dashboard/StatsPanel.tsx
// Muestra barras animadas de HP y EXP, fila de Gold/racha y chips de los 5 stats.

'use client'

import { motion } from 'framer-motion'
import { STATS, GAME_RULES } from '@/lib/constants'
import type { StatKey } from '@/lib/constants'
import type { StatLevel, PlayerStreak } from '@/store/types'

interface StatsPanelProps {
  hp: number
  exp: number
  expToNextLevel: number
  gold: number
  streak: PlayerStreak
  stats: Record<StatKey, StatLevel>
  isExhausted: boolean
  exhaustedUntil: string | null
}

const STAT_ORDER: StatKey[] = ['VIT', 'WIS', 'WIL', 'SOC', 'FOR']

// Barra de progreso animada con Framer Motion
function ProgressBar({
  percent,
  gradient,
  bg,
}: {
  percent: number
  gradient: string
  bg: string
}) {
  return (
    <div className="h-2 rounded-full overflow-hidden" style={{ background: bg }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: gradient }}
        initial={{ width: '0%' }}
        animate={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  )
}

export default function StatsPanel({
  hp,
  exp,
  expToNextLevel,
  gold,
  streak,
  stats,
  isExhausted,
}: StatsPanelProps) {
  const hpPercent  = (hp / GAME_RULES.MAX_HP) * 100
  const expPercent = (exp / expToNextLevel) * 100

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Barra de HP */}
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-xs font-semibold text-rose-500">❤️ HP</span>
          <span className="text-xs text-slate-500">
            {hp} / {GAME_RULES.MAX_HP}
          </span>
        </div>
        <ProgressBar
          percent={hpPercent}
          gradient={
            isExhausted
              ? 'linear-gradient(90deg, #f97316, #fb923c)'
              : 'linear-gradient(90deg, #f43f5e, #fb7185)'
          }
          bg="#fff1f2"
        />
        {isExhausted && (
          <p className="text-[11px] text-orange-500 mt-1">
            Agotado — recuperación con {GAME_RULES.RECOVERY_GOLD_COST} Gold
          </p>
        )}
      </div>

      {/* Barra de EXP */}
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-xs font-semibold text-indigo-500">⚡ EXP</span>
          <span className="text-xs text-slate-500">
            {exp} / {expToNextLevel}
          </span>
        </div>
        <ProgressBar
          percent={expPercent}
          gradient="linear-gradient(90deg, #6366f1, #818cf8)"
          bg="#e0e7ff"
        />
      </div>

      {/* Gold + Racha */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold text-amber-500">★ {gold} Gold</span>
        {streak.current > 0 && (
          <span className="text-sm font-bold text-orange-500">
            🔥 Racha {streak.current}d
          </span>
        )}
      </div>

      {/* Chips de los 5 stats */}
      <div className="flex flex-wrap gap-2">
        {STAT_ORDER.map((key) => (
          <span
            key={key}
            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{
              background: STATS[key].light,
              color: STATS[key].color,
            }}
          >
            {STATS[key].emoji} {key} Lv{stats[key].level}
          </span>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Paso 2.2: Verificar TypeScript**

```bash
cd "b:/Proyectos IA/LifeStep" && npx tsc --noEmit
```

Resultado esperado: sin salida (0 errores).

- [ ] **Paso 2.3: Commit**

```bash
cd "b:/Proyectos IA/LifeStep" && git add components/dashboard/StatsPanel.tsx && git commit -m "feat: StatsPanel — barras HP/EXP animadas y chips de stats"
```

---

## Tarea 3: `QuestSummary` — Resumen de misiones del día

**Archivos:**
- Crear: `components/dashboard/QuestSummary.tsx`

- [ ] **Paso 3.1: Crear el archivo**

Crea `components/dashboard/QuestSummary.tsx`:

```typescript
// components/dashboard/QuestSummary.tsx
// Lista de misiones del día actual. Solo lectura — las acciones están en /quests.
// Lee useQuestStore directamente. Muestra hasta 5 misiones con animación stagger.

'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useQuestStore } from '@/store/useQuestStore'
import { STATS } from '@/lib/constants'

const MAX_VISIBLE = 5

export default function QuestSummary() {
  const quests = useQuestStore((s) => s.quests)

  // Misiones relevantes para hoy: diarias (completadas o no) + épicas completadas hoy
  const todayQuests = quests
    .filter((q) => q.isDaily || q.completedToday)
    .sort((a, b) => {
      // Obligatorias primero
      if (a.isMandatory === b.isMandatory) return 0
      return a.isMandatory ? -1 : 1
    })

  const completed = todayQuests.filter((q) => q.completedToday).length
  const visible   = todayQuests.slice(0, MAX_VISIBLE)
  const hasMore   = todayQuests.length > MAX_VISIBLE

  if (todayQuests.length === 0) {
    return (
      <div className="w-full text-center py-4">
        <p className="text-sm text-slate-400">
          Sin misiones — ve a Misiones para añadir
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-base font-bold text-slate-900">Hoy</h2>
        <span className="text-xs text-slate-400">
          ({completed}/{todayQuests.length} completadas)
        </span>
      </div>

      {/* Lista de misiones */}
      <div className="flex flex-col gap-2">
        {visible.map((quest, i) => (
          <motion.div
            key={quest.id}
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3, ease: 'easeOut' }}
          >
            {/* Check circle */}
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                quest.completedToday
                  ? 'bg-emerald-500 border-emerald-500'
                  : 'border-slate-300'
              }`}
            >
              {quest.completedToday && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path
                    d="M1 4L3.5 6.5L9 1"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>

            {/* Nombre de la misión */}
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              {quest.isMandatory && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
              )}
              <span
                className={`text-sm truncate ${
                  quest.completedToday
                    ? 'line-through text-slate-400'
                    : 'text-slate-700'
                }`}
              >
                {quest.name}
              </span>
            </div>

            {/* Chip del stat */}
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{
                background: STATS[quest.stat].light,
                color: STATS[quest.stat].color,
              }}
            >
              {quest.stat}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Enlace "Ver todas" si hay más de 5 */}
      {hasMore && (
        <Link
          href="/quests"
          className="block text-xs text-indigo-500 font-semibold mt-3 text-right"
        >
          Ver todas →
        </Link>
      )}
    </div>
  )
}
```

- [ ] **Paso 3.2: Verificar TypeScript**

```bash
cd "b:/Proyectos IA/LifeStep" && npx tsc --noEmit
```

Resultado esperado: sin salida (0 errores).

- [ ] **Paso 3.3: Commit**

```bash
cd "b:/Proyectos IA/LifeStep" && git add components/dashboard/QuestSummary.tsx && git commit -m "feat: QuestSummary — resumen de misiones del día con animación stagger"
```

---

## Tarea 4: `app/dashboard/page.tsx` — Página completa

**Archivos:**
- Modificar: `app/dashboard/page.tsx`

- [ ] **Paso 4.1: Reemplazar el placeholder con la página completa**

Reemplaza todo el contenido de `app/dashboard/page.tsx` con:

```typescript
// app/dashboard/page.tsx
// Pantalla principal del juego. Muestra el emblema del jugador, sus stats y misiones del día.
// Si no hay jugador registrado (player === null), redirige al onboarding.

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { usePlayerStore } from '@/store/usePlayerStore'
import PlayerRing from '@/components/dashboard/PlayerRing'
import StatsPanel from '@/components/dashboard/StatsPanel'
import QuestSummary from '@/components/dashboard/QuestSummary'

export default function DashboardPage() {
  const router = useRouter()
  const player = usePlayerStore((s) => s.player)

  useEffect(() => {
    if (player === null) {
      router.push('/onboarding')
    }
  }, [player, router])

  // Mientras redirige, no renderizar nada
  if (player === null) return null

  return (
    <div className="flex flex-col items-center px-6 pt-8 pb-4 gap-6 max-w-md mx-auto">
      {/* Saludo */}
      <motion.h1
        className="text-2xl font-bold text-slate-900 self-start"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        Hola, {player.name}
      </motion.h1>

      {/* Anillo SVG */}
      <PlayerRing level={player.level} stats={player.stats} />

      {/* Barras de HP/EXP y stats */}
      <StatsPanel
        hp={player.hp}
        exp={player.exp}
        expToNextLevel={player.expToNextLevel}
        gold={player.gold}
        streak={player.streak}
        stats={player.stats}
        isExhausted={player.isExhausted}
        exhaustedUntil={player.exhaustedUntil}
      />

      {/* Resumen de misiones */}
      <QuestSummary />
    </div>
  )
}
```

- [ ] **Paso 4.2: Verificar TypeScript**

```bash
cd "b:/Proyectos IA/LifeStep" && npx tsc --noEmit
```

Resultado esperado: sin salida (0 errores).

- [ ] **Paso 4.3: Verificar build de producción**

```bash
cd "b:/Proyectos IA/LifeStep" && npm run build
```

Resultado esperado: build exitoso, 6 rutas compiladas (`/`, `/dashboard`, `/onboarding`, `/profile`, `/quests`, `/shop`), sin errores de TypeScript ni de compilación.

- [ ] **Paso 4.4: Verificar visualmente con el dev server**

Arranca el servidor de desarrollo:

```bash
cd "b:/Proyectos IA/LifeStep" && npm run dev
```

Abre el navegador en `http://localhost:3000/dashboard`. Sin datos, deberías ser redirigido a `/onboarding`. Para ver el dashboard con datos de prueba, abre la consola del navegador (F12 → Console) y pega:

```javascript
// Semilla: jugador con nivel 7 y misiones de prueba
localStorage.setItem('lifestep_player', JSON.stringify({
  state: {
    player: {
      name: "Jorge",
      createdAt: "2026-04-12",
      level: 7,
      exp: 350,
      expToNextLevel: 700,
      hp: 80,
      gold: 240,
      isExhausted: false,
      exhaustedUntil: null,
      stats: {
        VIT: { level: 12, exp: 450 },
        WIS: { level: 8,  exp: 200 },
        WIL: { level: 6,  exp: 150 },
        SOC: { level: 4,  exp: 80  },
        FOR: { level: 3,  exp: 60  }
      },
      priorityStats: ["VIT", "WIS"],
      streak: { current: 5, lastCompletedDate: "2026-04-11" }
    }
  },
  version: 0
}))

localStorage.setItem('lifestep_quests', JSON.stringify({
  state: {
    quests: [
      { id: "q1", name: "Correr 30 min", stat: "VIT", difficulty: "medium", isDaily: true, isMandatory: true,  completedToday: true,  completedDates: ["2026-04-12"] },
      { id: "q2", name: "Leer 20 páginas", stat: "WIS", difficulty: "easy", isDaily: true, isMandatory: false, completedToday: false, completedDates: [] },
      { id: "q3", name: "Meditar 10 min",  stat: "WIL", difficulty: "easy", isDaily: true, isMandatory: true,  completedToday: false, completedDates: [] }
    ]
  },
  version: 0
}))

location.reload()
```

**Qué verificar:**
1. ✅ Saludo "Hola, Jorge" aparece y entra con animación fadeIn
2. ✅ Anillo SVG visible con 5 arcos de colores distintos que se dibujan al cargar
3. ✅ Barras de HP (80/100, roja) y EXP (350/700, índigo) con animación
4. ✅ Fila con "★ 240 Gold" y "🔥 Racha 5d"
5. ✅ Chips de stats: 💪 VIT Lv12, 📚 WIS Lv8, 🎯 WIL Lv6, ❤️ SOC Lv4, ★ FOR Lv3
6. ✅ Sección "Hoy (1/3 completadas)" con 3 misiones
7. ✅ Primera misión (Correr) con check verde y texto tachado
8. ✅ Las obligatorias tienen un punto rojo antes del nombre
9. ✅ Al visitar `/dashboard` sin datos → redirección a `/onboarding`

- [ ] **Paso 4.5: Commit**

```bash
cd "b:/Proyectos IA/LifeStep" && git add app/dashboard/page.tsx && git commit -m "feat: dashboard — página completa con anillo SVG, stats y misiones del día"
```

---

## Tests existentes

Los 27 tests de Fase 2 deben seguir pasando:

```bash
cd "b:/Proyectos IA/LifeStep" && npm test
```

Resultado esperado: `27 tests passed`.
