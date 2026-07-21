import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base matches the GitHub Pages project path: https://<user>.github.io/times-tables/
export default defineConfig({
  plugins: [react()],
  base: '/times-tables/',
})
