'use client'

import { motion } from 'framer-motion'
import { STATS } from '@/lib/constants'
import type { StatKey } from '@/lib/constants'
import type { PlayerData } from '@/store/types'

const STAT_ORDER: StatKey[] = ['VIT', 'WIS', 'WIL', 'SOC', 'FOR']

interface SocialCardModalProps {
  player: PlayerData
  onClose: () => void
}

function buildShareText(player: PlayerData): string {
  const statsText = STAT_ORDER
    .map((k) => `${STATS[k].emoji}${player.stats[k].level}`)
    .join(' ')
  return `Soy ${player.name}, nivel ${player.level} en LifeStep\n⚡ Racha de ${player.streak.current} días\n${statsText}\nlifestep.vercel.app`
}

export default function SocialCardModal({ player, onClose }: SocialCardModalProps) {
  const handleShare = async () => {
    const text = buildShareText(player)
    if (navigator.share) {
      await navigator.share({ text })
    } else {
      await navigator.clipboard.writeText(text)
    }
  }

  return (
    <>
      <motion.div
        data-testid="social-card-backdrop"
        className="fixed inset-0 bg-black/60 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-5 pb-8 max-w-md mx-auto"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <div className="w-8 h-1 bg-slate-200 rounded-full mx-auto mb-5" />

        <div
          data-testid="social-card"
          className="rounded-2xl p-4 mb-4 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)' }}
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-white font-bold text-base">{player.name}</p>
              <p className="text-white/60 text-xs">LifeStep Player</p>
            </div>
            <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-lg">
              Nv. {player.level}
            </span>
          </div>

          <div className="flex gap-2 mb-3">
            {STAT_ORDER.map((key) => (
              <div key={key} className="flex-1 bg-white/10 rounded-lg py-2 text-center">
                <div className="text-base">{STATS[key].emoji}</div>
                <div className="text-white font-bold text-xs mt-0.5">{player.stats[key].level}</div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white/60 text-xs">⚡ Racha de {player.streak.current} días</span>
            <span className="text-white/40 text-xs font-bold tracking-widest">LIFESTEP</span>
          </div>
        </div>

        <button
          data-testid="share-button"
          onClick={handleShare}
          className="w-full py-3 rounded-2xl font-bold text-white text-sm"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          📤 Compartir tarjeta
        </button>
      </motion.div>
    </>
  )
}
