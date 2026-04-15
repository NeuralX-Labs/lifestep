# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Servidor de desarrollo → http://localhost:3000
npm run build        # Compilar para producción
npm run lint         # ESLint
npm test             # Vitest (todos los tests, una sola vez)
npm run test:watch   # Vitest en modo watch

# Ejecutar un archivo de tests concreto:
npx vitest run tests/app/shop.test.tsx
npx vitest run tests/store/usePlayerStore.test.ts
```

## Architecture

**LifeStep** es una PWA gamificada de productividad. El usuario completa misiones diarias para ganar EXP y Gold, sube de nivel, y gestiona su HP. Stack: Next.js 16 App Router, React 19, TypeScript 5, Tailwind v4, Framer Motion v12, Zustand v5.

### Flujo de la app

```
app/page.tsx  →  localStorage tiene STORAGE_KEYS.PLAYER?
                    Sí → /dashboard
                    No → /onboarding
```

Las rutas disponibles son `/dashboard`, `/onboarding`, `/quests`, `/shop`, `/profile`. El `BottomNav` se renderiza en todas las páginas desde `app/layout.tsx`.

### Estado global (Zustand v5)

Todos los stores están en `store/` y persisten en localStorage vía `storageAdapter` de `hooks/useLocalStorage.ts`.

| Store | Clave localStorage | Contenido |
|---|---|---|
| `usePlayerStore` | `lifestep_player` | PlayerData: nivel, EXP, HP, gold, stats, racha |
| `useQuestStore` | `lifestep_quests` | QuestData[]: misiones diarias y épicas |
| `useShopStore` | `lifestep_shop` | ShopItemData[]: premios personales de un solo uso |

El patrón Zustand es siempre: `create<Interface>()(persist(..., { name: STORAGE_KEYS.X, storage: createJSONStorage(() => storageAdapter) }))`.

### Lógica de negocio

`hooks/useGameLogic.ts` orquesta los dos stores principales. Expone:
- `completeQuest(id)` — entrega EXP/Gold/StatEXP con multiplicadores de racha/agotamiento
- `applyDailyPenalties()` — descuenta HP por misiones obligatorias no completadas
- `recoverWithGold()` — gasta `GAME_RULES.RECOVERY_GOLD_COST` (50) gold para salir del estado Agotado

Todas las constantes del juego (HP máximo, coste de recuperación, multiplicadores, etc.) están en `lib/constants.ts` bajo `GAME_RULES`. Usar siempre esas constantes, nunca valores hardcodeados.

### Tipos centrales

`store/types.ts` define `PlayerData`, `QuestData` y `ShopItemData`. Los tipos `StatKey` y `DifficultyKey` se derivan automáticamente de los objetos `STATS` y `DIFFICULTIES` en `lib/constants.ts`.

### Componentes

Los componentes se organizan por página en `components/<página>/`. El componente `components/layout/BottomNav.tsx` es el único compartido entre páginas.

## Testing

- Framework: Vitest + @testing-library/react, entorno jsdom
- `tests/setup.ts` limpia localStorage antes y después de cada test
- El alias `@/` apunta a la raíz del proyecto (configurado en `vitest.config.ts`)

**Patrón de tests de páginas** (ver `tests/app/quests.test.tsx` o `tests/app/shop.test.tsx`):
1. Mockear `framer-motion` (motion.div → div, AnimatePresence → fragment)
2. Mockear `@/hooks/useGameLogic` con `vi.fn()`
3. Importar la página con `await import('@/app/X/page')` **después** de los mocks
4. Manipular estado con `usePlayerStore.setState(...)` / `useQuestStore.setState(...)` directamente
5. Usar `data-testid` para interacciones (`fireEvent.click`, `fireEvent.change`)

**Patrón de tests de stores** (ver `tests/store/usePlayerStore.test.ts`): llamar directamente a las acciones del store y verificar el estado resultante.

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
