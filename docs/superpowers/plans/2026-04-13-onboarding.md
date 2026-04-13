# Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar el flujo de onboarding de 3 pantallas (Bienvenida → Nombre → Pilares) que crea el jugador y redirige al dashboard.

**Architecture:** Un solo archivo `app/onboarding/page.tsx` con estado local (`step`, `name`, `selectedStats`). Al completar el paso 3 llama `initPlayer(name.trim(), selectedStats)` del store existente y navega a `/dashboard`. Incluye guardia para redirigir si el jugador ya existe.

**Tech Stack:** Next.js 16 App Router, React 19, Framer Motion v12, Zustand v5, Tailwind v4, Vitest + @testing-library/react

---

## Archivos

| Acción | Ruta |
|--------|------|
| Modificar | `app/onboarding/page.tsx` |
| Crear | `tests/app/onboarding.test.tsx` |

---

## Task 1: Scaffolding de tests + mocks

**Files:**
- Create: `tests/app/onboarding.test.tsx`

- [ ] **Step 1: Crear el archivo de tests con mocks y estructura base**

```tsx
// tests/app/onboarding.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { usePlayerStore } from '@/store/usePlayerStore'

// Mock de next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Mock de framer-motion: reemplaza motion.div con un div normal
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
}))

// Helper para resetear el store antes de cada test
const resetStore = () => usePlayerStore.setState({ player: null })

// Import dinámico DESPUÉS de los mocks (Next.js page)
const { default: OnboardingPage } = await import('@/app/onboarding/page')

describe('OnboardingPage', () => {
  beforeEach(() => {
    resetStore()
    localStorage.clear()
    mockPush.mockClear()
  })

  // --- STEP 1: BIENVENIDA ---
  describe('Paso 1 — Bienvenida', () => {
    it('muestra el título LifeStep y el tagline', () => {
      render(<OnboardingPage />)
      expect(screen.getByText('LifeStep')).toBeDefined()
      expect(screen.getByText(/Convierte tu vida/i)).toBeDefined()
    })

    it('tiene el botón "Comenzar aventura"', () => {
      render(<OnboardingPage />)
      expect(screen.getByRole('button', { name: /Comenzar aventura/i })).toBeDefined()
    })

    it('avanza al paso 2 al pulsar "Comenzar aventura"', () => {
      render(<OnboardingPage />)
      fireEvent.click(screen.getByRole('button', { name: /Comenzar aventura/i }))
      expect(screen.getByPlaceholderText('Tu nombre...')).toBeDefined()
    })
  })

  // --- STEP 2: NOMBRE ---
  describe('Paso 2 — Nombre', () => {
    function renderStep2() {
      render(<OnboardingPage />)
      fireEvent.click(screen.getByRole('button', { name: /Comenzar aventura/i }))
    }

    it('muestra el campo de nombre', () => {
      renderStep2()
      expect(screen.getByPlaceholderText('Tu nombre...')).toBeDefined()
    })

    it('el botón "Siguiente" está desactivado si el nombre está vacío', () => {
      renderStep2()
      const btn = screen.getByRole('button', { name: /Siguiente/i })
      expect(btn.hasAttribute('disabled')).toBe(true)
    })

    it('el botón "Siguiente" se activa al escribir un nombre', () => {
      renderStep2()
      fireEvent.change(screen.getByPlaceholderText('Tu nombre...'), {
        target: { value: 'Jorge' },
      })
      const btn = screen.getByRole('button', { name: /Siguiente/i })
      expect(btn.hasAttribute('disabled')).toBe(false)
    })

    it('avanza al paso 3 al pulsar "Siguiente" con nombre válido', () => {
      renderStep2()
      fireEvent.change(screen.getByPlaceholderText('Tu nombre...'), {
        target: { value: 'Jorge' },
      })
      fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }))
      expect(screen.getByText('Elige tus 2 pilares')).toBeDefined()
    })

    it('vuelve al paso 1 al pulsar "Volver"', () => {
      renderStep2()
      fireEvent.click(screen.getByRole('button', { name: /Volver/i }))
      expect(screen.getByText('LifeStep')).toBeDefined()
    })
  })

  // --- STEP 3: PILARES ---
  describe('Paso 3 — Pilares', () => {
    function renderStep3() {
      render(<OnboardingPage />)
      fireEvent.click(screen.getByRole('button', { name: /Comenzar aventura/i }))
      fireEvent.change(screen.getByPlaceholderText('Tu nombre...'), {
        target: { value: 'Jorge' },
      })
      fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }))
    }

    it('muestra los 5 pilares', () => {
      renderStep3()
      expect(screen.getByText('Vitalidad')).toBeDefined()
      expect(screen.getByText('Sabiduría')).toBeDefined()
      expect(screen.getByText('Voluntad')).toBeDefined()
      expect(screen.getByText('Vínculo')).toBeDefined()
      expect(screen.getByText('Fortuna')).toBeDefined()
    })

    it('el botón "Comenzar" está desactivado sin 2 pilares', () => {
      renderStep3()
      const btn = screen.getByRole('button', { name: /Comenzar/i })
      expect(btn.hasAttribute('disabled')).toBe(true)
    })

    it('permite seleccionar 2 pilares', () => {
      renderStep3()
      fireEvent.click(screen.getByText('Vitalidad'))
      fireEvent.click(screen.getByText('Sabiduría'))
      const btn = screen.getByRole('button', { name: /Comenzar/i })
      expect(btn.hasAttribute('disabled')).toBe(false)
    })

    it('al seleccionar un 3º pilar reemplaza el primero', () => {
      renderStep3()
      fireEvent.click(screen.getByText('Vitalidad'))
      fireEvent.click(screen.getByText('Sabiduría'))
      fireEvent.click(screen.getByText('Voluntad'))
      // "Comenzar" sigue activo (hay exactamente 2 seleccionados)
      const btn = screen.getByRole('button', { name: /Comenzar/i })
      expect(btn.hasAttribute('disabled')).toBe(false)
    })

    it('llama initPlayer y redirige al dashboard al pulsar "Comenzar"', () => {
      renderStep3()
      fireEvent.click(screen.getByText('Vitalidad'))
      fireEvent.click(screen.getByText('Sabiduría'))
      fireEvent.click(screen.getByRole('button', { name: /Comenzar/i }))

      const { player } = usePlayerStore.getState()
      expect(player?.name).toBe('Jorge')
      expect(player?.priorityStats).toEqual(['VIT', 'WIS'])
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    it('vuelve al paso 2 al pulsar "Volver"', () => {
      renderStep3()
      fireEvent.click(screen.getByRole('button', { name: /Volver/i }))
      expect(screen.getByPlaceholderText('Tu nombre...')).toBeDefined()
    })
  })

  // --- GUARDIA ---
  describe('Guardia — jugador ya existe', () => {
    it('redirige a /dashboard si el jugador ya existe', () => {
      usePlayerStore.getState().initPlayer('Ana', ['WIL', 'FOR'])
      render(<OnboardingPage />)
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })
})
```

