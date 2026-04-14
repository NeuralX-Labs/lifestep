'use client'

import { useEffect } from 'react'

interface Props {
  name: string
  onUndo: () => void
  onDismiss: () => void
}

export default function QuestToast({ name, onUndo, onDismiss }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      role="alert"
      className="fixed bottom-20 left-4 right-4 max-w-sm mx-auto bg-slate-800 text-white rounded-xl px-4 py-3 flex items-center justify-between z-50 shadow-lg"
    >
      <span className="text-sm">✓ Misión completada</span>
      <button
        onClick={onUndo}
        className="text-sm font-semibold text-indigo-300 ml-4"
      >
        Deshacer
      </button>
    </div>
  )
}
