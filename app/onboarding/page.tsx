// app/onboarding/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, type Transition } from 'framer-motion'
import { usePlayerStore } from '@/store/usePlayerStore'
import { STATS } from '@/lib/constants'
import type { StatKey } from '@/lib/constants'

// Orden fijo de los 5 pilares en la pantalla de selección
const STAT_KEYS: StatKey[] = ['VIT', 'WIS', 'WIL', 'SOC', 'FOR']

// Animación compartida para cada pantalla
const SCREEN_ANIM = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: 'easeOut' } as Transition,
}

// Indicador de 3 puntos de progreso
function ProgressDots({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="flex gap-2 mb-6">
      {([1, 2, 3] as const).map((n) => (
        <div
          key={n}
          className={`w-2 h-2 rounded-full ${
            n === step ? 'bg-indigo-500' : 'bg-indigo-200'
          }`}
        />
      ))}
    </div>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const player = usePlayerStore((s) => s.player)
  const initPlayer = usePlayerStore((s) => s.initPlayer)

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [name, setName] = useState('')
  const [selectedStats, setSelectedStats] = useState<StatKey[]>([])

  // Guardia: si ya existe jugador → redirigir
  useEffect(() => {
    if (player !== null) {
      router.push('/dashboard')
    }
  }, [player, router])

  if (player !== null) return null

  // ——— LÓGICA DE SELECCIÓN DE PILARES ———
  function toggleStat(key: StatKey) {
    setSelectedStats((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key)
      }
      if (prev.length < 2) {
        return [...prev, key]
      }
      return [prev[1], key]
    })
  }

  function handleFinish() {
    initPlayer(name.trim(), selectedStats)
    router.push('/dashboard')
  }

  // ——— PASO 1: BIENVENIDA ———
  if (step === 1) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-b from-white to-indigo-50 px-6">
        <motion.div
          key="step1"
          {...SCREEN_ANIM}
          className="flex flex-col items-center gap-3 w-full max-w-sm"
        >
          <ProgressDots step={1} />
          <span className="text-5xl">🌱</span>
          <h1 className="text-2xl font-bold text-slate-900">LifeStep</h1>
          <p className="text-sm text-indigo-500 italic text-center">
            "Convierte tu vida en una aventura"
          </p>
          <button
            onClick={() => setStep(2)}
            className="w-full mt-6 bg-indigo-500 text-white font-semibold py-3 rounded-xl text-sm"
          >
            Comenzar aventura →
          </button>
        </motion.div>
      </div>
    )
  }

  // ——— PASO 2: NOMBRE ———
  if (step === 2) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-b from-white to-indigo-50 px-6">
        <motion.div
          key="step2"
          {...SCREEN_ANIM}
          className="flex flex-col items-center gap-3 w-full max-w-sm"
        >
          <ProgressDots step={2} />
          <span className="text-4xl">⚔️</span>
          <h2 className="text-xl font-bold text-slate-900 text-center">
            ¿Cómo te llamas, aventurero?
          </h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre..."
            maxLength={20}
            autoFocus
            className="w-full text-center text-base px-4 py-3 rounded-xl border-2 border-indigo-200 bg-white/80 text-slate-900 outline-none focus:border-indigo-400 mt-2"
          />
          <button
            onClick={() => setStep(3)}
            disabled={name.trim() === ''}
            className="w-full mt-2 bg-indigo-500 text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente →
          </button>
          <button
            onClick={() => setStep(1)}
            className="text-sm text-slate-400 mt-1"
          >
            ← Volver
          </button>
        </motion.div>
      </div>
    )
  }

  // ——— PASO 3: PILARES ———
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-b from-white to-indigo-50 px-6">
      <motion.div
        key="step3"
        {...SCREEN_ANIM}
        className="flex flex-col items-center gap-3 w-full max-w-sm"
      >
        <ProgressDots step={3} />
        <h2 className="text-xl font-bold text-slate-900 text-center">
          Elige tus 2 pilares
        </h2>
        <p className="text-sm text-slate-500 text-center">
          Serán tu especialidad — ganarás más EXP en ellos
        </p>

        <div className="flex flex-col gap-3 w-full mt-2">
          {STAT_KEYS.map((key) => {
            const stat = STATS[key]
            const isSelected = selectedStats.includes(key)
            return (
              <button
                key={key}
                onClick={() => toggleStat(key)}
                style={
                  isSelected
                    ? { background: stat.light, borderColor: stat.color }
                    : { background: 'rgba(255,255,255,0.6)', borderColor: '#e2e8f0' }
                }
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 text-left"
              >
                <span className="text-xl">{stat.emoji}</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-800">
                    {stat.name}
                  </div>
                  <div className="text-xs text-slate-500">{stat.description}</div>
                </div>
                {isSelected && (
                  <div
                    style={{ background: stat.color }}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                    aria-hidden="true"
                  >
                    ✓
                  </div>
                )}
              </button>
            )
          })}
        </div>

        <button
          onClick={handleFinish}
          disabled={selectedStats.length !== 2}
          className="w-full mt-2 bg-indigo-500 text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ¡Comenzar!
        </button>
        <button
          onClick={() => setStep(2)}
          className="text-sm text-slate-400 mt-1"
        >
          ← Volver
        </button>
      </motion.div>
    </div>
  )
}
