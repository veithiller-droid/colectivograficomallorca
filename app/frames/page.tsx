"use client";

import SiteHeader from "../components/site-header";
import { useLanguage } from "../components/language-provider";

export default function FramesPage() {
  const { t } = useLanguage();
  return <main><SiteHeader/><section className="editorial-page frames-page shell"><p className="eyebrow">{t.frames.eyebrow}</p><h1>{t.frames.title}</h1><p className="frames-intro">{t.frames.intro}</p><div className="frame-grid">{t.frames.options.map((option, index) => <article key={option.title}><span>0{index + 1}</span><h2>{option.title}</h2><p>{option.text}</p></article>)}</div><section className="frame-partner"><div><p className="eyebrow">{t.frames.partnerEyebrow}</p><h2>{t.frames.partnerTitle}</h2></div><div><p>{t.frames.partnerText}</p><ul>{t.frames.details.map(detail => <li key={detail}>{detail}</li>)}</ul><a className="text-link" href="https://artivases.es" target="_blank" rel="noreferrer">{t.frames.partnerLink} ↗</a></div></section><p className="local-claim">{t.frames.claim}</p></section></main>;
}
