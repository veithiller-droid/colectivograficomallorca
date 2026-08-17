"use client";

import SiteHeader from "../components/site-header";
import { useLanguage } from "../components/language-provider";

export default function WhatWeDo() {
  const { t } = useLanguage();
  return <main><SiteHeader/><section className="editorial-page shell"><p className="eyebrow">{t.what.eyebrow}</p><h1>{t.what.title}</h1><div className="editorial-copy">{t.what.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div><p className="local-claim">{t.what.claim}</p></section></main>;
}
