import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'www.global-thermonuclear-war.com', // Add your domain here
      'global-thermonuclear-war.com', // Add your domain here
      'localhost', // You can also keep localhost if needed
    ],
    proxy: {
      '^/api/.*': {
        target: 'http://localhost:5200',
        changeOrigin: true
      }
    }
  }
}) 