// app/shop/page.tsx
'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useShopStore } from '@/store/useShopStore'
import { useGameLogic } from '@/hooks/useGameLogic'
import ShopSection from '@/components/shop/ShopSection'
import ShopItem from '@/components/shop/ShopItem'
import NewRewardSheet from '@/components/shop/NewRewardSheet'
import ShopToast from '@/components/shop/ShopToast'

// Coste fijo de la Poción de vida (igual que GAME_RULES.RECOVERY_GOLD_COST = 50)
const POTION_COST = 50

export default function ShopPage() {
  const player = usePlayerStore((s) => s.player)
  const spendGold = usePlayerStore((s) => s.spendGold)
  const { items, addItem, removeItem } = useShopStore()
  const { recoverWithGold } = useGameLogic()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  if (!player) return null

  const handleRedeemPotion = () => {
    const success = recoverWithGold()
    if (success) setToast('¡HP restaurado!')
  }

  const handleRedeemReward = (id: string, cost: number) => {
    spendGold(cost)
    removeItem(id)
    setToast('¡Premio canjeado!')
  }

  const handleSaveReward = (name: string, cost: number) => {
    addItem({ name, cost })
    setSheetOpen(false)
  }

  return (
    <div className="flex flex-col px-4 pt-8 pb-24 gap-6 max-w-md mx-auto">
      {/* Header con gold */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900">Tienda</h1>
        <div className="flex items-center gap-1.5 bg-amber-100 rounded-full px-3 py-1 w-fit">
          <span className="text-sm">★</span>
          <span className="text-sm font-semibold text-amber-800">{player.gold} gold</span>
        </div>
      </div>

      {/* Ítems de juego */}
      <ShopSection title="Ítems de juego">
        <ShopItem
          name="Poción de vida"
          cost={POTION_COST}
          emoji="❤️"
          emojiBg="bg-rose-100"
          description={
            player.isExhausted
              ? '¡Estás Agotado! Recupera HP al máximo'
              : 'Restaura HP al máximo · Solo activo si estás Agotado'
          }
          isAvailable={player.isExhausted}
          canAfford={player.gold >= POTION_COST}
          redeemTestId="potion-button"
          buttonVariant="red"
          onRedeem={handleRedeemPotion}
        />
      </ShopSection>

      {/* Mis premios */}
      <ShopSection title="Mis premios">
        {items.length === 0 && (
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center text-slate-300 text-sm">
            Pulsa + para añadir un premio
          </div>
        )}
        {items.map((item) => (
          <ShopItem
            key={item.id}
            name={item.name}
            cost={item.cost}
            emoji="🎁"
            emojiBg="bg-indigo-50"
            description="Premio personal · 1 uso"
            isAvailable={true}
            canAfford={player.gold >= item.cost}
            redeemTestId={`redeem-${item.id}`}
            onRedeem={() => handleRedeemReward(item.id, item.cost)}
          />
        ))}
      </ShopSection>

      {/* FAB */}
      <button
        data-testid="add-reward-fab"
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-indigo-500 text-white text-2xl flex items-center justify-center shadow-lg z-30"
        aria-label="Añadir premio"
      >
        +
      </button>

      {/* Bottom sheet */}
      <AnimatePresence>
        {sheetOpen && (
          <NewRewardSheet
            onClose={() => setSheetOpen(false)}
            onSave={handleSaveReward}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <ShopToast message={toast} onDismiss={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
