# LifeStep — Dashboard Fase 3: Diseño

**Fecha:** 2026-04-12
**Proyecto:** LifeStep (NeuralX Labs)

---

## Objetivo

Reemplazar el placeholder de `/dashboard` con la pantalla principal del juego: un anillo SVG animado con el nivel y los stats del jugador, barras de HP y EXP, y un resumen de las misiones del día.

---

## Arquitectura

La página orquesta tres componentes visuales. Los datos fluyen desde los stores de Zustand hacia abajo vía props (excepto `QuestSummary`, que lee el store directamente).

```
usePlayerStore → page.tsx → PlayerRing (nivel, stats)
                          → StatsPanel (hp, exp, gold, streak, isExhausted)
useQuestStore  → QuestSummary (quests del día)
```

**Directiva `'use client'`:** Requerida en la página y todos los componentes del dashboard (usan hooks de Zustand y Framer Motion).

**Redirección:** Si `usePlayerStore().player === null`, la página hace `router.push('/onboarding')` inmediatamente. El usuario nunca ve el dashboard vacío.

---

## Archivos

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `components/dashboard/PlayerRing.tsx` | Crear | SVG con 5 arcos animados, uno por stat |
| `components/dashboard/StatsPanel.tsx` | Crear | Barras HP/EXP + fila Gold/racha + chips de stats |
| `components/dashboard/QuestSummary.tsx` | Crear | Lista de misiones de hoy (solo lectura) |
| `app/dashboard/page.tsx` | Modificar | Orquesta los 3 componentes, redirige si no hay jugador |

---

## Componente: `PlayerRing`

### Props

```typescript
interface PlayerRingProps {
  level: number
  stats: Record<StatKey, StatLevel>
  size?: number  // por defecto 200
}
```

### Diseño visual

- Un `<svg>` con 5 `<circle>` superpuestos, cada uno con `stroke-dasharray` para dibujar un arco.
- El círculo completo se divide en **5 sectores de 72°** con un hueco de 4° entre cada uno (68° relleno + 4° hueco).
- La circunferencia del círculo base: `2 * Math.PI * r` donde `r` es el radio.
- Cada arco muestra el progreso de `stat.exp / expForNextLevel(stat.level)` dentro de su sector de 68°.
- Orden de stats en el anillo (desde las 12h, sentido horario): VIT, WIS, WIL, SOC, FOR.
- Colores: VIT `#10b981`, WIS `#3b82f6`, WIL `#8b5cf6`, SOC `#f43f5e`, FOR `#f59e0b`.
- Fondo de cada arco (la parte no rellena): versión `light` del color del stat.
- En el centro: texto "NIVEL" (10px, gris) y el número de nivel (32px, bold, negro).

### Animación (Framer Motion)

Al montar, cada arco se anima desde `strokeDasharray: "0 circumference"` hasta su valor real. Duración 0.8s, easing `easeOut`. Los 5 arcos arrancan simultáneamente.

---

## Componente: `StatsPanel`

### Props

```typescript
interface StatsPanelProps {
  hp: number
  exp: number
  expToNextLevel: number
  gold: number
  streak: PlayerStreak
  stats: Record<StatKey, StatLevel>
  isExhausted: boolean
  exhaustedUntil: string | null
}
```

### Secciones (de arriba a abajo)

**1. Barra de HP**
- Label: `❤️ HP` + valor `80 / 100` alineados en los extremos.
- Barra: fondo `#fff1f2`, relleno con gradiente `#f43f5e → #fb7185`.
- Si `isExhausted === true`: relleno naranja (`#f97316`), y debajo de la barra aparece el texto "Agotado — recuperación con 50 Gold" en naranja pequeño.
- Animación: la barra crece de 0% al valor real al montar (Framer Motion, 0.6s, easeOut).

**2. Barra de EXP**
- Label: `⚡ EXP` + valor `350 / 700`.
- Barra: fondo `#e0e7ff`, relleno con gradiente `#6366f1 → #818cf8`.
- Animación: igual que HP, 0.6s, easeOut.

**3. Fila Gold + Racha**
- Dos elementos en los extremos: `★ {gold} Gold` (ámbar) y `🔥 Racha {streak.current}d` (naranja).
- Sin animación.
- Si `streak.current === 0`: no se muestra la racha.

**4. Chips de stats**
- Una fila de 5 chips (o 3+2 si no caben): `{emoji} {key} Lv{level}`.
- Fondo y color de texto según el `light`/`dark` de cada stat (de `lib/constants.ts`).
- Sin animación.

---

## Componente: `QuestSummary`

### Datos

Lee `useQuestStore().quests` directamente. Muestra las misiones del día actual.

**Filtro:** Misiones donde `isDaily === true` O `completedToday === true`.
**Orden:** Obligatorias (`isMandatory === true`) primero, luego opcionales.
**Límite:** Máximo 5 misiones visibles. Si hay más, enlace "Ver todas →" a `/quests`.

### Diseño visual

- Título: `"Hoy"` + contador `"(2/5 completadas)"` en gris a la derecha.
- Cada fila de misión:
  - Círculo check: verde relleno si `completedToday`, borde gris si no.
  - Nombre de la misión.
  - Chip pequeño con el stat (`VIT`, `WIS`, etc.) en su color.
  - Si `isMandatory`: punto rojo pequeño a la izquierda del nombre.
- Estado vacío: `"Sin misiones — ve a Misiones para añadir"` en gris centrado.

### Animación (Framer Motion)

Las filas entran con `staggerChildren`: cada fila aparece con `opacity: 0 → 1` y `y: 8 → 0`, con 0.05s de retraso entre cada una.

---

## Página: `app/dashboard/page.tsx`

```
'use client'

Redirección → si player === null, router.push('/onboarding')

Layout (de arriba a abajo, centrado, padding horizontal 24px):
  ┌─────────────────────────────────┐
  │  "Hola, {player.name}" (h1)     │  ← fadeInDown al montar
  │                                 │
  │       [ PlayerRing ]            │  ← centrado
  │                                 │
  │       [ StatsPanel ]            │
  │                                 │
  │       [ QuestSummary ]          │
  └─────────────────────────────────┘
```

El saludo usa `motion.h1` de Framer Motion con `initial: {opacity:0, y:-12}` → `animate: {opacity:1, y:0}`.

---

## Testing

Los stores (`usePlayerStore`, `useQuestStore`) y la lógica del juego (`useGameLogic`) ya tienen 27 tests en Fase 2.

Los componentes del dashboard son puramente presentacionales (reciben props y renderizan SVG/HTML). No se escriben tests unitarios para ellos en esta fase — la validación es visual.

**Excepción:** `QuestSummary` accede directamente al store. Si en una fase futura se añaden tests de integración, este componente es el candidato principal.

---

## Decisiones descartadas

- **Todo en un archivo:** Descartado porque el SVG del anillo tiene lógica compleja de cálculo (`stroke-dasharray`) que conviene aislar.
- **Completar misiones desde el dashboard:** Descartado (YAGNI). La acción de completar vive en `/quests`. El dashboard es solo lectura.
- **Chips de stats clickeables:** Descartado. En esta fase son decorativos.
