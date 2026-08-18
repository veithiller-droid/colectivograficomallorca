"use client";

import SiteHeader from "../components/site-header";
import { useLanguage } from "../components/language-provider";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const artists = [
  { name: "Blanca Colina", image: `${basePath}/images/artists/blanca-colina.webp` },
  { name: "Herví Tille", image: `${basePath}/images/artists/hervi-tille.webp` },
  { name: "Mateo Vilar", image: `${basePath}/images/artists/mateo-vilar.webp` },
  { name: "Miquel Salat", image: `${basePath}/images/artists/miquel-salat.webp` },
];

export default function WhoWeAre() {
  const { t } = useLanguage();
  return <main><SiteHeader/><section className="editorial-page shell"><p className="eyebrow">{t.who.eyebrow}</p><h1>{t.who.title}</h1><div className="editorial-copy">{t.who.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div><h2>{t.who.artistsTitle}</h2><div className="artist-grid">{artists.map(artist => <article key={artist.name}><div className="artist-portrait"><img src={artist.image} alt={`Künstlerporträt ${artist.name}`} /></div><h3>{artist.name}</h3>{artist.name === "Blanca Colina" ? <p className="artist-bio">{t.who.blancaBio}</p> : <p>{t.who.artistPlaceholder}</p>}</article>)}</div></section></main>;
}
