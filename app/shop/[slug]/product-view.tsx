"use client";

import { useEffect, useRef, useState, type FormEvent, type TouchEvent } from "react";
import { useRouter } from "next/navigation";
import type { Product, PrintFormat } from "../../data/products";
import { fetchProducts, formatPrices } from "../../data/products";
import { useLanguage } from "../../components/language-provider";
import { useCart, type CartFrame } from "../../components/cart-provider";

type FrameType = "unframed" | "standard" | "aluminium" | "custom";
type FrameColor = "silver" | "black" | "gold";
const frameSurcharges: Record<Exclude<FrameType, "unframed">, Partial<Record<PrintFormat, number>>> = {
  standard: { A4: 10, A3: 18, A2: 34 },
  aluminium: { A4: 35, A3: 48, A2: 65 },
  custom: { A4: 45, A3: 60, A2: 70 },
};

type ProductViewProps = {
  requestedSlug: string;
  product: Product;
  previousProduct: Product;
  nextProduct: Product;
};

const artistTransitionKey = "cgm-artist-transition";

const formatLabel = (format: PrintFormat, language: "de" | "es") => ({
  A6: language === "es" ? "Postal" : "Postkarte",
  A4: "20 × 30 cm",
  A3: "30 × 40 cm",
  A2: "40 × 60 cm",
}[format]);

