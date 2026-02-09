# Étape de build
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration=production

# Étape de production
FROM nginx:alpine

# Copiez les fichiers buildés
COPY --from=build /app/dist/bff-angular /usr/share/nginx/html

# Copiez le script d'entrée depuis le contexte de build
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Exposez le port 80
EXPOSE 80

# Utilisez le script d'entrée
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
