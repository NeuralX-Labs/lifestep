# Quests Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar la página completa de Misiones (`app/quests/page.tsx`) con lista swipeable, bottom sheet para crear misiones, toast de deshacer y modal de confirmación de borrado.

**Architecture:** La página orquesta 5 componentes bajo `components/quests/`. Los datos vienen de `useQuestStore` y las recompensas de `useGameLogic`. El swipe usa Framer Motion `drag="x"` con botones `sr-only` para tests. El formulario de nueva misión es un bottom sheet animado con `AnimatePresence`.

**Tech Stack:** Next.js 16, React 19, Framer Motion 12, Zustand 5, Tailwind v4, Vitest 4, Testing Library

---

## Estructura de archivos

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `tests/app/quests.test.tsx` | Crear | 15 tests para la página completa |
| `components/quests/QuestItem.tsx` | Crear | Tarjeta individual swipeable |
| `components/quests/QuestSection.tsx` | Crear | Sección con cabecera + lista de items |
| `components/quests/DeleteQuestModal.tsx` | Crear | Modal de confirmación de borrado |
| `components/quests/QuestToast.tsx` | Crear | Toast "Misión completada · Deshacer" |
| `components/quests/NewQuestSheet.tsx` | Crear | Bottom sheet con formulario de creación |
| `app/quests/page.tsx` | Modificar | Página principal (reemplaza placeholder) |

---

### Task 1: Escribir los 15 tests (todos deben fallar)

**Files:**
- Create: `tests/app/quests.test.tsx`

- [ ] **Step 1: Crear el archivo de tests**

