# LifeStep — Fase 1: Entorno, Tailwind y Layout Base

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crear el proyecto Next.js con toda la configuración base: Tailwind con los colores del juego, Bottom Navigation con blur, layouts PWA, y una estructura de carpetas lista para construir encima.

**Architecture:** Next.js 14 App Router con TypeScript. La navegación es un componente `BottomNav` con glassmorphism. Cada ruta (`/dashboard`, `/quests`, `/shop`, `/profile`) tiene su página placeholder. La lógica de redirección en `app/page.tsx` detecta si es la primera vez del usuario (sin datos en localStorage) y manda al onboarding o al dashboard.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS v3, Lucide React

---

## Mapa de archivos (Fase 1)

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `package.json` | Crear (via CLI) | Dependencias del proyecto |
| `tailwind.config.ts` | Modificar | Colores VIT/WIS/WIL/SOC/FOR + sombras iOS |
| `app/globals.css` | Modificar | Reset base + fuente system-ui |
| `app/layout.tsx` | Modificar | HTML base, meta tags PWA, fuente, fondo blanco |
| `app/page.tsx` | Crear | Redirige a /onboarding (primera vez) o /dashboard |
| `app/onboarding/page.tsx` | Crear | Placeholder — "Onboarding próximamente" |
| `app/dashboard/page.tsx` | Crear | Placeholder — "Dashboard próximamente" |
| `app/quests/page.tsx` | Crear | Placeholder — "Misiones próximamente" |
| `app/shop/page.tsx` | Crear | Placeholder — "Tienda próximamente" |
| `app/profile/page.tsx` | Crear | Placeholder — "Perfil próximamente" |
| `components/layout/BottomNav.tsx` | Crear | Barra de navegación inferior con 4 pestañas + blur |
| `lib/constants.ts` | Crear | Colores, nombres y configuración de los 5 pilares |

---

## Tarea 1: Crear el proyecto Next.js

**Archivos:** genera todo el scaffolding inicial

- [ ] **Paso 1.1: Crear el proyecto en el directorio existente**

Abre una terminal en `b:\Proyectos IA\LifeStep` y ejecuta:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```

Cuando pregunte "Would you like to use Turbopack?" → responde **No**.  
Cuando avise que el directorio no está vacío → responde **Yes** (continuar de todas formas).

Resultado esperado: carpetas `app/`, `public/`, archivos `package.json`, `tsconfig.json`, `tailwind.config.ts` creados.

- [ ] **Paso 1.2: Instalar dependencias adicionales**

```bash
npm install zustand framer-motion lucide-react
```

Resultado esperado: las 3 librerías aparecen en `package.json` bajo `dependencies`.

- [ ] **Paso 1.3: Verificar que el proyecto arranca**

```bash
npm run dev
```

Abre `http://localhost:3000` — debe aparecer la página de bienvenida de Next.js (la default). Detén el servidor con `Ctrl+C`.

- [ ] **Paso 1.4: Commit inicial**

```bash
git init
git add .
git commit -m "feat: scaffolding inicial de LifeStep con Next.js 14"
```

---

## Tarea 2: Configurar Tailwind con los colores de LifeStep

**Archivos:**
- Modificar: `tailwind.config.ts`
- Modificar: `app/globals.css`

- [ ] **Paso 2.1: Reemplazar tailwind.config.ts con los colores del juego**

