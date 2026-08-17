import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Colectivo Gráfico Mallorca",
  description: "Obra gráfica creada en Mallorca. Ediciones de artistas de la isla.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <html lang="es"><body>{children}</body></html>;
}
