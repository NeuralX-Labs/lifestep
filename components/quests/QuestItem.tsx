// components/quests/QuestItem.tsx
'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import { STATS } from '@/lib/constants'
import type { QuestData } from '@/store/types'

interface Props {
  quest: QuestData
  onComplete: (id: string) => void
  onDelete: (id: string) => void
}

export default function QuestItem({ quest, onComplete, onDelete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const greenOpacity = useTransform(x, [0, 80], [0, 1])
  const redOpacity = useTransform(x, [-80, 0], [1, 0])
  const stat = STATS[quest.stat]

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const width = containerRef.current?.offsetWidth ?? 300
    const threshold = width * 0.4
    if (info.offset.x > threshold) {
      onComplete(quest.id)
    } else if (info.offset.x < -threshold) {
      onDelete(quest.id)
    }
  }

  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-xl">
      {/* Fondo verde (completar) */}
      <motion.div
        className="absolute inset-0 bg-emerald-50 flex items-center pl-4"
        style={{ opacity: greenOpacity }}
        aria-hidden
      >
        <span className="text-emerald-600 font-semibold text-sm">✓ Completar</span>
      </motion.div>

      {/* Fondo rojo (eliminar) */}
      <motion.div
        className="absolute inset-0 bg-rose-50 flex items-center justify-end pr-4"
        style={{ opacity: redOpacity }}
        aria-hidden
      >
        <span className="text-rose-600 font-semibold text-sm">Eliminar 🗑</span>
      </motion.div>

      {/* Tarjeta */}
      <motion.div
        drag="x"
        dragSnapToOrigin
        dragElastic={0.3}
        style={{ x }}
        onDragEnd={handleDragEnd}
        className="relative bg-white border border-slate-200 rounded-xl px-3 py-3 flex items-center gap-2.5 z-10"
      >
        {/* Check */}
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
            quest.completedToday
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-slate-300'
          }`}
        >
          {quest.completedToday && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden>
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        {/* Punto rojo obligatoria */}
        {quest.isMandatory && (
          <div
            data-testid={`mandatory-dot-${quest.id}`}
            className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"
          />
        )}

        {/* Nombre */}
        <span
          className={`text-sm flex-1 truncate ${
            quest.completedToday ? 'line-through text-slate-400' : 'text-slate-700'
          }`}
        >
          {quest.name}
        </span>

        {/* Estrella épica */}
        {!quest.isDaily && (
          <span
            data-testid={`epic-star-${quest.id}`}
            className="text-amber-400 text-sm shrink-0"
            aria-hidden
          >
            ★
          </span>
        )}

        {/* Chip stat */}
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
          style={{ background: stat.light, color: stat.color }}
        >
          {quest.stat}
        </span>
      </motion.div>

      {/* Botones ocultos para accesibilidad y tests */}
      <button
        data-testid={`complete-${quest.id}`}
        onClick={() => onComplete(quest.id)}
        aria-label={`Completar ${quest.name}`}
        className="sr-only"
      />
      <button
        data-testid={`delete-${quest.id}`}
        onClick={() => onDelete(quest.id)}
        aria-label={`Eliminar ${quest.name}`}
        className="sr-only"
      />
    </div>
  )
}
