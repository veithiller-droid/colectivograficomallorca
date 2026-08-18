"use client";

import { useState } from "react";
import type { Product, PrintFormat } from "../../data/products";
import { formatPrices } from "../../data/products";
import { useLanguage } from "../../components/language-provider";

const formats = Object.keys(formatPrices) as PrintFormat[];
type FrameType = "unframed" | "standard" | "aluminium" | "custom";
type FrameColor = "silver" | "black" | "gold";

export default function ProductView({ product }: { product: Product }) {
  const [format, setFormat] = useState<PrintFormat>("A6");
  const [frame, setFrame] = useState<FrameType>("unframed");
  const [frameColor, setFrameColor] = useState<FrameColor>("silver");
  const [activeImage, setActiveImage] = useState(product.image);
  const { t } = useLanguage();
  return <section className="product-detail shell">
    <div className="product-gallery"><div className="product-visual"><img src={activeImage} alt={`${product.title} — ${product.artist}`} /></div>{product.gallery.length > 1 && <div className="product-thumbnails" aria-label="Produktansichten">{product.gallery.map((image, index) => <button type="button" className={activeImage === image ? "active" : ""} onClick={() => setActiveImage(image)} key={image} aria-label={`Ansicht ${index + 1}`}><img src={image} alt="" /></button>)}</div>}</div>
    <div className="product-info">
      <p className="eyebrow">{t.product.eyebrow}</p><h1>{product.title}</h1><p className="product-artist">{product.artist}</p>
      <p className="product-price">{formatPrices[format].toFixed(2).replace(".", ",")} €</p>
      <p className="price-note">{t.product.printPrice}</p>
      <p className="product-description">{t.product.description}</p>
      <fieldset className="format-picker"><legend>{t.product.format}</legend><div>{formats.map(item => <button type="button" className={format === item ? "active" : ""} onClick={() => setFormat(item)} key={item}>{item}</button>)}</div></fieldset>
      <fieldset className="option-picker frame-picker"><legend>{t.product.frame}</legend><div className="option-grid">
        <button type="button" className={frame === "unframed" ? "active" : ""} onClick={() => setFrame("unframed")}>{t.product.unframed}</button>
        <button type="button" className={frame === "standard" ? "active" : ""} onClick={() => setFrame("standard")}>{t.product.standardFrame}</button>
        <button type="button" className={frame === "aluminium" ? "active" : ""} onClick={() => setFrame("aluminium")}>{t.product.aluminiumFrame}</button>
        <button type="button" className={frame === "custom" ? "active" : ""} onClick={() => setFrame("custom")}>{t.product.customFrame}</button>
      </div></fieldset>
      {frame === "aluminium" && <fieldset className="option-picker color-picker"><legend>{t.product.frameColor}</legend><div className="color-options">{(["silver", "black", "gold"] as FrameColor[]).map(color => <button type="button" className={frameColor === color ? "active" : ""} onClick={() => setFrameColor(color)} key={color}><span className={`color-dot ${color}`} />{t.product.colors[color]}</button>)}</div><p>{t.product.realGlass}</p></fieldset>}
      {frame === "custom" && <p className="custom-frame-note">{t.product.customInfo}</p>}
      <button className="add-to-cart" type="button">{frame === "custom" ? t.product.request : t.product.cart}</button>
      <div className="technical-info"><h2>{t.product.technical}</h2><dl><div><dt>{t.product.product}</dt><dd>Fine Art Print</dd></div><div><dt>{t.product.artist}</dt><dd>{product.artist}</dd></div><div><dt>{t.product.format}</dt><dd>{format}</dd></div><div><dt>{t.product.frame}</dt><dd>{frame === "aluminium" ? `${t.product.aluminiumFrame} · ${t.product.colors[frameColor]} · ${t.product.realGlass}` : t.product.frameValues[frame]}</dd></div><div><dt>{t.product.origin}</dt><dd>Made, selected and printed in Mallorca</dd></div><div><dt>{t.product.shipping}</dt><dd>{t.product.shippingValue}</dd></div></dl></div>
    </div>
  </section>;
}
