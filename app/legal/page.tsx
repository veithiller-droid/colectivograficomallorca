"use client";

import SiteHeader from "../components/site-header";
import { useLanguage } from "../components/language-provider";

const content = {
  de: {
    eyebrow: "Rechtliche Angaben",
    title: "Impressum",
    intro: "Angaben zum Anbieter von Colectivo Gráfico Mallorca.",
    sections: [
      {
        title: "Anbieter",
        items: [
          ["Name", "Colectivo Gráfico Mallorca · Veit Hiller"],
          ["NIF / NIE", "Y5710911W"],
          ["Anschrift", "Carrer Na Batlessa 10 · 07570 Artà · Mallorca · Spanien"],
          ["E-Mail", "info@colectivograficomallorca.com"],
        ],
      },
      {
        title: "Verantwortung für Inhalte",
        items: [
          ["Inhalte", "Die Inhalte dieser Website werden von Colectivo Gráfico Mallorca bereitgestellt und mit angemessener Sorgfalt gepflegt."],
          ["Externe Links", "Für Inhalte externer Websites, auf die wir verlinken, sind ausschließlich deren jeweilige Betreiber verantwortlich."],
        ],
      },
      {
        title: "Urheber- und Nutzungsrechte",
        items: [
          ["Werke & Gestaltung", "Texte, Grafiken, Fotografien, Illustrationen, Produktdarstellungen und die Gestaltung dieser Website sind urheberrechtlich beziehungsweise durch sonstige Schutzrechte geschützt, soweit nicht anders angegeben."],
          ["Nutzung", "Eine Vervielfältigung, Bearbeitung, Verbreitung oder kommerzielle Nutzung außerhalb der gesetzlich zulässigen Grenzen bedarf der vorherigen Zustimmung des jeweiligen Rechteinhabers."],
        ],
      },
      {
        title: "Online-Handel",
        items: [
          ["Vertragsschluss", "Für Bestellungen über diesen Shop gelten zusätzlich die jeweils im Bestellprozess angezeigten Bedingungen sowie die Informationen zu Rückgabe und Widerruf."],
          ["Preise und Mehrwertsteuer", "Alle im Shop angegebenen Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer. Versandkosten werden im Checkout gesondert ausgewiesen."],
          ["Kontakt", "Für Fragen zu Bestellungen oder rechtlichen Angaben erreichst du uns unter info@colectivograficomallorca.com."],
        ],
      },
    ],
  },
  es: {
    eyebrow: "Información legal",
    title: "Aviso Legal",
    intro: "Información del prestador de Colectivo Gráfico Mallorca.",
    sections: [
      {
        title: "Titular",
        items: [
          ["Nombre", "Colectivo Gráfico Mallorca · Veit Hiller"],
          ["NIF / NIE", "Y5710911W"],
          ["Domicilio", "Carrer Na Batlessa 10 · 07570 Artà · Mallorca · España"],
          ["Correo electrónico", "info@colectivograficomallorca.com"],
        ],
      },
      {
        title: "Responsabilidad sobre los contenidos",
        items: [
          ["Contenidos", "Los contenidos de esta web son facilitados por Colectivo Gráfico Mallorca y se mantienen con la diligencia razonablemente exigible."],
          ["Enlaces externos", "Los contenidos de páginas externas enlazadas desde esta web son responsabilidad exclusiva de sus respectivos titulares."],
        ],
      },
      {
        title: "Propiedad intelectual y uso",
        items: [
          ["Obras y diseño", "Los textos, gráficos, fotografías, ilustraciones, imágenes de producto y el diseño de esta web están protegidos por derechos de autor u otros derechos de propiedad, salvo indicación contraria."],
          ["Uso", "La reproducción, modificación, distribución o uso comercial fuera de los límites permitidos por la ley requiere la autorización previa del titular de los derechos correspondiente."],
        ],
      },
      {
        title: "Comercio electrónico",
        items: [
          ["Contratación", "Los pedidos realizados a través de esta tienda se rigen además por las condiciones e informaciones sobre devoluciones y desistimiento mostradas durante el proceso de compra."],
          ["Precios e IVA", "Todos los precios indicados en la tienda incluyen el IVA legal. Los gastos de envío se muestran por separado durante el proceso de compra."],
          ["Contacto", "Para consultas sobre pedidos o información legal puedes escribirnos a info@colectivograficomallorca.com."],
        ],
      },
    ],
  },
} as const;

export default function LegalPage() {
  const { language } = useLanguage();
  const page = content[language];

  return (
    <main>
      <SiteHeader />
      <section className="faq-page shell">
        <div className="faq-intro">
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p>{page.intro}</p>
        </div>

        <div className="faq-sections">
          {page.sections.map((section, index) => (
            <section className="faq-section" key={section.title}>
              <div className="faq-section-title">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h2>{section.title}</h2>
              </div>
              <div className="faq-list">
                {section.items.map(([label, text]) => (
                  <article className="faq-item" key={label}>
                    <h3>{label}</h3>
                    <p>{text}</p>
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
