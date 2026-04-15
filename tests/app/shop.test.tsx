import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useShopStore } from '@/store/useShopStore'
import type { StatKey } from '@/lib/constants'

// --- Mocks (deben ir ANTES del import de la página) ---

const mockRecoverWithGold = vi.fn(() => true)

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) =>
      <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/hooks/useGameLogic', () => ({
  useGameLogic: () => ({ recoverWithGold: mockRecoverWithGold }),
}))

const { default: ShopPage } = await import('@/app/shop/page')

// --- Helpers ---

const basePlayer = {
  name: 'Test',
  createdAt: '2026-01-01',
  level: 1,
  exp: 0,
  expToNextLevel: 100,
  hp: 100,
  gold: 100,
  isExhausted: false,
  exhaustedUntil: null,
  stats: {
    VIT: { level: 1, exp: 0 },
    WIS: { level: 1, exp: 0 },
    WIL: { level: 1, exp: 0 },
    SOC: { level: 1, exp: 0 },
    FOR: { level: 1, exp: 0 },
  },
  priorityStats: ['VIT', 'WIS'] as StatKey[],
  streak: { current: 0, lastCompletedDate: null },
}

function setPlayer(overrides: Partial<typeof basePlayer> = {}) {
  usePlayerStore.setState({ player: { ...basePlayer, ...overrides } })
}

function addTestReward(overrides: { id?: string; name?: string; cost?: number } = {}) {
  useShopStore.setState({
    items: [{
      id: overrides.id ?? 'r1',
      name: overrides.name ?? 'Helado',
      cost: overrides.cost ?? 20,
    }],
  })
}

// --- Tests ---

