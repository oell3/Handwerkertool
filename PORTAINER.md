# Portainer Deployment

Dieser Stack wird aus dem Git-Repository durch Portainer aktualisiert. Die lokale `.env` wird nicht in Git versioniert und steht auf dem Raspberry Pi daher nicht automatisch zur Verfuegung.

## Stack-Variablen

In Portainer unter `Stacks -> <Stack> -> Environment variables` eintragen:

| Variable | Beispiel | Bedeutung |
| --- | --- | --- |
| `HOST_PORT` | `8089` | Port des Pi, unter dem die Anwendung erreichbar ist |
| `CONTAINER_PORT` | `80` | Interner Nginx-Port |
| `CONTAINER_NAME` | `crm` | Containername |
| `IMAGE_NAME` | `crm` | Image-Name |
| `IMAGE_TAG` | `latest` | Image-Tag |
| `BACKEND_URL` | `http://backend:3000` | Backend-Adresse aus dem Docker-Netzwerk |
| `DOCKER_NETWORK` | `crm-network` | Bereits vorhandenes externes Docker-Netzwerk |
| `RESTART_POLICY` | `unless-stopped` | Neustartverhalten |

Die Variablennamen entsprechen `.env.example`. Portainer ersetzt sie beim Stack-Deployment in `docker-compose.yml`.

## Voraussetzungen auf dem Pi

Das externe Netzwerk muss vor dem ersten Stack-Deployment existieren und denselben Namen wie `DOCKER_NETWORK` haben:

```bash
docker network create crm-network
```

Wenn das Netzwerk bereits existiert, darf dieser Befehl nicht erneut ausgefuehrt werden.

Das Backend muss mit diesem Netzwerk verbunden sein und unter `BACKEND_URL` erreichbar sein.

## Automatischer Redeploy

Im Portainer-Git-Stack den Webhook aktivieren und als Update-Verhalten das erneute Bauen des Images aus dem Repository verwenden. Nach einem Push laedt Portainer den neuen Commit, baut das Frontend-Image neu und startet den Stack mit den in Portainer gespeicherten Variablen.

Die Stack-Variablen bleiben bei Git-Updates erhalten. Sie muessen nicht in das Repository committed werden.
