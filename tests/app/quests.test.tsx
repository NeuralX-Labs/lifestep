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
