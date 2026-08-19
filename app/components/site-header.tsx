"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "./language-provider";

export default function SiteHeader() {
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [["/shop", t.nav.shop], ["/who-we-are", t.nav.who], ["/what-we-do", t.nav.what], ["/frames", t.nav.frames], ["/#newsletter", t.nav.newsletter]] as const;
  return <header className="nav shell">
    <Link className="brand" href="/" aria-label="Colectivo Gráfico Mallorca"><span>COLECTIVO</span><span>GRÁFICO</span><span>MALLORCA</span></Link>
    <button type="button" className="menu-toggle" aria-expanded={menuOpen} aria-controls="site-navigation" onClick={() => setMenuOpen(value => !value)}><span>{menuOpen ? "Schließen" : "Menü"}</span><i aria-hidden="true" /></button>
    <nav id="site-navigation" className={menuOpen ? "open" : ""} aria-label="Navigation">{links.map(([href, label]) => { const active = href !== "/#newsletter" && (pathname === href || pathname.startsWith(`${href}/`)); return <Link href={href} className={active ? "active" : ""} aria-current={active ? "page" : undefined} onClick={() => setMenuOpen(false)} key={href}>{label}</Link>; })}<div className="language-switch" aria-label="Sprache wählen"><button className={language === "de" ? "active" : ""} onClick={() => setLanguage("de")}>DE</button><span>/</span><button className={language === "es" ? "active" : ""} onClick={() => setLanguage("es")}>ES</button></div><button className="bag" aria-label={t.nav.bag}>{t.nav.bag} <b>0</b></button></nav>
  </header>;
}
