"use client";

import Link from "next/link";
import { useLanguage } from "./language-provider";

export default function SiteHeader() {
  const { language, setLanguage, t } = useLanguage();
  return <header className="nav shell">
    <Link className="brand" href="/" aria-label="Colectivo Gráfico Mallorca"><span>COLECTIVO</span><span>GRÁFICO</span><span>MALLORCA</span></Link>
    <nav aria-label="Navigation"><Link href="/shop">{t.nav.shop}</Link><Link href="/who-we-are">{t.nav.who}</Link><Link href="/what-we-do">{t.nav.what}</Link><Link href="/#newsletter">{t.nav.newsletter}</Link><div className="language-switch" aria-label="Sprache wählen"><button className={language === "de" ? "active" : ""} onClick={() => setLanguage("de")}>DE</button><span>/</span><button className={language === "es" ? "active" : ""} onClick={() => setLanguage("es")}>ES</button></div><button className="bag" aria-label={t.nav.bag}>{t.nav.bag} <b>0</b></button></nav>
  </header>;
}
