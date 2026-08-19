"use client";

import Link from "next/link";
import { useState } from "react";
import SiteHeader from "../components/site-header";
import { useCart, type CartFrame, type CartItem } from "../components/cart-provider";
import { useLanguage } from "../components/language-provider";

const standardSurcharge = { A4: 10, A3: 18, A2: 34 } as const;
const aluminiumSurcharge = { A4: 35, A3: 48, A2: 65 } as const;
const money = (value: number) => `${value.toFixed(2).replace(".", ",")} €`;
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://creative-perfection-production-3c6e.up.railway.app";

function upgradeFor(item: CartItem) {
  if (item.type !== "product" || !item.format || item.format === "A6") return null;
  if (item.frameId === "unframed") return { frameId: "standard-black" as CartFrame, delta: standardSurcharge[item.format] };
  if (item.frameId === "standard-black") return { frameId: "aluminium-black" as CartFrame, delta: aluminiumSurcharge[item.format] - standardSurcharge[item.format] };
  return null;
}

export default function CartPage() {
  const { language } = useLanguage();
  const { items, total, addSurprise, removeItem, setQuantity, upgradeFrame } = useCart();
  const de = language === "de";
  return <main><SiteHeader /><section className="cart-page shell"><p className="eyebrow">{de ? "Deine Auswahl" : "Tu selección"}</p><h1>{de ? "Warenkorb" : "Cesta"}</h1>
    {!items.length ? <div className="empty-cart"><p>{de ? "Dein Warenkorb ist leer." : "Tu cesta está vacía."}</p><Link className="text-link" href="/shop">{de ? "Zum Shop" : "Ir a la tienda"}</Link></div> : <div className="cart-layout"><div className="cart-items">{items.map(item => { const upgrade = upgradeFor(item); return <article className="cart-item" key={item.key}>{item.image ? <img src={item.image} alt="" /> : <div className="surprise-mark">5×</div>}<div className="cart-item-copy"><h2>{item.title}</h2><p>{item.type === "surprise" ? (de ? "Fünf unterschiedliche A6-Postkarten · Überraschungsauswahl" : "Cinco postales A6 diferentes · selección sorpresa") : `${item.artist} · ${item.format} · ${item.frameId === "unframed" ? (de ? "ungerahmt" : "sin marco") : item.frameId === "standard-black" ? (de ? "Standardrahmen" : "marco estándar") : (de ? "Aluminium mit Echtglas" : "aluminio con cristal")}`}</p><div className="quantity"><button onClick={() => setQuantity(item.key, item.quantity - 1)}>−</button><span>{item.quantity}</span><button onClick={() => setQuantity(item.key, item.quantity + 1)}>+</button></div>{upgrade && <button className="cart-upgrade" onClick={() => upgradeFrame(item.key, upgrade.frameId, upgrade.delta)}>{item.frameId === "unframed" ? (de ? `Für nur ${money(upgrade.delta)} mehr mit Standardrahmen` : `Por solo ${money(upgrade.delta)} más con marco estándar`) : (de ? `Für ${money(upgrade.delta)} mehr Aluminium mit Echtglas` : `Por ${money(upgrade.delta)} más aluminio con cristal`)}</button>}<button className="remove-item" onClick={() => removeItem(item.key)}>{de ? "Entfernen" : "Eliminar"}</button></div><strong>{money(item.unitPrice * item.quantity)}</strong></article>; })}</div>
      <aside className="cart-summary"><div className="surprise-offer"><span>SPECIAL OFFER</span><h2>{de ? "5 Surprise-Postkarten" : "5 postales sorpresa"}</h2><p>{de ? "Fünf unterschiedliche A6-Motive, von uns ausgewählt." : "Cinco diseños A6 diferentes, seleccionados por nosotros."}</p><strong>10,00 €</strong><button onClick={addSurprise}>{de ? "Zum Warenkorb hinzufügen" : "Añadir a la cesta"}</button></div><div className="cart-total"><span>{de ? "Gesamtsumme" : "Total"}</span><strong>{money(total)}</strong></div><p className="checkout-note">{de ? "Adresse und Zahlungsdaten werden verschlüsselt über Stripe verarbeitet." : "La dirección y los datos de pago se procesan de forma cifrada mediante Stripe."}</p><Link className="checkout-button checkout-link" href="/checkout">{de ? "Weiter zur Kasse" : "Continuar al pago"}</Link></aside></div>}
  </section></main>;
}
