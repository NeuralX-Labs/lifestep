# LifeStep — Documento de Especificación
**Fecha:** 2026-04-10  
**Proyecto:** LifeStep PWA  
**Empresa:** NeuralX Labs (neuralxlabs@gmail.com)  
**Estado:** Aprobado por el usuario

---

## 1. Visión del Producto

LifeStep transforma la vida del usuario en un sistema de alto rendimiento biopsicosocial. No es un juego de fantasía, es una interfaz de gestión personal gamificada con estética iOS de alta gama. El diseño es invisible, ultra-limpio y profesional.

**Principios de diseño:**
- Fondo blanco puro `#FFFFFF`, tipografía system-ui / SF Pro
- Sombras sutiles: `box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1)`
- Glassmorphism en la navegación: `backdrop-filter: blur(12px)`
- Bordes redondeados: `rounded-3xl` / `rounded-2xl` en todos los contenedores
- Micro-interacciones con Framer Motion en cada acción

---

## 2. Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14+ con App Router |
| Estilos | Tailwind CSS |
| Animaciones | Framer Motion |
| Iconos | Lucide Icons |
| Estado global | Zustand |
| Persistencia inicial | localStorage mediante Custom Hook |
| Persistencia futura | Supabase (migración sin cambiar el resto del código) |
| Target | PWA en móvil (iPhone / Android vía navegador) |

**Entorno detectado:** Node.js v22.19.0 · npm v10.9.3 · create-next-app v16.2.3

---

## 3. Arquitectura de Carpetas (Atomic Design)

```
lifestep/
├── app/
│   ├── layout.tsx                # Base: fondo, fuente, PWA meta tags
│   ├── page.tsx                  # Redirige a /dashboard o /onboarding
│   ├── onboarding/page.tsx       # Flujo inicial (3 pasos)
│   ├── dashboard/page.tsx        # Pantalla principal
│   ├── quests/page.tsx           # Lista de misiones
│   ├── shop/page.tsx             # Tienda de recompensas
│   └── profile/page.tsx          # Perfil y estadísticas
├── components/
│   ├── ui/                       # Botones, Cards, ProgressBars, Badges base
│   ├── dashboard/                # Emblema con anillos, tarjetas de Stats
│   ├── quests/                   # Lista de misiones, modal de creación
│   ├── shop/                     # Tarjetas de recompensa, lógica de canje
│   └── layout/                   # BottomNav, SafeArea para móvil
├── store/
│   ├── usePlayerStore.ts         # HP, EXP, Gold, Nivel, Stats por categoría
│   └── useQuestStore.ts          # Misiones, rachas, dailies
├── hooks/
│   ├── useLocalStorage.ts        # Guardar/cargar datos del navegador automáticamente
│   └── useGameLogic.ts           # Fórmulas de nivel, EXP, penalizaciones
└── lib/
    └── constants.ts              # Colores de Stats, multiplicadores, configuración
```

**Justificación:** Cada capa tiene responsabilidad única. Migrar a Supabase en el futuro solo requiere tocar `hooks/useLocalStorage.ts`.

---

## 4. Sistema de Juego (Game Engine)

### 4.1. Los 5 Pilares (Stats)

| Stat | Nombre | Color Tailwind | Hex |
|---|---|---|---|
| VIT | Vitalidad | emerald | `#10b981` |
| WIS | Sabiduría | blue | `#3b82f6` |
| WIL | Voluntad | violet | `#8b5cf6` |
| SOC | Vínculo | rose | `#f43f5e` |
| FOR | Fortuna | amber | `#f59e0b` |

### 4.2. Fórmulas del Juego

```
EXP para subir de nivel = Nivel actual × 100
  Ejemplo: en nivel 3 se necesitan 300 EXP para pasar al nivel 4

Racha activa (3+ días consecutivos) → multiplicador ×1.2 en todas las recompensas

Estado Agotado (HP = 0) → multiplicador ×0.5 durante 24 horas

Penalización diaria → -10 HP por cada misión marcada como "Obligatoria" no completada
```

### 4.3. Dificultades de Misiones

| Dificultad | EXP base | Gold base |
|---|---|---|
| Fácil | 10 | 5 |
| Media | 25 | 15 |
| Difícil | 50 | 30 |
| Épica | 150 | 100 |

*Las recompensas se multiplican por el factor de racha o debuff activo.*

### 4.4. El Emblema Central

- Círculo con 5 anillos concéntricos (estilo Apple Activity Rings)
- Cada anillo corresponde a un Stat, con su color específico
- El progreso del anillo = `(stat.level % 10) / 10` — es decir, muestra el avance dentro del tramo de 10 niveles actuales (0% al inicio de cada tramo, 100% al llegar al siguiente múltiplo de 10)
- Icono central evoluciona según el nivel global:
  - Nivel 1–10: 🌱 Semilla / Brote
  - Nivel 11–20: 🧭 Brújula
  - Nivel 21+: ⭐ Fénix / Estrella

### 4.5. Estado Agotado

Cuando HP llega a 0 el usuario entra en estado "AGOTADO":
- Los anillos del Emblema se vacían y se muestran en rojo
- Multiplicador de recompensas: ×0.5 durante 24 horas
- Se muestra un aviso prominente en el Dashboard
- Para recuperarse: completar una "Misión de Recuperación" especial O pagar 50 Gold

---

## 5. Modelo de Datos (localStorage)

### Clave `lifestep_player`

