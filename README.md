# Colectivo Gráfico Mallorca

Onlineshop und redaktionelle Website für Colectivo Gráfico Mallorca.

## Bereiche

- **Storefront:** öffentliche Website im Ordner `app/`
- **CMS:** getrennte Verwaltungsoberfläche im Ordner `cms/`
- **Backend:** Railway-API, PostgreSQL, Stripe, Newsletter und Downloads in `backend/`
- **Webbilder:** ausschließlich optimierte Vorschauen in `public/images/`
- **Dokumentation:** Architektur und Abläufe in `docs/`

## Öffentliche Seiten

- Hauptseite
- Who we are
- What we do
- Produkte und Produktdetails
- Künstler und Kollektionen
- Newsletter
- Instagram
- Datenschutz und Impressum
- Versand, Rückgabe und AGB

## Grundregel

Produkte, Varianten, Formate, Rahmen, Downloads und Preise werden ausschließlich
im CMS verwaltet. Stripe erhält beim Checkout die serverseitig geprüften
Warenkorbpositionen. Zahlungs- und Adressdaten werden über Stripe Checkout
erfasst.

Siehe [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
