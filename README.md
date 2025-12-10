# OPDashboard – MVP

Eine stateless Single-Page-App zur Multiprojekt-Steuerung für OpenProject. Die MVP-Oberfläche bietet eine intuitive, niederschwellige Managementsicht mit Projektwahl, KPI-Kacheln, Meilensteinen und einem Work-Item-Tableau (Deadlines, Prioritäten, Zuständigkeiten).

## Features
- Multiprojekt-Kontext mit Checkbox-Auswahl und Statusfilter
- KPI-Kacheln über die gewählten Projekte (offene Items, kritische Prioritäten, Fälligkeiten < 30 Tage, Meilensteine)
- Karten je Projekt mit Beschreibung und automatisch geladenen Milestones (OpenProject Versions)
- Tabelle mit echten Work Packages inkl. Priorität, Fälligkeit und Owner
- OpenProject-URL und API-Token werden lokal gespeichert, serverseitig bleibt die App stateless
- Verbindungstest-Button prüft den API-Zugriff, Export-Button liefert die aktuelle Sicht als JSON
- Docker-Deployment via `docker-compose` und NGINX-Serve der gebauten SPA

## OpenProject anbinden
1. OpenProject-Basis-URL (ohne `/api/v3`, z. B. `https://example.domain`) und persönlichen API-Token in der Kopfzeile
   eintragen.
2. Mit **„Verbindung testen“** die API-Reichbarkeit prüfen.
3. **„Projekte laden“** ruft die aktiven Projekte aus OpenProject ab und füllt die Projektliste.
4. Über die Checkboxen Projekte auswählen; **„Work Items laden“** holt die zugehörigen Work Packages (max. 50 Einträge).
5. Der **Export-Button** erzeugt eine JSON-Datei aus der aktuellen Projekt- und Work-Item-Sicht.

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