```json
{
  "name": "Jorge",
  "createdAt": "2026-04-10",
  "level": 3,
  "exp": 240,
  "expToNextLevel": 300,
  "hp": 78,
  "gold": 340,
  "isExhausted": false,
  "exhaustedUntil": null,
  "stats": {
    "VIT": { "level": 12, "exp": 0 },
    "WIS": { "level": 8,  "exp": 0 },
    "WIL": { "level": 6,  "exp": 0 },
    "SOC": { "level": 10, "exp": 0 },
    "FOR": { "level": 5,  "exp": 0 }
  },
  "priorityStats": ["VIT", "WIS"],
  "streak": {
    "current": 3,
    "lastCompletedDate": "2026-04-09"
  }
}
```

### Clave `lifestep_quests`

```json
[
  {
    "id": "uuid-generado",
    "name": "Correr 30 min",
    "stat": "VIT",
    "difficulty": "easy",
    "isDaily": true,
    "isMandatory": true,
    "completedToday": false,
    "completedDates": ["2026-04-08", "2026-04-09"]
    // Nota: se guardan solo los últimos 30 días para no saturar localStorage
  }
]
```

### Clave `lifestep_shop`

```json
[
  {
    "id": "uuid-generado",
    "name": "Cena pizza",
    "cost": 100,
    "redeemedCount": 2
  }
]
```

---

## 6. Diseño de Pantallas

### Decisiones aprobadas por el usuario

| Elemento | Decisión |
|---|---|
| Layout del Dashboard | Opción B — Compacto: emblema pequeño izquierda, HP siempre visible, stats en fila |
| Estilo tarjetas de misión | Opción A — Minimalista iOS: fondo gris suave, check circular, badge de categoría |
| Estilo del Emblema | Opción A — 5 anillos concéntricos (estilo Apple Activity Rings) |
| Onboarding | Opción B — 3 pasos: nombre → elección de pilares → bienvenida |

### Flujo de pantallas

1. **Onboarding** (solo la primera vez):
   - Paso 1: Introduce tu nombre
   - Paso 2: Elige 2 pilares prioritarios (los 5 disponibles)
   - Paso 3: Pantalla de bienvenida → entra al Dashboard

2. **Dashboard** (`/dashboard`): Emblema + nombre + EXP bar + gold badge · Barra de HP · Grid de 5 Stats · Lista de misiones del día (3 visibles + "Ver todas")

3. **Misiones** (`/quests`): Tabs Diarias / Épicas / Hechas · Tarjetas minimalistas con check, nombre, badge de categoría, dificultad, EXP y Gold · Botón FAB (+) para crear nueva · Modal bottom-sheet para crear misión (nombre, categoría, dificultad, checkbox diaria/obligatoria)

4. **Tienda** (`/shop`): Balance de Gold en header · Lista de premios personalizados · Botón de canje amber (activo) o gris (sin Gold suficiente) · FAB (+) para añadir nuevo premio

5. **Perfil** (`/profile`): Nombre, nivel, historial de rachas, estadísticas de misiones completadas *(Fase posterior)*

### Bottom Navigation

Cuatro pestañas: 🏠 Inicio · ⚔️ Misiones · 🛍️ Tienda · 👤 Perfil  
Con `backdrop-filter: blur(12px)` y borde superior sutil.

---

## 7. Configuración de Tailwind (colores personalizados)

```js
// tailwind.config.js — extensiones necesarias
theme: {
  extend: {
    colors: {
      vit:  { DEFAULT: '#10b981', light: '#dcfce7', dark: '#065f46' },
      wis:  { DEFAULT: '#3b82f6', light: '#dbeafe', dark: '#1e3a8a' },
      wil:  { DEFAULT: '#8b5cf6', light: '#ede9fe', dark: '#4c1d95' },
      soc:  { DEFAULT: '#f43f5e', light: '#fff1f2', dark: '#881337' },
      gold: { DEFAULT: '#f59e0b', light: '#fef3c7', dark: '#78350f' },
    },
    boxShadow: {
      ios:    '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      'ios-lg': '0 20px 60px rgba(0,0,0,0.12)',
    }
  }
}
```

---

## 8. Configuración PWA

- `manifest.json`: nombre "LifeStep", `display: standalone`, `theme_color: #6366f1`
- Meta tags iOS en `app/layout.tsx`: `apple-mobile-web-app-capable`, `apple-touch-icon`
- Service Worker básico para instalación offline (Fase 6)

---

## 9. Roadmap de Desarrollo (6 Fases)

| Fase | Contenido | Prerequisito |
|---|---|---|
| 1 | Entorno + Tailwind config + Layout PWA base + Bottom Nav | — |
| 2 | Esquema JSON + Zustand stores + Hook useLocalStorage + useGameLogic | Fase 1 ✓ |
| 3 | Dashboard + Emblema con anillos SVG + Stats + Framer Motion | Fase 2 ✓ |
| 4 | Gestor de Misiones: lista, tabs, modal de creación, lógica de check | Fase 3 ✓ |
| 5 | Tienda de Recompensas: lista, creación de premios, lógica de canje | Fase 4 ✓ |
| 6 | PWA completa: Manifest, Service Worker, Social Card compartible | Fase 5 ✓ |

**Regla de ejecución:** No se pasa a la siguiente fase sin terminar y verificar la anterior.

---

## 10. Reglas de Seguridad y Calidad

- Contraseñas con bcrypt (no aplica en Fase 1–5, relevante al integrar Supabase auth)
- Claves de API siempre en `.env` con valor `TU_CLAVE_AQUI`
- `.env` siempre en `.gitignore`
- Código limpio con nombres descriptivos en español/inglés consistente
- Comentarios solo en lógica de negocio compleja (fórmulas de nivel, penalizaciones)
