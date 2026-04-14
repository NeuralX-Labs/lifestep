interface ShopSectionProps {
  title: string
  children: React.ReactNode
}

export default function ShopSection({ title, children }: ShopSectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-1">
        {title}
      </h2>
      {children}
    </div>
  )
}
