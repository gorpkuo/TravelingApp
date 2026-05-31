# Traveling App Layered Architecture

## Layers

1. Presentation Layer
- Files: `index.html`, `styles.css`
- Responsibility: Render mobile-first UI and route-level sections.

2. Application Layer
- Files: `app.js`
- Responsibility: Route switching, form handling, trip/day workflow, in-memory state for phase 1.

3. Domain Layer
- Files: `app.js` (domain model blocks)
- Responsibility: Trip, Day, Spot data model and date-range generation rules.

4. Infrastructure Layer
- Files: `manifest.webmanifest`, `sw.js`
- Responsibility: PWA install metadata, offline cache shell.

5. Persistence Layer (next phase)
- Planned: IndexedDB adapter module
- Responsibility: Persist/reload `trips` data.

## Layer Relationships

- Presentation -> Application
- Application -> Domain
- Application -> Infrastructure (service worker registration)
- Application -> Persistence (next phase)

