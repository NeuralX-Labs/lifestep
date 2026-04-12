// app/dashboard/page.tsx
// Pantalla principal del juego. Muestra el emblema del jugador, sus stats y misiones del día.
// Si no hay jugador registrado (player === null), redirige al onboarding.

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { usePlayerStore } from '@/store/usePlayerStore'
import PlayerRing from '@/components/dashboard/PlayerRing'
import StatsPanel from '@/components/dashboard/StatsPanel'
import QuestSummary from '@/components/dashboard/QuestSummary'

export default function DashboardPage() {
  const router = useRouter()
  const player = usePlayerStore((s) => s.player)

  useEffect(() => {
    if (player === null) {
      router.push('/onboarding')
    }
  }, [player, router])

  // Mientras redirige, no renderizar nada
  if (player === null) return null

  return (
    <div className="flex flex-col items-center px-6 pt-8 pb-4 gap-6 max-w-md mx-auto">
      {/* Saludo */}
      <motion.h1
        className="text-2xl font-bold text-slate-900 self-start"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        Hola, {player.name}
      </motion.h1>

      {/* Anillo SVG */}
      <PlayerRing level={player.level} stats={player.stats} />

      {/* Barras de HP/EXP y stats */}
      <StatsPanel
        hp={player.hp}
        exp={player.exp}
        expToNextLevel={player.expToNextLevel}
        gold={player.gold}
        streak={player.streak}
        stats={player.stats}
        isExhausted={player.isExhausted}
        exhaustedUntil={player.exhaustedUntil}
      />

      {/* Resumen de misiones */}
      <QuestSummary />
    </div>
  )
}
