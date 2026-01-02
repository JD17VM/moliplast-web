import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl() // 2. Añade el plugin
  ],
  server: {
    host: true, // Esto ya lo sueles tener para Docker
    port: 5173, 
    watch: {
      usePolling: true, // <--- ESTA ES LA CLAVE
    },
  },
})
