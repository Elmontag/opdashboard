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

## Troubleshooting: CORS beim Aufruf der OpenProject-API
Wenn im Browser ein Fehler wie

> `... has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present ...`

auftaucht, kommt die Blockade nicht aus dem OPDashboard, sondern von der OpenProject-Instanz (oder einem vorgeschalteten
Reverse Proxy). Das Frontend ruft die API direkt aus dem Browser auf; ohne freigegebenes `Access-Control-Allow-Origin` lässt
der Browser die Antwort nicht zu.

Mögliche Lösungen:
- **Gleicher Origin:** OPDashboard und OpenProject unter derselben Domain/Origin bereitstellen (z. B. per Reverse Proxy), sodass
  keine Cross-Origin-Anfrage entsteht.
- **Proxy mit CORS-Headern:** Einen vorgeschalteten Proxy (Nginx, Traefik, Apache) nutzen, der `/api/v3` an OpenProject
  weiterleitet und `Access-Control-Allow-Origin` (z. B. `*` oder die konkrete Dashboard-URL) sowie `Access-Control-Allow-Headers`
  (mindestens `Authorization, Content-Type`) setzt. Beispiel für Nginx:
  ```nginx
  location /api/ {
    proxy_pass https://op.example.domain/api/;
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    add_header Access-Control-Allow-Methods "GET, POST, PATCH, OPTIONS" always;
    if ($request_method = 'OPTIONS') { return 204; }
  }
  ```
- **OpenProject-Server konfigurieren:** Falls der Server selbst konfigurierbar ist, CORS-Header dort aktivieren.

Die App kann den fehlenden CORS-Header nicht umgehen; die Freigabe muss server- oder proxyseitig erfolgen.

## Projektstruktur
- `src/App.jsx` – Hauptansicht mit Projektwahl, KPIs, Karten und Tabelle
- `src/index.css` – Styles für die UI
- `Dockerfile` – Multi-Stage Build (Node → NGINX)
- `docker-compose.yml` – Startet das Frontend-Image auf Port 5173