```tsx
// tests/app/quests.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useQuestStore } from '@/store/useQuestStore'
import type { QuestData } from '@/store/types'

// ── Mocks ───────────────────────────────────────────────────────────────────

const mockCompleteQuest = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) =>
      <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useMotionValue: (initial: number) => initial,
  useTransform: () => 0,
}))

vi.mock('@/hooks/useGameLogic', () => ({
  useGameLogic: () => ({ completeQuest: mockCompleteQuest }),
}))

// ── Helpers ──────────────────────────────────────────────────────────────────

const resetStore = () => useQuestStore.setState({ quests: [] })

function addTestQuest(overrides: Partial<QuestData> = {}): QuestData {
  const quest: QuestData = {
    id: 'q1',
    name: 'Test Quest',
    stat: 'VIT',
    difficulty: 'easy',
    isDaily: true,
    isMandatory: false,
    completedToday: false,
    completedDates: [],
    ...overrides,
  }
  useQuestStore.setState({ quests: [quest] })
  return quest
}

// ── Import dinámico DESPUÉS de los mocks ─────────────────────────────────────

const { default: QuestsPage } = await import('@/app/quests/page')

// ── Tests ────────────────────────────────────────────────────────────────────

describe('QuestsPage', () => {
  beforeEach(() => {
    resetStore()
    mockCompleteQuest.mockReset()
  })

  // ── Lista de misiones ───────────────────────────────────────────────────

  describe('Lista de misiones', () => {
    it('renderiza la sección Diarias con misiones del store', () => {
      addTestQuest({ isDaily: true, name: 'Ir al gimnasio' })
      render(<QuestsPage />)
      expect(screen.getByText('Diarias')).toBeDefined()
      expect(screen.getByText('Ir al gimnasio')).toBeDefined()
    })

    it('renderiza la sección Épicas con misiones del store', () => {
      addTestQuest({ isDaily: false, name: 'Aprender React' })
      render(<QuestsPage />)
      expect(screen.getByText('Épicas')).toBeDefined()
      expect(screen.getByText('Aprender React')).toBeDefined()
    })

    it('muestra mensaje vacío si no hay misiones en una sección', () => {
      render(<QuestsPage />)
      // Sin misiones, ambas secciones muestran el mensaje vacío
      const msgs = screen.getAllByText(/pulsa \+ para añadir/i)
      expect(msgs.length).toBe(2)
    })

    it('el punto rojo aparece en misiones obligatorias', () => {
      addTestQuest({ isMandatory: true })
      render(<QuestsPage />)
      expect(screen.getByTestId('mandatory-dot-q1')).toBeDefined()
    })

    it('la estrella ★ aparece en misiones de tipo épico (isDaily: false)', () => {
      addTestQuest({ isDaily: false })
      render(<QuestsPage />)
      expect(screen.getByTestId('epic-star-q1')).toBeDefined()
    })

    it('misión completada aparece tachada con check verde', () => {
      addTestQuest({ completedToday: true, name: 'Misión hecha' })
      render(<QuestsPage />)
      const name = screen.getByText('Misión hecha')
      expect(name.className).toContain('line-through')
    })
  })

  // ── Completar misión ────────────────────────────────────────────────────

  describe('Completar misión', () => {
    it('simular completar misión muestra el toast', () => {
      addTestQuest({ id: 'q1', name: 'Ir al gimnasio' })
      render(<QuestsPage />)

      fireEvent.click(screen.getByTestId('complete-q1'))

      expect(screen.getByText(/Misión completada/i)).toBeDefined()
    })

    it('el toast "Deshacer" revierte la misión a no completada', () => {
      addTestQuest({ id: 'q1', name: 'Ir al gimnasio' })
      mockCompleteQuest.mockImplementation((id: string) => {
        useQuestStore.getState().markCompleted(id)
      })
      render(<QuestsPage />)

      fireEvent.click(screen.getByTestId('complete-q1'))
      fireEvent.click(screen.getByRole('button', { name: /Deshacer/i }))

      const q = useQuestStore.getState().quests.find((q) => q.id === 'q1')
      expect(q?.completedToday).toBe(false)
    })
  })

  // ── Eliminar misión ─────────────────────────────────────────────────────

  describe('Eliminar misión', () => {
    it('simular eliminar abre el modal de confirmación', () => {
      addTestQuest({ id: 'q1', name: 'Ir al gimnasio' })
      render(<QuestsPage />)

      fireEvent.click(screen.getByTestId('delete-q1'))

      expect(screen.getByText(/¿Borrar esta misión\?/i)).toBeDefined()
      expect(screen.getByText('Ir al gimnasio')).toBeDefined()
    })

    it('confirmar borrado elimina la misión de la lista', () => {
      addTestQuest({ id: 'q1', name: 'Ir al gimnasio' })
      render(<QuestsPage />)

      fireEvent.click(screen.getByTestId('delete-q1'))
      fireEvent.click(screen.getByRole('button', { name: /^Borrar$/i }))

      expect(useQuestStore.getState().quests.length).toBe(0)
    })

    it('cancelar borrado no elimina la misión', () => {
      addTestQuest({ id: 'q1', name: 'Ir al gimnasio' })
      render(<QuestsPage />)

      fireEvent.click(screen.getByTestId('delete-q1'))
      fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }))

      expect(useQuestStore.getState().quests.length).toBe(1)
    })
  })

  // ── Nueva misión (sheet) ────────────────────────────────────────────────

  describe('Nueva misión (bottom sheet)', () => {
    it('pulsar el FAB abre el bottom sheet', () => {
      render(<QuestsPage />)
      fireEvent.click(screen.getByRole('button', { name: /Nueva misión/i }))
      expect(screen.getByPlaceholderText(/¿Qué quieres lograr\?/i)).toBeDefined()
    })

    it('crear misión con nombre válido llama addQuest y cierra el sheet', () => {
      render(<QuestsPage />)
      fireEvent.click(screen.getByRole('button', { name: /Nueva misión/i }))
      fireEvent.change(screen.getByPlaceholderText(/¿Qué quieres lograr\?/i), {
        target: { value: 'Correr 5km' },
      })
      fireEvent.click(screen.getByRole('button', { name: /Crear misión/i }))

      const quests = useQuestStore.getState().quests
      expect(quests.some((q) => q.name === 'Correr 5km')).toBe(true)
      expect(screen.queryByPlaceholderText(/¿Qué quieres lograr\?/i)).toBeNull()
    })

    it('el botón Crear misión está desactivado si el nombre está vacío', () => {
      render(<QuestsPage />)
      fireEvent.click(screen.getByRole('button', { name: /Nueva misión/i }))
      const createBtn = screen.getByRole('button', { name: /Crear misión/i })
      expect(createBtn.hasAttribute('disabled')).toBe(true)
    })

    it('pulsar el backdrop cierra el sheet sin crear misión', () => {
      render(<QuestsPage />)
      fireEvent.click(screen.getByRole('button', { name: /Nueva misión/i }))
      expect(screen.getByPlaceholderText(/¿Qué quieres lograr\?/i)).toBeDefined()

      fireEvent.click(screen.getByTestId('sheet-backdrop'))

      expect(screen.queryByPlaceholderText(/¿Qué quieres lograr\?/i)).toBeNull()
      expect(useQuestStore.getState().quests.length).toBe(0)
    })
  })
})
```

