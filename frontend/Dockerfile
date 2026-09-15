# ---------- Stage 1: Build ----------
FROM node:20-alpine AS build

WORKDIR /app

# Nur die package-Dateien aus dem Angularfolder kopieren
COPY Angularfolder/package*.json ./
RUN npm ci

# Restlichen Angular-Code kopieren und bauen
COPY Angularfolder/ ./
RUN npm run build -- --configuration production

# ---------- Stage 2: Runtime (Nginx) ----------
FROM nginx:alpine

# Nginx-Template (Port + Backend-URL werden zur Laufzeit ersetzt)
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Gebaute Angular-App kopieren
# Pfad ggf. an deinen Projektnamen anpassen (dist/<projektname>/browser)
COPY --from=build /app/dist/*/browser /usr/share/nginx/html

# Standardwerte (können per ENV überschrieben werden)
ENV PORT=80
ENV BACKEND_URL=http://backend:3000

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]