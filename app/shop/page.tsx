"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SiteHeader from "../components/site-header";
import { artistOrder, fetchProducts, products, type Product } from "../data/products";
import { useLanguage } from "../components/language-provider";

export default function ShopPage() {
  const { t } = useLanguage();
  const [catalogProducts, setCatalogProducts] = useState<readonly Product[]>(products);
  useEffect(() => { void fetchProducts().then(setCatalogProducts); }, []);
  const productsByArtist = artistOrder.map(artist => ({ artist, products: catalogProducts.filter(item => item.artist === artist) })).filter(group => group.products.length > 0);
  return <main><SiteHeader />
    <section className="shop-intro shell"><p className="eyebrow">{t.shop.eyebrow}</p><h1>{t.shop.title}</h1><p>{t.shop.intro}</p></section>
    <section className="catalog-controls shell" aria-label="Filter"><button>{t.shop.all} <span>{catalogProducts.length}</span></button><button>{t.shop.artists}</button><button>{t.shop.formats}</button><select aria-label="Sortierung" defaultValue="recent"><option value="recent">{t.shop.recent}</option><option value="artist">{t.shop.artist}</option></select></section>
    <div className="artist-catalogs shell">{productsByArtist.map(group => <section className="artist-catalog" aria-labelledby={`artist-${group.artist.replaceAll(" ", "-")}`} key={group.artist}><header><h2 id={`artist-${group.artist.replaceAll(" ", "-")}`}>{group.artist}</h2><span>{group.products.length} {t.shop.designs}</span></header><div className="catalog">{group.products.map(item => <Link className="catalog-card" href={`/shop/${item.slug}`} key={item.id}><div className="catalog-image">{item.image ? <img src={item.image} alt={`${item.title} — ${item.artist}`} /> : <div className="product-placeholder" aria-label={`${item.title} Platzhalter`}><span className="placeholder-circle"/><span className="placeholder-line"/><b>{item.id.toUpperCase()}</b></div>}</div><div className="catalog-meta"><div><h3>{item.title}</h3><p>{item.artist}</p></div><span>{t.shop.from} 3 €</span></div></Link>)}</div></section>)}</div>
  </main>;
}