- [ ] **Step 2: Ejecutar los tests para confirmar que fallan**

```bash
cd "b:/Proyectos IA/LifeStep"
npx vitest run tests/app/quests.test.tsx
```

Resultado esperado: Error de importación (el módulo `@/app/quests/page` no exporta los componentes necesarios aún). Todos deben fallar — no debe haber ningún PASS.

- [ ] **Step 3: Commit**

```bash
git add tests/app/quests.test.tsx
git commit -m "test: 15 tests failing para la página de Misiones (TDD)"
```

---

### Task 2: Crear archivos stub para los componentes

**Files:**
- Create: `components/quests/QuestItem.tsx`
- Create: `components/quests/QuestSection.tsx`
- Create: `components/quests/DeleteQuestModal.tsx`
- Create: `components/quests/QuestToast.tsx`
- Create: `components/quests/NewQuestSheet.tsx`

- [ ] **Step 1: Crear los 5 stubs**

`components/quests/QuestItem.tsx`:
```tsx
import type { QuestData } from '@/store/types'
interface Props {
  quest: QuestData
  onComplete: (id: string) => void
  onDelete: (id: string) => void
}
export default function QuestItem(_props: Props) { return null }
```

`components/quests/QuestSection.tsx`:
```tsx
import type { QuestData } from '@/store/types'
interface Props {
  title: string
  quests: QuestData[]
  onComplete: (id: string) => void
  onDelete: (id: string) => void
}
export default function QuestSection(_props: Props) { return null }
```

`components/quests/DeleteQuestModal.tsx`:
```tsx
interface Props { questName: string; onConfirm: () => void; onCancel: () => void }
export default function DeleteQuestModal(_props: Props) { return null }
```

`components/quests/QuestToast.tsx`:
```tsx
interface Props { name: string; onUndo: () => void; onDismiss: () => void }
export default function QuestToast(_props: Props) { return null }
```

`components/quests/NewQuestSheet.tsx`:
```tsx
interface Props { onClose: () => void }
export default function NewQuestSheet(_props: Props) { return null }
```

- [ ] **Step 2: Ejecutar los tests para confirmar que ahora fallan por contenido, no por importación**

```bash
npx vitest run tests/app/quests.test.tsx
```

Resultado esperado: Todos fallan con errores como `Unable to find an element with the text: 'Diarias'`. Ya no hay errores de importación.

---

### Task 3: Implementar QuestItem

**Files:**
- Modify: `components/quests/QuestItem.tsx`

- [ ] **Step 1: Implementar QuestItem completo**

