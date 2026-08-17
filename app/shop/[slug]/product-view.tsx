"use client";

import { useState } from "react";
import type { Product, PrintFormat } from "../../data/products";
import { formatPrices } from "../../data/products";
import { useLanguage } from "../../components/language-provider";

const formats = Object.keys(formatPrices) as PrintFormat[];

export default function ProductView({ product }: { product: Product }) {
  const [format, setFormat] = useState<PrintFormat>("A6");
  const [activeImage, setActiveImage] = useState(product.image);
  const { t } = useLanguage();
  return <section className="product-detail shell">
    <div className="product-gallery"><div className="product-visual"><img src={activeImage} alt={`${product.title} — ${product.artist}`} /></div>{product.gallery.length > 1 && <div className="product-thumbnails" aria-label="Produktansichten">{product.gallery.map((image, index) => <button type="button" className={activeImage === image ? "active" : ""} onClick={() => setActiveImage(image)} key={image} aria-label={`Ansicht ${index + 1}`}><img src={image} alt="" /></button>)}</div>}</div>
    <div className="product-info">
      <p className="eyebrow">{t.product.eyebrow}</p><h1>{product.title}</h1><p className="product-artist">{product.artist}</p>
      <p className="product-price">{formatPrices[format].toFixed(2).replace(".", ",")} €</p>
      <p className="product-description">{t.product.description}</p>
      <fieldset className="format-picker"><legend>{t.product.format}</legend><div>{formats.map(item => <button type="button" className={format === item ? "active" : ""} onClick={() => setFormat(item)} key={item}>{item}</button>)}</div></fieldset>
      <button className="add-to-cart" type="button">{t.product.cart}</button>
      <div className="technical-info"><h2>{t.product.technical}</h2><dl><div><dt>{t.product.product}</dt><dd>Fine Art Print</dd></div><div><dt>{t.product.artist}</dt><dd>{product.artist}</dd></div><div><dt>{t.product.format}</dt><dd>{format}</dd></div><div><dt>{t.product.origin}</dt><dd>Made, selected and printed in Mallorca</dd></div><div><dt>{t.product.shipping}</dt><dd>{t.product.shippingValue}</dd></div></dl></div>
    </div>
  </section>;
}
