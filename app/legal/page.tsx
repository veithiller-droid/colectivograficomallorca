"use client";

import SiteHeader from "../components/site-header";
import { useLanguage } from "../components/language-provider";

const content = {
  de: { title: "Impressum", sections: [
    ["Angaben zum Betreiber", ["Colectivo Gráfico Mallorca", "Inhaber: Veit Hiller", "NIE: Y5710911W", "Carrer na Batlessa 10", "07570 Artà, Illes Balears, Spanien"]],
    ["Kontakt", ["E-Mail: info@colectivograficomallorca.es"]],
    ["Tätigkeit", ["Colectivo Gráfico Mallorca ist ein unabhängiges Designstudio und Kunstlabel. Wir entwickeln, präsentieren und vertreiben grafische Arbeiten und vermitteln ausgewählte Werke. Betreiber des Onlineshops und Ansprechpartner für Bestellungen, Zahlungen, Versand und Reklamationen ist Veit Hiller."]],
    ["Streitbeilegung", ["Verbraucher können sich bei Streitigkeiten an die zuständige Verbraucherschlichtungsstelle oder die europäischen Verbraucherzentren wenden. Wir sind nicht verpflichtet und derzeit nicht bereit, an einem freiwilligen Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen."]],
    ["Urheberrecht", ["Texte, Fotografien, Illustrationen, Designs und sonstige Inhalte dieser Website sind urheberrechtlich geschützt. Eine Vervielfältigung, Bearbeitung oder gewerbliche Nutzung ist ohne vorherige schriftliche Zustimmung nicht gestattet."]]
  ]},
  es: { title: "Aviso legal", sections: [
    ["Datos del titular", ["Colectivo Gráfico Mallorca", "Titular: Veit Hiller", "NIE: Y5710911W", "Carrer na Batlessa 10", "07570 Artà, Illes Balears, España"]],
    ["Contacto", ["Correo electrónico: info@colectivograficomallorca.es"]],
    ["Actividad", ["Colectivo Gráfico Mallorca es un estudio de diseño y sello artístico independiente. Desarrollamos, presentamos y distribuimos obra gráfica y mediamos en la presentación de obras seleccionadas. Veit Hiller es el titular de la tienda online y la persona de contacto para pedidos, pagos, envíos y reclamaciones."]],
    ["Resolución de litigios", ["Las personas consumidoras pueden dirigirse a los organismos de consumo competentes o a la red de Centros Europeos del Consumidor. No estamos obligados ni adheridos actualmente a un procedimiento voluntario de resolución alternativa de litigios de consumo."]],
    ["Propiedad intelectual", ["Los textos, fotografías, ilustraciones, diseños y demás contenidos de esta web están protegidos por derechos de propiedad intelectual. No se permite su reproducción, modificación o uso comercial sin autorización previa por escrito."]]
  ]}
} as const;

export default function Legal() {
  const { language } = useLanguage();
  const page = content[language];
  return <main><SiteHeader/><section className="text-page legal-copy shell"><p className="eyebrow">Legal</p><h1>{page.title}</h1>{page.sections.map(([heading, paragraphs]) => <section key={heading}><h2>{heading}</h2>{paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</section>)}</section></main>;
}
