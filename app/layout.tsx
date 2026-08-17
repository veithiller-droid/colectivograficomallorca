import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "./components/language-provider";

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
  return <html lang="de"><body><LanguageProvider>{children}</LanguageProvider></body></html>;
}
