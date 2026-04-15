// components/shop/ShopItem.tsx
// Tarjeta de ítem de tienda. Cubre dos casos:
//   - Poción de vida (isAvailable=false si no agotado, buttonVariant='red' si activo)
//   - Premio personal (isAvailable=true siempre, buttonVariant='indigo' por defecto)

interface ShopItemProps {
  name: string
  cost: number
  emoji: string
  emojiBg: string          // clase Tailwind para el fondo del emoji, ej. 'bg-rose-100'
  description: string
  canAfford: boolean       // player.gold >= cost
  isAvailable: boolean     // false → 'No disponible' (para Poción cuando no agotado)
  redeemTestId?: string
  buttonVariant?: 'indigo' | 'red'
  onRedeem: () => void
}

export default function ShopItem({
  name,
  cost,
  emoji,
  emojiBg,
  description,
  canAfford,
  isAvailable,
  redeemTestId,
  buttonVariant = 'indigo',
  onRedeem,
}: ShopItemProps) {
  const isDisabled = !isAvailable || !canAfford

  const buttonBase = 'text-white rounded-xl px-3 py-1.5 text-sm font-semibold'
  const buttonClass = `${buttonVariant === 'red' ? 'bg-rose-500' : 'bg-indigo-500'} ${buttonBase}`

  return (
    <div className={`bg-white rounded-2xl p-4 flex items-center gap-3 ${isDisabled ? 'opacity-50' : ''}`}>
      <div className={`w-11 h-11 rounded-xl ${emojiBg} flex items-center justify-center text-xl shrink-0`}>
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900">{name}</p>
        <p className="text-sm text-slate-400 mt-0.5">{description}</p>
      </div>
      <div className="shrink-0">
        {!isAvailable && (
          <span className="text-xs text-slate-300">No disponible</span>
        )}
        {isAvailable && !canAfford && (
          <span className="text-xs text-slate-300">Sin gold</span>
        )}
        {isAvailable && canAfford && (
          <button
            data-testid={redeemTestId}
            onClick={onRedeem}
            className={buttonClass}
          >
            {cost} ★
          </button>
        )}
      </div>
    </div>
  )
}
