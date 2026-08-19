# Colectivo Gráfico Mallorca – Railway Backend v1

Eigenständige Node.js-API für Railway mit PostgreSQL.

## Enthalten

- PostgreSQL-Schema für Künstler, Produkte, Bilder, Formate und Rahmen
- 31 aktuelle Produkte als wiederholbarer Seed-Import
- Newsletter- und Bestelltabellen
- öffentliche Produkt-API und Healthcheck
- CORS-Konfiguration für Storefront und CMS

## Lokal starten

```bash
cp .env.example .env
npm install
npm run db:init
npm start
```

## Railway

Root Directory: `/backend`

```text
NODE_ENV=production
DATABASE_URL=<Reference auf PostgreSQL.DATABASE_URL>
STOREFRONT_ORIGIN=https://deine-storefront-domain
CMS_ORIGIN=https://deine-cms-domain
```

Beim Start werden Schema und Produktimport automatisch ausgeführt. Der Import
arbeitet mit stabilen Produkt-IDs und kann beliebig oft wiederholt werden.

## Endpunkte

- `GET /health`
- `GET /api/public/artists`
- `GET /api/public/products`
- `GET /api/public/products/:slug`
- `POST /api/public/newsletter`
