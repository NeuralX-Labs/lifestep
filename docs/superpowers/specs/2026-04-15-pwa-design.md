# LifeStep PWA — Diseño

**Fecha:** 2026-04-15  
**Estado:** Aprobado

## Objetivo

Convertir LifeStep en una Progressive Web App (PWA) instalable en iPhone que funcione también sin conexión a internet.

## Contexto

El proyecto ya tiene la base PWA parcialmente lista:
- `public/manifest.json` con nombre, iconos y `display: standalone`
- `public/icons/icon-192.png` y `icon-512.png`
- Meta tags de iOS en `app/layout.tsx` (`apple-mobile-web-app-capable`, `apple-touch-icon`)

Lo que falta: despliegue en URL pública HTTPS + Service Worker para caché offline.

## Parte 1 — Despliegue en Vercel

- Crear cuenta en vercel.com usando GitHub (gratis)
- Importar el repositorio LifeStep
- Vercel detecta Next.js automáticamente y despliega sin configuración adicional
- URL resultante: `lifestep-[usuario].vercel.app` (o dominio personalizado opcional)
- Cada `git push` a `master` despliega la nueva versión automáticamente

Sin cambios de código para este paso.

## Parte 2 — Service Worker manual

### Archivo nuevo: `public/sw.js`

Estrategia **Network First con fallback a caché**:
- Al instalar: guarda en caché los archivos del shell de la app (`/`, `/dashboard`, `/quests`, `/shop`, `/profile`, `/manifest.json`, iconos)
- Al activar: elimina cachés con versión antigua
- Al interceptar peticiones (`fetch`): intenta la red primero; si falla (sin internet), sirve desde caché

Versión de caché: constante `CACHE_NAME = 'lifestep-v1'`. Para invalidar la caché en futuras versiones se incrementa este número.

### Cambio en `app/layout.tsx`

Añadir un bloque `<script>` inline en `<body>` que registra el service worker:

```js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}
```

Solo ~4 líneas. No requiere paquetes adicionales.

## Parte 3 — Instalación en iPhone

Proceso manual (limitación de iOS — Apple no permite instalación automática):

1. Abrir Safari en iPhone y navegar a la URL de Vercel
2. Tocar el botón **Compartir** (ícono de cuadrado con flecha)
3. Seleccionar **"Añadir a pantalla de inicio"**
4. Confirmar con **Añadir**

La app aparece como ícono nativo. Al abrirla, funciona en pantalla completa sin la barra de Safari.

**Requisito:** Solo Safari en iOS soporta instalación de PWAs. Chrome/Firefox en iPhone no lo permiten.

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `public/sw.js` | Nuevo — Service Worker |
| `app/layout.tsx` | Añadir script de registro del SW |

## Archivos sin cambios

`public/manifest.json`, iconos, stores, componentes — todo lo demás queda igual.

## Verificación

1. Abrir DevTools en Chrome → Application → Service Workers → verificar que está registrado
2. DevTools → Application → Manifest → verificar que no hay errores
3. DevTools → Lighthouse → "Progressive Web App" → puntuación debe pasar los checks de instalabilidad
4. En iPhone Safari: debe aparecer la opción "Añadir a pantalla de inicio"
5. Abrir en modo avión después de instalar → debe cargar la app
