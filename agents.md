# Agents Overview – OPDashboard

Dieses Dokument beschreibt dedizierte „Agents“ (Rollen) für die Entwicklung und Weiterentwicklung des **OPDashboard**.  
Es dient als Arbeitsgrundlage für menschliche Contributor und für AI-gestützte Assistenten (z. B. ChatGPT, Copilot), damit klar ist, *wer* sich *worum* kümmert.

Das OPDashboard ist eine **API-basierte Management-Ansicht für OpenProject**, die:
- eine Auswahl mehrerer Projekte erlaubt,
- projektbezogen Meilensteine, Zielsetzungen, Deliverables, Features etc. anzeigt,
- Deadlines, Prioritäten und Zuständigkeiten sichtbar und (wo möglich) änderbar macht,
- KPIs über Projekte hinweg visualisiert,
- optional mehrere Projekte in einer kombinierten Ansicht darstellt,
- tool-spezifische Einstellungen lokal speichert,
- als **stateless App** mit **Docker-Compose-Setup** betrieben wird.

---

## Globale Annahmen

- **Backend-Datenquelle**: OpenProject REST API (inkl. API-Token-Authentifizierung).
- **App-Typ**: Stateless Single Page Application (SPA), Browser-seitige State-Verwaltung + Local Storage / IndexedDB für User-spezifische Einstellungen.
- **Deployment**: Docker-Compose, idealerweise ein Container für das Frontend (z. B. React/Node/NGINX) und optional ein Backend/Proxy, falls benötigt (z. B. für API-Gateway, CORS, zusätzliche Aggregationslogik).
- **Zielgruppe**: Projektleitende, Produktmanager, PMO, Management, die den Überblick über mehrere OpenProject-Projekte behalten wollen.

---

## 1. Product & Domain Agent

**Zweck:**  
Stellt sicher, dass alle Features des OPDashboard die fachlichen Anforderungen abdecken und sinnvoll auf OpenProject-Daten gemappt sind.

**Hauptaufgaben:**

- Anforderungen aus den Punkten (1)–(8) in konkrete User Stories übersetzen.
  - (1) Mehrfachauswahl von Projekten.
  - (2) Anzeige von Meilensteinen, Zielen, Deliverables, Features und weiteren Work Item Types.
  - (3) Sichtbarkeit & Bearbeitung von Deadlines, Priorität, Verantwortlichen.
  - (4) KPI-Definition (z. B. Anzahl offener Tickets, Burn-Down, Durchlaufzeiten).
  - (5) Multi-Projekt-Ansichten.
  - (6) Lokale Speicherung von Toolspezifischen Einstellungen.
  - (7) Fokus auf Docker-Compose-Setup.
  - (8) Stateless Architektur.
- Begriffe und Strukturen von OpenProject (Work Packages, Versions, Milestones, Custom Fields, etc.) sauber auf Dashboard-Konzepte abbilden.
- Klären, welche Aktionen read-only sind und wo Schreibzugriffe auf die OpenProject-API erfolgen (z. B. Prioritätsanpassung, Zuständigkeitsänderung).

**Typische Prompts an diesen Agenten:**

- „Definiere User Stories für die Mehrfachauswahl von Projekten im OPDashboard.“
- „Mappe OpenProject Work Package Typen (z. B. Milestone, Phase, Task, Feature) auf die Dashboard-Ansichten.“
- „Hilf mir, KPIs für Projektstatus und Portfolio-Sicht zu definieren.“

---

## 2. OpenProject API & Integration Agent

**Zweck:**  
Kümmert sich um alle technischen Details rund um die Anbindung an die OpenProject REST API.

**Hauptaufgaben:**

- API-Endpunkte identifizieren, die für:
  - Projektauswahl (Liste der Projekte)
  - Work Packages (Meilensteine, Features, Deliverables etc.)
  - Versionen / Releases
  - Benutzer / Verantwortliche
  - Custom Fields & Status
  benötigt werden.
- API-Clients entwerfen:
  - Authentifizierung via API-Token.
  - Fehlerhandling (Time-Outs, Rate Limits, 4xx/5xx).
  - Paging / Filtering / Sorting.
- Sicherstellen, dass alle Datenabrufe im Sinne einer **stateless App** funktionieren:
  - Keine serverseitigen Sessions.
  - Der Client sendet bei jedem Request alles Nötige (Token, Projektauswahl, Filter).

**Typische Prompts:**

- „Erstelle eine API-Client-Schicht für OpenProject in TypeScript/JavaScript.“
- „Zeig mir Beispiel-Requests, um alle Meilensteine eines Projekts inkl. Deadlines und Verantwortlichen zu laden.“
- „Hilf mir, API-Fehler und Rate Limits robust zu behandeln.“

---

## 3. UI/UX & Dashboard Visualization Agent

