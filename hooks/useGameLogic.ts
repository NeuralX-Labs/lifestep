// hooks/useGameLogic.ts
// Hook de lógica de negocio del juego.
// Orquesta el usePlayerStore y useQuestStore para implementar las reglas del juego:
// completar misiones, aplicar penalizaciones diarias y recuperar de estado agotado.

import { usePlayerStore } from '@/store/usePlayerStore'
import { useQuestStore } from '@/store/useQuestStore'
import { GAME_RULES, DIFFICULTIES } from '@/lib/constants'

export function useGameLogic() {
  const playerActions = usePlayerStore()
  const questActions = useQuestStore()

  // Calcula el multiplicador de recompensas según el estado del jugador:
  // - Agotado → ×0.5 (penalización)
  // - Racha activa (≥3 días) → ×1.2 (bonus)
  // - Sin ninguna condición → ×1 (normal)
  const getRewardMultiplier = (): number => {
    const { player } = playerActions
    if (!player) return 1
    if (player.isExhausted) return GAME_RULES.EXHAUSTED_MULTIPLIER
    if (player.streak.current >= GAME_RULES.STREAK_MIN_DAYS) return GAME_RULES.STREAK_MULTIPLIER
    return 1
  }

  // Completa una misión: la marca como completada y entrega EXP, Gold y EXP de stat
  const completeQuest = (questId: string): void => {
    const quest = questActions.quests.find((q) => q.id === questId)
    if (!quest || quest.completedToday) return

    const difficulty = DIFFICULTIES[quest.difficulty]
    const multiplier = getRewardMultiplier()

    // Aplicar multiplicador a las recompensas (redondeado hacia abajo)
    const expReward = Math.floor(difficulty.exp * multiplier)
    const goldReward = Math.floor(difficulty.gold * multiplier)

    questActions.markCompleted(questId)
    playerActions.gainExp(expReward)
    playerActions.gainGold(goldReward)
    playerActions.gainStatExp(quest.stat, expReward)

    // Actualizar racha al completar una misión
    const today = new Date().toISOString().split('T')[0]
    playerActions.updateStreak(today)
  }

  // Aplica las penalizaciones del fin del día:
  // - Descuenta HP por misiones obligatorias no completadas
  // - Resetea el estado "completada hoy" de todas las misiones
  const applyDailyPenalties = (): void => {
    const missedMandatory = questActions.quests.filter(
      (q) => q.isMandatory && !q.completedToday
    )
    if (missedMandatory.length > 0) {
      playerActions.loseHP(missedMandatory.length * GAME_RULES.HP_PENALTY_PER_MISS)
    }
    questActions.resetDailyCompletions()
  }

  // Recupera al jugador del estado Agotado pagando RECOVERY_GOLD_COST gold.
  // Devuelve true si tuvo éxito, false si no había suficiente gold.
  const recoverWithGold = (): boolean => {
    const { player } = playerActions
    if (!player?.isExhausted) return false

    const spent = playerActions.spendGold(GAME_RULES.RECOVERY_GOLD_COST)
    if (spent) {
      playerActions.clearExhausted()
      playerActions.gainHP(GAME_RULES.MAX_HP) // restaurar HP al máximo
    }
    return spent
  }

  return { completeQuest, applyDailyPenalties, recoverWithGold, getRewardMultiplier }
}
