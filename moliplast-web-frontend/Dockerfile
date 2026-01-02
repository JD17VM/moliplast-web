# Usamos Node 20 (Versión estable y moderna)
FROM node:20-alpine

# 1. Definir carpeta de trabajo
WORKDIR /app

# 2. Copiamos los archivos de dependencias primero (para aprovechar la caché de Docker)
COPY package*.json ./

# 3. Instalamos las dependencias
RUN npm install

# 4. Copiamos el resto del código
COPY . .

# 5. Comando para iniciar Vite
# OJO: Agregamos "--host" para que Vite acepte conexiones desde fuera del contenedor
CMD ["npm", "run", "dev", "--", "--host"]