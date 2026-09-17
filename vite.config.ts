import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Served from https://yilmazderin.github.io/hostit/ on GitHub Pages
  base: '/hostit/',
  plugins: [react(), tailwindcss()],
})
