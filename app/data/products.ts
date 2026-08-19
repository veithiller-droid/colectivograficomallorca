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
  availableFormats: readonly PrintFormat[];
  placeholder?: boolean;
};

const allFormats = Object.keys(formatPrices) as PrintFormat[];

const product = (
  id: string,
  slug: string,
  title: string,
  artist: string,
  roomImages: readonly string[] = [],
  availableFormats: readonly PrintFormat[] = allFormats,
): Product => {
  const image = asset(`${id}.webp`);
  return { id, slug, title, artist, image, gallery: [image, ...roomImages.map(asset)], availableFormats };
};

export const artistOrder = ["Blanca Colina", "Herví Tille", "Mateo Vilar", "Miquel Salat"] as const;

export const products: readonly Product[] = [
  product("cgm-bc001", "mercat-arta", "Mercat d’Artà", "Blanca Colina", ["cgm-bc001-room007-a2.webp"]),
  product("cgm-bc002", "higos-en-arta", "Higos en Artà", "Blanca Colina"),
  product("cgm-bc003", "cena-en-arta", "Cena en Artà", "Blanca Colina", ["cgm-bc003-room001-a2.webp"]),
  product("cgm-bc004", "por-la-tarde-en-arta", "Por la tarde en Artà", "Blanca Colina", ["cgm-bc004-room006-a3.webp"]),
  product("cgm-bc005", "siesta", "Siesta", "Blanca Colina", ["cgm-bc005-room002-a2.webp"]),

  product("cgm-ht001", "mallorca-arta", "Mallorca · Artà", "Herví Tille", ["cgm-ht001-room003-a2.webp"]),
  product("cgm-ht002", "mallorca-colonia-de-sant-pere", "Mallorca · Colònia de Sant Pere", "Herví Tille", ["cgm-ht002-room005-a2.webp", "cgm-ht001-room003-a2.webp"]),
  product("cgm-ht003", "mallorca-capdepera", "Mallorca · Capdepera", "Herví Tille"),
  product("cgm-ht004", "mallorca-palma", "Mallorca · Palma", "Herví Tille"),
  product("cgm-ht005", "mallorca-porto-cristo", "Mallorca · Porto Cristo", "Herví Tille", ["cgm-ht001-room003-a2.webp"]),
  product("cgm-ht006", "mallorca-pollenca", "Mallorca · Pollença", "Herví Tille", ["cgm-ht006-room002-a2.webp"]),
  product("cgm-ht007", "mallorca-soller", "Mallorca · Sóller", "Herví Tille"),
  product("cgm-ht008", "mallorca-son-servera", "Mallorca · Son Servera", "Herví Tille"),
  product("cgm-ht009", "sporting-mallorca-golf", "Sporting Mallorca · Golf", "Herví Tille"),
  product("cgm-ht010", "sporting-mallorca-tennis", "Sporting Mallorca · Tennis", "Herví Tille"),
  product("cgm-ht011", "sporting-mallorca-motorcycle", "Sporting Mallorca · Motorcycle", "Herví Tille"),
  product("cgm-ht012", "sporting-mallorca-cycling", "Sporting Mallorca · Cycling", "Herví Tille"),
  product("cgm-ht013", "sporting-mallorca-roadster", "Sporting Mallorca · Roadster", "Herví Tille"),
  product("cgm-ht014", "sporting-mallorca-free-diving", "Sporting Mallorca · Free Diving", "Herví Tille"),

  product("cgm-mv001", "fruites-de-mallorca-figues", "Fruites de Mallorca · Figues", "Mateo Vilar"),
  product("cgm-mv002", "fruites-de-mallorca-llimones", "Fruites de Mallorca · Llimones", "Mateo Vilar", ["cgm-mv004-room007-a2.webp"]),
  product("cgm-mv003", "fruites-de-mallorca-taronges", "Fruites de Mallorca · Taronges", "Mateo Vilar", ["cgm-mv004-room007-a2.webp"]),
  product("cgm-mv004", "fruites-de-mallorca-tomatigues", "Fruites de Mallorca · Tomàtigues", "Mateo Vilar"),

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

type ApiProduct = {
  id: string;
  slug: string;
  title: string;
  artist: { name: string };
  images: readonly { type: string; path: string }[];
  formats: readonly { format: string; available: boolean }[];
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://creative-perfection-production-3c6e.up.railway.app";

export async function fetchProducts(): Promise<readonly Product[]> {
  try {
    const response = await fetch(`${apiUrl}/api/public/products`);
    if (!response.ok) throw new Error(`Product API returned ${response.status}`);
    const payload = await response.json() as { products?: ApiProduct[] };
    if (!payload.products?.length) throw new Error("Product API returned no products");
    return payload.products.map(item => {
      const images = item.images.map(image => `${basePath}${image.path}`);
      const primary = item.images.findIndex(image => image.type === "primary");
      const gallery = primary > 0 ? [images[primary], ...images.filter((_, index) => index !== primary)] : images;
      return {
        id: item.id,
        slug: item.slug,
        title: item.title,
        artist: item.artist.name,
        image: gallery[0] ?? null,
        gallery: gallery.length ? gallery : [null],
        availableFormats: item.formats.filter(format => format.available && format.format in formatPrices).map(format => format.format as PrintFormat),
      };
    });
  } catch (error) {
    console.warn("Using bundled product catalog because the API is unavailable.", error);
    return products;
  }
}
