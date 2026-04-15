import { useMemo } from 'react'

interface MetricsRowProps {
  streak: number
  gold: number
  createdAt: string
}

function MetricCard({ icon, value, label }: { icon: string; value: string | number; label: string }) {
  return (
    <div className="flex-1 bg-slate-50 rounded-2xl p-3 flex flex-col items-center gap-0.5 border border-slate-100">
      <span className="text-xl">{icon}</span>
      <span className="font-bold text-slate-900 text-base leading-tight">{value}</span>
      <span className="text-[10px] text-slate-400 text-center leading-tight">{label}</span>
    </div>
  )
}

export default function MetricsRow({ streak, gold, createdAt }: MetricsRowProps) {
  const daysPlaying = useMemo(() => {
    const start = new Date(createdAt)
    const now = new Date()
    return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }, [createdAt])

  return (
    <div className="flex gap-3">
      <MetricCard icon="⚡" value={streak} label="días racha" />
      <MetricCard icon="🏅" value={gold} label="gold total" />
      <MetricCard icon="📅" value={`${daysPlaying}d`} label="jugando" />
    </div>
  )
}
