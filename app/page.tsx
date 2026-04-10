// app/page.tsx
// Punto de entrada de la app.
// Si el usuario ya completó el onboarding → va al Dashboard.
// Si es la primera vez → va al Onboarding.

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { STORAGE_KEYS } from '@/lib/constants'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    // Intentamos leer el perfil guardado en localStorage
    const savedPlayer = localStorage.getItem(STORAGE_KEYS.PLAYER)

    if (savedPlayer) {
      // Ya existe perfil → ir al Dashboard
      router.replace('/dashboard')
    } else {
      // Primera vez → ir al Onboarding
      router.replace('/onboarding')
    }
  }, [router])

  // Mientras redirige, mostramos un fondo blanco limpio
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