Reemplaza el contenido de `tailwind.config.ts` con:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Los 5 pilares de LifeStep
        vit: {
          DEFAULT: '#10b981', // Esmeralda — Vitalidad
          light:   '#dcfce7',
          dark:    '#065f46',
        },
        wis: {
          DEFAULT: '#3b82f6', // Azul — Sabiduría
          light:   '#dbeafe',
          dark:    '#1e3a8a',
        },
        wil: {
          DEFAULT: '#8b5cf6', // Violeta — Voluntad
          light:   '#ede9fe',
          dark:    '#4c1d95',
        },
        soc: {
          DEFAULT: '#f43f5e', // Coral — Vínculo
          light:   '#fff1f2',
          dark:    '#881337',
        },
        gold: {
          DEFAULT: '#f59e0b', // Ámbar — Fortuna / Moneda
          light:   '#fef3c7',
          dark:    '#78350f',
        },
      },
      boxShadow: {
        // Sombras estilo iOS
        'ios':    '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'ios-lg': '0 20px 60px rgba(0, 0, 0, 0.12)',
        'ios-xl': '0 25px 80px rgba(0, 0, 0, 0.15)',
      },
      fontFamily: {
        // Tipografía del sistema (SF Pro en iOS, Segoe en Windows)
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"',
               '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Paso 2.2: Actualizar globals.css con el reset base de LifeStep**

Reemplaza el contenido de `app/globals.css` con:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Reset base para aspecto iOS */
* {
  -webkit-tap-highlight-color: transparent; /* Quita el flash azul en móvil al tocar */
  -webkit-font-smoothing: antialiased;       /* Texto más suave en macOS/iOS */
}

html, body {
  background-color: #ffffff;
  overscroll-behavior: none; /* Evita el rebote al hacer scroll en móvil */
}

/* Safe area para iPhone con notch */
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

- [ ] **Paso 2.3: Verificar que Tailwind compila con los nuevos colores**

```bash
npm run build
```

Resultado esperado: compilación exitosa sin errores. Si hay error de TypeScript, revisar sintaxis en `tailwind.config.ts`.

- [ ] **Paso 2.4: Commit**

```bash
git add tailwind.config.ts app/globals.css
git commit -m "feat: configurar Tailwind con colores y sombras de LifeStep"
```

---

## Tarea 3: Crear constants.ts con la configuración del juego

**Archivos:**
- Crear: `lib/constants.ts`

- [ ] **Paso 3.1: Crear el directorio lib y el archivo constants.ts**

```bash
mkdir -p lib
```

Crea `lib/constants.ts` con el siguiente contenido:

```typescript
// lib/constants.ts
// Configuración central del juego — todos los valores en un solo lugar

// Los 5 pilares: abreviatura, nombre completo, color y emoji
export const STATS = {
  VIT: {
    key:    'VIT',
    name:   'Vitalidad',
    color:  '#10b981',
    light:  '#dcfce7',
    emoji:  '💪',
    description: 'Actividad física, deporte, sueño, hidratación',
  },
  WIS: {
    key:    'WIS',
    name:   'Sabiduría',
    color:  '#3b82f6',
    light:  '#dbeafe',
    emoji:  '📚',
    description: 'Lectura, cursos, deep work, aprendizaje',
  },
  WIL: {
    key:    'WIL',
    name:   'Voluntad',
    color:  '#8b5cf6',
    light:  '#ede9fe',
    emoji:  '🎯',
    description: 'Disciplina, hábitos, madrugar, control de impulsos',
  },
  SOC: {
    key:    'SOC',
    name:   'Vínculo',
    color:  '#f43f5e',
    light:  '#fff1f2',
    emoji:  '❤️',
    description: 'Relaciones, familia, meditación, salud mental',
  },
  FOR: {
    key:    'FOR',
    name:   'Fortuna',
    color:  '#f59e0b',
    light:  '#fef3c7',
    emoji:  '★',
    description: 'Ahorro, inversión, registro financiero',
  },
} as const

// Tipo derivado automáticamente de las claves de STATS
export type StatKey = keyof typeof STATS

// Dificultades de misiones con sus recompensas base
export const DIFFICULTIES = {
  easy: {
    label: 'Fácil',
    exp:   10,
    gold:  5,
  },
  medium: {
    label: 'Media',
    exp:   25,
    gold:  15,
  },
  hard: {
    label: 'Difícil',
    exp:   50,
    gold:  30,
  },
  epic: {
    label: 'Épica',
    exp:   150,
    gold:  100,
  },
} as const

export type DifficultyKey = keyof typeof DIFFICULTIES

// Reglas del juego
export const GAME_RULES = {
  MAX_HP:                100,   // HP máximo del jugador
  HP_PENALTY_PER_MISS:   10,    // HP que se pierde por misión obligatoria no completada
  STREAK_MIN_DAYS:       3,     // Días consecutivos para activar multiplicador de racha
  STREAK_MULTIPLIER:     1.2,   // Multiplicador de recompensas con racha activa
  EXHAUSTED_MULTIPLIER:  0.5,   // Multiplicador de recompensas en estado Agotado
  EXHAUSTED_DURATION_H:  24,    // Horas que dura el estado Agotado
  RECOVERY_GOLD_COST:    50,    // Gold necesario para restaurar HP pagando
  MAX_COMPLETED_DATES:   30,    // Máximo de fechas guardadas por misión (evitar saturar localStorage)
} as const

// Fórmula de EXP para subir de nivel
// Ejemplo: para pasar del nivel 3 al 4 necesitas 3 × 100 = 300 EXP
export function expForNextLevel(currentLevel: number): number {
  return currentLevel * 100
}

// Claves de localStorage
export const STORAGE_KEYS = {
  PLAYER: 'lifestep_player',
  QUESTS: 'lifestep_quests',
  SHOP:   'lifestep_shop',
} as const
```

- [ ] **Paso 3.2: Verificar que TypeScript no da errores**

```bash
npx tsc --noEmit
```

Resultado esperado: sin output (= sin errores). Si hay error, revisar la sintaxis de `as const`.

- [ ] **Paso 3.3: Commit**

```bash
git add lib/constants.ts
git commit -m "feat: constantes del juego (stats, dificultades, reglas)"
```

---

## Tarea 4: Crear el componente BottomNav

**Archivos:**
- Crear: `components/layout/BottomNav.tsx`

- [ ] **Paso 4.1: Crear los directorios de componentes**

```bash
mkdir -p components/layout components/ui components/dashboard components/quests components/shop
```

- [ ] **Paso 4.2: Crear BottomNav.tsx**

Crea `components/layout/BottomNav.tsx`:

```typescript
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
```

- [ ] **Paso 4.3: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Resultado esperado: sin errores.

- [ ] **Paso 4.4: Commit**

```bash
git add components/
git commit -m "feat: componente BottomNav con glassmorphism y rutas activas"
```

---

## Tarea 5: Actualizar layout.tsx con base PWA

**Archivos:**
- Modificar: `app/layout.tsx`

- [ ] **Paso 5.1: Reemplazar app/layout.tsx**

```typescript
// app/layout.tsx
// Layout raíz: aplica a todas las páginas.
// Configura fuente, fondo blanco, meta tags PWA y el BottomNav.

import type { Metadata, Viewport } from 'next'
import './globals.css'
import BottomNav from '@/components/layout/BottomNav'

export const metadata: Metadata = {
  title: 'LifeStep',
  description: 'Gamifica tu vida. Sube de nivel cada día.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LifeStep',
  },
}

export const viewport: Viewport = {
  themeColor: '#6366f1',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        {/* Meta tags adicionales para instalación en iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="bg-white font-sans antialiased">
        {/* Contenedor principal: deja espacio abajo para el BottomNav (h-16 = 64px) */}
        <main className="min-h-screen pb-16">
          {children}
        </main>

        {/* BottomNav se muestra en todas las páginas excepto onboarding */}
        <BottomNav />
      </body>
    </html>
  )
}
```

- [ ] **Paso 5.2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Resultado esperado: sin errores.

- [ ] **Paso 5.3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: layout raíz con meta tags PWA y BottomNav integrado"
```

---

## Tarea 6: Crear páginas placeholder y lógica de redirección

**Archivos:**
- Modificar: `app/page.tsx`
- Crear: `app/onboarding/page.tsx`
- Crear: `app/dashboard/page.tsx`
- Crear: `app/quests/page.tsx`
- Crear: `app/shop/page.tsx`
- Crear: `app/profile/page.tsx`

- [ ] **Paso 6.1: Crear app/page.tsx — lógica de redirección**

Esta página es la raíz (`/`). Detecta si el usuario ya tiene datos guardados para mandarlo al lugar correcto.

```typescript
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
```

- [ ] **Paso 6.2: Crear app/onboarding/page.tsx**

```typescript
// app/onboarding/page.tsx
// Placeholder para la Fase 3 (Onboarding de 3 pasos).

export default function OnboardingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-indigo-50 px-6">
      <div className="text-4xl mb-4">🌱</div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">LifeStep</h1>
      <p className="text-slate-500 text-sm text-center">
        Onboarding — Fase 3
      </p>
    </div>
  )
}
```

- [ ] **Paso 6.3: Crear app/dashboard/page.tsx**

```typescript
// app/dashboard/page.tsx
// Placeholder para la Fase 3 (Dashboard con Emblema y Stats).

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="text-4xl mb-4">🏠</div>
      <h1 className="text-xl font-bold text-slate-900 mb-2">Dashboard</h1>
      <p className="text-slate-400 text-sm">Fase 3 — Próximamente</p>
    </div>
  )
}
```

- [ ] **Paso 6.4: Crear app/quests/page.tsx**

```typescript
// app/quests/page.tsx
// Placeholder para la Fase 4 (Gestor de Misiones).

