// hooks/useLocalStorage.ts
// Adaptador de almacenamiento para los stores de Zustand.
//
// ¿Cómo funciona? Zustand necesita un objeto con 3 métodos (getItem, setItem,
// removeItem) para saber dónde guardar y cargar datos. Este archivo provee
// esos métodos usando localStorage del navegador.
//
// ¿Por qué este archivo separado? Para migrar a Supabase en el futuro:
// solo cambia este archivo. El resto del código (stores, componentes) no toca.

export const storageAdapter = {
  // Lee un valor guardado (devuelve null si no existe)
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null  // evita errores en SSR
    return window.localStorage.getItem(name)
  },

  // Guarda un valor (Zustand lo serializa a JSON antes de llamar esta función)
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(name, value)
  },

  // Elimina un valor guardado
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(name)
  },
}
