"use client";

import SiteHeader from "../components/site-header";
import { useLanguage } from "../components/language-provider";

const artists = ["Blanca Colina", "Herví Tille", "Sandra Engler", "Miquel Salat"];

export default function WhoWeAre() {
  const { t } = useLanguage();
  return <main><SiteHeader/><section className="editorial-page shell"><p className="eyebrow">{t.who.eyebrow}</p><h1>{t.who.title}</h1><div className="editorial-copy">{t.who.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div><h2>{t.who.artistsTitle}</h2><div className="artist-grid">{artists.map(name => <article key={name}><div className="artist-placeholder" aria-hidden="true"/><h3>{name}</h3><p>{t.who.artistPlaceholder}</p></article>)}</div></section></main>;
}
