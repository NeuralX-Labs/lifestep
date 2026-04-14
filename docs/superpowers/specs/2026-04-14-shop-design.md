# Tienda (Shop) — Spec de Diseño (Fase 6a)

## Objetivo

Implementar la pantalla de Tienda donde el jugador puede:
1. Canjear la **Poción de vida** (ítem de juego predefinido) para salir del estado Agotado
2. Crear **premios personales** (usuario-definidos, de un solo uso) y canjearlos gastando gold

---

## Contexto del proyecto

- Stack: Next.js App Router, React 19, TypeScript, Tailwind v4, Framer Motion v12, Zustand v5, Vitest
- El tipo `ShopItemData` ya existe en `store/types.ts`
- La acción `recoverWithGold()` ya existe en `hooks/useGameLogic.ts`
- La acción `spendGold()` ya existe en `store/usePlayerStore.ts`
- La clave `STORAGE_KEYS.SHOP = 'lifestep_shop'` ya existe en `lib/constants.ts`
- Patrón de testing: igual que Quests — mock de framer-motion, tests TDD en `tests/app/shop.test.tsx`

---

## Pantalla principal (`app/shop/page.tsx`)

### Header
- Título "Tienda" (h1, font-bold text-2xl)
- Badge con el gold actual del jugador (fondo amarillo, ★ + número)

### Sección "Ítems de juego"
- Título de sección en uppercase pequeño (mismo estilo que QuestSection)
- Un único ítem hardcodeado: **Poción de vida**
  - Emoji ❤️, nombre, descripción
  - **Estado normal** (jugador NO agotado): ítem con opacity-50, texto "No disponible", sin botón de compra
  - **Estado agotado** (jugador agotado): ítem con borde rojo, botón "50 ★" en rojo que llama a `recoverWithGold()`
  - Si `recoverWithGold()` devuelve `false` (gold insuficiente): no hacer nada, el botón ya está disabled

### Sección "Mis premios"
- Título de sección igual que el anterior
- Lista de `ShopItemData[]` del `useShopStore`
- Si la lista está vacía: placeholder dashed "Pulsa + para añadir un premio"
- Cada ítem muestra: nombre, "Premio personal · 1 uso", coste en gold
  - Si `player.gold >= item.cost`: botón índigo "X ★" activo
  - Si `player.gold < item.cost`: opacity-50, texto "Sin gold" en lugar del botón
- Al pulsar el botón: `spendGold(item.cost)` + `removeItem(item.id)` + mostrar toast

### FAB "+"
- Botón circular índigo fijo abajo a la derecha (mismo estilo que en Quests)
- Abre el `NewRewardSheet`

### Toast
- Aparece en `fixed bottom-20` durante 3 segundos y desaparece solo
- Mensaje: "¡Premio canjeado!" (premios personales) o "¡HP restaurado!" (Poción de vida)
- Sin botón Deshacer (la acción no es reversible)

---

## Componentes

### `components/shop/ShopItem.tsx`
Props:
```ts
{
  name: string
  cost: number
  emoji: string
  description: string
  canAfford: boolean      // player.gold >= cost
  isAvailable: boolean    // false → opacity-50, sin botón (para Poción de vida cuando no agotado)
  buttonLabel: string     // "X ★" o "No disponible"
  onRedeem: () => void
}
```
- Si `!isAvailable`: opacity-50, muestra texto estático "No disponible"
- Si `isAvailable && !canAfford`: opacity-50, muestra "Sin gold"
- Si `isAvailable && canAfford`: botón activo con `onRedeem`

### `components/shop/ShopSection.tsx`
Props:
```ts
{ title: string; children: React.ReactNode }
```
- Título uppercase + slot para contenido (no gestiona la lista, solo el layout)

### `components/shop/NewRewardSheet.tsx`
Props:
```ts
{ onClose: () => void; onSave: (name: string, cost: number) => void }
```
- `motion.div` con `initial={{ y: '100%' }}`, `animate={{ y: 0 }}`, `exit={{ y: '100%' }}`
- Backdrop: `<div data-testid="reward-sheet-backdrop" onClick={onClose} />`
- Campo de nombre (texto libre)
- Selector de coste: 4 opciones fijas — **10, 20, 50, 100** gold (pill seleccionable, default: 20)
- Botón "Guardar premio" deshabilitado si `name.trim() === ''`
- Al guardar: llama `onSave(name, cost)` y cierra

