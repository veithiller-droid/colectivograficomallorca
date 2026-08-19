"use client";

import { useEffect, useState } from "react";
import { fetchHomepage, type HomepageImage } from "../data/products";

export default function HeroArt() {
  const [hero, setHero] = useState<HomepageImage | null>(null);
  useEffect(() => { fetchHomepage().then(content => setHero(content.hero)); }, []);
  if (hero) return <div className="hero-art hero-art-image"><img src={hero.path} alt={`${hero.title} — ${hero.artist}`} /></div>;
  return <div className="hero-art" aria-label="Mediterrane grafische Komposition"><div className="sun"/><div className="arch"/><div className="sea"/><div className="leaf leaf-one"/><div className="leaf leaf-two"/><span className="edition">Edición<br/>01—26</span></div>;
}
