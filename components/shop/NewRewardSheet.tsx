'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const COST_OPTIONS = [10, 20, 50, 100] as const

interface NewRewardSheetProps {
  onClose: () => void
  onSave: (name: string, cost: number) => void
}

export default function NewRewardSheet({ onClose, onSave }: NewRewardSheetProps) {
  const [name, setName] = useState('')
  const [cost, setCost] = useState<number>(20)

  const handleSave = () => {
    if (!name.trim()) return
    if (name.trim().length > 100) return
    onSave(name.trim(), cost)
  }

  return (
    <>
      <div
        data-testid="reward-sheet-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-40"
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 px-4 pb-8 pt-5 max-w-md mx-auto"
      >
        <div className="w-9 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
        <h2 className="text-[17px] font-bold text-slate-900 mb-4">Nuevo premio</h2>

        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
          Nombre
        </p>
        <input
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 mb-4 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1"
          placeholder="ej. Helado de postre"
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
          Coste (gold)
        </p>
        <div className="grid grid-cols-4 gap-2 mb-5">
          {COST_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => setCost(option)}
              className={`rounded-xl py-2 text-center font-semibold text-sm border ${
                cost === option
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                  : 'border-slate-200 text-slate-500'
              }`}
            >
              {option}
              <div className="text-[10px] text-slate-400 font-normal">★</div>
            </button>
          ))}
        </div>

        <button
          data-testid="save-reward-button"
          onClick={handleSave}
          disabled={name.trim() === ''}
          className="w-full bg-indigo-500 disabled:opacity-40 text-white rounded-2xl py-3.5 text-[15px] font-semibold"
        >
          Guardar premio
        </button>
      </motion.div>
    </>
  )
}
