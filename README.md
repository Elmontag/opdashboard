# OpenProject Dashboard

Webbasiertes Dashboard für OpenProject, entwickelt mit React, Vite, TailwindCSS und einem Node.js-Backend als API-Proxy.

## Funktionsumfang (MVP)
- Projekte via OpenProject-API laden und auswählen
- Aggregierte Kennzahlen über Meilensteine, Deliverables und Ziele
- Projektansicht zur Pflege von Deadlines, Prioritäten und Zuständigkeiten
- Angebotsmanagement für Angebots-Tickets inkl. Budget und Dokumenten
- Mock-Datenmodus für lokale Entwicklung ohne echte OpenProject-Instanz

## Struktur
```
frontend/   # React + Vite + TailwindCSS
server/     # Express-Backend als OpenProject-Proxy
```

## Lokale Entwicklung
1. `.env`-Dateien aus den Beispielen kopieren:
   ```bash
   cp server/.env.example server/.env
   cp frontend/.env.example frontend/.env
   ```
2. Optional: In `server/.env` OpenProject-URL und Token hinterlegen. Ohne Token greift der Mock-Modus.
3. Docker Compose starten:
   ```bash
   docker compose up --build
   ```
4. Frontend ist anschließend unter [http://localhost:5173](http://localhost:5173) erreichbar, Backend unter [http://localhost:8080](http://localhost:8080).

Persistente Volumes halten `node_modules` und die Mock-Daten (`server_data`) zwischen Containern fest.

## Tests
- Frontend: `npm test` im Ordner `frontend` (Vitest)
- Backend: `npm test` im Ordner `server` (Jest)

## Deployment-Hinweis
Für produktive Umgebungen sollten eigene Build-Pipelines erstellt werden (z. B. Vite `npm run build` + statischer Hoster, Backend mit `npm run build` + `node dist/index.js`). Die Docker-Setups sind auf schnelle Entwicklung ausgelegt.
