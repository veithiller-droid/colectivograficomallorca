"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { fetchNewProducts, type Product } from "../data/products";
import { useLanguage } from "./language-provider";

export default function NewArrivals() {
  const { t } = useLanguage();
  const [items, setItems] = useState<readonly Product[]>([]);
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => { fetchNewProducts().then(setItems); }, []);
  if (!items.length) return null;
  const move = (direction: number) => track.current?.scrollBy({ left: direction * Math.min(520, window.innerWidth * .75), behavior:"smooth" });
  return <section className="new-arrivals shell" aria-labelledby="new-arrivals-title">
    <header><div><p className="eyebrow">{t.home.newEyebrow}</p><h2 id="new-arrivals-title">{t.home.newTitle}</h2></div><div className="arrival-actions"><button onClick={() => move(-1)} aria-label="Zurück">←</button><button onClick={() => move(1)} aria-label="Weiter">→</button></div></header>
    <div className="arrival-track" ref={track}>{items.map(item => <Link href={`/shop/${item.slug}`} className="arrival-card" key={item.id}><div><img src={item.image!} alt={`${item.title} — ${item.artist}`} /></div><h3>{item.title}</h3><p>{item.artist}</p></Link>)}</div>
    <Link className="arrival-all" href="/shop">{t.home.newLink} →</Link>
  </section>;
}
