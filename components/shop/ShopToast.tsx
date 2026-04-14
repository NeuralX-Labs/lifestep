'use client'

import { useEffect } from 'react'

interface ShopToastProps {
  message: string
  onDismiss: () => void
}

export default function ShopToast({ message, onDismiss }: ShopToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      role="alert"
      className="fixed bottom-20 left-4 right-4 max-w-sm mx-auto bg-slate-900 text-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg z-50"
    >
      <span className="text-lg">🎉</span>
      <span className="text-sm font-medium">{message}</span>
    </div>
  )
}
