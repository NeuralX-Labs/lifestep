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
