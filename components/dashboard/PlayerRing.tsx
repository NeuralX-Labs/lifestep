// components/dashboard/PlayerRing.tsx
// Anillo SVG con 5 arcos animados (uno por stat).
// Los arcos se dibujan desde 0 hasta el progreso real al montar.

'use client'

import { motion } from 'framer-motion'
import { STATS, expForNextLevel } from '@/lib/constants'
import type { StatKey } from '@/lib/constants'
import type { StatLevel } from '@/store/types'

interface PlayerRingProps {
  level: number
  stats: Record<StatKey, StatLevel>
  size?: number
}

// Orden de aparición de los stats en el anillo (sentido horario desde las 12h)
const STAT_ORDER: StatKey[] = ['VIT', 'WIS', 'WIL', 'SOC', 'FOR']

const SECTOR_DEG   = 68   // grados del arco visible por stat
const TOTAL_DEG    = 72   // grados del sector completo (68 + 4 de hueco)
const STROKE_WIDTH = 14   // grosor del trazo SVG
const INNER_PADDING = 4   // margen interior para que el trazo no toque el borde del contenedor

export default function PlayerRing({ level, stats, size = 200 }: PlayerRingProps) {
  const cx = size / 2
  const cy = size / 2
  const r = (size - STROKE_WIDTH) / 2 - INNER_PADDING
  const circumference = 2 * Math.PI * r
  const sectorLength  = circumference * (SECTOR_DEG / 360)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* SVG rotado -90° para que el primer arco empiece arriba (12h) */}
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {STAT_ORDER.map((key, i) => {
          const stat       = stats[key]
          const progress   = Math.min(1, stat.exp / (expForNextLevel(stat.level) || 1))
          const fillLength = sectorLength * progress
          const dashOffset = -(circumference * i * (TOTAL_DEG / 360))

          return (
            <g key={key}>
              {/* Track (fondo del arco) */}
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={STATS[key].light}
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={`${sectorLength} ${circumference - sectorLength}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
              />
              {/* Fill animado */}
              <motion.circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={STATS[key].color}
                strokeWidth={STROKE_WIDTH}
                strokeLinecap="round"
                strokeDashoffset={dashOffset}
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{
                  strokeDasharray: `${fillLength} ${circumference - fillLength}`,
                }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.05 }}
              />
            </g>
          )
        })}
      </svg>

      {/* Texto central: nivel */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] font-semibold text-slate-400 tracking-widest">
          NIVEL
        </span>
        <span className="text-4xl font-extrabold text-slate-900 leading-none">
          {level}
        </span>
      </div>
    </div>
  )
}
