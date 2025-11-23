import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // Simula el navegador
    setupFiles: ['./vitest.setup.ts'], // Para configuraciones extra
    globals: true,
  },
})