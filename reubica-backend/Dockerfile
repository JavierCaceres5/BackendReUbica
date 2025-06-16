# Usa Node oficial
FROM node:18

# Crear directorio de trabajo
WORKDIR /usr/src/app

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto
EXPOSE 8080

# Comando para correr la app
CMD [ "npm", "start" ]
