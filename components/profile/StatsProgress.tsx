import { STATS } from '@/lib/constants'
import type { StatKey } from '@/lib/constants'
import type { StatLevel } from '@/store/types'

const STAT_ORDER: StatKey[] = ['VIT', 'WIS', 'WIL', 'SOC', 'FOR']

interface StatsProgressProps {
  stats: Record<StatKey, StatLevel>
}

export default function StatsProgress({ stats }: StatsProgressProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
        Pilares
      </h2>
      {STAT_ORDER.map((key) => {
        const stat = stats[key]
        const info = STATS[key]
        const percent = Math.min(100, (stat.exp / (stat.level * 100)) * 100)
        return (
          <div key={key} className="flex items-center gap-3">
            <span className="text-base w-5 text-center">{info.emoji}</span>
            <span className="text-sm text-slate-600 w-20 font-medium">{info.name}</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${percent}%`, background: info.color }}
              />
            </div>
            <span
              className="text-xs font-bold w-10 text-right"
              style={{ color: info.color }}
            >
              Nv. {stat.level}
            </span>
          </div>
        )
      })}
    </div>
  )
}
