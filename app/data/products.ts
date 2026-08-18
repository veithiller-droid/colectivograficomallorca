export const formatPrices = { A6: 3, A4: 15, A3: 28, A2: 46 } as const;
export type PrintFormat = keyof typeof formatPrices;

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const asset = (name: string) => `${basePath}/images/products/${name}`;

export type Product = {
  id: string;
  slug: string;
  title: string;
  artist: string;
  image: string | null;
  gallery: readonly (string | null)[];
  placeholder?: boolean;
};

const product = (
  id: string,
  slug: string,
  title: string,
  artist: string,
  roomImages: readonly string[] = [],
): Product => {
  const image = asset(`${id}.webp`);
  return { id, slug, title, artist, image, gallery: [image, ...roomImages.map(asset)] };
};

const placeholder = (id: string, artist: string): Product => ({
  id,
  slug: id,
  title: `Motiv ${id.toUpperCase().replace("CGM-", "")}`,
  artist,
  image: null,
  gallery: [null],
  placeholder: true,
});

export const artistOrder = ["Blanca Colina", "Herví Tille", "Mateo Vilar", "Miquel Salat"] as const;

export const products: readonly Product[] = [
  product("cgm-bc001", "mercat-arta", "Mercat d’Artà", "Blanca Colina", ["cgm-bc001-room007-a2.webp"]),
  product("cgm-bc002", "higos-en-arta", "Higos en Artà", "Blanca Colina"),
  product("cgm-bc003", "cena-en-arta", "Cena en Artà", "Blanca Colina", ["cgm-bc003-room001-a2.webp"]),
  product("cgm-bc004", "por-la-tarde-en-arta", "Por la tarde en Artà", "Blanca Colina", ["cgm-bc004-room006-a3.webp"]),
  product("cgm-bc005", "siesta", "Siesta", "Blanca Colina", ["cgm-bc005-room002-a2.webp"]),
  placeholder("cgm-bc006", "Blanca Colina"),
  placeholder("cgm-bc007", "Blanca Colina"),
  placeholder("cgm-bc008", "Blanca Colina"),

  product("cgm-ht001", "mallorca-arta", "Mallorca · Artà", "Herví Tille", ["cgm-ht001-room003-a2.webp"]),
  product("cgm-ht002", "mallorca-colonia-de-sant-pere", "Mallorca · Colònia de Sant Pere", "Herví Tille", ["cgm-ht002-room005-a2.webp", "cgm-ht001-room003-a2.webp"]),
  product("cgm-ht003", "mallorca-capdepera", "Mallorca · Capdepera", "Herví Tille"),
  product("cgm-ht004", "mallorca-palma", "Mallorca · Palma", "Herví Tille"),
  product("cgm-ht005", "mallorca-porto-cristo", "Mallorca · Porto Cristo", "Herví Tille", ["cgm-ht001-room003-a2.webp"]),
  product("cgm-ht006", "mallorca-pollenca", "Mallorca · Pollença", "Herví Tille", ["cgm-ht006-room002-a2.webp"]),
  product("cgm-ht007", "mallorca-soller", "Mallorca · Sóller", "Herví Tille"),
  product("cgm-ht008", "mallorca-son-servera", "Mallorca · Son Servera", "Herví Tille"),

  product("cgm-mv001", "fruites-de-mallorca-figues", "Fruites de Mallorca · Figues", "Mateo Vilar"),
  product("cgm-mv002", "fruites-de-mallorca-llimones", "Fruites de Mallorca · Llimones", "Mateo Vilar", ["cgm-mv004-room007-a2.webp"]),
  product("cgm-mv003", "fruites-de-mallorca-taronges", "Fruites de Mallorca · Taronges", "Mateo Vilar", ["cgm-mv004-room007-a2.webp"]),
  product("cgm-mv004", "fruites-de-mallorca-tomatigues", "Fruites de Mallorca · Tomàtigues", "Mateo Vilar"),
  placeholder("cgm-mv005", "Mateo Vilar"),
  placeholder("cgm-mv006", "Mateo Vilar"),

  product("cgm-ms001", "sardines-on-tour-bus", "Sardines on Tour · Bus", "Miquel Salat"),
  product("cgm-ms002", "sardines-on-tour-plane", "Sardines on Tour · Plane", "Miquel Salat", ["cgm-ms002-room006-a4.webp"]),
  product("cgm-ms003", "sardines-on-tour-car", "Sardines on Tour · Car", "Miquel Salat"),
  product("cgm-ms004", "sardines-on-tour-boat", "Sardines on Tour · Boat", "Miquel Salat", ["cgm-ms002-room006-a4.webp"]),
  product("cgm-ms005", "sardines-on-tour-tram", "Sardines on Tour · Tram", "Miquel Salat"),
  product("cgm-ms006", "sardines-on-tour-vespa", "Sardines on Tour · Vespa", "Miquel Salat"),
  product("cgm-ms007", "sardines-on-tour-balloon", "Sardines on Tour · Balloon", "Miquel Salat"),
  product("cgm-ms008", "sardines-on-tour-tin", "Sardines on Tour · Tin", "Miquel Salat"),
];

export const productsByArtist = artistOrder.map(artist => ({
  artist,
  products: products.filter(productItem => productItem.artist === artist),
}));