### `components/shop/ShopToast.tsx`
Props:
```ts
{ message: string; onDismiss: () => void }
```
- `role="alert"`, `fixed bottom-20 left-4 right-4 max-w-sm mx-auto`
- `useEffect` con `setTimeout(onDismiss, 3000)`
- Sin botón Deshacer

---

## Store: `store/useShopStore.ts`

```ts
interface ShopStore {
  items: ShopItemData[]
  addItem: (input: { name: string; cost: number }) => void
  removeItem: (id: string) => void
}
```

- `addItem` genera `id` con `crypto.randomUUID()`, `redeemedCount: 0`
- `removeItem` filtra por id
- Persistido en localStorage con clave `STORAGE_KEYS.SHOP`

---

## Tests (`tests/app/shop.test.tsx`)

15 tests TDD, escritos antes de implementar, siguiendo el mismo patrón que `tests/app/quests.test.tsx`:

| # | Descripción |
|---|-------------|
| 1 | Renderiza el título "Tienda" |
| 2 | Muestra el gold actual del jugador |
| 3 | Muestra la sección "Ítems de juego" |
| 4 | Poción de vida aparece deshabilitada cuando el jugador NO está agotado |
| 5 | Poción de vida aparece activa cuando el jugador ESTÁ agotado |
| 6 | Canjear Poción de vida llama a `recoverWithGold` (que internamente llama a `spendGold`) y muestra toast "¡HP restaurado!" |
| 7 | Muestra la sección "Mis premios" |
| 8 | Muestra placeholder cuando no hay premios personales |
| 9 | Muestra premios personales existentes con nombre y coste |
| 10 | Premio con gold insuficiente aparece deshabilitado |
| 11 | Botón "+" abre el NewRewardSheet |
| 12 | Cerrar sheet con backdrop cierra el sheet |
| 13 | Guardar un premio nuevo lo añade a la lista |
| 14 | Canjear un premio personal llama a `spendGold`, elimina el ítem y muestra toast "¡Premio canjeado!" |
| 15 | El toast desaparece tras 3 segundos |

---

## Mocks de tests

```ts
const mockRecoverWithGold = vi.fn(() => true)
vi.mock('framer-motion', () => ({
  motion: { div: ({ children, ...props }) => <div {...props}>{children}</div> },
  AnimatePresence: ({ children }) => <>{children}</>,
}))
vi.mock('@/hooks/useGameLogic', () => ({
  useGameLogic: () => ({ recoverWithGold: mockRecoverWithGold }),
}))
const { default: ShopPage } = await import('@/app/shop/page')
```

Helpers:
- `setGold(amount)` → `usePlayerStore.setState({ player: { ...basePlayer, gold: amount } })`
- `setExhausted(true/false)` → `usePlayerStore.setState({ player: { ...basePlayer, isExhausted: true } })`
- `addTestReward(overrides)` → `useShopStore.setState({ items: [reward] })`

---

## Flujo de datos

```
usePlayerStore → gold, isExhausted
useShopStore   → items[]
useGameLogic   → recoverWithGold()

ShopPage
  ├── ShopSection "Ítems de juego"
  │     └── ShopItem (Poción de vida — hardcoded)
  ├── ShopSection "Mis premios"
  │     ├── ShopItem[] (desde useShopStore)
  │     └── placeholder si vacío
  ├── FAB (+) → sheetOpen = true
  ├── AnimatePresence → NewRewardSheet (si sheetOpen)
  ├── AnimatePresence → ShopToast (si toast !== null)
  └── backdrop → sheetOpen = false
```

---

## Fuera de alcance (Fase 6a)

- Más ítems de juego (boost de EXP, etc.) — Fase futura
- Editar o reordenar premios personales
- Categorías o iconos personalizables por el usuario
- Historial de canjes
