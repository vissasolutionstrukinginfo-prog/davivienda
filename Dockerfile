FROM node:18-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache postgresql-client git

# Crear directorio de la aplicación
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY drizzle.config.ts ./
COPY .env ./

# Instalar TODAS las dependencias (incluyendo devDependencies para el build)
RUN npm ci

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Limpiar dependencias de desarrollo después del build
RUN npm prune --production

# Exponer puerto
EXPOSE 5000

# Comando de inicio
CMD ["npm", "start"]