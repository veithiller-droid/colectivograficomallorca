"use client";

import SiteHeader from "../components/site-header";
import { useLanguage } from "../components/language-provider";

const faq = {
  de: [
    {
      title: "Bestellung & Versand",
      items: [
        ["Woher werden die Prints versendet?", "Alle Werke werden bei uns in Artà, Mallorca, gestaltet, gedruckt und versendet. Jede Bestellung kommt direkt von der Insel zu dir."],
        ["Wie lange dauert die Lieferung?", "Wir versenden jede Bestellung innerhalb von 48 Stunden nach Zahlungseingang. Die tatsächliche Lieferzeit danach hängt vom gewählten Versanddienstleister sowie dem Zielland ab."],
        ["Was kostet der Versand?", "Die Versandkosten trägt der Käufer und richten sich nach Format, Verpackungsart und Zielland."],
        ["Liefert ihr auch international?", "Ja, wir versenden international."],
        ["Wie wird der Print verpackt?", "Ungerahmte Prints verschicken wir in stabilen Versandrollen, gerahmte oder größere Bestellungen je nach Produkt in einer passenden Box."],
      ],
    },
    {
      title: "Formate & Produkte",
      items: [
        ["Welche Formate gibt es?", "Postkarte, 20 × 30 cm, 30 × 40 cm und 40 × 60 cm."],
        ["Warum keine DIN-Formate wie A4 oder A3?", "Unsere Formate orientieren sich am klassischen Kunstdruckmarkt, nicht am Bürodruck-Standard. So passen die Prints zu den gängigsten Fertigrahmen und Passepartouts."],
        ["Auf welchem Papier und mit welchem Verfahren wird gedruckt?", "Wir drucken im Pigmentdruck-Verfahren auf mattem, strukturiertem Fine-Art-Papier von Hahnemühle und Canson Infinity."],
      ],
    },
    {
      title: "Rahmung",
      items: [
        ["Welche Rahmenoptionen gibt es?", "Ungerahmt, Standardrahmen Schwarz mit leichtem und bruchsicherem Plexiglas, Aluminium mit Echtglas in Silber, Schwarz oder Gold sowie Customized Frames von Art i Vases in Artà."],
        ["Woraus bestehen die Rahmen?", "Der Standardrahmen ist aus MDF, schwarz, mit Plexiglasscheibe. Aluminium- und Customized Frames werden handgefertigt und mit Echtglas verglast. Beim Customized Frame ist auf Wunsch auch Mattglas möglich."],
        ["Ist beim Customized Frame jedes Format möglich?", "Ja. Beim Customized Frame ist jedes Format möglich."],
      ],
    },
    {
      title: "Zahlung, Rückgabe & Widerruf",
      items: [
        ["Welche Zahlungsmethoden akzeptiert ihr?", "Wir akzeptieren die über Stripe in unserem Checkout angebotenen Zahlungsmethoden."],
        ["Kann ich meine Bestellung zurückgeben?", "Bei personalisierten oder individuell gefertigten Bestellungen ist eine Rückgabe ausgeschlossen. Bei allen anderen Bestellungen gilt das gesetzliche Widerrufsrecht."],
      ],
    },
    {
      title: "Über das Label",
      items: [
        ["Wer steckt hinter Colectivo Gráfico Mallorca?", "Wir sind ein unabhängiges Designstudio und Kunstlabel aus Mallorca. Unter unserem Label entstehen Fine-Art-Prints von Künstlerinnen und Künstlern mit unterschiedlichen Blicken auf die Insel."],
        ["Wo werden die Rahmen gefertigt?", "Individuelle Rahmen entstehen bei Art i Vases, einer traditionellen Rahmenwerkstatt in Artà."],
      ],
    },
    {
      title: "Kontakt",
      items: [
        ["Wie erreiche ich euch bei Fragen?", "Bei Fragen erreichst du uns unter support@colectivograficomallorca.com. Wir sind ein kleines Unternehmen und antworten so schnell wie möglich."],
      ],
    },
  ],
  es: [
    {
      title: "Pedidos y envíos",
      items: [
        ["¿Desde dónde se envían los prints?", "Todas las obras se diseñan, imprimen y envían desde Artà, Mallorca. Cada pedido llega directamente desde la isla."],
        ["¿Cuánto tarda la entrega?", "Enviamos cada pedido dentro de las 48 horas posteriores a la recepción del pago. El tiempo de entrega posterior depende del transportista y del país de destino."],
        ["¿Cuánto cuesta el envío?", "Los gastos de envío corren a cargo del comprador y dependen del formato, el tipo de embalaje y el país de destino."],
        ["¿Hacéis envíos internacionales?", "Sí, realizamos envíos internacionales."],
        ["¿Cómo se embala el print?", "Los prints sin marco se envían en tubos resistentes. Los pedidos enmarcados o de mayor tamaño se envían en una caja adecuada al producto."],
      ],
    },
    {
      title: "Formatos y productos",
      items: [
        ["¿Qué formatos hay disponibles?", "Postal, 20 × 30 cm, 30 × 40 cm y 40 × 60 cm."],
        ["¿Por qué no utilizáis formatos DIN como A4 o A3?", "Nuestros formatos siguen los estándares habituales del mercado de impresión artística y no los formatos de oficina. Así resultan compatibles con muchos marcos y paspartús estándar."],
        ["¿En qué papel y con qué técnica se imprime?", "Imprimimos con pigmentos sobre papel Fine Art mate y texturizado de Hahnemühle y Canson Infinity."],
      ],
    },
    {
      title: "Enmarcación",
      items: [
        ["¿Qué opciones de marco hay?", "Sin marco, marco estándar negro con plexiglás ligero y resistente, aluminio con cristal en plata, negro u oro, y Customized Frames realizados por Art i Vases en Artà."],
        ["¿De qué están hechos los marcos?", "El marco estándar es de MDF negro con plexiglás. Los marcos de aluminio y Customized Frames se fabrican a mano y llevan cristal auténtico. Para los Customized Frames también está disponible el cristal mate."],
        ["¿Se puede hacer cualquier formato con un Customized Frame?", "Sí. Con un Customized Frame es posible realizar cualquier formato."],
      ],
    },
    {
      title: "Pago, devoluciones y desistimiento",
      items: [
        ["¿Qué métodos de pago aceptáis?", "Aceptamos los métodos de pago disponibles en nuestro checkout a través de Stripe."],
        ["¿Puedo devolver mi pedido?", "Los pedidos personalizados o fabricados individualmente no se pueden devolver. Para los demás pedidos se aplica el derecho legal de desistimiento."],
      ],
    },
    {
      title: "Sobre el label",
      items: [
        ["¿Quién está detrás de Colectivo Gráfico Mallorca?", "Somos un estudio de diseño y label artístico independiente de Mallorca. Bajo nuestro sello nacen Fine-Art-Prints de artistas con diferentes miradas sobre la isla."],
        ["¿Dónde se fabrican los marcos?", "Los marcos personalizados se realizan en Art i Vases, un taller tradicional de enmarcación en Artà."],
      ],
    },
    {
      title: "Contacto",
      items: [
        ["¿Cómo puedo contactar con vosotros?", "Puedes escribirnos a support@colectivograficomallorca.com. Somos una pequeña empresa y respondemos lo antes posible."],
      ],
    },
  ],
} as const;

export default function FAQPage() {
  const { language } = useLanguage();
  const content = faq[language];

  return (
    <main>
      <SiteHeader />
      <section className="faq-page shell">
        <div className="faq-intro">
          <p className="eyebrow">{language === "de" ? "Gut zu wissen" : "Información útil"}</p>
          <h1>FAQ</h1>
          <p>{language === "de"
            ? "Alles zu Prints, Formaten, Rahmung, Versand und Bestellung."
            : "Todo sobre prints, formatos, enmarcación, envíos y pedidos."}</p>
        </div>

        <div className="faq-sections">
          {content.map((section, sectionIndex) => (
            <section className="faq-section" key={section.title}>
              <div className="faq-section-title">
                <span>{String(sectionIndex + 1).padStart(2, "0")}</span>
                <h2>{section.title}</h2>
              </div>
              <div className="faq-list">
                {section.items.map(([question, answer]) => (
                  <article className="faq-item" key={question}>
                    <h3>{question}</h3>
                    <p>{answer}</p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
