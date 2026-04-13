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
