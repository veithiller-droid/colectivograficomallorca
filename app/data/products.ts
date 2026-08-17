export const formatPrices = { A6: 3, A4: 15, A3: 28, A2: 46 } as const;
export type PrintFormat = keyof typeof formatPrices;

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const asset = (name: string) => `${basePath}/images/products/${name}`;

export type Product = {
  slug: string;
  title: string;
  artist: string;
  image: string;
  gallery: readonly string[];
};

export const products: readonly Product[] = [
  { slug: "cena-en-arta", title: "Cena en Artà", artist: "Blanca Colina", image: asset("blanca-colina-cena-en-arta.webp"), gallery: [asset("blanca-colina-cena-en-arta.webp")] },
  { slug: "por-la-tarde-en-arta", title: "Por la tarde en Artà", artist: "Blanca Colina", image: asset("blanca-colina-por-la-tarde-en-arta.webp"), gallery: [asset("blanca-colina-por-la-tarde-en-arta.webp")] },
  { slug: "mercat-arta", title: "Mercat d’Artà", artist: "Blanca Colina", image: asset("blanca-colina-mercat-arta-001.webp"), gallery: [asset("blanca-colina-mercat-arta-001.webp"), asset("blanca-colina-mercat-arta-room-001.webp")] },
  { slug: "taronges", title: "Taronges", artist: "Herví Tille", image: asset("hervi-tille-taronges-001.webp"), gallery: [asset("hervi-tille-taronges-001.webp")] },
  { slug: "palma", title: "Palma", artist: "Herví Tille", image: asset("hervi-tille-palma-001.webp"), gallery: [asset("hervi-tille-palma-001.webp")] },
  { slug: "sardines-on-tour-bus", title: "Sardines on Tour · Bus", artist: "Miquel Salat", image: asset("miquel-salat-sardines-on-tour-bus-001.webp"), gallery: [asset("miquel-salat-sardines-on-tour-bus-001.webp")] },
  { slug: "sardines-on-tour-boat", title: "Sardines on Tour · Boat", artist: "Miquel Salat", image: asset("miquel-salat-sardines-on-tour-boat-001.webp"), gallery: [asset("miquel-salat-sardines-on-tour-boat-001.webp")] },
  { slug: "colonia-de-sant-pere", title: "Colònia de Sant Pere", artist: "Herví Tille", image: asset("hervi-tille-colonia-de-sant-pere.webp"), gallery: [asset("hervi-tille-colonia-de-sant-pere.webp")] },
  { slug: "mallorca-cycling", title: "Mallorca Cycling", artist: "Herví Tille", image: asset("hervi-tille-mallorca-cycling.webp"), gallery: [asset("hervi-tille-mallorca-cycling.webp")] },
];
