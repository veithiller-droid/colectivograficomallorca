"use client";
import SiteHeader from "../components/site-header";
import { useLanguage } from "../components/language-provider";
export default function Privacy(){const {language,t}=useLanguage();return <main><SiteHeader/><section className="text-page shell"><p className="eyebrow">Legal</p><h1>{t.footer.privacy}</h1><p>{language==="de"?"Die vollständige Datenschutzerklärung wird vor dem Verkaufsstart ergänzt.":"La política de privacidad completa se añadirá antes del inicio de las ventas."}</p></section></main>}
