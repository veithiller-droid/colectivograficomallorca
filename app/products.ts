export const formatPrices = { A6: 3, A4: 15, A3: 28, A2: 46 } as const;
export type PrintFormat = keyof typeof formatPrices;

export const products = [
  { slug: "cena-en-arta", title: "Cena en Artà", artist: "Blanca Colina", image: "/images/products/blanca-colina-cena-en-arta.webp" },
  { slug: "por-la-tarde-en-arta", title: "Por la tarde en Artà", artist: "Blanca Colina", image: "/images/products/blanca-colina-por-la-tarde-en-arta.webp" },
  { slug: "colonia-de-sant-pere", title: "Colònia de Sant Pere", artist: "Herví Tille", image: "/images/products/hervi-tille-colonia-de-sant-pere.webp" },
  { slug: "mallorca-cycling", title: "Mallorca Cycling", artist: "Herví Tille", image: "/images/products/hervi-tille-mallorca-cycling.webp" },
] as const;

export type Product = (typeof products)[number];
