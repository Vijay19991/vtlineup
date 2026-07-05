import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/vtlineup/',          // GitHub Pages serves from /username/repo-name/
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})