export default function QuestsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="text-4xl mb-4">⚔️</div>
      <h1 className="text-xl font-bold text-slate-900 mb-2">Misiones</h1>
      <p className="text-slate-400 text-sm">Fase 4 — Próximamente</p>
    </div>
  )
}
```

- [ ] **Paso 6.5: Crear app/shop/page.tsx**

```typescript
// app/shop/page.tsx
// Placeholder para la Fase 5 (Tienda de Recompensas).

export default function ShopPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="text-4xl mb-4">🛍️</div>
      <h1 className="text-xl font-bold text-slate-900 mb-2">Tienda</h1>
      <p className="text-slate-400 text-sm">Fase 5 — Próximamente</p>
    </div>
  )
}
```

- [ ] **Paso 6.6: Crear app/profile/page.tsx**

```typescript
// app/profile/page.tsx
// Placeholder para la Fase 6 (Perfil y Social Card).

export default function ProfilePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="text-4xl mb-4">👤</div>
      <h1 className="text-xl font-bold text-slate-900 mb-2">Perfil</h1>
      <p className="text-slate-400 text-sm">Fase 6 — Próximamente</p>
    </div>
  )
}
```

- [ ] **Paso 6.7: Crear directorios de rutas**

```bash
mkdir -p app/onboarding app/dashboard app/quests app/shop app/profile
```

- [ ] **Paso 6.8: Commit**

```bash
git add app/
git commit -m "feat: páginas placeholder y lógica de redirección en raíz"
```

---

## Tarea 7: Crear manifest.json básico para PWA

**Archivos:**
- Crear: `public/manifest.json`
- Crear: `public/icons/` (iconos placeholder)

- [ ] **Paso 7.1: Crear public/manifest.json**

```json
{
  "name": "LifeStep",
  "short_name": "LifeStep",
  "description": "Gamifica tu vida. Sube de nivel cada día.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#6366f1",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

- [ ] **Paso 7.2: Crear icono placeholder**

Por ahora usamos un icono temporal. Crea el directorio:

```bash
mkdir -p public/icons
```

Descarga o copia cualquier imagen PNG de 192×192 px en `public/icons/icon-192.png` y otra de 512×512 en `public/icons/icon-512.png`. Puedes usar los iconos por defecto de Next.js (renómbralos) o cualquier imagen cuadrada. Los iconos reales se harán en la Fase 6.

- [ ] **Paso 7.3: Commit**

```bash
git add public/
git commit -m "feat: manifest.json PWA con iconos placeholder"
```

---

## Tarea 8: Verificación final de la Fase 1

- [ ] **Paso 8.1: Build de producción limpio**

```bash
npm run build
```

Resultado esperado: compilación exitosa. Líneas como:
```
✓ Compiled successfully
✓ Linting and checking validity of types
Route (app)
├ ○ /
├ ○ /dashboard
├ ○ /onboarding
├ ○ /profile
├ ○ /quests
└ ○ /shop
```

Si hay errores de TypeScript, corrígelos antes de continuar.

- [ ] **Paso 8.2: Prueba en navegador de escritorio**

```bash
npm run dev
```

Abre `http://localhost:3000` y verifica:

1. Redirige automáticamente a `/onboarding` (primera vez, sin datos)
2. El BottomNav aparece en la parte inferior con 4 iconos
3. Las pestañas llevan a `/dashboard`, `/quests`, `/shop`, `/profile`
4. La pestaña activa se resalta en morado (`text-indigo-500`)
5. Fondo blanco, sin bordes toscos

- [ ] **Paso 8.3: Prueba en móvil (opcional pero recomendado)**

Con el servidor corriendo, abre `http://[tu-ip-local]:3000` en el móvil.  
Para saber tu IP local: `ipconfig` (Windows) → busca "Dirección IPv4".

Verifica:
- El BottomNav queda pegado al fondo y no tapa contenido
- Los iconos son tocables sin ser demasiado pequeños

- [ ] **Paso 8.4: Commit final de Fase 1**

```bash
git add .
git commit -m "feat: Fase 1 completa — entorno, Tailwind, layout y BottomNav listos"
```

---

## Resumen de la Fase 1

Al terminar esta fase tienes:

- ✅ Proyecto Next.js 14 con TypeScript funcionando
- ✅ Tailwind configurado con los 5 colores del juego (VIT, WIS, WIL, SOC, FOR)
- ✅ Bottom Navigation con glassmorphism y pestaña activa resaltada
- ✅ Redirección automática a onboarding o dashboard según localStorage
- ✅ Estructura de carpetas lista para las siguientes fases
- ✅ `lib/constants.ts` con toda la configuración del juego centralizada
- ✅ Manifest PWA básico para instalación en móvil

**Siguiente paso:** Fase 2 — Zustand stores + hooks de lógica del juego + modelo de datos completo.
