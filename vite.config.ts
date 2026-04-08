import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
     proxy: {
      "/api": {
        target: "https://api-kedokteran-test.ubg.ac.id",
        changeOrigin: true,
        secure: false,
      },
      "/sanctum": {
        target: "https://api-kedokteran-test.ubg.ac.id",
        changeOrigin: true,
        secure: false,
      },
    },
  }
})
