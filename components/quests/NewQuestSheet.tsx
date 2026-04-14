// components/quests/NewQuestSheet.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuestStore } from '@/store/useQuestStore'
import { STATS, DIFFICULTIES } from '@/lib/constants'
import type { StatKey, DifficultyKey } from '@/lib/constants'

interface Props {
  onClose: () => void
}

const STAT_KEYS = Object.keys(STATS) as StatKey[]
const DIFFICULTY_KEYS = Object.keys(DIFFICULTIES) as DifficultyKey[]

export default function NewQuestSheet({ onClose }: Props) {
  const addQuest = useQuestStore((s) => s.addQuest)

  const [name, setName]             = useState('')
  const [stat, setStat]             = useState<StatKey>('VIT')
  const [difficulty, setDifficulty] = useState<DifficultyKey>('easy')
  const [isDaily, setIsDaily]       = useState(true)
  const [isMandatory, setIsMandatory] = useState(false)

  const handleCreate = () => {
    addQuest({ name: name.trim(), stat, difficulty, isDaily, isMandatory })
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        data-testid="sheet-backdrop"
      />

      {/* Sheet */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl px-5 pb-10 pt-4 z-50"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {/* Handle */}
        <div className="w-9 h-1 bg-slate-200 rounded-full mx-auto mb-4" />

        <h2 className="text-base font-bold text-slate-900 mb-4">Nueva misión</h2>

        {/* Nombre */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="¿Qué quieres lograr?"
          maxLength={40}
          autoFocus
          className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 mb-4 outline-none focus:border-indigo-300"
        />

        {/* Selector de stat */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-500 mb-2">Estadística</p>
          <div className="flex flex-wrap gap-2">
            {STAT_KEYS.map((key) => {
              const s = STATS[key]
              const isSelected = stat === key
              return (
                <button
                  key={key}
                  onClick={() => setStat(key)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-colors"
                  style={
                    isSelected
                      ? { background: s.light, borderColor: s.color, color: s.color }
                      : { background: 'transparent', borderColor: '#e2e8f0', color: '#64748b' }
                  }
                >
                  {key}
                </button>
              )
            })}
          </div>
        </div>

        {/* Toggle tipo */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-500 mb-2">Tipo</p>
          <div className="flex gap-2">
            <button
              onClick={() => setIsDaily(true)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 ${
                isDaily
                  ? 'bg-indigo-500 border-indigo-500 text-white'
                  : 'bg-transparent border-slate-200 text-slate-500'
              }`}
            >
              Diaria
            </button>
            <button
              onClick={() => setIsDaily(false)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 ${
                !isDaily
                  ? 'bg-indigo-500 border-indigo-500 text-white'
                  : 'bg-transparent border-slate-200 text-slate-500'
              }`}
            >
              Épica
            </button>
          </div>
        </div>

        {/* Selector de dificultad */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-500 mb-2">Dificultad</p>
          <div className="flex gap-2">
            {DIFFICULTY_KEYS.map((key) => (
              <button
                key={key}
                onClick={() => setDifficulty(key)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border-2 ${
                  difficulty === key
                    ? 'bg-indigo-500 border-indigo-500 text-white'
                    : 'bg-transparent border-slate-200 text-slate-500'
                }`}
              >
                {DIFFICULTIES[key].label}
              </button>
            ))}
          </div>
        </div>

        {/* Checkbox obligatoria */}
        <label className="flex items-center gap-3 mb-5 cursor-pointer">
          <input
            type="checkbox"
            checked={isMandatory}
            onChange={(e) => setIsMandatory(e.target.checked)}
            className="w-4 h-4 accent-indigo-500"
          />
          <span className="text-sm text-slate-700">Obligatoria</span>
        </label>

        {/* Botón crear */}
        <button
          onClick={handleCreate}
          disabled={name.trim() === ''}
          className="w-full bg-indigo-500 text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Crear misión
        </button>
      </motion.div>
    </>
  )
}