describe('ShopPage', () => {
  beforeEach(() => {
    mockRecoverWithGold.mockClear()
    mockRecoverWithGold.mockReturnValue(true)
    useShopStore.setState({ items: [] })
    setPlayer()
  })

  describe('Estructura básica', () => {
    it('renderiza el título Tienda', () => {
      render(<ShopPage />)
      expect(screen.getByRole('heading', { name: /tienda/i })).toBeInTheDocument()
    })

    it('muestra el gold actual del jugador', () => {
      setPlayer({ gold: 150 })
      render(<ShopPage />)
      expect(screen.getByText(/150/)).toBeInTheDocument()
    })

    it('muestra la sección Ítems de juego', () => {
      render(<ShopPage />)
      expect(screen.getByText(/ítems de juego/i)).toBeInTheDocument()
    })

    it('muestra la sección Mis premios', () => {
      render(<ShopPage />)
      expect(screen.getByText(/mis premios/i)).toBeInTheDocument()
    })
  })

  describe('Poción de vida', () => {
    it('aparece deshabilitada cuando el jugador NO está agotado', () => {
      setPlayer({ isExhausted: false })
      render(<ShopPage />)
      expect(screen.getByText(/no disponible/i)).toBeInTheDocument()
      expect(screen.queryByTestId('potion-button')).not.toBeInTheDocument()
    })

    it('aparece activa cuando el jugador ESTÁ agotado y puede pagarla', () => {
      setPlayer({ isExhausted: true, gold: 100 })
      render(<ShopPage />)
      expect(screen.getByTestId('potion-button')).toBeInTheDocument()
    })

    it('al canjearla llama a recoverWithGold y muestra toast HP restaurado', () => {
      setPlayer({ isExhausted: true, gold: 100 })
      render(<ShopPage />)
      fireEvent.click(screen.getByTestId('potion-button'))
      expect(mockRecoverWithGold).toHaveBeenCalledTimes(1)
      expect(screen.getByRole('alert')).toHaveTextContent(/hp restaurado/i)
    })
  })

  describe('Premios personales', () => {
    it('muestra placeholder cuando no hay premios', () => {
      render(<ShopPage />)
      expect(screen.getByText(/pulsa \+ para añadir/i)).toBeInTheDocument()
    })

    it('muestra premios existentes con nombre y coste', () => {
      setPlayer({ gold: 50 })
      addTestReward({ name: 'Helado', cost: 20 })
      render(<ShopPage />)
      expect(screen.getByText('Helado')).toBeInTheDocument()
      expect(screen.getByText(/20/)).toBeInTheDocument()
    })

    it('premio con gold insuficiente aparece deshabilitado y muestra Sin gold', () => {
      setPlayer({ gold: 5 })
      addTestReward({ id: 'r1', name: 'Helado', cost: 20 })
      render(<ShopPage />)
      expect(screen.queryByTestId('redeem-r1')).not.toBeInTheDocument()
      expect(screen.getByText(/sin gold/i)).toBeInTheDocument()
    })

    it('al canjear un premio lo elimina y muestra toast Premio canjeado', () => {
      setPlayer({ gold: 50 })
      addTestReward({ id: 'r1', name: 'Helado', cost: 20 })
      render(<ShopPage />)
      fireEvent.click(screen.getByTestId('redeem-r1'))
      expect(screen.queryByText('Helado')).not.toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent(/premio canjeado/i)
    })
  })

  describe('NewRewardSheet', () => {
    it('el botón + abre el sheet', () => {
      render(<ShopPage />)
      fireEvent.click(screen.getByTestId('add-reward-fab'))
      expect(screen.getByTestId('reward-sheet-backdrop')).toBeInTheDocument()
    })

    it('el backdrop cierra el sheet', () => {
      render(<ShopPage />)
      fireEvent.click(screen.getByTestId('add-reward-fab'))
      fireEvent.click(screen.getByTestId('reward-sheet-backdrop'))
      expect(screen.queryByTestId('reward-sheet-backdrop')).not.toBeInTheDocument()
    })

    it('guardar un nuevo premio lo añade a la lista', () => {
      render(<ShopPage />)
      fireEvent.click(screen.getByTestId('add-reward-fab'))
      fireEvent.change(screen.getByPlaceholderText(/ej\./i), { target: { value: 'Cine' } })
      fireEvent.click(screen.getByTestId('save-reward-button'))
      expect(screen.getByText('Cine')).toBeInTheDocument()
    })
  })

  describe('Toast', () => {
    it('el toast desaparece tras 3 segundos', () => {
      vi.useFakeTimers()
      setPlayer({ gold: 50 })
      addTestReward({ id: 'r1', name: 'Helado', cost: 20 })
      render(<ShopPage />)
      fireEvent.click(screen.getByTestId('redeem-r1'))
      expect(screen.getByRole('alert')).toBeInTheDocument()
      act(() => { vi.advanceTimersByTime(3000) })
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      vi.useRealTimers()
    })
  })

  describe('Caminos negativos', () => {
    it('si recoverWithGold devuelve false, no aparece el toast', () => {
      mockRecoverWithGold.mockReturnValue(false)
      setPlayer({ isExhausted: true, gold: 100 })
      render(<ShopPage />)
      fireEvent.click(screen.getByTestId('potion-button'))
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('si el gold es insuficiente al canjear, el premio no desaparece', () => {
      setPlayer({ gold: 5 })
      addTestReward({ id: 'r1', name: 'Helado', cost: 20 })
      render(<ShopPage />)
      // El botón no se muestra porque canAfford=false — el ítem sigue en pantalla
      expect(screen.queryByTestId('redeem-r1')).not.toBeInTheDocument()
      expect(screen.getByText('Helado')).toBeInTheDocument()
    })

    it('no se guarda un premio con nombre vacío', () => {
      render(<ShopPage />)
      fireEvent.click(screen.getByTestId('add-reward-fab'))
      fireEvent.click(screen.getByTestId('save-reward-button'))
      // El sheet sigue abierto, no se añadió ningún ítem
      expect(screen.getByTestId('reward-sheet-backdrop')).toBeInTheDocument()
    })
  })
})
