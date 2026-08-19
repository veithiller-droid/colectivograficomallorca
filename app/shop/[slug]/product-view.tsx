"use client";

import { useEffect, useRef, useState, type TouchEvent } from "react";
import { useRouter } from "next/navigation";
import type { Product, PrintFormat } from "../../data/products";
import { formatPrices } from "../../data/products";
import { useLanguage } from "../../components/language-provider";

type FrameType = "unframed" | "standard" | "aluminium" | "custom";
type FrameColor = "silver" | "black" | "gold";
const frameSurcharges: Record<Exclude<FrameType, "unframed">, Partial<Record<PrintFormat, number>>> = {
  standard: { A4: 10, A3: 18, A2: 34 },
  aluminium: { A4: 35, A3: 48, A2: 65 },
  custom: { A4: 45, A3: 60, A2: 70 },
};

type ProductViewProps = {
  product: Product;
  previousProduct: Product;
  nextProduct: Product;
};

const artistTransitionKey = "cgm-artist-transition";

export default function ProductView({ product, previousProduct, nextProduct }: ProductViewProps) {
  const router = useRouter();
  const [format, setFormat] = useState<PrintFormat | null>(null);
  const [frame, setFrame] = useState<FrameType>("unframed");
  const [frameColor, setFrameColor] = useState<FrameColor>("silver");
  const [activeImage, setActiveImage] = useState(product.image);
  const [artistTransition, setArtistTransition] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const artist = window.sessionStorage.getItem(artistTransitionKey);
    if (!artist) return;
    window.sessionStorage.removeItem(artistTransitionKey);
    setArtistTransition(artist);
    const timer = window.setTimeout(() => setArtistTransition(null), 2000);
    return () => window.clearTimeout(timer);
  }, []);

  const navigateTo = (target: Product) => {
    if (target.artist !== product.artist) {
      window.sessionStorage.setItem(artistTransitionKey, target.artist);
    }
    router.push(`/shop/${target.slug}`);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") navigateTo(previousProduct);
      if (event.key === "ArrowRight") navigateTo(nextProduct);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const onTouchStart = (event: TouchEvent<HTMLElement>) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null) return;
    const distance = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) < 60) return;
    navigateTo(distance > 0 ? previousProduct : nextProduct);
  };
  const frameAvailable = format !== null && format !== "A6";
  const surcharge = format && frame !== "unframed" ? frameSurcharges[frame][format] ?? 0 : 0;
  const totalPrice = format ? formatPrices[format] + surcharge : null;
  const chooseFormat = (nextFormat: PrintFormat) => {
    setFormat(nextFormat);
    if (nextFormat === "A6") setFrame("unframed");
  };
  return <>
    <button type="button" className="product-page-arrow product-page-arrow-left" onClick={() => navigateTo(previousProduct)} aria-label={`Previous: ${previousProduct.title}`}><span aria-hidden="true">&#8249;</span></button>
    <button type="button" className="product-page-arrow product-page-arrow-right" onClick={() => navigateTo(nextProduct)} aria-label={`Next: ${nextProduct.title}`}><span aria-hidden="true">&#8250;</span></button>
    {artistTransition && <div className="artist-transition" role="status" aria-live="polite"><span>{artistTransition}</span></div>}
    <section className="product-detail shell" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
    <div className="product-gallery"><div className="product-visual">{activeImage ? <img src={activeImage} alt={`${product.title} — ${product.artist}`} /> : <div className="product-placeholder product-placeholder-large" aria-label={`${product.title} Platzhalter`}><span className="placeholder-circle"/><span className="placeholder-line"/><b>{product.id.toUpperCase()}</b></div>}</div>{product.gallery.length > 1 && <div className="product-thumbnails" aria-label="Produktansichten">{product.gallery.map((image, index) => <button type="button" className={activeImage === image ? "active" : ""} onClick={() => setActiveImage(image)} key={`${product.id}-${index}`} aria-label={`Ansicht ${index + 1}`}>{image ? <img src={image} alt="" /> : <span className="thumbnail-placeholder">{product.id.toUpperCase()}</span>}</button>)}</div>}</div>
    <div className="product-info">
      <p className="eyebrow">{t.product.eyebrow}</p><h1>{product.title}</h1><p className="product-artist">{product.artist}</p>
      <p className="product-price">{totalPrice === null ? t.product.selectFormatPrice : <>{frame === "custom" && `${t.product.from} `}{totalPrice.toFixed(2).replace(".", ",")} €</>}</p>
      <p className="price-note">{format ? t.product.totalPrice : t.product.priceAfterSelection}</p>
      <p className="product-description">{t.product.description}</p>
      <fieldset className="format-picker"><legend>{t.product.format}</legend><div>{product.availableFormats.map(item => <button type="button" className={format === item ? "active" : ""} onClick={() => chooseFormat(item)} key={item}>{item}</button>)}</div></fieldset>
      <fieldset className="option-picker frame-picker"><legend>{t.product.frame}</legend><div className="option-grid">
        <button type="button" className={frame === "unframed" ? "active" : ""} onClick={() => setFrame("unframed")}>{t.product.unframed}</button>
        <button type="button" disabled={!frameAvailable} className={frame === "standard" ? "active" : ""} onClick={() => setFrame("standard")}>{t.product.standardFrame}</button>
        <button type="button" disabled={!frameAvailable} className={frame === "aluminium" ? "active" : ""} onClick={() => setFrame("aluminium")}>{t.product.aluminiumFrame}</button>
        <button type="button" disabled={!frameAvailable} className={frame === "custom" ? "active" : ""} onClick={() => setFrame("custom")}>{t.product.customFrame}</button>
      </div></fieldset>
      {format === "A6" && <p className="frame-availability">{t.product.a6Unframed}</p>}
      {frame === "aluminium" && <fieldset className="option-picker color-picker"><legend>{t.product.frameColor}</legend><div className="color-options">{(["silver", "black", "gold"] as FrameColor[]).map(color => <button type="button" className={frameColor === color ? "active" : ""} onClick={() => setFrameColor(color)} key={color}><span className={`color-dot ${color}`} />{t.product.colors[color]}</button>)}</div><p>{t.product.realGlass}</p></fieldset>}
      {frame === "custom" && <p className="custom-frame-note">{t.product.customInfo}</p>}
      <button className="add-to-cart" type="button" disabled={!format}>{frame === "custom" ? t.product.request : t.product.cart}</button>
      <div className="technical-info"><h2>{t.product.technical}</h2><dl><div><dt>{t.product.product}</dt><dd>Fine Art Print</dd></div><div><dt>{t.product.artist}</dt><dd>{product.artist}</dd></div><div><dt>{t.product.format}</dt><dd>{format ?? "–"}</dd></div><div><dt>{t.product.frame}</dt><dd>{frame === "aluminium" ? `${t.product.aluminiumFrame} · ${t.product.colors[frameColor]} · ${t.product.realGlass}` : t.product.frameValues[frame]}</dd></div><div><dt>{t.product.origin}</dt><dd>Made, selected and printed in Mallorca</dd></div><div><dt>{t.product.shipping}</dt><dd>{t.product.shippingValue}</dd></div></dl></div>
    </div>
    </section>
  </>;
}
