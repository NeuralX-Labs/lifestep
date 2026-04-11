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
