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
