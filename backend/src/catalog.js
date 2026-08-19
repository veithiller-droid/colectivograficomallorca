export const artists = [
  { id: "bc", name: "Blanca Colina", sortOrder: 1 },
  { id: "ht", name: "Herví Tille", sortOrder: 2 },
  { id: "mv", name: "Mateo Vilar", sortOrder: 3 },
  { id: "ms", name: "Miquel Salat", sortOrder: 4 },
];

const formats = ["A6", "A4", "A3", "A2"];
const prices = { A6: 300, A4: 1500, A3: 2800, A2: 4600 };
const item = (id, slug, title, artistId, rooms = [], availableFormats = formats) => ({
  id, slug, title, artistId, primaryImage: `/images/products/${id}.webp`, rooms,
  formats: availableFormats.map(format => ({ format, priceCents: prices[format], available: true })),
});

export const products = [
  item("cgm-bc001", "mercat-arta", "Mercat d’Artà", "bc", ["cgm-bc001-room007-a2.webp"]),
  item("cgm-bc002", "higos-en-arta", "Higos en Artà", "bc"),
  item("cgm-bc003", "cena-en-arta", "Cena en Artà", "bc", ["cgm-bc003-room001-a2.webp"]),
  item("cgm-bc004", "por-la-tarde-en-arta", "Por la tarde en Artà", "bc", ["cgm-bc004-room006-a3.webp"]),
  item("cgm-bc005", "siesta", "Siesta", "bc", ["cgm-bc005-room002-a2.webp"]),
  item("cgm-ht001", "mallorca-arta", "Mallorca · Artà", "ht", ["cgm-ht001-room003-a2.webp"]),
  item("cgm-ht002", "mallorca-colonia-de-sant-pere", "Mallorca · Colònia de Sant Pere", "ht", ["cgm-ht002-room005-a2.webp", "cgm-ht001-room003-a2.webp"]),
  item("cgm-ht003", "mallorca-capdepera", "Mallorca · Capdepera", "ht"),
  item("cgm-ht004", "mallorca-palma", "Mallorca · Palma", "ht"),
  item("cgm-ht005", "mallorca-porto-cristo", "Mallorca · Porto Cristo", "ht", ["cgm-ht001-room003-a2.webp"]),
  item("cgm-ht006", "mallorca-pollenca", "Mallorca · Pollença", "ht", ["cgm-ht006-room002-a2.webp"]),
  item("cgm-ht007", "mallorca-soller", "Mallorca · Sóller", "ht"),
  item("cgm-ht008", "mallorca-son-servera", "Mallorca · Son Servera", "ht"),
  item("cgm-ht009", "sporting-mallorca-golf", "Sporting Mallorca · Golf", "ht"),
  item("cgm-ht010", "sporting-mallorca-tennis", "Sporting Mallorca · Tennis", "ht"),
  item("cgm-ht011", "sporting-mallorca-motorcycle", "Sporting Mallorca · Motorcycle", "ht"),
  item("cgm-ht012", "sporting-mallorca-cycling", "Sporting Mallorca · Cycling", "ht"),
  item("cgm-ht013", "sporting-mallorca-roadster", "Sporting Mallorca · Roadster", "ht"),
  item("cgm-ht014", "sporting-mallorca-free-diving", "Sporting Mallorca · Free Diving", "ht"),
  item("cgm-mv001", "fruites-de-mallorca-figues", "Fruites de Mallorca · Figues", "mv"),
  item("cgm-mv002", "fruites-de-mallorca-llimones", "Fruites de Mallorca · Llimones", "mv", ["cgm-mv004-room007-a2.webp"]),
  item("cgm-mv003", "fruites-de-mallorca-taronges", "Fruites de Mallorca · Taronges", "mv", ["cgm-mv004-room007-a2.webp"]),
  item("cgm-mv004", "fruites-de-mallorca-tomatigues", "Fruites de Mallorca · Tomàtigues", "mv"),
  item("cgm-ms001", "sardines-on-tour-bus", "Sardines on Tour · Bus", "ms"),
  item("cgm-ms002", "sardines-on-tour-plane", "Sardines on Tour · Plane", "ms", ["cgm-ms002-room006-a4.webp"]),
  item("cgm-ms003", "sardines-on-tour-car", "Sardines on Tour · Car", "ms"),
  item("cgm-ms004", "sardines-on-tour-boat", "Sardines on Tour · Boat", "ms", ["cgm-ms002-room006-a4.webp"]),
  item("cgm-ms005", "sardines-on-tour-tram", "Sardines on Tour · Tram", "ms"),
  item("cgm-ms006", "sardines-on-tour-vespa", "Sardines on Tour · Vespa", "ms"),
  item("cgm-ms007", "sardines-on-tour-balloon", "Sardines on Tour · Balloon", "ms"),
  item("cgm-ms008", "sardines-on-tour-tin", "Sardines on Tour · Tin", "ms"),
];

export const frames = [
  { id: "unframed", de: "Ungerahmt", es: "Sin marco", material: "none", glazing: "none", color: null, custom: false, prices: { A4: 0, A3: 0, A2: 0 } },
  { id: "standard-black", de: "Standardrahmen Schwarz", es: "Marco estándar negro", material: "wood", glazing: "plexiglass", color: "black", custom: false, prices: { A4: 1000, A3: 1800, A2: 3400 } },
  { id: "aluminium-silver", de: "Aluminium Silber", es: "Aluminio plata", material: "aluminium", glazing: "real-glass", color: "silver", custom: true, prices: { A4: 3500, A3: 4800, A2: 6500 } },
  { id: "aluminium-black", de: "Aluminium Schwarz", es: "Aluminio negro", material: "aluminium", glazing: "real-glass", color: "black", custom: true, prices: { A4: 3500, A3: 4800, A2: 6500 } },
  { id: "aluminium-gold", de: "Aluminium Gold", es: "Aluminio oro", material: "aluminium", glazing: "real-glass", color: "gold", custom: true, prices: { A4: 3500, A3: 4800, A2: 6500 } },
  { id: "custom", de: "Individueller Rahmen", es: "Marco personalizado", material: "custom", glazing: "real-glass", color: null, custom: true, prices: { A4: 4500, A3: 6000, A2: 7000 } },
];
