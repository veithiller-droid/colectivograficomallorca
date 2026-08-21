"use client";

import SiteHeader from "../components/site-header";
import { useLanguage } from "../components/language-provider";

const content = {
  de: {
    eyebrow: "Datenschutz",
    title: "Datenschutzerklärung",
    intro: "Hier erklären wir, welche personenbezogenen Daten wir im Shop verarbeiten, wofür wir sie benötigen und welche Rechte du hast.",
    sections: [
      {
        title: "Verantwortlicher",
        items: [
          ["Verantwortlicher", "Colectivo Gráfico Mallorca · Veit Hiller"],
          ["Anschrift", "Carrer Na Batlessa 10 · 07570 Artà · Mallorca · Spanien"],
          ["NIF / NIE", "Y5710911W"],
          ["Kontakt", "info@colectivograficomallorca.com"],
        ],
      },
      {
        title: "Bestellungen",
        items: [
          ["Welche Daten", "Bei einer Bestellung verarbeiten wir die Angaben, die für Kauf, Zahlung, Lieferung und Kommunikation erforderlich sind. Dazu können insbesondere Name, Liefer- und Rechnungsanschrift, E-Mail-Adresse, bestellte Produkte, Beträge und Transaktionsinformationen gehören."],
          ["Zweck", "Abwicklung des Kaufvertrags, Versand der Bestellung, Zahlungszuordnung, Kundenkommunikation sowie Buchhaltung und Erfüllung gesetzlicher Pflichten."],
          ["Rechtsgrundlage", "Die Verarbeitung erfolgt zur Durchführung des Vertrags und zur Erfüllung gesetzlicher Verpflichtungen."],
          ["Speicherdauer", "Bestell- und Rechnungsdaten werden so lange gespeichert, wie dies für die Vertragsabwicklung und aufgrund gesetzlicher Aufbewahrungs- und Nachweispflichten erforderlich ist."],
        ],
      },
      {
        title: "Zahlung mit Stripe",
        items: [
          ["Dienstleister", "Für die Zahlungsabwicklung nutzen wir Stripe. Zahlungsdaten werden im Rahmen des Checkout-Prozesses an Stripe übermittelt und dort nach den für Stripe geltenden Datenschutzbestimmungen verarbeitet."],
          ["Daten", "Je nach gewählter Zahlungsart verarbeitet Stripe insbesondere Zahlungs-, Transaktions-, Kontakt- und technische Daten, die zur Durchführung und Absicherung der Zahlung erforderlich sind."],
          ["Internationale Verarbeitung", "Stripe ist international tätig. Personenbezogene Daten können daher auch außerhalb des Europäischen Wirtschaftsraums verarbeitet werden. Stripe nennt hierfür unter anderem das EU-U.S. Data Privacy Framework und Standardvertragsklauseln als Transfermechanismen."],
        ],
      },
      {
        title: "Hosting & Datenbank",
        items: [
          ["Railway", "Unsere Website und die zugehörige PostgreSQL-Datenbank werden über Railway in einer europäischen Region betrieben."],
          ["Technische Daten", "Beim Aufruf der Website können technisch erforderliche Verbindungs- und Serverdaten verarbeitet werden, insbesondere IP-Adresse, Zeitpunkt des Zugriffs, angeforderte Ressource und technische Browserinformationen."],
          ["Zweck", "Bereitstellung, Stabilität, Sicherheit und technische Fehleranalyse des Shops."],
        ],
      },
      {
        title: "E-Mail & Resend",
        items: [
          ["Dienstleister", "Für den technischen Versand von E-Mails nutzen wir Resend, einen Dienst von Plus Five Five, Inc., USA."],
          ["Verarbeitung", "Beim E-Mail-Versand werden insbesondere Empfängeradresse, E-Mail-Metadaten und der Inhalt der jeweiligen Nachricht verarbeitet."],
          ["Internationale Übermittlung", "Resend verarbeitet Daten auch in den USA. Der Anbieter stellt hierfür ein Data Processing Addendum bereit und nennt das EU-U.S. Data Privacy Framework sowie Standardvertragsklauseln als Mechanismen für internationale Datenübermittlungen."],
        ],
      },
      {
        title: "Newsletter",
        items: [
          ["Welche Daten", "Für die Newsletter-Anmeldung erfassen wir ausschließlich deine E-Mail-Adresse."],
          ["Zweck", "Versand von Informationen zu neuen Editionen, Künstlern und Veröffentlichungen von Colectivo Gráfico Mallorca."],
          ["Rechtsgrundlage", "Deine Einwilligung."],
          ["Widerruf", "Du kannst deine Einwilligung jederzeit für die Zukunft widerrufen. Danach verwenden wir deine E-Mail-Adresse nicht mehr für den Newsletter."],
        ],
      },
      {
        title: "Tracking & externe Dienste",
        items: [
          ["Analytics", "Wir verwenden derzeit weder Google Analytics noch vergleichbare Analyse- oder Marketing-Tracking-Dienste."],
          ["Google Maps", "Google Maps ist auf dieser Website nicht eingebunden."],
          ["Kundenkonten", "Wir führen keine eigenen Kundenkonten. Zahlungsbezogene Schnell-Checkout-Funktionen werden von Stripe bereitgestellt."],
          ["Cookies", "Wir setzen keine eigenen Analyse- oder Marketing-Cookies ein. Technisch notwendige Speichermechanismen können für Shop-, Warenkorb- und Zahlungsfunktionen verwendet werden."],
        ],
      },
      {
        title: "Empfänger & Weitergabe",
        items: [
          ["Dienstleister", "Personenbezogene Daten erhalten nur die Dienstleister, die wir für Betrieb, Zahlung, E-Mail-Versand und Bestellabwicklung benötigen, insbesondere Railway, Stripe und Resend sowie der jeweils eingesetzte Versanddienstleister."],
          ["Keine Vermarktung", "Wir verkaufen keine personenbezogenen Kundendaten und geben sie nicht für fremde Werbezwecke weiter."],
        ],
      },
      {
        title: "Deine Rechte",
        items: [
          ["Datenschutzrechte", "Du hast nach den gesetzlichen Voraussetzungen das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Eine erteilte Einwilligung kannst du jederzeit mit Wirkung für die Zukunft widerrufen."],
          ["Kontakt", "Zur Ausübung deiner Rechte kannst du dich an info@colectivograficomallorca.com wenden."],
          ["Aufsichtsbehörde", "Du hast außerdem das Recht, dich bei einer zuständigen Datenschutzaufsichtsbehörde zu beschweren. In Spanien ist dies insbesondere die Agencia Española de Protección de Datos (AEPD)."],
        ],
      },
      {
        title: "Stand",
        items: [
          ["Aktualisierung", "Stand dieser Datenschutzerklärung: August 2026."],
        ],
      },
    ],
  },

  es: {
    eyebrow: "Privacidad",
    title: "Política de Privacidad",
    intro: "Aquí explicamos qué datos personales tratamos en la tienda, para qué los necesitamos y qué derechos tienes.",
    sections: [
      {
        title: "Responsable",
        items: [
          ["Responsable", "Colectivo Gráfico Mallorca · Veit Hiller"],
          ["Domicilio", "Carrer Na Batlessa 10 · 07570 Artà · Mallorca · España"],
          ["NIF / NIE", "Y5710911W"],
          ["Contacto", "info@colectivograficomallorca.com"],
        ],
      },
      {
        title: "Pedidos",
        items: [
          ["Datos tratados", "Cuando realizas un pedido tratamos los datos necesarios para la compra, el pago, la entrega y la comunicación. Esto puede incluir nombre, dirección de entrega y facturación, correo electrónico, productos pedidos, importes e información de la transacción."],
          ["Finalidad", "Gestionar el contrato de compra, enviar el pedido, asignar el pago, comunicarnos contigo y cumplir nuestras obligaciones contables y legales."],
          ["Base jurídica", "El tratamiento se realiza para ejecutar el contrato y cumplir obligaciones legales."],
          ["Conservación", "Los datos de pedidos y facturación se conservan durante el tiempo necesario para gestionar la relación contractual y durante los plazos legales de conservación y acreditación aplicables."],
        ],
      },
      {
        title: "Pago con Stripe",
        items: [
          ["Proveedor", "Utilizamos Stripe para procesar los pagos. Durante el checkout, los datos necesarios para el pago se transmiten a Stripe y se tratan conforme a sus propias condiciones de privacidad."],
          ["Datos", "Según el método de pago elegido, Stripe trata especialmente datos de pago, transacción, contacto y datos técnicos necesarios para ejecutar y proteger la operación."],
          ["Tratamiento internacional", "Stripe opera internacionalmente, por lo que determinados datos personales pueden tratarse fuera del Espacio Económico Europeo. Stripe indica, entre otros mecanismos, el EU-U.S. Data Privacy Framework y las cláusulas contractuales tipo para estas transferencias."],
        ],
      },
      {
        title: "Hosting y base de datos",
        items: [
          ["Railway", "Nuestra web y la base de datos PostgreSQL asociada se alojan mediante Railway en una región europea."],
          ["Datos técnicos", "Al acceder a la web pueden tratarse datos técnicos necesarios de conexión y servidor, especialmente dirección IP, momento del acceso, recurso solicitado e información técnica del navegador."],
          ["Finalidad", "Prestar el servicio, mantener la estabilidad y seguridad de la tienda y analizar errores técnicos."],
        ],
      },
      {
        title: "Correo electrónico y Resend",
        items: [
          ["Proveedor", "Para el envío técnico de correos electrónicos utilizamos Resend, un servicio de Plus Five Five, Inc., Estados Unidos."],
          ["Tratamiento", "Para enviar correos se tratan especialmente la dirección del destinatario, metadatos del mensaje y el contenido del correo correspondiente."],
          ["Transferencia internacional", "Resend también trata datos en Estados Unidos. El proveedor ofrece un Data Processing Addendum y señala el EU-U.S. Data Privacy Framework y las cláusulas contractuales tipo como mecanismos para transferencias internacionales."],
        ],
      },
      {
        title: "Newsletter",
        items: [
          ["Datos", "Para suscribirte al newsletter recogemos únicamente tu dirección de correo electrónico."],
          ["Finalidad", "Enviar información sobre nuevas ediciones, artistas y publicaciones de Colectivo Gráfico Mallorca."],
          ["Base jurídica", "Tu consentimiento."],
          ["Retirada del consentimiento", "Puedes retirar tu consentimiento en cualquier momento con efecto para el futuro. A partir de ese momento dejaremos de utilizar tu correo para el newsletter."],
        ],
      },
      {
        title: "Seguimiento y servicios externos",
        items: [
          ["Analítica", "Actualmente no utilizamos Google Analytics ni otros servicios equivalentes de analítica o seguimiento publicitario."],
          ["Google Maps", "Google Maps no está integrado en esta web."],
          ["Cuentas de cliente", "No mantenemos cuentas propias de clientes. Las funciones de checkout rápido relacionadas con el pago son proporcionadas por Stripe."],
          ["Cookies", "No utilizamos cookies propias de analítica o marketing. Pueden utilizarse mecanismos de almacenamiento técnicamente necesarios para las funciones de tienda, cesta y pago."],
        ],
      },
      {
        title: "Destinatarios",
        items: [
          ["Proveedores", "Solo reciben datos personales los proveedores necesarios para el funcionamiento, el pago, el envío de correos y la gestión del pedido, especialmente Railway, Stripe y Resend, además del transportista utilizado para cada envío."],
          ["Sin venta de datos", "No vendemos datos personales de clientes ni los cedemos para publicidad de terceros."],
        ],
      },
      {
        title: "Tus derechos",
        items: [
          ["Derechos", "Cuando se cumplan los requisitos legales, puedes ejercer los derechos de acceso, rectificación, supresión, limitación del tratamiento, portabilidad y oposición. También puedes retirar un consentimiento en cualquier momento con efecto para el futuro."],
          ["Contacto", "Para ejercer tus derechos puedes escribir a info@colectivograficomallorca.com."],
          ["Autoridad de control", "También puedes presentar una reclamación ante una autoridad de protección de datos competente. En España, en particular, ante la Agencia Española de Protección de Datos (AEPD)."],
        ],
      },
      {
        title: "Versión",
        items: [
          ["Actualización", "Versión de esta política de privacidad: agosto de 2026."],
        ],
      },
    ],
  },
} as const;

export default function PrivacyPage() {
  const { language } = useLanguage();
  const page = content[language];

  return (
    <main>
      <SiteHeader />
      <section className="faq-page privacy-page shell">
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