function ProductViewContent({ product, previousProduct, nextProduct }: Omit<ProductViewProps, "requestedSlug">) {
  const router = useRouter();
  const [format, setFormat] = useState<PrintFormat | null>(null);
  const [frame, setFrame] = useState<FrameType>("unframed");
  const [frameColor, setFrameColor] = useState<FrameColor>("silver");
  const [activeImage, setActiveImage] = useState(product.image);
  const [artistTransition, setArtistTransition] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);
  const { language, t } = useLanguage();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customSending, setCustomSending] = useState(false);
  const [customSent, setCustomSent] = useState(false);
  const [customError, setCustomError] = useState("");

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
  const submitCustomFrame = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!format) return;

    setCustomError("");
    setCustomSending(true);

    try {
      const form = event.currentTarget;
      const payload = new FormData(form);
      const files = payload.getAll("images").filter(value => value instanceof File && value.size > 0);

      if (files.length > 3) {
        setCustomError(language === "es" ? "Puedes subir un máximo de 3 imágenes." : "Du kannst maximal 3 Bilder hochladen.");
        setCustomSending(false);
        return;
      }

      payload.set("productId", product.id);
      payload.set("format", format);
      payload.set("locale", language);

      const response = await fetch("/api/framing-request", {
        method: "POST",
        body: payload,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || (language === "es" ? "No se pudo enviar la solicitud." : "Die Anfrage konnte nicht gesendet werden."));
      }

      form.reset();
      setCustomSent(true);
    } catch (error) {
      setCustomError(error instanceof Error ? error.message : (language === "es" ? "No se pudo enviar la solicitud." : "Die Anfrage konnte nicht gesendet werden."));
    } finally {
      setCustomSending(false);
    }
  };

  const addToCart = () => {
    if (!format || totalPrice === null || frame === "custom") return;
    const frameId: CartFrame = frame === "aluminium" ? `aluminium-${frameColor}` : frame === "standard" ? "standard-black" : "unframed";
    addItem({ type: "product", productId: product.id, slug: product.slug, title: product.title, artist: product.artist, image: product.image, format, frameId, unitPrice: totalPrice });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
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
      {totalPrice !== null && <p className="vat-note">{language === "es" ? "IVA incluido" : "inkl. MwSt."}</p>}
      <p className="price-note">{format ? t.product.totalPrice : t.product.priceAfterSelection}</p>
      <p className="product-description">{t.product.description}</p>
      <fieldset className="format-picker"><legend>{t.product.format}</legend><div>{product.availableFormats.map(item => <button type="button" className={format === item ? "active" : ""} onClick={() => chooseFormat(item)} key={item}>{formatLabel(item, language)}</button>)}</div></fieldset>
      <fieldset className="option-picker frame-picker"><legend>{t.product.frame}</legend><div className="option-grid">
        <button type="button" className={frame === "unframed" ? "active" : ""} onClick={() => setFrame("unframed")}>{t.product.unframed}</button>
        <button type="button" disabled={!frameAvailable} className={frame === "standard" ? "active" : ""} onClick={() => setFrame("standard")}>{t.product.standardFrame}</button>
        <button type="button" disabled={!frameAvailable} className={frame === "aluminium" ? "active" : ""} onClick={() => setFrame("aluminium")}>{t.product.aluminiumFrame}</button>
        <button type="button" disabled={!frameAvailable} className={frame === "custom" ? "active" : ""} onClick={() => setFrame("custom")}>{t.product.customFrame}</button>
      </div></fieldset>
      {format === "A6" && <p className="frame-availability">{t.product.a6Unframed}</p>}
      {frame === "aluminium" && <fieldset className="option-picker color-picker"><legend>{t.product.frameColor}</legend><div className="color-options">{(["silver", "black", "gold"] as FrameColor[]).map(color => <button type="button" className={frameColor === color ? "active" : ""} onClick={() => setFrameColor(color)} key={color}><span className={`color-dot ${color}`} />{t.product.colors[color]}</button>)}</div><p>{t.product.realGlass}</p></fieldset>}
      {frame === "custom" && <p className="custom-frame-note">{t.product.customInfo}</p>}
      <button className="add-to-cart" type="button" disabled={!format} onClick={() => frame === "custom" ? (setCustomOpen(true), setCustomSent(false), setCustomError("")) : addToCart()}>{frame === "custom" ? t.product.request : added ? (t.product.cart === "In den Warenkorb" ? "Hinzugefügt" : "Añadido") : t.product.cart}</button>

      {frame === "custom" && customOpen && (
        <form className="custom-frame-form" onSubmit={submitCustomFrame} onTouchStart={event => event.stopPropagation()} onTouchEnd={event => event.stopPropagation()}>
          {customSent ? (
            <div className="custom-frame-success">
              <span>OK</span>
              <h2>{language === "es" ? "Solicitud recibida." : "Anfrage erhalten."}</h2>
              <p>{language === "es"
                ? "Te hemos enviado una copia por email. Enviaremos tu solicitud a Art i Vases en Artà. Ellos revisarán tus preferencias y se pondrán en contacto contigo directamente."
                : "Wir haben dir eine Kopie per E-Mail geschickt. Deine Anfrage leiten wir an Art i Vases in Artà weiter. Dort werden deine Wünsche geprüft und Art i Vases meldet sich anschließend direkt bei dir."}</p>
              <button type="button" className="custom-frame-close" onClick={() => setCustomOpen(false)}>{language === "es" ? "Cerrar" : "Schließen"}</button>
            </div>
          ) : (
            <>
              <div className="custom-frame-head">
                <div>
                  <p className="eyebrow">CUSTOMIZED FRAME</p>
                  <h2>{language === "es" ? "Solicitar enmarcación personalizada" : "Individuelle Rahmung anfragen"}</h2>
                </div>
                <button type="button" className="custom-frame-x" onClick={() => setCustomOpen(false)} aria-label={language === "es" ? "Cerrar" : "Schließen"}>×</button>
              </div>

              <p className="custom-frame-intro">{language === "es"
                ? "Cuéntanos brevemente cómo imaginas el marco. Guardaremos la solicitud junto con el motivo y el formato seleccionados."
                : "Sag uns kurz, wie du dir die Rahmung vorstellst. Die Anfrage wird zusammen mit dem ausgewählten Motiv und Format gespeichert."}</p>

              <div className="custom-frame-product">
                <span>{language === "es" ? "Tu print" : "Dein Print"}</span>
                <strong>{product.title}</strong>
                <small>{product.artist} · {formatLabel(format, language)}</small>
              </div>

              <div className="custom-frame-fields">
                <label>{language === "es" ? "Nombre" : "Name"}<input name="name" required autoComplete="name" /></label>
                <label>E-Mail<input name="email" required type="email" autoComplete="email" /></label>
                <label>{language === "es" ? "Teléfono · opcional" : "Telefon · optional"}<input name="phone" type="tel" autoComplete="tel" /></label>

                <label>{language === "es" ? "Material del marco" : "Material des Rahmens"}
                  <select name="material" defaultValue="unsure">
                    <option value="wood">{language === "es" ? "Madera" : "Holz"}</option>
                    <option value="aluminium">{language === "es" ? "Aluminio" : "Aluminium"}</option>
                    <option value="unsure">{language === "es" ? "Aún no lo sé" : "Noch unsicher"}</option>
                  </select>
                </label>

                <label>{language === "es" ? "Color / acabado" : "Farbe / Oberfläche"}
                  <select name="frameColor" defaultValue="unsure">
                    <option value="black">{language === "es" ? "Negro" : "Schwarz"}</option>
                    <option value="white">{language === "es" ? "Blanco" : "Weiß"}</option>
                    <option value="natural">{language === "es" ? "Madera natural" : "Naturholz"}</option>
                    <option value="silver">{language === "es" ? "Plata" : "Silber"}</option>
                    <option value="gold">{language === "es" ? "Oro" : "Gold"}</option>
                    <option value="other">{language === "es" ? "Otro" : "Andere"}</option>
                    <option value="unsure">{language === "es" ? "Aún no lo sé" : "Noch unsicher"}</option>
                  </select>
                </label>

                <label>Passepartout
                  <select name="passepartout" defaultValue="unsure">
                    <option value="no">{language === "es" ? "Sin paspartú" : "Ohne Passepartout"}</option>
                    <option value="yes">{language === "es" ? "Con paspartú" : "Mit Passepartout"}</option>
                    <option value="unsure">{language === "es" ? "Aún no lo sé" : "Noch unsicher"}</option>
                  </select>
                </label>

                <label>{language === "es" ? "Anchura del paspartú" : "Passepartout-Breite"}
                  <select name="passepartoutWidth" defaultValue="unsure">
                    <option value="narrow">{language === "es" ? "Estrecho · aprox. 3–4 cm" : "Schmal · ca. 3–4 cm"}</option>
                    <option value="medium">{language === "es" ? "Medio · aprox. 5–7 cm" : "Mittel · ca. 5–7 cm"}</option>
                    <option value="wide">{language === "es" ? "Ancho · aprox. 8–12 cm" : "Breit · ca. 8–12 cm"}</option>
                    <option value="other">{language === "es" ? "Otra anchura" : "Andere Breite"}</option>
                    <option value="unsure">{language === "es" ? "Aún no lo sé" : "Noch unsicher"}</option>
                  </select>
                </label>

                <label>{language === "es" ? "Cristal" : "Glas"}
                  <select name="glassType" defaultValue="unsure">
                    <option value="normal">{language === "es" ? "Cristal normal" : "Normalglas"}</option>
                    <option value="anti_reflective">{language === "es" ? "Cristal antirreflejos" : "Entspiegeltes Glas"}</option>
                    <option value="unsure">{language === "es" ? "Aún no lo sé" : "Noch unsicher"}</option>
                  </select>
                </label>

                <label className="custom-frame-full">{language === "es" ? "Otros deseos" : "Sonstige Wünsche"}
                  <textarea name="message" rows={4} placeholder={language === "es" ? "Color, estilo, una idea concreta…" : "Farbe, Stil, eine bestimmte Vorstellung…"} />
                </label>

                <label className="custom-frame-upload custom-frame-full">{language === "es" ? "Imágenes de referencia · opcional" : "Referenzbilder · optional"}
                  <input name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple />
                  <small>{language === "es" ? "Hasta 3 imágenes · pared, habitación, marco o inspiración · JPG, PNG o WebP" : "Bis zu 3 Bilder · Wand, Raum, Rahmen oder Inspiration · JPG, PNG oder WebP"}</small>
                </label>
              </div>

              {customError && <p className="custom-frame-error">{customError}</p>}

              <button className="custom-frame-submit" type="submit" disabled={customSending}>
                {customSending ? (language === "es" ? "Enviando…" : "Wird gesendet …") : (language === "es" ? "Enviar solicitud" : "Rahmungsanfrage senden")}
              </button>

              <p className="custom-frame-small">{language === "es"
                ? "La solicitud no implica ningún compromiso. La enviaremos a Art i Vases en Artà. Ellos revisarán la opción solicitada y se pondrán en contacto contigo directamente con las posibilidades y el precio."
                : "Die Anfrage ist unverbindlich. Wir leiten sie an Art i Vases in Artà weiter. Dort wird die gewünschte Ausführung geprüft und Art i Vases meldet sich anschließend direkt bei dir mit den Möglichkeiten und dem Preis."}</p>
            </>
          )}
        </form>
      )}
      <div className="technical-info"><h2>{t.product.technical}</h2><dl><div><dt>{t.product.product}</dt><dd>Fine Art Print</dd></div><div><dt>{t.product.artist}</dt><dd>{product.artist}</dd></div><div><dt>{t.product.format}</dt><dd>{format ? formatLabel(format, language) : "–"}</dd></div><div><dt>{t.product.frame}</dt><dd>{frame === "aluminium" ? `${t.product.aluminiumFrame} · ${t.product.colors[frameColor]} · ${t.product.realGlass}` : t.product.frameValues[frame]}</dd></div><div><dt>{t.product.origin}</dt><dd>Made, selected and printed in Mallorca</dd></div><div><dt>{t.product.shipping}</dt><dd>{t.product.shippingValue}</dd></div></dl></div>
    </div>
    </section>
  </>;
}

export default function ProductView({ requestedSlug, product: initialProduct, previousProduct: initialPrevious, nextProduct: initialNext }: ProductViewProps) {
  const [catalog, setCatalog] = useState<readonly Product[] | null>(null);

  useEffect(() => {
    let active = true;
    fetchProducts().then(items => { if (active) setCatalog(items); });
    return () => { active = false; };
  }, []);

  const navigableProducts = (catalog ?? []).filter(item => item.image !== null);
  const resolvedProduct = navigableProducts.find(item => item.slug === requestedSlug) ?? initialProduct;
  const resolvedIndex = navigableProducts.findIndex(item => item.slug === resolvedProduct.slug);
  const previousProduct = resolvedIndex >= 0 ? navigableProducts[(resolvedIndex - 1 + navigableProducts.length) % navigableProducts.length] : initialPrevious;
  const nextProduct = resolvedIndex >= 0 ? navigableProducts[(resolvedIndex + 1) % navigableProducts.length] : initialNext;

  return <ProductViewContent key={`${resolvedProduct.slug}-${resolvedProduct.image ?? "placeholder"}`} product={resolvedProduct} previousProduct={previousProduct} nextProduct={nextProduct} />;
}
