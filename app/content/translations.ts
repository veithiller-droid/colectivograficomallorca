export type Language = "de" | "es";

export const translations = {
  de: {
    nav: { shop: "Shop", who: "Wer wir sind", what: "Was wir tun", frames: "Rahmen", newsletter: "Newsletter", bag: "Warenkorb" },
    home: {
      eyebrow: "Unabhängiges Designstudio und Kunstlabel",
      title1: "Die Insel,", title2: "gedruckt.",
      intro: "Wir sind ein unabhängiges Designstudio und Kunstlabel auf Mallorca. Gemeinsam entwickeln wir Fine Art Prints, produzieren sie lokal und versenden sie direkt von der Insel.",
      cta: "Kollektion entdecken",
      galleryEyebrow: "Unsere Auswahl", galleryTitle: "Designs von der Insel", galleryText: "Wir gestalten, wählen und drucken unsere Fine Art Prints auf Mallorca.", galleryLink: "Kollektion ansehen",
      whoEyebrow: "Wer wir sind", whoTitle: "Wir übersetzen Mallorca in Farbe, Form und Papier.",
      whoText: "Wir arbeiten wie ein Designstudio mit unterschiedlichen künstlerischen Handschriften. Gemeinsam entwickeln wir grafische Arbeiten, wählen Editionen aus und produzieren sie lokal.", whoLink: "Mehr über uns",
      whatEyebrow: "Was wir tun", whatTitle: "Von der Idee zum Print.",
      whatText1: "Wir entwickeln Illustrationen und grafische Entwürfe und produzieren daraus hochwertige Druckeditionen.",
      whatText2: "Wir bieten unsere Arbeiten als Print, gerahmt oder ungerahmt, mit individueller Rahmung und bei ausgewählten Motiven als digitalen Download an.",
      newsletterEyebrow: "Neuigkeiten von der Insel", newsletterTitle: "Neue Editionen, ohne Umwege.", newsletterLabel: "E-Mail-Adresse", newsletterPlaceholder: "name@email.com", newsletterButton: "Anmelden", newsletterSmall: "Neue Designs, Künstler und Veröffentlichungen.",
    },
    who: {
      eyebrow: "Wer wir sind", title: "Kunst von der Insel. Für die Welt.",
      paragraphs: [
        "Wir sind ein unabhängiges Designstudio und Kunstlabel auf Mallorca. Unter einem gemeinsamen Namen entwickeln, gestalten und produzieren wir grafische Arbeiten mit einer klaren Verbindung zur Insel.",
        "Mallorca ist mehr als ein Postkartenmotiv. Die Insel ist ein Lebensraum voller Kontraste: Kalkstein und Meer, intensive Farben und ausgebleichte Fassaden, ländliche Stille und mediterrane Lebendigkeit. Diese Vielfalt bildet den gemeinsamen Bezug unserer Arbeiten.",
        "Wir arbeiten mit unterschiedlichen künstlerischen Handschriften. Illustration, Malerei, Zeichnung, Druckgrafik und Gestaltung geben uns verschiedene Möglichkeiten, Mallorca zu betrachten.",
        "Blanca Colina, Herví Tille, Mateo Vilar und Miquel Salat stehen für vier visuelle Perspektiven innerhalb unseres Studios. Jede davon hat eine eigene Formensprache, Farbwelt und thematische Richtung.",
        "Wir entwickeln, wählen, drucken und rahmen auf Mallorca. So entsteht keine einheitliche Darstellung der Insel, sondern unsere gemeinsame Sammlung aus Landschaft, Architektur, Farben, Alltag und mediterranem Leben."
      ],
      artistsTitle: "Artist Corner",
      artistBios: {
        blanca: "Mit Blanca Colina zeigen wir Mallorca nah, farbig und alltäglich. Märkte, gedeckte Tische, stille Nachmittage und kleine Szenen aus Artà werden zu klaren Illustrationen mit eigener Leichtigkeit.",
        hervi: "Mit Herví Tille greifen wir die Klarheit historischer Reise- und Sportplakate auf. Orte, Bewegung, Architektur und das besondere Licht Mallorcas verdichten wir zu grafischen Erinnerungen an das Unterwegssein auf der Insel.",
        mateo: "Mit Mateo Vilar entwickeln wir rhythmische Bildflächen aus wiederkehrenden Formen und intensiven Farben. Feigen, Zitronen, Orangen und Tomaten verbinden eine fernöstlich inspirierte Ästhetik mit Mallorcas Märkten, Obstgärten und Küchen.",
        miquel: "Mit Miquel Salat verbinden wir reduzierte Druckgrafik, trockenen Humor und mediterrane Alltagsmotive. In Sardines on Tour schicken wir die Sardine mit Anklängen an Linolschnitt und Gebrauchsgrafik der 1950er-Jahre auf Reisen."
      }
    },
    what: {
      eyebrow: "Was wir tun", title: "Lokal entwickelt, hochwertig produziert.",
      paragraphs: [
        "Wir entwickeln unsere Motive innerhalb verschiedener künstlerischer Handschriften, bereiten sie für unterschiedliche Editionen und Formate auf und übernehmen Gestaltung, Produktion und Präsentation.",
        "Wir verwenden hochwertige Papiere und Materialien, die zum jeweiligen Motiv und Druckverfahren passen. Farben, Kontraste und Details sollen den Charakter der ursprünglichen Gestaltung authentisch wiedergeben.",
        "Unsere Fine Art Prints sind je nach Motiv in unterschiedlichen Formaten erhältlich. Sie können ungerahmt, fertig gerahmt oder mit einer individuell angefertigten Rahmung bestellt werden.",
        "Individuelle Rahmungen fertigen wir bei Art i Vases in Artà. Rahmenprofil, Farbe, Passepartout und Verglasung wählen wir passend zu Werk, Format und Raum aus.",
        "Ausgewählte Designs sind zusätzlich als digitale Downloads verfügbar. Öffentlich zeigen wir ausschließlich weboptimierte Vorschauen; die hochauflösenden Dateien werden erst nach dem Kauf bereitgestellt."
      ],
      claim: "Made in Mallorca. Selected in Mallorca. Printed in Mallorca. Distributed from Mallorca."
    },
    frames: { eyebrow: "Rahmen aus Mallorca", title: "Der richtige Rahmen gehört zum Werk.", intro: "Wir bieten drei Rahmungen an: einen unkomplizierten Standardrahmen aus Holz, einen präzise gefertigten Aluminiumrahmen und eine vollständig individuelle Lösung. Welche Optionen verfügbar sind, hängt vom Motiv und Format ab.", options: [
      { title: "Standardrahmen aus Holz", text: "Unsere Standardlösung besteht aus einem schlichten schwarzen Holzrahmen mit leichtem, bruchsicherem Plexiglas. Er ist sofort einsetzbar und für ausgewählte Motive und Formate erhältlich." },
      { title: "Aluminium mit Echtglas", text: "Unsere Aluminiumrahmen werden bei Art i Vases in Artà gefertigt. Die Profile sind in Silber, Schwarz oder Gold erhältlich. Jeder Rahmen wird von Hand zugeschnitten, montiert und mit Echtglas ausgestattet." },
      { title: "Customized Frame", text: "Für die individuelle Rahmung wählen wir gemeinsam mit Art i Vases Profil, Farbe, Echtglas und auf Wunsch Passepartout passend zu Werk, Format und Raum. Jeder Rahmen wird als Einzelanfertigung von Hand gebaut." }
    ], partnerEyebrow: "Unser Partner in Artà", partnerTitle: "Art i Vases – Rahmenhandwerk statt Serienware.", partnerText: "Art i Vases ist eine Rahmenwerkstatt in Artà. Dort verbindet sich traditionelles Rahmenhandwerk mit einer klaren, zeitgemäßen Auswahl an Holz- und Aluminiumprofilen, Papieren, Gläsern und Passepartouts. Jeder Rahmen entsteht Schritt für Schritt in der Werkstatt: vermessen, zugeschnitten, montiert und kontrolliert. So können wir Material, Proportion und Farbe auf das jeweilige Motiv abstimmen – vom präzisen Aluminiumrahmen bis zur vollständig individuellen Einrahmung.", partnerLink: "Art i Vases besuchen", details: ["Handgefertigt in Artà", "Echtglas und ausgewählte Materialien", "Individuelle Beratung und Einzelanfertigung"], claim: "Gedruckt und gerahmt auf Mallorca." },
    shop: { eyebrow: "Unsere Kollektion", title: "Fine Art Prints", intro: "Wir gestalten, wählen, drucken und versenden direkt aus Mallorca.", all: "Alle", artists: "Künstler", formats: "Formate", recent: "Neueste", artist: "Künstler", designs: "Designs", from: "ab" },
product: { eyebrow: "Fine Art Print · Mallorca", description: "Wir produzieren dieses Motiv auf Mallorca und drucken es im gewählten Format sorgfältig auf hochwertigem Papier.", format: "Format", selectFormatPrice: "Format auswählen", priceAfterSelection: "Der Preis erscheint nach der Formatwahl", totalPrice: "Gesamtpreis für die gewählte Ausführung", from: "ab", frame: "Rahmung", unframed: "Ungerahmt", standardFrame: "Standardrahmen Schwarz", aluminiumFrame: "Aluminium mit Echtglas", customFrame: "Customized Frame", frameColor: "Rahmenfarbe", realGlass: "Echtglas", a6Unframed: "A6 ist ausschließlich ungerahmt erhältlich.", colors: { silver: "Silber", black: "Schwarz", gold: "Gold" }, frameValues: { unframed: "Ungerahmt", standard: "Standardrahmen Schwarz", aluminium: "Aluminium mit Echtglas", custom: "Customized Frame von Art i Vases" }, customInfo: "Individuelle Rahmung von Art i Vases in Artà. Profil, Farbe, Passepartout und Glas werden passend zum Motiv ausgewählt.", request: "Individuelle Rahmung anfragen", cart: "In den Warenkorb", technical: "Technische Informationen", product: "Produkt", artist: "Künstler", origin: "Herkunft", shipping: "Versand", shippingValue: "Direkt aus Mallorca" },
    footer: { privacy: "Datenschutz", legal: "Impressum", returns: "Rückgabe und Widerruf" }
  },
  es: {
    nav: { shop: "Tienda", who: "Quiénes somos", what: "Qué hacemos", frames: "Marcos", newsletter: "Newsletter", bag: "Cesta" },
    home: {
      eyebrow: "Estudio de diseño y sello artístico independiente",
      title1: "La isla,", title2: "impresa.",
      intro: "Somos un estudio de diseño y sello artístico independiente en Mallorca. Juntos desarrollamos Fine Art Prints, los producimos localmente y los enviamos directamente desde la isla.",
      cta: "Descubrir la colección",
      galleryEyebrow: "Nuestra selección", galleryTitle: "Diseños de la isla", galleryText: "Diseñamos, seleccionamos e imprimimos nuestros Fine Art Prints en Mallorca.", galleryLink: "Ver la colección",
      whoEyebrow: "Quiénes somos", whoTitle: "Traducimos Mallorca en color, forma y papel.",
      whoText: "Trabajamos como un estudio de diseño con distintos lenguajes artísticos. Juntos desarrollamos obra gráfica, seleccionamos ediciones y las producimos localmente.", whoLink: "Conocer el proyecto",
      whatEyebrow: "Qué hacemos", whatTitle: "De la idea al papel.",
      whatText1: "Desarrollamos ilustraciones y diseños gráficos y los convertimos en ediciones impresas de alta calidad.",
      whatText2: "Ofrecemos nuestros diseños impresos, con o sin marco, con enmarcación personalizada y, en motivos seleccionados, como descarga digital.",
      newsletterEyebrow: "Noticias desde la isla", newsletterTitle: "Nuevas ediciones, directamente.", newsletterLabel: "Correo electrónico", newsletterPlaceholder: "nombre@correo.com", newsletterButton: "Suscribirme", newsletterSmall: "Nuevos diseños, artistas y lanzamientos.",
    },
    who: {
      eyebrow: "Quiénes somos", title: "Arte de la isla. Para el mundo.",
      paragraphs: [
        "Somos un estudio de diseño y sello artístico independiente en Mallorca. Bajo un mismo nombre desarrollamos, diseñamos y producimos obra gráfica conectada con la isla.",
        "Mallorca es mucho más que una imagen de postal. Es un territorio de contrastes: piedra caliza y mar, colores intensos y fachadas desgastadas, silencio rural y vitalidad mediterránea. Esta diversidad es el punto de unión de nuestras obras.",
        "Trabajamos con distintos lenguajes artísticos. La ilustración, la pintura, el dibujo, la obra gráfica y el diseño nos ofrecen diferentes maneras de observar Mallorca.",
        "Blanca Colina, Herví Tille, Mateo Vilar y Miquel Salat representan cuatro perspectivas visuales dentro de nuestro estudio. Cada una tiene su propio lenguaje formal, su paleta y su dirección temática.",
        "Diseñamos, seleccionamos, imprimimos y enmarcamos en Mallorca. El resultado no es una imagen uniforme de la isla, sino una colección plural de perspectivas contemporáneas sobre paisaje, arquitectura, color, vida cotidiana y Mediterráneo."
      ],
      artistsTitle: "Artist Corner",
      artistBios: {
        blanca: "Con Blanca Colina mostramos una Mallorca cercana, colorida y cotidiana. Mercados, mesas, tardes tranquilas y pequeñas escenas de Artà se convierten en ilustraciones claras y ligeras.",
        hervi: "Con Herví Tille retomamos la claridad de los carteles históricos de viaje y deporte. Lugares, movimiento, arquitectura y la luz de Mallorca se condensan en recuerdos gráficos de recorrer la isla.",
        mateo: "Con Mateo Vilar desarrollamos superficies rítmicas a partir de formas repetidas y colores intensos. Higos, limones, naranjas y tomates unen una estética de inspiración oriental con los mercados, huertos y cocinas de Mallorca.",
        miquel: "Con Miquel Salat unimos gráfica reducida, humor seco y motivos cotidianos del Mediterráneo. En Sardines on Tour enviamos la sardina de viaje con ecos del linograbado y la gráfica de los años cincuenta."
      }
    },
    what: {
      eyebrow: "Qué hacemos", title: "Desarrollado localmente, producido con calidad.",
      paragraphs: [
        "Desarrollamos nuestros motivos dentro de distintos lenguajes artísticos, los adaptamos a diferentes ediciones y formatos y nos encargamos del diseño, la producción y la presentación.",
        "Utilizamos papeles y materiales de alta calidad adecuados para cada motivo y técnica de impresión. Los colores, contrastes y detalles conservan el carácter de la obra original.",
        "Nuestros Fine Art Prints están disponibles en diferentes formatos según cada diseño. Pueden pedirse sin marco, enmarcados o con una enmarcación personalizada.",
        "Realizamos las enmarcaciones personalizadas en Art i Vases, en Artà. Elegimos el perfil, el color, el paspartú y el cristal de acuerdo con la obra, el formato y el espacio.",
        "Algunos diseños también están disponibles como descarga digital. En la web mostramos únicamente imágenes optimizadas; los archivos de alta resolución se entregan después de la compra."
      ],
      claim: "Made in Mallorca. Selected in Mallorca. Printed in Mallorca. Distributed from Mallorca."
    },
    frames: { eyebrow: "Marcos de Mallorca", title: "El marco adecuado forma parte de la obra.", intro: "Ofrecemos tres opciones: un marco estándar de madera, un marco de aluminio fabricado con precisión y una solución completamente personalizada. Las opciones disponibles dependen del diseño y del formato.", options: [
      { title: "Marco estándar de madera", text: "Nuestra solución estándar es un marco negro de madera con plexiglás ligero y resistente. Está listo para colgar y disponible para una selección de diseños y formatos." },
      { title: "Aluminio con cristal", text: "Nuestros marcos de aluminio se fabrican en Art i Vases, en Artà. Los perfiles están disponibles en plata, negro y oro. Cada marco se corta y se monta a mano y se completa con cristal auténtico." },
      { title: "Marco personalizado", text: "Para cada enmarcación individual elegimos con Art i Vases el perfil, el color, el cristal y, si se desea, el paspartú según la obra, el formato y el espacio. Cada marco es una pieza hecha a mano." }
    ], partnerEyebrow: "Nuestro colaborador en Artà", partnerTitle: "Art i Vases: oficio, no producción en serie.", partnerText: "Art i Vases es un taller de enmarcación en Artà. Allí, la tradición del oficio se combina con una selección contemporánea de perfiles de madera y aluminio, papeles, cristales y paspartús. Cada marco se crea paso a paso en el taller: medición, corte, montaje y control. Así podemos ajustar el material, la proporción y el color a cada diseño, desde un marco de aluminio preciso hasta una enmarcación completamente personalizada.", partnerLink: "Visitar Art i Vases", details: ["Hecho a mano en Artà", "Cristal auténtico y materiales seleccionados", "Asesoramiento individual y piezas únicas"], claim: "Impreso y enmarcado en Mallorca." },
    shop: { eyebrow: "Nuestra colección", title: "Fine Art Prints", intro: "Diseñamos, seleccionamos, imprimimos y enviamos directamente desde Mallorca.", all: "Todos", artists: "Artistas", formats: "Formatos", recent: "Más recientes", artist: "Artista", designs: "diseños", from: "Desde" },
    product: { eyebrow: "Fine Art Print · Mallorca", description: "Producimos este diseño en Mallorca y lo imprimimos cuidadosamente, en el formato elegido, sobre papel de alta calidad.", format: "Formato", selectFormatPrice: "Seleccionar formato", priceAfterSelection: "El precio aparece después de elegir el formato", totalPrice: "Precio total de la configuración elegida", from: "desde", frame: "Enmarcación", unframed: "Sin marco", standardFrame: "Marco estándar negro", aluminiumFrame: "Aluminio con cristal", customFrame: "Marco personalizado", frameColor: "Color del marco", realGlass: "Cristal auténtico", a6Unframed: "A6 está disponible únicamente sin marco.", colors: { silver: "Plata", black: "Negro", gold: "Oro" }, frameValues: { unframed: "Sin marco", standard: "Marco estándar negro", aluminium: "Aluminio con cristal auténtico", custom: "Marco personalizado de Art i Vases" }, customInfo: "Enmarcación individual realizada por Art i Vases en Artà. El perfil, el color, el paspartú y el cristal se eligen para cada obra.", request: "Solicitar enmarcación personalizada", cart: "Añadir a la cesta", technical: "Información técnica", product: "Producto", artist: "Artista", origin: "Origen", shipping: "Envío", shippingValue: "Directamente desde Mallorca" },
    footer: { privacy: "Privacidad", legal: "Aviso legal", returns: "Devoluciones" }
  }
} as const;
