'use client'

interface Props {
  questName: string
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteQuestModal({ questName, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
      <div className="bg-white rounded-2xl p-6 w-full max-w-xs">
        <h2 className="text-base font-bold text-slate-900 mb-1">¿Borrar esta misión?</h2>
        <p className="text-sm text-slate-500 mb-6">
          <strong className="text-slate-700">{questName}</strong>
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold"
          >
            Borrar
          </button>
        </div>
      </div>
    </div>
  )
}