- [ ] **Step 2: Ejecutar los tests para verificar que fallan**

```bash
cd "b:/Proyectos IA/LifeStep"
npx vitest run tests/app/onboarding.test.tsx
```

Resultado esperado: **FAIL** — el módulo `@/app/onboarding/page` existe pero no tiene la implementación real aún.

---

## Task 2: Implementar Paso 1 — Bienvenida

**Files:**
- Modify: `app/onboarding/page.tsx`

- [ ] **Step 1: Reemplazar el placeholder con la implementación completa del Paso 1**

```tsx
// app/onboarding/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { usePlayerStore } from '@/store/usePlayerStore'
import { STATS } from '@/lib/constants'
import type { StatKey } from '@/lib/constants'

// Orden fijo de los 5 pilares en la pantalla de selección
const STAT_KEYS: StatKey[] = ['VIT', 'WIS', 'WIL', 'SOC', 'FOR']

// Animación compartida para cada pantalla
const SCREEN_ANIM = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: 'easeOut' },
}

// Indicador de 3 puntos de progreso
function ProgressDots({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="flex gap-2 mb-6">
      {([1, 2, 3] as const).map((n) => (
        <div
          key={n}
          className={`w-2 h-2 rounded-full ${
            n === step ? 'bg-indigo-500' : 'bg-indigo-200'
          }`}
        />
      ))}
    </div>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const player = usePlayerStore((s) => s.player)
  const initPlayer = usePlayerStore((s) => s.initPlayer)

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [name, setName] = useState('')
  const [selectedStats, setSelectedStats] = useState<StatKey[]>([])

  // Guardia: si ya existe jugador → redirigir
  useEffect(() => {
    if (player !== null) {
      router.push('/dashboard')
    }
  }, [player, router])

  if (player !== null) return null

  // ——— PASO 1: BIENVENIDA ———
  if (step === 1) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-indigo-50 px-6">
        <motion.div
          key="step1"
          {...SCREEN_ANIM}
          className="flex flex-col items-center gap-3 w-full max-w-sm"
        >
          <ProgressDots step={1} />
          <span className="text-5xl">🌱</span>
          <h1 className="text-2xl font-bold text-slate-900">LifeStep</h1>
          <p className="text-sm text-indigo-500 italic text-center">
            "Convierte tu vida en una aventura"
          </p>
          <button
            onClick={() => setStep(2)}
            className="w-full mt-6 bg-indigo-500 text-white font-semibold py-3 rounded-xl text-sm"
          >
            Comenzar aventura →
          </button>
        </motion.div>
      </div>
    )
  }

  // ——— PASO 2: NOMBRE ———
  // (se añade en Task 3)

  // ——— PASO 3: PILARES ———
  // (se añade en Task 4)

  return null
}
```

