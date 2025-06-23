# Utilise une image Node officielle
FROM node:18-alpine

# Crée le dossier de l'app
WORKDIR /usr/src/app

# Copie les fichiers package.json et package-lock.json
COPY package*.json ./

# Installe les dépendances
RUN npm ci --only=production

# Copie le reste du code
COPY . .

# Expose le port (à adapter si besoin)
EXPOSE 3001

# Commande de lancement
CMD ["node", "server.js"] 