// components/quests/QuestSection.tsx
'use client'

import QuestItem from '@/components/quests/QuestItem'
import type { QuestData } from '@/store/types'

interface Props {
  title: string
  quests: QuestData[]
  onComplete: (id: string) => void
  onDelete: (id: string) => void
}

export default function QuestSection({ title, quests, onComplete, onDelete }: Props) {
  // Ordenar: obligatorias primero
  const sorted = [...quests].sort((a, b) => (b.isMandatory ? 1 : 0) - (a.isMandatory ? 1 : 0))
  const completed = quests.filter((q) => q.completedToday).length

  return (
    <div className="flex flex-col gap-2">
      {/* Cabecera de sección */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</h2>
        {quests.length > 0 && (
          <span className="text-xs text-slate-400">
            {completed}/{quests.length}
          </span>
        )}
      </div>

      {/* Lista o mensaje vacío */}
      {quests.length === 0 ? (
        <p className="text-sm text-slate-400 py-1">Sin misiones — pulsa + para añadir</p>
      ) : (
        sorted.map((quest) => (
          <QuestItem
            key={quest.id}
            quest={quest}
            onComplete={onComplete}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  )
}
