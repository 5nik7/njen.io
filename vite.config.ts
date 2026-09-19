import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // njen.io serves this application from the domain root.
  base: '/',
  build: { outDir: 'dist' },
})
