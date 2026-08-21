"use client";

import SiteHeader from "../components/site-header";
import { useLanguage } from "../components/language-provider";

const content = {
  de: { title: "Rückgabe und Widerruf", intro: "Informationen zu Widerruf, Rücksendung, Erstattung und individuell gefertigten Produkten.", sections: [
    ["Widerrufsfrist", ["Verbraucher können den Kauf von nicht individuell angefertigten Waren innerhalb von 14 Tagen ohne Angabe von Gründen widerrufen. Die Frist beginnt mit dem Tag, an dem der Kunde oder eine von ihm benannte Person die Ware erhält."]],
    ["Widerruf erklären", ["Der Widerruf muss eindeutig per E-Mail an info@colectivograficomallorca.com erklärt werden. Bitte Bestellnummer, Namen und die betroffenen Artikel angeben."]],
    ["Rücksendung", ["Die Ware muss spätestens 14 Tage nach Erklärung des Widerrufs an Colectivo Gráfico Mallorca, Veit Hiller, Carrer Na Batlessa 10, 07570 Artà, Illes Balears, Spanien zurückgesendet werden. Die unmittelbaren Kosten der Rücksendung trägt der Kunde.", "Die Ware sollte sicher und möglichst in der ursprünglichen Schutzverpackung zurückgesendet werden. Für einen Wertverlust muss nur aufgekommen werden, wenn er auf einen Umgang zurückzuführen ist, der zur Prüfung von Beschaffenheit, Eigenschaften und Funktion der Ware nicht notwendig war."]],
    ["Erstattung", ["Nach einem wirksamen Widerruf erstatten wir die erhaltenen Zahlungen einschließlich der Kosten der günstigsten angebotenen Standardlieferung. Zusätzliche Kosten einer ausdrücklich gewählten teureren Versandart werden nicht erstattet. Die Erstattung kann bis zum Eingang der Ware oder bis zum Nachweis der Rücksendung zurückgehalten werden und erfolgt grundsätzlich über dasselbe Zahlungsmittel."]],
    ["Individuell gefertigte Rahmen", ["Vom Widerrufsrecht ausgeschlossen sind Customized Frames und andere Waren, die nach Kundenspezifikation angefertigt oder eindeutig auf persönliche Bedürfnisse zugeschnitten wurden."]],
    ["Digitale Downloads", ["Wir stellen digitale Inhalte unmittelbar nach dem Kauf auf der Website oder per E-Mail bereit. Vor der sofortigen Bereitstellung muss der Kunde ausdrücklich zustimmen, dass mit der Vertragserfüllung vor Ablauf der Widerrufsfrist begonnen wird, und bestätigen, dass dadurch das Widerrufsrecht erlischt."]],
    ["Beschädigte oder fehlerhafte Ware", ["Gesetzliche Gewährleistungsrechte bleiben unberührt. Bei beschädigter, fehlerhafter oder falsch gelieferter Ware bitte zeitnah mit Bestellnummer und Fotos an info@colectivograficomallorca.com wenden."]],
    ["Liefergebiet", ["Wir liefern derzeit nach Spanien und Deutschland."]]
  ]},
  es: { title: "Devoluciones y desistimiento", intro: "Información sobre desistimiento, devoluciones, reembolsos y productos personalizados.", sections: [
    ["Plazo de desistimiento", ["Las personas consumidoras pueden desistir de la compra de productos no personalizados dentro de los 14 días naturales siguientes, sin necesidad de indicar el motivo. El plazo comienza el día en que el cliente o una persona designada por él recibe el producto."]],
    ["Comunicación", ["El desistimiento debe comunicarse de forma inequívoca por correo electrónico a info@colectivograficomallorca.com, indicando el número de pedido, el nombre y los artículos afectados."]],
    ["Devolución", ["El producto deberá enviarse, como máximo dentro de los 14 días siguientes a la comunicación del desistimiento, a Colectivo Gráfico Mallorca, Veit Hiller, Carrer Na Batlessa 10, 07570 Artà, Illes Balears, España. El cliente asume el coste directo de la devolución.", "El producto deberá devolverse protegido y, cuando sea posible, en su embalaje protector original. El cliente solo responderá de la disminución de valor derivada de una manipulación distinta de la necesaria para comprobar la naturaleza, características y funcionamiento del producto."]],
    ["Reembolso", ["Tras un desistimiento válido reembolsaremos los pagos recibidos, incluidos los gastos de la modalidad de entrega estándar más económica ofrecida. No se reembolsan los costes adicionales de una modalidad más cara elegida expresamente. El reembolso puede retenerse hasta recibir el producto o una prueba de su devolución y se realizará, en principio, mediante el mismo medio de pago."]],
    ["Marcos personalizados", ["Quedan excluidos del derecho de desistimiento los Customized Frames y demás productos confeccionados conforme a las especificaciones del cliente o claramente personalizados."]],
    ["Descargas digitales", ["Facilitamos los contenidos digitales inmediatamente después de la compra en la web o por correo electrónico. Antes de la entrega inmediata, el cliente deberá consentir expresamente el inicio de la ejecución durante el plazo de desistimiento y reconocer que, con ello, pierde su derecho de desistimiento."]],
    ["Productos dañados o incorrectos", ["Los derechos legales de garantía no se ven afectados. En caso de producto dañado, defectuoso o incorrecto, debe escribirse lo antes posible a info@colectivograficomallorca.com, indicando el número de pedido y adjuntando fotografías."]],
    ["Zona de entrega", ["Actualmente enviamos a España y Alemania."]]
  ]}
} as const;

export default function Returns() {
  const { language } = useLanguage();
  const page = content[language];
  return <main><SiteHeader/><section className="faq-page returns-page shell"><div className="faq-intro"><p className="eyebrow">Legal</p><h1>{page.title}</h1><p>{page.intro}</p></div><div className="faq-sections">{page.sections.map(([heading, paragraphs], index) => <section className="faq-section" key={heading}><div className="faq-section-title"><span>{String(index + 1).padStart(2, "0")}</span><h2>{heading}</h2></div><div className="faq-list"><article className="faq-item returns-item"><h3>{language === "de" ? "Information" : "Información"}</h3><div className="returns-copy">{paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div></article></div></section>)}</div></section></main>;
}