```tsx
// components/quests/QuestItem.tsx
'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import { STATS } from '@/lib/constants'
import type { QuestData } from '@/store/types'

interface Props {
  quest: QuestData
  onComplete: (id: string) => void
  onDelete: (id: string) => void
}

export default function QuestItem({ quest, onComplete, onDelete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const greenOpacity = useTransform(x, [0, 80], [0, 1])
  const redOpacity = useTransform(x, [-80, 0], [1, 0])
  const stat = STATS[quest.stat]

  const handleDragEnd = (_: PointerEvent, info: PanInfo) => {
    const width = containerRef.current?.offsetWidth ?? 300
    const threshold = width * 0.4
    if (info.offset.x > threshold) {
      onComplete(quest.id)
    } else if (info.offset.x < -threshold) {
      onDelete(quest.id)
    }
  }

  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-xl">
      {/* Fondo verde (completar) */}
      <motion.div
        className="absolute inset-0 bg-emerald-50 flex items-center pl-4"
        style={{ opacity: greenOpacity }}
        aria-hidden
      >
        <span className="text-emerald-600 font-semibold text-sm">✓ Completar</span>
      </motion.div>

      {/* Fondo rojo (eliminar) */}
      <motion.div
        className="absolute inset-0 bg-rose-50 flex items-center justify-end pr-4"
        style={{ opacity: redOpacity }}
        aria-hidden
      >
        <span className="text-rose-600 font-semibold text-sm">Eliminar 🗑</span>
      </motion.div>

      {/* Tarjeta */}
      <motion.div
        drag="x"
        dragSnapToOrigin
        dragElastic={0.3}
        style={{ x }}
        onDragEnd={handleDragEnd}
        className="relative bg-white border border-slate-200 rounded-xl px-3 py-3 flex items-center gap-2.5 z-10"
      >
        {/* Check */}
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
            quest.completedToday
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-slate-300'
          }`}
        >
          {quest.completedToday && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden>
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        {/* Punto rojo obligatoria */}
        {quest.isMandatory && (
          <div
            data-testid={`mandatory-dot-${quest.id}`}
            className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"
          />
        )}

        {/* Nombre */}
        <span
          className={`text-sm flex-1 truncate ${
            quest.completedToday ? 'line-through text-slate-400' : 'text-slate-700'
          }`}
        >
          {quest.name}
        </span>

        {/* Estrella épica */}
        {!quest.isDaily && (
          <span
            data-testid={`epic-star-${quest.id}`}
            className="text-amber-400 text-sm flex-shrink-0"
            aria-hidden
          >
            ★
          </span>
        )}

        {/* Chip stat */}
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
          style={{ background: stat.light, color: stat.color }}
        >
          {quest.stat}
        </span>
      </motion.div>

      {/* Botones ocultos para accesibilidad y tests */}
      <button
        data-testid={`complete-${quest.id}`}
        onClick={() => onComplete(quest.id)}
        aria-label={`Completar ${quest.name}`}
        className="sr-only"
      />
      <button
        data-testid={`delete-${quest.id}`}
        onClick={() => onDelete(quest.id)}
        aria-label={`Eliminar ${quest.name}`}
        className="sr-only"
      />
    </div>
  )
}
```

- [ ] **Step 2: Ejecutar tests**

```bash
npx vitest run tests/app/quests.test.tsx
```

Resultado esperado: Los tests 4, 5, 6 (relativos a mandatory-dot, epic-star y line-through) aún fallan porque la página no usa QuestItem todavía. Ningún test debe pasar aún — está bien.

---

### Task 4: Implementar QuestSection

**Files:**
- Modify: `components/quests/QuestSection.tsx`

- [ ] **Step 1: Implementar QuestSection**

```tsx
// components/quests/QuestSection.tsx
'use client'

import QuestItem from '@/components/quests/QuestItem'
import type { QuestData } from '@/store/types'

interface Props {
  title: string
  quests: QuestData[]
  onComplete: (id: string) => void
  onDelete: (id: string) => void
}

