FROM node:18-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache postgresql-client git python3 make g++

# Crear directorio de la aplicación
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY drizzle.config.ts ./
COPY start-prod.cjs ./

# Instalar TODAS las dependencias (incluyendo devDependencies para el build y migraciones)
RUN npm ci

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# NO limpiar devDependencies - necesitamos drizzle-kit para las migraciones en runtime
# RUN npm prune --production

# Exponer puerto
EXPOSE 5000

# Comando de inicio - ejecuta migraciones y luego la app
CMD ["node", "start-prod.cjs"]