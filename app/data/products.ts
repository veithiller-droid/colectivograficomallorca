export const formatPrices = { A6: 3, A4: 15, A3: 28, A2: 46 } as const;
export type PrintFormat = keyof typeof formatPrices;

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const asset = (name: string) => `${basePath}/images/products/${name}`;
const room = (number: number, name: string) => asset(`room${String(number).padStart(3, "0")}-${name}.webp`);

export type Product = {
  id: string;
  slug: string;
  title: string;
  artist: string;
  image: string | null;
  gallery: readonly (string | null)[];
  placeholder?: boolean;
};

const placeholder = (id: string, artist: string, roomImage?: string): Product => ({
  id,
  slug: id,
  title: `Motiv ${id.toUpperCase().replace("CGM-", "")}`,
  artist,
  image: null,
  gallery: roomImage ? [null, roomImage] : [null],
  placeholder: true,
});

export const artistOrder = ["Blanca Colina", "Herví Tille", "Sandra Engler", "Miquel Salat"] as const;

export const products: readonly Product[] = [
  { id: "cgm-bc001", slug: "cena-en-arta", title: "Cena en Artà", artist: "Blanca Colina", image: asset("blanca-colina-cena-en-arta.webp"), gallery: [asset("blanca-colina-cena-en-arta.webp")] },
  { id: "cgm-bc002", slug: "por-la-tarde-en-arta", title: "Por la tarde en Artà", artist: "Blanca Colina", image: asset("blanca-colina-por-la-tarde-en-arta.webp"), gallery: [asset("blanca-colina-por-la-tarde-en-arta.webp")] },
  { id: "cgm-bc003", slug: "mercat-arta", title: "Mercat d’Artà", artist: "Blanca Colina", image: asset("blanca-colina-mercat-arta-001.webp"), gallery: [asset("blanca-colina-mercat-arta-001.webp"), asset("blanca-colina-mercat-arta-room-001.webp")] },
  placeholder("cgm-bc004", "Blanca Colina"),
  placeholder("cgm-bc005", "Blanca Colina"),
  placeholder("cgm-bc006", "Blanca Colina", room(2, "finca")),
  placeholder("cgm-bc007", "Blanca Colina"),
  placeholder("cgm-bc008", "Blanca Colina"),

  { id: "cgm-ht001", slug: "taronges", title: "Taronges", artist: "Herví Tille", image: asset("hervi-tille-taronges-001.webp"), gallery: [asset("hervi-tille-taronges-001.webp"), room(3, "modern")] },
  { id: "cgm-ht002", slug: "palma", title: "Palma", artist: "Herví Tille", image: asset("hervi-tille-palma-001.webp"), gallery: [asset("hervi-tille-palma-001.webp")] },
  { id: "cgm-ht003", slug: "colonia-de-sant-pere", title: "Colònia de Sant Pere", artist: "Herví Tille", image: asset("hervi-tille-colonia-de-sant-pere.webp"), gallery: [asset("hervi-tille-colonia-de-sant-pere.webp")] },
  { id: "cgm-ht004", slug: "mallorca-cycling", title: "Mallorca Cycling", artist: "Herví Tille", image: asset("hervi-tille-mallorca-cycling.webp"), gallery: [asset("hervi-tille-mallorca-cycling.webp"), room(4, "eclectic")] },
  placeholder("cgm-ht005", "Herví Tille"),
  placeholder("cgm-ht006", "Herví Tille"),
  placeholder("cgm-ht007", "Herví Tille", room(5, "hallway")),
  placeholder("cgm-ht008", "Herví Tille"),

  placeholder("cgm-se001", "Sandra Engler"),
  placeholder("cgm-se002", "Sandra Engler", room(6, "desk")),
  placeholder("cgm-se003", "Sandra Engler"),
  placeholder("cgm-se004", "Sandra Engler"),
  placeholder("cgm-se005", "Sandra Engler", room(7, "kitchen")),
  placeholder("cgm-se006", "Sandra Engler"),
  placeholder("cgm-se007", "Sandra Engler"),

  { id: "cgm-ms001", slug: "sardines-on-tour-bus", title: "Sardines on Tour · Bus", artist: "Miquel Salat", image: asset("miquel-salat-sardines-on-tour-bus-001.webp"), gallery: [asset("miquel-salat-sardines-on-tour-bus-001.webp"), room(1, "scandinavian")] },
  { id: "cgm-ms002", slug: "sardines-on-tour-boat", title: "Sardines on Tour · Boat", artist: "Miquel Salat", image: asset("miquel-salat-sardines-on-tour-boat-001.webp"), gallery: [asset("miquel-salat-sardines-on-tour-boat-001.webp")] },
  placeholder("cgm-ms003", "Miquel Salat"),
  placeholder("cgm-ms004", "Miquel Salat", room(2, "finca")),
  placeholder("cgm-ms005", "Miquel Salat"),
  placeholder("cgm-ms006", "Miquel Salat"),
  placeholder("cgm-ms007", "Miquel Salat", room(3, "modern")),
];

export const productsByArtist = artistOrder.map(artist => ({
  artist,
  products: products.filter(product => product.artist === artist),
}));
