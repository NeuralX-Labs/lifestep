// tests/setup.ts
// Configuración global ejecutada antes de cada archivo de test.
// Limpia localStorage entre tests para evitar interferencias.

import '@testing-library/jest-dom'
import { beforeEach, afterEach } from 'vitest'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  localStorage.clear()
})
