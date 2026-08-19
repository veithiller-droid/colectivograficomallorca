"use client";
import SiteHeader from "../components/site-header";
import { useLanguage } from "../components/language-provider";
export default function Legal(){const {language,t}=useLanguage();return <main><SiteHeader/><section className="text-page shell"><p className="eyebrow">Legal</p><h1>{t.footer.legal}</h1><p>{language==="de"?"Die vollständigen Unternehmensangaben werden vor dem Verkaufsstart ergänzt.":"Los datos completos de la empresa se añadirán antes del inicio de las ventas."}</p></section></main>}
