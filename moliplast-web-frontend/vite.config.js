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
    host: true, // Esto hace que el servidor escuche en todas las interfaces de red disponibles
    port: 5173, // Puedes especificar un puerto diferente si el 5173 ya está en uso
  },
})