- [ ] **Step 2: Ejecutar solo los tests del Paso 1**

```bash
cd "b:/Proyectos IA/LifeStep"
npx vitest run tests/app/onboarding.test.tsx --reporter=verbose 2>&1 | grep -E "✓|✗|PASS|FAIL|Paso 1"
```

Resultado esperado: los 3 tests de "Paso 1 — Bienvenida" pasan ✓. Los demás siguen fallando.

- [ ] **Step 3: Verificar TypeScript**

```bash
cd "b:/Proyectos IA/LifeStep"
npx tsc --noEmit
```

Resultado esperado: 0 errores.

- [ ] **Step 4: Commit**

```bash
cd "b:/Proyectos IA/LifeStep"
git add app/onboarding/page.tsx tests/app/onboarding.test.tsx
git commit -m "feat: onboarding paso 1 — bienvenida con tests"
```

---

## Task 3: Implementar Paso 2 — Nombre

**Files:**
- Modify: `app/onboarding/page.tsx`

- [ ] **Step 1: Añadir el bloque del Paso 2 (reemplaza el comentario `// PASO 2`)**

Localiza `// ——— PASO 2: NOMBRE ———` en el archivo y reemplaza ese bloque (hasta `// PASO 3`) por:

```tsx
  // ——— PASO 2: NOMBRE ———
  if (step === 2) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-indigo-50 px-6">
        <motion.div
          key="step2"
          {...SCREEN_ANIM}
          className="flex flex-col items-center gap-3 w-full max-w-sm"
        >
          <ProgressDots step={2} />
          <span className="text-4xl">⚔️</span>
          <h2 className="text-xl font-bold text-slate-900 text-center">
            ¿Cómo te llamas, aventurero?
          </h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre..."
            maxLength={20}
            autoFocus
            className="w-full text-center text-base px-4 py-3 rounded-xl border-2 border-indigo-200 bg-white/80 text-slate-900 outline-none focus:border-indigo-400 mt-2"
          />
          <button
            onClick={() => setStep(3)}
            disabled={name.trim() === ''}
            className="w-full mt-2 bg-indigo-500 text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente →
          </button>
          <button
            onClick={() => setStep(1)}
            className="text-sm text-slate-400 mt-1"
          >
            ← Volver
          </button>
        </motion.div>
      </div>
    )
  }
```

- [ ] **Step 2: Ejecutar los tests del Paso 2**

```bash
cd "b:/Proyectos IA/LifeStep"
npx vitest run tests/app/onboarding.test.tsx --reporter=verbose 2>&1 | grep -E "✓|✗|PASS|FAIL|Paso 2"
```

Resultado esperado: los 5 tests de "Paso 2 — Nombre" pasan ✓.

- [ ] **Step 3: Verificar TypeScript**

```bash
cd "b:/Proyectos IA/LifeStep"
npx tsc --noEmit
```

Resultado esperado: 0 errores.

- [ ] **Step 4: Commit**

```bash
cd "b:/Proyectos IA/LifeStep"
git add app/onboarding/page.tsx
git commit -m "feat: onboarding paso 2 — nombre del jugador"
```

---

## Task 4: Implementar Paso 3 — Pilares + integración final

**Files:**
- Modify: `app/onboarding/page.tsx`

