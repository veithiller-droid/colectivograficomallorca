"use client";

import { useState } from "react";
import type { Product, PrintFormat } from "../../data/products";
import { formatPrices } from "../../data/products";

const formats = Object.keys(formatPrices) as PrintFormat[];

export default function ProductView({ product }: { product: Product }) {
  const [format, setFormat] = useState<PrintFormat>("A6");
  return <section className="product-detail shell">
    <div className="product-visual"><img src={product.image} alt={`${product.title} — ${product.artist}`} /></div>
    <div className="product-info">
      <p className="eyebrow">Fine Art Print · Mallorca</p><h1>{product.title}</h1><p className="product-artist">{product.artist}</p>
      <p className="product-price">{formatPrices[format].toFixed(2).replace(".", ",")} €</p>
      <p className="product-description">Hochwertiger Kunstdruck, gestaltet, ausgewählt und auf Mallorca produziert. Das Motiv wird im gewählten Format sorgfältig auf hochwertigem Papier gedruckt.</p>
      <fieldset className="format-picker"><legend>Format</legend><div>{formats.map(item => <button type="button" className={format === item ? "active" : ""} onClick={() => setFormat(item)} key={item}>{item}</button>)}</div></fieldset>
      <button className="add-to-cart" type="button">In den Warenkorb</button>
      <div className="technical-info"><h2>Technische Informationen</h2><dl><div><dt>Produkt</dt><dd>Fine Art Print</dd></div><div><dt>Künstler</dt><dd>{product.artist}</dd></div><div><dt>Format</dt><dd>{format}</dd></div><div><dt>Herkunft</dt><dd>Made, selected and printed in Mallorca</dd></div><div><dt>Versand</dt><dd>Direkt aus Mallorca</dd></div></dl></div>
    </div>
  </section>;
}
