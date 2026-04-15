// app/profile/page.tsx
'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '@/store/usePlayerStore'
import ProfileHeader from '@/components/profile/ProfileHeader'
import MetricsRow from '@/components/profile/MetricsRow'
import StatsProgress from '@/components/profile/StatsProgress'
import SocialCardModal from '@/components/profile/SocialCardModal'

export default function ProfilePage() {
  const player = usePlayerStore((s) => s.player)
  const [modalOpen, setModalOpen] = useState(false)

  if (!player) return null

  return (
    <div className="flex flex-col px-4 pt-8 pb-24 gap-5 max-w-md mx-auto">
      <ProfileHeader
        name={player.name}
        level={player.level}
        streak={player.streak.current}
      />

      <MetricsRow
        streak={player.streak.current}
        gold={player.gold}
        createdAt={player.createdAt}
      />

      <StatsProgress stats={player.stats} />

      <button
        data-testid="social-card-button"
        onClick={() => setModalOpen(true)}
        className="w-full py-3 rounded-2xl font-bold text-white text-sm"
        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
      >
        🃏 Ver Social Card
      </button>

      <AnimatePresence>
        {modalOpen && (
          <SocialCardModal
            player={player}
            onClose={() => setModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
