# Expense Tracker - Frontend

Das Frontend des Expense Trackers ist eine leistungsstarke Single-Page-Application (SPA), die mit Vue 3 entwickelt wurde. Sie bietet eine interaktive Oberfläche zur Verwaltung persönlicher Finanzen.

## Key Features
- **Dashboard**: Visualisierung der Finanzen durch interaktive Charts (Pie-Chart, Line-Chart, Bar-Chart).
- **Transaktionsverwaltung**: Zentrale Ansicht für alle Buchungen mit Such- und Filterfunktionen.
- **Scrollbare Listen**: Optimierte Benutzeroberfläche für große Datenmengen.
- **Responsive Design**: Modernes, glassmorphenes UI, das auf allen Geräten gut aussieht.
- **CSV-Export**: Einfacher Download der Transaktionsdaten für externe Analysen.
- **Benutzerführung**: Authentifizierungs-Guards sorgen dafür, dass geschützte Bereiche nur für angemeldete Nutzer zugänglich sind.

## Technologiestack
- **Framework**: Vue.js 3 (Composition API)
- **State Management**: Pinia
- **Routing**: Vue Router
- **HTTP Client**: Axios
- **Charts**: Chart.js
- **Styling**: Vanilla CSS (Modern CSS features like Gradients & Glassmorphism)
- **Build Tool**: Vite
- **Testing**: Vitest, Vue Test Utils

## Lokale Entwicklung
1. **Abhängigkeiten installieren**:
   ```bash
   npm install
   ```
2. **Entwicklungsserver starten**:
   ```bash
   npm run dev
   ```
3. **Build für Produktion**:
   ```bash
   npm run build
   ```

## Deployment Einstellungen (Render)
Für den erfolgreichen Betrieb auf Render muss folgende Umgebungsvariable gesetzt werden:
- `VITE_API_BASE_URL`: Die URL deines Backends (z.B. `https://dein-backend.onrender.com`).

Standardmäßig versucht das Frontend, eine Verbindung zu `http://localhost:8080` herzustellen.

## Projektstruktur
- `src/views`: Enthält die Hauptseiten (Login, Register, Dashboard, Transactions, Profile).
- `src/components`: Wiederverwendbare UI-Komponenten (Layout, Transactions, Dashboard).
- `src/service`: API-Anbindung und Authentifizierungs-Logik.
- `src/composables`: Kapselung von Logik (z.B. `useAuth`).

---
*Viel Spaß beim Verwalten deiner Finanzen!*
