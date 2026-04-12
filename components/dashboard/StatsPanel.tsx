// components/dashboard/StatsPanel.tsx
// Muestra barras animadas de HP y EXP, fila de Gold/racha y chips de los 5 stats.

'use client'

import { motion } from 'framer-motion'
import { STATS, GAME_RULES } from '@/lib/constants'
import type { StatKey } from '@/lib/constants'
import type { StatLevel, PlayerStreak } from '@/store/types'

interface StatsPanelProps {
  hp: number
  exp: number
  expToNextLevel: number
  gold: number
  streak: PlayerStreak
  stats: Record<StatKey, StatLevel>
  isExhausted: boolean
  exhaustedUntil: string | null
}

const STAT_ORDER: StatKey[] = ['VIT', 'WIS', 'WIL', 'SOC', 'FOR']

// Barra de progreso animada con Framer Motion
function ProgressBar({
  percent,
  gradient,
  bg,
}: {
  percent: number
  gradient: string
  bg: string
}) {
  return (
    <div className="h-2 rounded-full overflow-hidden" style={{ background: bg }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: gradient }}
        initial={{ width: '0%' }}
        animate={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  )
}

export default function StatsPanel({
  hp,
  exp,
  expToNextLevel,
  gold,
  streak,
  stats,
  isExhausted,
}: StatsPanelProps) {
  const hpPercent  = (hp / GAME_RULES.MAX_HP) * 100
  const expPercent = (exp / expToNextLevel) * 100

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Barra de HP */}
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-xs font-semibold text-rose-500">❤️ HP</span>
          <span className="text-xs text-slate-500">
            {hp} / {GAME_RULES.MAX_HP}
          </span>
        </div>
        <ProgressBar
          percent={hpPercent}
          gradient={
            isExhausted
              ? 'linear-gradient(90deg, #f97316, #fb923c)'
              : 'linear-gradient(90deg, #f43f5e, #fb7185)'
          }
          bg="#fff1f2"
        />
        {isExhausted && (
          <p className="text-[11px] text-orange-500 mt-1">
            Agotado — recuperación con {GAME_RULES.RECOVERY_GOLD_COST} Gold
          </p>
        )}
      </div>

      {/* Barra de EXP */}
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-xs font-semibold text-indigo-500">⚡ EXP</span>
          <span className="text-xs text-slate-500">
            {exp} / {expToNextLevel}
          </span>
        </div>
        <ProgressBar
          percent={expPercent}
          gradient="linear-gradient(90deg, #6366f1, #818cf8)"
          bg="#e0e7ff"
        />
      </div>

      {/* Gold + Racha */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold text-amber-500">★ {gold} Gold</span>
        {streak.current > 0 && (
          <span className="text-sm font-bold text-orange-500">
            🔥 Racha {streak.current}d
          </span>
        )}
      </div>

      {/* Chips de los 5 stats */}
      <div className="flex flex-wrap gap-2">
        {STAT_ORDER.map((key) => (
          <span
            key={key}
            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{
              background: STATS[key].light,
              color: STATS[key].color,
            }}
          >
            {STATS[key].emoji} {key} Lv{stats[key].level}
          </span>
        ))}
      </div>
    </div>
  )
}
