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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
