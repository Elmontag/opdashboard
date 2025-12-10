# OPDashboard – MVP

Eine stateless Single-Page-App zur Multiprojekt-Steuerung für OpenProject. Die MVP-Oberfläche bietet eine intuitive, niederschwellige Managementsicht mit Projektwahl, KPI-Kacheln, Meilensteinen und einem Work-Item-Tableau (Deadlines, Prioritäten, Zuständigkeiten).

## Features
- Multiprojekt-Kontext mit Checkbox-Auswahl und Statusfilter
- KPI-Kacheln über die gewählten Projekte (offene Items, kritische Prioritäten, Fälligkeiten < 30 Tage, Meilensteine)
- Karten je Projekt mit Objectives und Meilensteinen
- Tabelle mit Work Items inkl. Priorität, Fälligkeit und Owner
- Lokale Speicherung der OpenProject-URL und des API-Tokens (localStorage), serverseitig bleibt die App stateless
- Docker-Deployment via `docker-compose` und NGINX-Serve der gebauten SPA

## Lokale Entwicklung
```bash
npm install
npm run dev -- --host
```
Die App läuft anschließend auf http://localhost:5173.

## Produktion / Docker
1. Image bauen und starten:
   ```bash
   docker-compose up --build
   ```
2. Die SPA ist über http://localhost:5173 erreichbar.

## Projektstruktur
- `src/App.jsx` – Hauptansicht mit Projektwahl, KPIs, Karten und Tabelle
- `src/index.css` – Styles für die UI
- `Dockerfile` – Multi-Stage Build (Node → NGINX)
- `docker-compose.yml` – Startet das Frontend-Image auf Port 5173