**Zweck:**  
Gestaltet die Benutzeroberfläche und sorgt für eine sinnvolle Visualisierung der Projektinformationen.

**Hauptaufgaben:**

- Entwurf einer intuitiven **Projekt-Auswahl** (z. B. Multi-Select, Suchfeld, Filter nach Status).
- Visualisierung von:
  - Meilensteinen, Zielen, Deliverables, Features,
  - Deadlines, Prioritäten, Zuständigkeiten,
  - Multi-Projekt-Ansichten (Portfolio-Sicht).
- Umsetzung von bevorzugten Visualisierungen:
  - Timeline-Ansicht (z. B. Gantt-ähnlich).
  - Kanban-Boards für Features / Work Packages.
  - KPI-Kacheln, Charts (Bar, Line, Donut etc.).
- UX-Patterns für:
  - „Drill-down“ von Portfolio-Ansicht in Projekt-Details.
  - Filter, Sortierung, Suche.

**Typische Prompts:**

- „Entwirf ein UI-Layout für eine Portfolio-Ansicht von 5 Projekten mit KPIs und Meilensteinen.“
- „Lege React-Komponentenstruktur für Timeline- und Kanban-Ansicht fest.“
- „Schlage Interaktionen vor, um Prioritäten im Kanban-Board anzupassen.“

---

## 4. KPI & Analytics Agent

**Zweck:**  
Definiert und implementiert Kennzahlen und Auswertungen über einzelne oder mehrere Projekte.

**Hauptaufgaben:**

- KPI-Definition, z. B.:
  - Anzahl offener / überfälliger Work Packages pro Projekt.
  - Meilenstein-Fortschritt (Anteil erledigt vs. offen).
  - Durchlaufzeiten (Cycle Time, Lead Time).
  - Workload pro Verantwortlichem.
- Aggregation über mehrere Projekte für die Portfolio-Sicht.
- Filterbare KPI-Ansichten:
  - nach Zeitraum (Monat, Quartal),
  - nach Projektstatus,
  - nach Verantwortlichen / Team.
- Optional: Vorbereitung für Export (CSV/Excel) von Kennzahlen.

**Typische Prompts:**

- „Definiere 10 KPIs für das Management von 5 parallelen OpenProject-Projekten.“
- „Erstelle eine Aggregationslogik für Kennzahlen über mehrere Projekte hinweg.“
- „Hilf mir bei der Berechnung von Durchlaufzeiten aus OpenProject Work Packages.“

---

## 5. Settings & Local Persistence Agent

**Zweck:**  
Sorgt dafür, dass alle **toolspezifischen Einstellungen lokal** auf Client-Seite persistiert werden – bei gleichzeitiger Wahrung der Stateless-Architektur.

**Hauptaufgaben:**

- Definition, welche Einstellungen lokal gespeichert werden sollen, z. B.:
  - ausgewählte Projekte,
  - bevorzugte Ansicht (Timeline, Kanban, KPI-Dashboard),
  - Filterpräferenzen (Status, Verantwortliche, Labels),
  - bevorzugte KPI-Sets.
- Umsetzung einer Persistence-Schicht:
  - `localStorage`, `sessionStorage` oder `IndexedDB`.
  - Versionierung der Settings (Migration bei App-Updates).
- Sicherstellen, dass sensible Daten (z. B. Access-Token) sicher gehandhabt werden:
  - Empfehlung: API-Token nicht persistieren oder nur nach explizitem Opt-In.

**Typische Prompts:**

- „Entwirf eine Settings-Struktur für das OPDashboard und speichere sie in localStorage.“
- „Schreibe Utility-Funktionen zum Laden/Speichern von User-Einstellungen.“
- „Erstelle ein Konzept für Migrationslogik von Einstellungen bei Breaking Changes.“

---

## 6. Stateless Architecture & Application Design Agent

**Zweck:**  
Garantiert, dass das OPDashboard wirklich **stateless** bleibt und sauber strukturiert ist.

**Hauptaufgaben:**

- Überprüfen, dass:
  - keine serverseitigen Sessions oder User-spezifischen Datenbanken für das Dashboard existieren,
  - alle User-spezifischen Informationen im Browser (Client) verbleiben.
- Architekturen vorschlagen:
  - reine Frontend-App (z. B. React/Vite) mit direkter API-Kommunikation zu OpenProject,
  - optionales leichtgewichtiges Backend (Proxy/API-Gateway), aber ohne persistenten User-State.
- Klare Trennung von:
  - Darstellungsschicht (UI),
  - API-Integrationsschicht,
  - Business-Logik/KPI-Berechnung.

**Typische Prompts:**

- „Beschreibe eine stateless Architektur für das OPDashboard in Form eines Diagramms.“
- „Bewerte, ob ein zusätzliches Backend sinnvoll ist, ohne den Stateless-Ansatz zu verletzen.“
- „Hilf mir, State-Management im Frontend (z. B. Zustand der Auswahlen) aufzubauen.“

