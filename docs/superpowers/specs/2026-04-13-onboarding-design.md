# Onboarding — Spec de diseño
**Fecha:** 2026-04-13
**Proyecto:** LifeStep (NeuralX Labs)
**Fase:** 4

---

## Objetivo

Crear el flujo de onboarding de 3 pantallas que recolecta el nombre del jugador y sus 2 pilares prioritarios, llama a `initPlayer()` del store y redirige al dashboard.

Sin onboarding funcional, el dashboard redirige a `/onboarding` indefinidamente porque `player === null`.

---

## Arquitectura

Un solo archivo: `app/onboarding/page.tsx` (`'use client'`).

Estado local con `useState`:
- `step: 1 | 2 | 3` — pantalla actual
- `name: string` — nombre del jugador
- `selectedStats: StatKey[]` — pilares seleccionados (máx. 2)

Al completar el paso 3 → llama `initPlayer(name, selectedStats)` → `router.push('/dashboard')`.

No se necesitan componentes hijos separados — todo cabe limpio en un solo archivo.

---

## Pantallas

### Pantalla 1 — Bienvenida (`step === 1`)

- Fondo: `bg-gradient-to-b from-white to-indigo-50` (igual que el placeholder actual)
- Logo emoji 🌱 (text-5xl)
- Título: **"LifeStep"** (text-2xl font-bold)
- Tagline: *"Convierte tu vida en una aventura"* (text-sm text-indigo-500 italic)
- Botón primario: **"Comenzar aventura →"** → avanza a step 2
- Indicador de progreso: 3 puntos (● ○ ○)

### Pantalla 2 — Nombre (`step === 2`)

- Mismo fondo
- Icono ⚔️ (text-4xl)
- Título: **"¿Cómo te llamas, aventurero?"**
- Input de texto:
  - `placeholder="Tu nombre..."`
  - `maxLength={20}`
  - Estilo: fondo blanco semitransparente, borde `border-indigo-200`, `rounded-xl`, texto centrado
  - Auto-focus al montar la pantalla
- Botón **"Siguiente →"**: desactivado (`opacity-50 cursor-not-allowed`) si `name.trim() === ''`
- Botón **"← Volver"** (text-sm text-slate-400) → vuelve a step 1
- Indicador de progreso: (○ ● ○)

### Pantalla 3 — Pilares (`step === 3`)

- Mismo fondo
- Título: **"Elige tus 2 pilares"**
- Subtítulo: *"Serán tu especialidad — ganarás más EXP en ellos"* (text-sm text-slate-500)
- Lista de 5 tarjetas (una por cada `StatKey` en orden: VIT, WIS, WIL, SOC, FOR)
  - Cada tarjeta muestra: emoji + nombre + descripción corta (de `STATS`)
  - Seleccionada: fondo `STATS[key].light`, borde del color del stat, tick ✓ a la derecha
  - No seleccionada: fondo blanco semitransparente, borde `border-slate-200`
  - Al pulsar una tarjeta:
    - Si ya está seleccionada → deseleccionar
    - Si hay menos de 2 seleccionadas → seleccionar
    - Si ya hay 2 seleccionadas → reemplazar la primera (la más antigua)
- Botón **"¡Comenzar!"**: desactivado si `selectedStats.length !== 2`
  - Al pulsar: llama `initPlayer(name.trim(), selectedStats)` → `router.push('/dashboard')`
- Botón **"← Volver"** → vuelve a step 2
- Indicador de progreso: (○ ○ ●)

---

## Indicador de progreso

Componente inline (no archivo separado): 3 puntos `w-2 h-2 rounded-full`.
- Punto activo: `bg-indigo-500`
- Punto inactivo: `bg-indigo-200`

---

## Transiciones

`motion.div` de Framer Motion con `initial={{ opacity: 0, y: 16 }}` / `animate={{ opacity: 1, y: 0 }}` en cada pantalla. Key = `step` para que Framer re-anime al cambiar.

---

## Dependencias usadas

| Import | Ya existe |
|--------|-----------|
| `usePlayerStore` → `initPlayer` | ✅ |
| `STATS`, `StatKey` de `@/lib/constants` | ✅ |
| `useRouter` de `next/navigation` | ✅ |
| `motion` de `framer-motion` | ✅ |

No se instala nada nuevo.

---

## Guardias

- Si el jugador ya existe (`player !== null`) al montar la página → redirigir a `/dashboard` inmediatamente (evita que alguien vuelva al onboarding después de crearse).
- `name.trim()` antes de llamar `initPlayer` (elimina espacios accidentales al inicio/fin).

---

## Lo que NO entra en esta fase

- Misiones de ejemplo precargadas (Fase 5+)
- Avatar o foto de perfil
- Animación de "nivel nuevo" al crear personaje
- Validación de nombre único o longitud mínima (solo vacío)
