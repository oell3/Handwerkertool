# ---------- Stage 1: Build ----------
FROM node:20-alpine AS build

WORKDIR /app

# Nur die package-Dateien aus dem Angularfolder kopieren
COPY frontend/package*.json ./
RUN npm ci

# Restlichen Angular-Code kopieren und bauen
COPY frontend/ ./
RUN npm run build -- --configuration production

# ---------- Stage 2: Runtime (Nginx) ----------
FROM nginx:alpine

# Nginx-Template: Port und Backend-URL werden zur Laufzeit ersetzt.
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Gebaute Angular-App kopieren
# Pfad ggf. an deinen Projektnamen anpassen (dist/<projektname>/browser)
COPY --from=build /app/dist/*/browser /usr/share/nginx/html

ARG CONTAINER_PORT=80

# Standardwerte; docker-compose überschreibt sie über die .env-Werte.
ENV PORT=${CONTAINER_PORT}
ENV BACKEND_URL=http://backend:3000

EXPOSE ${CONTAINER_PORT}

CMD ["nginx", "-g", "daemon off;"]