---

## 7. DevOps & Docker-Compose Agent

**Zweck:**  
Kümmert sich um ein sauberes, reproduzierbares **Docker-Compose-Setup**.

**Hauptaufgaben:**

- Definition der Container-Architektur:
  - Frontend-Container (Build + statische Auslieferung).
  - Optional: Backend/Proxy-Container.
  - Optional: Reverse Proxy (z. B. Traefik/NGINX) für TLS und Routing.
- Erstellung der `docker-compose.yml`:
  - Ports, Umgebungsvariablen (z. B. OpenProject-URL, API-Base-URL).
  - Volumes nur dort, wo nötig (z. B. für Logs oder Reverse Proxy).
- Dokumentation für Deployment:
  - Beispiel-Konfigurationen.
  - Umgang mit Secrets (API-Tokens via `.env` / Secret Manager).
- CI/CD-Ansätze vorschlagen (Build/Test/Deploy).

**Typische Prompts:**

- „Erstelle ein docker-compose Setup für eine React-basierten OPDashboard-Frontend-App.“
- „Zeig mir eine Beispiel-`.env` für OpenProject-URL und Token-Konfiguration.“
- „Schlage eine simple CI-Pipeline vor (Build, Test, Docker-Image pushen).“

---

## 8. QA, Testing & Validation Agent

**Zweck:**  
Sichert die Qualität der App – funktional, technisch und fachlich.

**Hauptaufgaben:**

- Teststrategie definieren:
  - Unit-Tests (z. B. KPI-Berechnung, API-Clients).
  - Integrationstests (API + UI).
  - E2E-Tests (z. B. „Wähle 3 Projekte aus und überprüfe, ob deren Meilensteine angezeigt werden“).
- Testdatenkonzepte:
  - Mock-Daten für OpenProject-API.
  - Szenarien mit mehreren Projekten, verschiedenen Zuständigkeiten und Prioritäten.
- Validierung der Anforderungen (1–8):
  - Checklisten, um alle Punkte abzuhaken.

**Typische Prompts:**

- „Definiere Testfälle für die Mehrfachauswahl von Projekten und deren KPI-Anzeige.“
- „Erstelle Jest/Playwright Test-Skeletons für die Project-Overview-Seite.“
- „Hilf mir bei der Generierung von Mock-Daten für OpenProject-Responses.“

---

## 9. Documentation & Onboarding Agent

**Zweck:**  
Sorgt für nachvollziehbare, verständliche Dokumentation – für Nutzer:innen und Entwickler:innen.

**Hauptaufgaben:**

- Ergänzende Dokumentation zur `README.md` verfassen:
  - Architekturübersicht.
  - API-Integrationshinweise (OpenProject).
  - Konfigurations- und Deployment-Anleitung (inkl. Docker-Compose).
- How-to-Guides:
  - „Wie wähle ich mehrere Projekte aus?“
  - „Wie passe ich Prioritäten an?“
  - „Wie speichere ich meine bevorzugten KPI-Ansichten?“
- Changelog/Upgrade-Hinweise, wenn sich Schnittstellen oder Settings-Strukturen ändern.

**Typische Prompts:**

- „Formuliere eine Kurzanleitung zur Nutzung der Multi-Projekt-Ansicht.“
- „Erstelle ein Architektur-Kapitel für die Dokumentation des OPDashboard.“
- „Schreibe ein Troubleshooting-Kapitel für häufige Fehler (API nicht erreichbar, Token ungültig, etc.).“

---

## Zusammenarbeit der Agents

Die Agents sollten **nicht isoliert** agieren, sondern ihre Ergebnisse gegenseitig berücksichtigen:

- **Product & Domain Agent** definiert *was* gebraucht wird →  
  **API & Integration Agent**, **UI/UX Agent** und **KPI Agent** setzen es technisch um.
- **Settings Agent** und **Stateless Architecture Agent** achten darauf, dass die technische Umsetzung mit den Architekturprinzipien kompatibel bleibt.
- **DevOps Agent** sorgt dafür, dass alles reproduzierbar und deploybar ist.
- **QA Agent** validiert fortlaufend die Anforderungen (1–8).
- **Documentation Agent** fasst alles so zusammen, dass neue Contributor schnell einsteigen können.

---

## Verwendung dieses Dokuments

- Beim Arbeiten mit KI-Tools:  
  → Diesen Text (oder relevante Auszüge) als Kontext/„System Prompt“ bereitstellen, damit die KI eine der hier beschriebenen Rollen übernehmen kann.
- Im Team:  
  → Rollen (Agents) können als grobe Aufgabenbereiche für Maintainer, Contributor oder Arbeitsgruppen genutzt und je nach Projektgröße kombiniert oder getrennt belegt werden.