- [ ] **Step 1: Añadir la función de selección de pilares y el bloque del Paso 3**

Localiza `// ——— PASO 3: PILARES ———` y reemplaza ese bloque (hasta `return null`) por:

```tsx
  // ——— LÓGICA DE SELECCIÓN DE PILARES ———
  function toggleStat(key: StatKey) {
    setSelectedStats((prev) => {
      if (prev.includes(key)) {
        // Deseleccionar
        return prev.filter((k) => k !== key)
      }
      if (prev.length < 2) {
        // Seleccionar (hay hueco)
        return [...prev, key]
      }
      // Ya hay 2 → reemplazar el más antiguo (el primero)
      return [prev[1], key]
    })
  }

  function handleFinish() {
    initPlayer(name.trim(), selectedStats)
    router.push('/dashboard')
  }

  // ——— PASO 3: PILARES ———
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-indigo-50 px-6">
      <motion.div
        key="step3"
        {...SCREEN_ANIM}
        className="flex flex-col items-center gap-3 w-full max-w-sm"
      >
        <ProgressDots step={3} />
        <h2 className="text-xl font-bold text-slate-900 text-center">
          Elige tus 2 pilares
        </h2>
        <p className="text-sm text-slate-500 text-center">
          Serán tu especialidad — ganarás más EXP en ellos
        </p>

        <div className="flex flex-col gap-3 w-full mt-2">
          {STAT_KEYS.map((key) => {
            const stat = STATS[key]
            const isSelected = selectedStats.includes(key)
            return (
              <button
                key={key}
                onClick={() => toggleStat(key)}
                style={
                  isSelected
                    ? { background: stat.light, borderColor: stat.color }
                    : { background: 'rgba(255,255,255,0.6)', borderColor: '#e2e8f0' }
                }
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 text-left"
              >
                <span className="text-xl">{stat.emoji}</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-800">
                    {stat.name}
                  </div>
                  <div className="text-xs text-slate-500">{stat.description}</div>
                </div>
                {isSelected && (
                  <div
                    style={{ background: stat.color }}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                    aria-hidden="true"
                  >
                    ✓
                  </div>
                )}
              </button>
            )
          })}
        </div>

        <button
          onClick={handleFinish}
          disabled={selectedStats.length !== 2}
          className="w-full mt-2 bg-indigo-500 text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ¡Comenzar!
        </button>
        <button
          onClick={() => setStep(2)}
          className="text-sm text-slate-400 mt-1"
        >
          ← Volver
        </button>
      </motion.div>
    </div>
  )
```

> **Nota:** La función `toggleStat` y `handleFinish` deben declararse ANTES del bloque `if (step === 2)` en el componente, justo después del bloque `if (player !== null) return null`. Esto es porque React no permite hooks ni declaraciones de función condicionales.

- [ ] **Step 2: Ejecutar todos los tests**

```bash
cd "b:/Proyectos IA/LifeStep"
npx vitest run tests/app/onboarding.test.tsx
```

Resultado esperado: **todos los tests pasan** (16 tests ✓).

- [ ] **Step 3: Ejecutar la suite completa para comprobar que no hay regresiones**

```bash
cd "b:/Proyectos IA/LifeStep"
npx vitest run
```

Resultado esperado: todos los tests anteriores siguen pasando (27 tests + 16 nuevos = 43 tests ✓).

- [ ] **Step 4: Verificar TypeScript**

```bash
cd "b:/Proyectos IA/LifeStep"
npx tsc --noEmit
```

Resultado esperado: 0 errores.

- [ ] **Step 5: Commit final**

```bash
cd "b:/Proyectos IA/LifeStep"
git add app/onboarding/page.tsx
git commit -m "feat: onboarding paso 3 — selección de pilares e integración final"
```

---

## Orden final de funciones en `OnboardingPage`

Para que los hooks de React no fallen (regla: no llamar hooks condicionalmente), el componente debe estar estructurado así:

```
export default function OnboardingPage() {
  // 1. Todos los hooks y estado (useState, useEffect, useRouter, usePlayerStore)
  // 2. Guardia: if (player !== null) return null
  // 3. toggleStat() y handleFinish() (declaraciones de función)
  // 4. if (step === 1) return <Paso1 />
  // 5. if (step === 2) return <Paso2 />
  // 6. return <Paso3 />   ← paso 3 es el render final (no necesita if)
}
```
