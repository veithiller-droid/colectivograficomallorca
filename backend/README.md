# Backend

Separate Railway-Anwendung für API, PostgreSQL, Stripe, Newsletter, Instagram
und private Downloads.

## Struktur

- `src/config/` – Umgebungsvariablen
- `src/db/` – Schema und Migrationen
- `src/middleware/` – Anmeldung und Fehlerbehandlung
- `src/routes/public/` – öffentliche API
- `src/routes/admin/` – geschützte CMS-API
- `src/routes/webhooks/` – Stripe-Webhooks
- `src/services/` – Stripe, Newsletter, Instagram, Downloads
- `src/jobs/` – Hintergrundaufgaben
- `src/templates/` – E-Mail-Vorlagen
- `tests/` – Backend-Tests

Private Download-Dateien werden nicht in Git gespeichert.
