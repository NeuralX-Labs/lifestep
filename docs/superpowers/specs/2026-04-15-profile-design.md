# Perfil — Diseño

**Fecha:** 2026-04-15  
**Estado:** Aprobado

## Objetivo

Reemplazar el placeholder de `/profile` con una página de perfil real que muestre los stats del jugador en detalle y permita compartir una Social Card.

## Layout elegido: Opción B

Header compacto + métricas + barras de progreso + botón Social Card.

## Secciones de la página (de arriba a abajo)

### 1. ProfileHeader
- Avatar: círculo con degradado morado (#6366f1 → #8b5cf6) con la inicial del nombre en blanco
- Nombre del jugador (en negrita)
- Nivel y racha actual ("Nivel 12 · ⚡ 7 días de racha")
- Icono ⚙️ en la esquina superior derecha — enlace a `/settings` (página futura, por ahora solo navega allí)

### 2. MetricsRow
Tres tarjetas pequeñas en fila horizontal:
- **Racha** (⚡): `player.streak.current` días
- **Gold** (🏅): `player.gold` acumulado
- **Días jugando** (📅): días desde `player.createdAt` hasta hoy

### 3. StatsProgress
Los 5 pilares (VIT, WIS, WIL, SOC, FOR) como filas:
- Emoji del stat
- Nombre completo del stat
- Barra de progreso con el color del stat (`STATS[key].color`)
- Ancho de la barra: `(stat.exp / (stat.level * 100)) * 100%` — porcentaje de EXP dentro del nivel actual
- Nivel actual en negrita a la derecha ("Nv. 8")

### 4. Botón Social Card
- Texto: "🃏 Ver Social Card"
- Abre `SocialCardModal`

## SocialCardModal

Modal que sube desde abajo con animación (Framer Motion `y: '100%' → y: 0`).  
Fondo semitransparente oscuro detrás. Se cierra tocando el fondo o el drag handle.

### Contenido de la tarjeta (estilo game card oscura)
- Fondo: degradado `#1e1b4b → #312e81 → #4c1d95` con patrón de textura sutil
- **Top:** nombre del jugador a la izquierda · badge "Nv. X" a la derecha
- **Subtítulo:** "LifeStep Player" en pequeño
- **Stats:** fila de 5 tarjetitas con emoji y número de nivel (`stat.level`)
- **Footer:** racha a la izquierda · "LIFESTEP" a la derecha en mayúsculas

### Botón compartir
Usa la Web Share API nativa (`navigator.share`). Texto generado:

```
Soy [nombre], nivel [N] en LifeStep
⚡ Racha de [X] días
💪[VIT] 📚[WIS] 🎯[WIL] ❤️[SOC] ★[FOR]
lifestep.vercel.app
```

Si el navegador no soporta `navigator.share` (desktop), el botón muestra "Copiar texto" y usa `navigator.clipboard.writeText`.

## Arquitectura

### Archivos nuevos

| Archivo | Responsabilidad |
|---|---|
| `components/profile/ProfileHeader.tsx` | Avatar, nombre, nivel, racha, botón ⚙️ |
| `components/profile/MetricsRow.tsx` | 3 tarjetas métricas (racha, gold, días) |
| `components/profile/StatsProgress.tsx` | 5 pilares con barras de progreso |
| `components/profile/SocialCardModal.tsx` | Modal con tarjeta oscura + Web Share API |

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `app/profile/page.tsx` | Reemplazar placeholder por página real con `usePlayerStore` |

### Archivos sin cambios

Stores, constantes, tipos, otros componentes — todo queda igual.

## Datos utilizados

Todo desde `usePlayerStore`:

| Dato | Campo |
|---|---|
| Nombre | `player.name` |
| Nivel | `player.level` |
| Gold | `player.gold` |
| Racha | `player.streak.current` |
| Stats | `player.stats[key].level` y `.exp` |
| Fecha inicio | `player.createdAt` |

## Testing

Archivo: `tests/app/profile.test.tsx`

Patrón igual que `tests/app/shop.test.tsx`:
1. Mock de `framer-motion`
2. Mock de `@/hooks/useGameLogic` (aunque perfil no lo usa, el mock evita errores de imports)
3. Import de la página con `await import('@/app/profile/page')`
4. Estado inyectado con `usePlayerStore.setState(...)`

Tests mínimos:
- Renderiza nombre del jugador
- Renderiza nivel
- Renderiza los 5 stats
- El botón "Ver Social Card" abre el modal (aparece el contenido de la tarjeta)
- El botón ⚙️ está presente
