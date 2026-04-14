// app/quests/page.tsx
'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useQuestStore } from '@/store/useQuestStore'
import { useGameLogic } from '@/hooks/useGameLogic'
import QuestSection from '@/components/quests/QuestSection'
import NewQuestSheet from '@/components/quests/NewQuestSheet'
import QuestToast from '@/components/quests/QuestToast'
import DeleteQuestModal from '@/components/quests/DeleteQuestModal'

export default function QuestsPage() {
  const quests          = useQuestStore((s) => s.quests)
  const markUncompleted = useQuestStore((s) => s.markUncompleted)
  const removeQuest     = useQuestStore((s) => s.removeQuest)
  const { completeQuest } = useGameLogic()

  const [sheetOpen, setSheetOpen]   = useState(false)
  const [toast, setToast]           = useState<{ id: string; name: string } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const dailyQuests = quests.filter((q) => q.isDaily)
  const epicQuests  = quests.filter((q) => !q.isDaily)

  const handleComplete = (id: string) => {
    const quest = quests.find((q) => q.id === id)
    if (!quest) return
    completeQuest(id)
    setToast({ id, name: quest.name })
  }

  const handleUndo = () => {
    if (toast) markUncompleted(toast.id)
    setToast(null)
  }

  const handleDelete = (id: string) => {
    const quest = quests.find((q) => q.id === id)
    if (!quest) return
    setDeleteTarget({ id, name: quest.name })
  }

  const handleConfirmDelete = () => {
    if (deleteTarget) removeQuest(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <div className="flex flex-col px-4 pt-8 pb-24 gap-6 max-w-sm mx-auto bg-linear-to-b from-white to-indigo-50 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-900">⚔️ Misiones</h1>

      {!deleteTarget && (
        <>
          <QuestSection
            title="Diarias"
            quests={dailyQuests}
            onComplete={handleComplete}
            onDelete={handleDelete}
          />

          <QuestSection
            title="Épicas"
            quests={epicQuests}
            onComplete={handleComplete}
            onDelete={handleDelete}
          />
        </>
      )}

      {/* FAB */}
      <button
        onClick={() => setSheetOpen(true)}
        aria-label="Nueva misión"
        className="fixed bottom-20 right-4 w-12 h-12 bg-indigo-500 text-white rounded-full text-2xl shadow-lg shadow-indigo-200 flex items-center justify-center z-30"
      >
        +
      </button>

      {/* Bottom sheet */}
      <AnimatePresence>
        {sheetOpen && <NewQuestSheet onClose={() => setSheetOpen(false)} />}
      </AnimatePresence>

      {/* Toast */}
      {toast && (
        <QuestToast
          name={toast.name}
          onUndo={handleUndo}
          onDismiss={() => setToast(null)}
        />
      )}

      {/* Modal de borrado */}
      {deleteTarget && (
        <DeleteQuestModal
          questName={deleteTarget.name}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
