// components/layout/BottomNav.tsx
// Barra de navegación inferior con 4 pestañas y efecto glassmorphism.
// Se oculta automáticamente en /onboarding (no tiene sentido navegar durante el setup).

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Sword, ShoppingBag, User } from 'lucide-react'

// Rutas donde NO debe aparecer el BottomNav
const HIDDEN_ON = ['/onboarding']

// Definición de las 4 pestañas de navegación
const NAV_ITEMS = [
  { href: '/dashboard', label: 'Inicio',   Icon: Home        },
  { href: '/quests',    label: 'Misiones', Icon: Sword       },
  { href: '/shop',      label: 'Tienda',   Icon: ShoppingBag },
  { href: '/profile',   label: 'Perfil',   Icon: User        },
] as const

export default function BottomNav() {
  // usePathname nos dice en qué ruta estamos para resaltar la pestaña activa
  const pathname = usePathname()

  // En /onboarding no mostramos la barra de navegación
  if (HIDDEN_ON.some(route => pathname.startsWith(route))) {
    return null
  }

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-50
        flex items-center justify-around
        h-16 px-2
        bg-white/85 backdrop-blur-md
        border-t border-black/[0.06]
        safe-bottom
      "
    >
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/')

        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors"
          >
            <Icon
              size={22}
              className={isActive ? 'text-indigo-500' : 'text-slate-400'}
              strokeWidth={isActive ? 2.5 : 1.8}
            />
            <span
              className={`text-[10px] font-medium ${
                isActive ? 'text-indigo-500' : 'text-slate-400'
              }`}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
