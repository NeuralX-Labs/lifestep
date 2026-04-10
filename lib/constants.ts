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
