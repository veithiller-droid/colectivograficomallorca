# Architektur

## Systemaufteilung

### Storefront

Die öffentliche Website zeigt Inhalte und weboptimierte Produktbilder. Sie
enthält keine geheimen Schlüssel und keine druckfähigen Originaldateien.

### CMS

Das CMS wird als getrennte Anwendung betrieben und erhält eine eigene URL. Es
greift ausschließlich über authentifizierte API-Endpunkte auf das Backend zu.

Verwaltet werden Künstler, Kollektionen, Produkte, physische und digitale
Varianten, Formate, Rahmen, Custom Frames, Preise, Bestände, Webbilder, private
Downloads, Bestellungen, Seiteninhalte, Newsletter und Instagram.

### Backend

Alle geschäftskritischen Funktionen liegen im Railway-Backend:

- Datenbankzugriff und CMS-Anmeldung
- Inhalts- und Produkt-API
- serverseitige Preis- und Bestandsprüfung
- Stripe Checkout und Stripe-Webhooks
- Bestellungen und Versandstatus
- Download-Berechtigungen und signierte Links
- Newsletter-Versand
- Instagram-Datenabruf

## Datenerfassung

Auf der öffentlichen Website wird nur die E-Mail-Adresse für den Newsletter
erfasst. Name, Lieferadresse, Rechnungsinformationen und Zahlungsdaten werden
im Stripe Checkout erfasst.

## Produktmodell

Ein Produkt ist ein Motiv. Varianten werden im CMS frei kombiniert:

- digitaler Download
- ungerahmt, gerahmt oder Custom Frame
- A6, A4, A3, A2 und A1
- klassische und spätere weitere Druckformate

Preise werden nicht im Frontend fest codiert. Das Backend lädt beim Checkout
jede Variante erneut aus PostgreSQL und übergibt den geprüften Betrag an Stripe.

## Bilder und Downloads

Webvorschauen liegen öffentlich unter `public/images/`. Verkaufte Dateien
liegen in einem privaten Objektspeicher und sind nicht Teil des Frontends. Nach
einem erfolgreichen Stripe-Webhook erzeugt das Backend einen zeitlich
begrenzten Download-Link.

## Bestellablauf

1. Storefront lädt Produktdaten vom Backend.
2. Kunde wählt Variante, Format, Rahmen und Anzahl.
3. Storefront übermittelt nur Varianten-IDs und Mengen.
4. Backend prüft Preis, Status und Bestand in PostgreSQL.
5. Backend erstellt die Stripe Checkout Session.
6. Stripe erfasst Kunden-, Liefer- und Zahlungsdaten.
7. Stripe meldet das Ergebnis über einen signierten Webhook.
8. Backend markiert die Bestellung als bezahlt.
9. Physische Produkte erscheinen im Versandprozess.
10. Digitale Produkte erhalten einen zeitlich begrenzten Download-Link.

## Newsletter

Die Anmeldung übermittelt nur die E-Mail-Adresse an das Backend. Newsletter
werden im CMS erstellt, geplant und über einen Versanddienst verschickt.
Einwilligung, Abmeldung und Versandstatus werden in PostgreSQL gespeichert.
