// components/dashboard/QuestSummary.tsx
// Lista de misiones del día actual. Solo lectura — las acciones están en /quests.
// Lee useQuestStore directamente. Muestra hasta 5 misiones con animación stagger.

'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useQuestStore } from '@/store/useQuestStore'
import { STATS } from '@/lib/constants'

const MAX_VISIBLE = 5

export default function QuestSummary() {
  const quests = useQuestStore((s) => s.quests)

  // Misiones relevantes para hoy: diarias (completadas o no) + épicas completadas hoy
  const todayQuests = quests
    .filter((q) => q.isDaily || q.completedToday)
    .sort((a, b) => {
      // Obligatorias primero
      if (a.isMandatory === b.isMandatory) return 0
      return a.isMandatory ? -1 : 1
    })

  const completed = todayQuests.filter((q) => q.completedToday).length
  const visible   = todayQuests.slice(0, MAX_VISIBLE)
  const hasMore   = todayQuests.length > MAX_VISIBLE

  if (todayQuests.length === 0) {
    return (
      <div className="w-full text-center py-4">
        <p className="text-sm text-slate-400">
          Sin misiones — ve a Misiones para añadir
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-base font-bold text-slate-900">Hoy</h2>
        <span className="text-xs text-slate-400">
          ({completed}/{todayQuests.length} completadas)
        </span>
      </div>

      {/* Lista de misiones */}
      <div className="flex flex-col gap-2">
        {visible.map((quest, i) => {
          const statDef = STATS[quest.stat] ?? STATS['VIT']  // fallback defensivo
          return (
          <motion.div
            key={quest.id}
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3, ease: 'easeOut' }}
          >
            {/* Check circle */}
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                quest.completedToday
                  ? 'bg-emerald-500 border-emerald-500'
                  : 'border-slate-300'
              }`}
            >
              {quest.completedToday && (
                <svg aria-hidden="true" width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path
                    d="M1 4L3.5 6.5L9 1"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>

            {/* Nombre de la misión */}
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              {quest.isMandatory && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
              )}
              <span
                className={`text-sm truncate ${
                  quest.completedToday
                    ? 'line-through text-slate-400'
                    : 'text-slate-700'
                }`}
              >
                {quest.name}
              </span>
            </div>

            {/* Chip del stat */}
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{
                background: statDef.light,
                color: statDef.color,
              }}
            >
              {quest.stat}
            </span>
          </motion.div>
          )
        })}
      </div>

      {/* Enlace "Ver todas" si hay más de 5 */}
      {hasMore && (
        <Link
          href="/quests"
          className="block text-xs text-indigo-500 font-semibold mt-3 text-right"
        >
          Ver todas →
        </Link>
      )}
    </div>
  )
}
