# Spec: Página de Misiones (Quests)

**Fecha:** 2026-04-14
**Proyecto:** LifeStep — NeuralX Labs
**Fase:** 5

---

## Resumen

Página completa de gestión de misiones en `app/quests/page.tsx`. Permite ver todas las misiones organizadas en dos secciones (Diarias / Épicas), marcarlas como completadas o borrarlas con gestos de swipe, y crear nuevas misiones desde un bottom sheet.

---

## Decisiones de diseño

| Decisión | Elección |
|---|---|
| Añadir misión | FAB `+` flotante → bottom sheet desde abajo |
| Completar misión | Swipe derecha → completar (toast deshacer 3s) |
| Borrar misión | Swipe izquierda → modal de confirmación |
| Organización de la lista | Dos secciones: Diarias arriba, Épicas abajo |
| Campos del formulario | Nombre, stat, tipo, dificultad, obligatoria |
| Librería de animaciones | Framer Motion (ya instalada) |

---

## Layout y estructura visual

- Fondo `bg-linear-to-b from-white to-indigo-50`, igual que onboarding
- `max-w-sm mx-auto px-4 pt-8 pb-24`, mismo ancho que dashboard
- Título `⚔️ Misiones` (h1, `text-2xl font-bold text-slate-900`)
- Dos secciones siempre visibles, sin tabs ni filtros
- Si una sección está vacía: mensaje sutil en slate-400

```
⚔️ Misiones

DIARIAS  (2/3)
  ○ ● Leer 30 min       [WIS]    ← ● = punto rojo obligatoria
  ✓   Ir al gimnasio    [VIT]

ÉPICAS
  ○   Aprender React    [WIS]

                              [+]  ← FAB, bottom-20 right-4
```

---

## Componente QuestItem

Cada misión es una tarjeta swipeable con Framer Motion `drag="x"`.

**Contenido visible:**
- Círculo check (emerald si completada, borde slate si no)
- Punto rojo `bg-rose-500` si `isMandatory === true`
- Nombre de la misión (`text-sm text-slate-700`, tachado si completada)
- Chip de stat con colores de `STATS` de `lib/constants`
- Estrella `★` si es de **tipo épico** (`isDaily === false`) — distinto de la *dificultad* "Épica"

**Swipe derecha → completar:**
- Umbral: 40% del ancho de la tarjeta
- Al soltar sobre el umbral: llama `onComplete(id)`
- La tarjeta desaparece con `animate={{ x: '100%', opacity: 0 }}`
- Aparece toast: *"✓ Misión completada · Deshacer"* durante 3s
- "Deshacer" llama `useQuestStore.markUncompleted(id)` y restaura la tarjeta

**Swipe izquierda → borrar:**
- Umbral: 40% del ancho de la tarjeta
- Al soltar sobre el umbral: abre `DeleteQuestModal`
- Si confirma: llama `onDelete(id)`, la tarjeta desaparece con animación
- Si cancela: la tarjeta vuelve a su posición con `animate={{ x: 0 }}`

**Indicadores visuales durante el swipe:**
- Fondo verde suave visible detrás de la tarjeta al deslizar derecha
- Fondo rojo suave visible detrás de la tarjeta al deslizar izquierda

---

## Componente NewQuestSheet (bottom sheet)

Se muestra con `AnimatePresence`. Animación: `initial={{ y: '100%' }}` → `animate={{ y: 0 }}`.

**Estructura:**
- Handle (pill gris, `w-9 h-1 bg-slate-200`)
- Título "Nueva misión" (`text-base font-bold text-slate-900`)
- Input nombre: `placeholder="¿Qué quieres lograr?"`, `maxLength={40}`, `autoFocus`
- Selector de stat: 5 chips (VIT/WIS/WIL/SOC/FOR) con colores de `STATS`
- Toggle tipo: [Diaria] / [Épica] — dos botones con estado activo indigo
- Selector de dificultad: 4 chips (Fácil/Media/Difícil/Épica)
- Checkbox "Obligatoria" con label
- Botón "Crear misión" (indigo, `disabled` hasta que haya nombre)

**Al crear:**
1. Llama `useQuestStore.addQuest({ name, stat, difficulty, isDaily, isMandatory })`
2. Cierra el sheet con animación de salida
3. La misión aparece en la sección correspondiente

**Backdrop:** `div` semitransparente detrás del sheet; pulsar cierra el panel.

---

## QuestToast

- Posición: fijo en la parte inferior, por encima del BottomNav (`bottom-20`)
- Mensaje: *"✓ Misión completada · Deshacer"*
- Duración: 3 segundos, luego desaparece con fade
- Solo uno activo a la vez (el nuevo reemplaza al anterior)
- "Deshacer" llama `useQuestStore.markUncompleted(id)` y cierra el toast

---

## DeleteQuestModal

- Modal centrado con backdrop oscuro
- Texto: *"¿Borrar esta misión?"* + nombre de la misión en negrita
- Dos botones: Cancelar (slate) / Borrar (rose)
- Al confirmar: `useQuestStore.removeQuest(id)` + animación de salida de la tarjeta

---

## Arquitectura de archivos

```
app/quests/page.tsx                ← reemplaza placeholder actual
components/quests/
  QuestItem.tsx                    ← tarjeta individual swipeable
  QuestSection.tsx                 ← cabecera de sección + lista de items
  NewQuestSheet.tsx                ← bottom sheet con formulario
  QuestToast.tsx                   ← toast "completada · deshacer"
  DeleteQuestModal.tsx             ← modal confirmación de borrado
tests/app/quests.test.tsx          ← tests de la página completa
```

---

## Flujo de datos

```
page.tsx
  ├── useQuestStore (quests, addQuest, removeQuest, markUncompleted)
  ├── useGameLogic (completeQuest → da EXP + Gold + StatExp + streak)
  ├── QuestSection (diarias) → QuestItem[] → onComplete / onDelete
  ├── QuestSection (épicas)  → QuestItem[] → onComplete / onDelete
  ├── NewQuestSheet (estado local del form) → addQuest al confirmar
  ├── QuestToast (aparece tras completar)
  └── DeleteQuestModal (aparece tras swipe izquierda)
```

`onComplete(id)` en `page.tsx` llama `useGameLogic.completeQuest(id)`, que internamente llama `markCompleted`, `gainExp`, `gainGold`, `gainStatExp` y `updateStreak`.

---

## Tests (`tests/app/quests.test.tsx`)

Escenarios cubiertos:

1. Renderiza la sección "Diarias" con misiones del store
2. Renderiza la sección "Épicas" con misiones del store
3. Muestra mensaje vacío si no hay misiones en una sección
4. El punto rojo aparece en misiones obligatorias
5. La estrella aparece en misiones épicas
6. Simular swipe derecha completa la misión y muestra toast
7. El toast "Deshacer" revierte la misión a no completada
8. Simular swipe izquierda abre el modal de confirmación
9. Confirmar borrado elimina la misión de la lista
10. Cancelar borrado no elimina la misión
11. Pulsar FAB abre el bottom sheet
12. Crear misión con campos válidos llama addQuest y cierra el sheet
13. Botón "Crear misión" desactivado si el nombre está vacío
14. Pulsar backdrop cierra el bottom sheet sin crear misión
15. Misión completada aparece tachada con check verde
