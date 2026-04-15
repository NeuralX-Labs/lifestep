'use client'

import { useRouter } from 'next/navigation'

interface ProfileHeaderProps {
  name: string
  level: number
  streak: number
}

export default function ProfileHeader({ name, level, streak }: ProfileHeaderProps) {
  const router = useRouter()
  const initial = name.charAt(0).toUpperCase()

  return (
    <div className="flex items-center gap-3">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
      >
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-900 text-base truncate">{name}</p>
        <p className="text-sm text-indigo-500 font-semibold">
          Nivel {level}{streak > 0 ? ` · ⚡ ${streak} días de racha` : ''}
        </p>
      </div>
      <button
        data-testid="settings-button"
        onClick={() => router.push('/settings')}
        className="text-slate-400 text-xl p-1"
        aria-label="Ajustes"
      >
        ⚙️
      </button>
    </div>
  )
}
