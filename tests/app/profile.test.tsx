import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { usePlayerStore } from '@/store/usePlayerStore'
import type { StatKey } from '@/lib/constants'

// --- Mocks (deben ir ANTES del import de la página) ---

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) =>
      <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

const { default: ProfilePage } = await import('@/app/profile/page')

// --- Helpers ---

const basePlayer = {
  name: 'Jorge',
  createdAt: '2026-01-01',
  level: 12,
  exp: 40,
  expToNextLevel: 1200,
  hp: 100,
  gold: 245,
  isExhausted: false,
  exhaustedUntil: null,
  stats: {
    VIT: { level: 8, exp: 20 },
    WIS: { level: 5, exp: 10 },
    WIL: { level: 6, exp: 30 },
    SOC: { level: 3, exp: 5 },
    FOR: { level: 4, exp: 15 },
  },
  priorityStats: ['VIT', 'WIS'] as StatKey[],
  streak: { current: 7, lastCompletedDate: '2026-04-14' },
}

function setPlayer(overrides: Partial<typeof basePlayer> = {}) {
  usePlayerStore.setState({ player: { ...basePlayer, ...overrides } })
}

// --- Tests ---

describe('ProfilePage', () => {
  beforeEach(() => {
    setPlayer()
  })

  describe('Estructura básica', () => {
    it('renderiza el nombre del jugador', () => {
      render(<ProfilePage />)
      expect(screen.getByText('Jorge')).toBeInTheDocument()
    })

    it('renderiza el nivel del jugador', () => {
      render(<ProfilePage />)
      expect(screen.getByText(/nivel 12/i)).toBeInTheDocument()
    })

    it('muestra el botón de ajustes', () => {
      render(<ProfilePage />)
      expect(screen.getByTestId('settings-button')).toBeInTheDocument()
    })

    it('muestra el gold del jugador en métricas', () => {
      render(<ProfilePage />)
      expect(screen.getByText('245')).toBeInTheDocument()
    })
  })

  describe('Stats', () => {
    it('renderiza los 5 pilares', () => {
      render(<ProfilePage />)
      expect(screen.getByText('Vitalidad')).toBeInTheDocument()
      expect(screen.getByText('Sabiduría')).toBeInTheDocument()
      expect(screen.getByText('Voluntad')).toBeInTheDocument()
      expect(screen.getByText('Vínculo')).toBeInTheDocument()
      expect(screen.getByText('Fortuna')).toBeInTheDocument()
    })

    it('muestra el nivel correcto de VIT', () => {
      render(<ProfilePage />)
      expect(screen.getByText('Nv. 8')).toBeInTheDocument()
    })
  })

  describe('Social Card Modal', () => {
    it('el modal no está visible inicialmente', () => {
      render(<ProfilePage />)
      expect(screen.queryByTestId('social-card')).not.toBeInTheDocument()
    })

    it('el botón Ver Social Card abre el modal', () => {
      render(<ProfilePage />)
      fireEvent.click(screen.getByTestId('social-card-button'))
      expect(screen.getByTestId('social-card')).toBeInTheDocument()
    })

    it('el modal muestra el nombre del jugador', () => {
      render(<ProfilePage />)
      fireEvent.click(screen.getByTestId('social-card-button'))
      expect(screen.getAllByText('Jorge').length).toBeGreaterThan(0)
    })

    it('el backdrop cierra el modal', () => {
      render(<ProfilePage />)
      fireEvent.click(screen.getByTestId('social-card-button'))
      fireEvent.click(screen.getByTestId('social-card-backdrop'))
      expect(screen.queryByTestId('social-card')).not.toBeInTheDocument()
    })

    it('el botón compartir está presente en el modal', () => {
      render(<ProfilePage />)
      fireEvent.click(screen.getByTestId('social-card-button'))
      expect(screen.getByTestId('share-button')).toBeInTheDocument()
    })
  })

  describe('Sin jugador', () => {
    it('no renderiza nada si player es null', () => {
      usePlayerStore.setState({ player: null })
      const { container } = render(<ProfilePage />)
      expect(container.firstChild).toBeNull()
    })
  })
})
