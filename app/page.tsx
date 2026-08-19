"use client";

import Link from "next/link";
import ParallaxGallery from "./components/parallax-gallery";
import NewArrivals from "./components/new-arrivals";
import SiteHeader from "./components/site-header";
import { useLanguage } from "./components/language-provider";

export default function Home() {
  const { t } = useLanguage();
  return <main>
    <SiteHeader />
    <section id="top" className="hero shell"><div className="hero-copy"><p className="eyebrow">{t.home.eyebrow}</p><h1>{t.home.title1}<br/><i>{t.home.title2}</i></h1><p className="intro">{t.home.intro}</p><a className="cta" href="#obra">{t.home.cta} <span>↘</span></a></div><div className="hero-art" aria-label="Mediterrane grafische Komposition"><div className="sun"/><div className="arch"/><div className="sea"/><div className="leaf leaf-one"/><div className="leaf leaf-two"/><span className="edition">Edición<br/>01—26</span></div></section>
    <div id="obra"><ParallaxGallery /></div>
    <NewArrivals />
    <section id="colectivo" className="manifesto shell"><p className="eyebrow">{t.home.whoEyebrow}</p><p className="statement">{t.home.whoTitle}</p><div className="manifesto-foot"><p>{t.home.whoText}</p><Link href="/who-we-are">{t.home.whoLink} →</Link></div></section>
    <section id="que-hacemos" className="what-we-do"><div className="shell"><p className="eyebrow">{t.home.whatEyebrow}</p><div className="what-grid"><h2>{t.home.whatTitle}</h2><div><p>{t.home.whatText1}</p><p>{t.home.whatText2}</p><Link className="text-link" href="/what-we-do">{t.nav.what} →</Link></div></div></div></section>
    <section id="newsletter" className="newsletter"><div className="shell newsletter-inner"><div><p className="eyebrow">{t.home.newsletterEyebrow}</p><h2>{t.home.newsletterTitle}</h2></div><form><label htmlFor="email">{t.home.newsletterLabel}</label><div><input id="email" name="email" type="email" autoComplete="email" placeholder={t.home.newsletterPlaceholder} required/><button type="submit">{t.home.newsletterButton} →</button></div><small>{t.home.newsletterSmall}</small></form></div></section>
    <footer className="shell"><div className="brand"><span>COLECTIVO</span><span>GRÁFICO</span><span>MALLORCA</span></div><p><Link href="/privacy">{t.footer.privacy}</Link> · <Link href="/legal">{t.footer.legal}</Link></p><p>Artà · Mallorca · © 2026</p></footer>
  </main>;
}