export default function QuestSection({ title, quests, onComplete, onDelete }: Props) {
  // Ordenar: obligatorias primero
  const sorted = [...quests].sort((a, b) => (b.isMandatory ? 1 : 0) - (a.isMandatory ? 1 : 0))
  const completed = quests.filter((q) => q.completedToday).length

  return (
    <div className="flex flex-col gap-2">
      {/* Cabecera de sección */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</h2>
        {quests.length > 0 && (
          <span className="text-xs text-slate-400">
            {completed}/{quests.length}
          </span>
        )}
      </div>

      {/* Lista o mensaje vacío */}
      {quests.length === 0 ? (
        <p className="text-sm text-slate-400 py-1">Sin misiones — pulsa + para añadir</p>
      ) : (
        sorted.map((quest) => (
          <QuestItem
            key={quest.id}
            quest={quest}
            onComplete={onComplete}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit interim**

```bash
git add components/quests/QuestItem.tsx components/quests/QuestSection.tsx
git commit -m "feat: QuestItem y QuestSection — tarjeta swipeable y sección de lista"
```

---

### Task 5: Implementar DeleteQuestModal y QuestToast

**Files:**
- Modify: `components/quests/DeleteQuestModal.tsx`
- Modify: `components/quests/QuestToast.tsx`

- [ ] **Step 1: Implementar DeleteQuestModal**

```tsx
// components/quests/DeleteQuestModal.tsx
'use client'

interface Props {
  questName: string
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteQuestModal({ questName, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
      <div className="bg-white rounded-2xl p-6 w-full max-w-xs">
        <h2 className="text-base font-bold text-slate-900 mb-1">¿Borrar esta misión?</h2>
        <p className="text-sm text-slate-500 mb-6">
          <strong className="text-slate-700">{questName}</strong>
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold"
          >
            Borrar
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Implementar QuestToast**

```tsx
// components/quests/QuestToast.tsx
'use client'

import { useEffect } from 'react'

interface Props {
  name: string
  onUndo: () => void
  onDismiss: () => void
}

export default function QuestToast({ name, onUndo, onDismiss }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      role="alert"
      className="fixed bottom-20 left-4 right-4 max-w-sm mx-auto bg-slate-800 text-white rounded-xl px-4 py-3 flex items-center justify-between z-50 shadow-lg"
    >
      <span className="text-sm">✓ Misión completada</span>
      <button
        onClick={onUndo}
        className="text-sm font-semibold text-indigo-300 ml-4"
      >
        Deshacer
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/quests/DeleteQuestModal.tsx components/quests/QuestToast.tsx
git commit -m "feat: DeleteQuestModal y QuestToast — confirmación de borrado y toast de deshacer"
```

---

### Task 6: Implementar NewQuestSheet

**Files:**
- Modify: `components/quests/NewQuestSheet.tsx`

- [ ] **Step 1: Implementar NewQuestSheet**

```tsx
// components/quests/NewQuestSheet.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuestStore } from '@/store/useQuestStore'
import { STATS, DIFFICULTIES } from '@/lib/constants'
import type { StatKey, DifficultyKey } from '@/lib/constants'

interface Props {
  onClose: () => void
}

const STAT_KEYS = Object.keys(STATS) as StatKey[]
const DIFFICULTY_KEYS = Object.keys(DIFFICULTIES) as DifficultyKey[]

export default function NewQuestSheet({ onClose }: Props) {
  const addQuest = useQuestStore((s) => s.addQuest)

  const [name, setName]           = useState('')
  const [stat, setStat]           = useState<StatKey>('VIT')
  const [difficulty, setDifficulty] = useState<DifficultyKey>('easy')
  const [isDaily, setIsDaily]     = useState(true)
  const [isMandatory, setIsMandatory] = useState(false)

  const handleCreate = () => {
    addQuest({ name: name.trim(), stat, difficulty, isDaily, isMandatory })
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        data-testid="sheet-backdrop"
      />

      {/* Sheet */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl px-5 pb-10 pt-4 z-50"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {/* Handle */}
        <div className="w-9 h-1 bg-slate-200 rounded-full mx-auto mb-4" />

        <h2 className="text-base font-bold text-slate-900 mb-4">Nueva misión</h2>

        {/* Nombre */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="¿Qué quieres lograr?"
          maxLength={40}
          autoFocus
          className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 mb-4 outline-none focus:border-indigo-300"
        />

        {/* Selector de stat */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-500 mb-2">Estadística</p>
          <div className="flex flex-wrap gap-2">
            {STAT_KEYS.map((key) => {
              const s = STATS[key]
              const isSelected = stat === key
              return (
                <button
                  key={key}
                  onClick={() => setStat(key)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-colors"
                  style={
                    isSelected
                      ? { background: s.light, borderColor: s.color, color: s.color }
                      : { background: 'transparent', borderColor: '#e2e8f0', color: '#64748b' }
                  }
                >
                  {key}
                </button>
              )
            })}
          </div>
        </div>

        {/* Toggle tipo */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-500 mb-2">Tipo</p>
          <div className="flex gap-2">
            <button
              onClick={() => setIsDaily(true)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 ${
                isDaily
                  ? 'bg-indigo-500 border-indigo-500 text-white'
                  : 'bg-transparent border-slate-200 text-slate-500'
              }`}
            >
              Diaria
            </button>
            <button
              onClick={() => setIsDaily(false)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 ${
                !isDaily
                  ? 'bg-indigo-500 border-indigo-500 text-white'
                  : 'bg-transparent border-slate-200 text-slate-500'
              }`}
            >
              Épica
            </button>
          </div>
        </div>

        {/* Selector de dificultad */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-500 mb-2">Dificultad</p>
          <div className="flex gap-2">
            {DIFFICULTY_KEYS.map((key) => (
              <button
                key={key}
                onClick={() => setDifficulty(key)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border-2 ${
                  difficulty === key
                    ? 'bg-indigo-500 border-indigo-500 text-white'
                    : 'bg-transparent border-slate-200 text-slate-500'
                }`}
              >
                {DIFFICULTIES[key].label}
              </button>
            ))}
          </div>
        </div>

        {/* Checkbox obligatoria */}
        <label className="flex items-center gap-3 mb-5 cursor-pointer">
          <input
            type="checkbox"
            checked={isMandatory}
            onChange={(e) => setIsMandatory(e.target.checked)}
            className="w-4 h-4 accent-indigo-500"
          />
          <span className="text-sm text-slate-700">Obligatoria</span>
        </label>

        {/* Botón crear */}
        <button
          onClick={handleCreate}
          disabled={name.trim() === ''}
          className="w-full bg-indigo-500 text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Crear misión
        </button>
      </motion.div>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/quests/NewQuestSheet.tsx
git commit -m "feat: NewQuestSheet — formulario de creación de misiones (bottom sheet)"
```

---

### Task 7: Implementar QuestsPage y hacer pasar todos los tests

**Files:**
- Modify: `app/quests/page.tsx`

- [ ] **Step 1: Reemplazar el placeholder con la implementación completa**

```tsx
// app/quests/page.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuestStore } from '@/store/useQuestStore'
import { useGameLogic } from '@/hooks/useGameLogic'
import QuestSection from '@/components/quests/QuestSection'
import NewQuestSheet from '@/components/quests/NewQuestSheet'
import QuestToast from '@/components/quests/QuestToast'
import DeleteQuestModal from '@/components/quests/DeleteQuestModal'

export default function QuestsPage() {
  const quests        = useQuestStore((s) => s.quests)
  const markUncompleted = useQuestStore((s) => s.markUncompleted)
  const removeQuest   = useQuestStore((s) => s.removeQuest)
  const { completeQuest } = useGameLogic()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [toast, setToast]         = useState<{ id: string; name: string } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const dailyQuests = quests.filter((q) => q.isDaily)
  const epicQuests  = quests.filter((q) => !q.isDaily)

  const handleComplete = (id: string) => {
    const quest = quests.find((q) => q.id === id)
    if (!quest) return
    completeQuest(id)
    setToast({ id, name: quest.name })
  }

  const handleUndo = () => {
    if (toast) markUncompleted(toast.id)
    setToast(null)
  }

  const handleDelete = (id: string) => {
    const quest = quests.find((q) => q.id === id)
    if (!quest) return
    setDeleteTarget({ id, name: quest.name })
  }

  const handleConfirmDelete = () => {
    if (deleteTarget) removeQuest(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <div className="flex flex-col px-4 pt-8 pb-24 gap-6 max-w-sm mx-auto bg-linear-to-b from-white to-indigo-50 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-900">⚔️ Misiones</h1>

      <QuestSection
        title="Diarias"
        quests={dailyQuests}
        onComplete={handleComplete}
        onDelete={handleDelete}
      />

      <QuestSection
        title="Épicas"
        quests={epicQuests}
        onComplete={handleComplete}
        onDelete={handleDelete}
      />

      {/* FAB */}
      <button
        onClick={() => setSheetOpen(true)}
        aria-label="Nueva misión"
        className="fixed bottom-20 right-4 w-12 h-12 bg-indigo-500 text-white rounded-full text-2xl shadow-lg shadow-indigo-200 flex items-center justify-center z-30"
      >
        +
      </button>

      {/* Bottom sheet */}
      <AnimatePresence>
        {sheetOpen && <NewQuestSheet onClose={() => setSheetOpen(false)} />}
      </AnimatePresence>

      {/* Toast */}
      {toast && (
        <QuestToast
          name={toast.name}
          onUndo={handleUndo}
          onDismiss={() => setToast(null)}
        />
      )}

      {/* Modal de borrado */}
      {deleteTarget && (
        <DeleteQuestModal
          questName={deleteTarget.name}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Ejecutar todos los tests y verificar que los 15 pasan**

```bash
npx vitest run tests/app/quests.test.tsx
```

Resultado esperado:
```
✓ tests/app/quests.test.tsx (15)
  ✓ QuestsPage > Lista de misiones (6)
  ✓ QuestsPage > Completar misión (2)
  ✓ QuestsPage > Eliminar misión (3)
  ✓ QuestsPage > Nueva misión (bottom sheet) (4)

Test Files  1 passed (1)
Tests       15 passed (15)
```

- [ ] **Step 3: Verificar que los tests existentes siguen pasando**

```bash
npx vitest run
```

Resultado esperado: todos los tests del proyecto pasan (incluyendo los de onboarding).

- [ ] **Step 4: Commit final**

```bash
git add app/quests/page.tsx
git commit -m "feat: página de Misiones completa — lista swipeable, bottom sheet y toast (Fase 5)"
```
