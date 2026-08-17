"use client";

import Link from "next/link";
import SiteHeader from "../components/site-header";
import { products } from "../data/products";
import { useLanguage } from "../components/language-provider";

export default function ShopPage() {
  const { t } = useLanguage();
  return <main><SiteHeader />
    <section className="shop-intro shell"><p className="eyebrow">{t.shop.eyebrow}</p><h1>{t.shop.title}</h1><p>{t.shop.intro}</p></section>
    <section className="catalog-controls shell" aria-label="Filter"><button>{t.shop.all} <span>{products.length}</span></button><button>{t.shop.artists}</button><button>{t.shop.formats}</button><select aria-label="Sortierung" defaultValue="recent"><option value="recent">{t.shop.recent}</option><option value="artist">{t.shop.artist}</option></select></section>
    <section className="catalog shell" aria-label="Produkte">{products.map(item => <Link className="catalog-card" href={`/shop/${item.slug}`} key={item.slug}><div className="catalog-image"><img src={item.image} alt={`${item.title} — ${item.artist}`} /></div><div className="catalog-meta"><div><h2>{item.title}</h2><p>{item.artist}</p></div><span>{t.shop.from} 3 €</span></div></Link>)}</section>
  </main>;
}
