# Portainer Deployment

Dieser Stack wird aus dem Git-Repository durch Portainer aktualisiert. Die lokale `.env` wird nicht in Git versioniert und steht auf dem Raspberry Pi daher nicht automatisch zur Verfuegung.

## Stack-Variablen

In Portainer unter `Stacks -> <Stack> -> Environment variables` eintragen:

| Variable | Beispiel | Bedeutung |
| --- | --- | --- |
| `HOST_PORT` | `8089` | Port des Pi, unter dem die Anwendung erreichbar ist |
| `CONTAINER_PORT` | `80` | Interner Nginx-Port |
| `CONTAINER_NAME` | `crm` | Containername |
| `BACKEND_HOST` | `backend` | DNS-Name oder IP des Backends im Docker-Netzwerk |
| `BACKEND_PORT` | `3000` | Interner Port des Backends |
| `BACKEND_PATH` | leer | Optionaler URL-Pfad des Backends, z. B. `/api` |
| `BACKEND_URL` | leer | Optionaler vollständiger Override, z. B. `http://backend:3000/api` |
| `DOCKER_NETWORK` | `crm-network` | Bereits vorhandenes externes Docker-Netzwerk |
| `RESTART_POLICY` | `unless-stopped` | Neustartverhalten |

Die Variablennamen entsprechen `.env.example`. Portainer ersetzt sie beim Stack-Deployment in `docker-compose.yml`.

## Voraussetzungen auf dem Pi

Das externe Netzwerk muss vor dem ersten Stack-Deployment existieren und denselben Namen wie `DOCKER_NETWORK` haben:

```bash
docker network create crm-network
```

Wenn das Netzwerk bereits existiert, darf dieser Befehl nicht erneut ausgefuehrt werden.

Das Backend muss mit diesem Netzwerk verbunden sein und unter `BACKEND_HOST` und `BACKEND_PORT` erreichbar sein. Für einen Backend-Pfad kann `BACKEND_PATH` gesetzt werden. `BACKEND_URL` überschreibt diese drei Werte vollständig.

## Automatischer Redeploy

Im Portainer-Git-Stack den Webhook aktivieren und das erneute Bauen des Images aus dem Repository einschalten. Nach einem Push laedt Portainer den neuen Commit, baut das Frontend-Image aus dem `Dockerfile` und startet den Stack mit den in Portainer gespeicherten Variablen. Es ist kein Docker-Hub-Login und kein Registry-Image namens `crm:latest` erforderlich.

Die Stack-Variablen bleiben bei Git-Updates erhalten. Sie muessen nicht in das Repository committed werden.
