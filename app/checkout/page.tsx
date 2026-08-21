"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SiteHeader from "../components/site-header";
import { useCart } from "../components/cart-provider";
import { useLanguage } from "../components/language-provider";
import CheckoutForm from "./checkout-form";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://creative-perfection-production-3c6e.up.railway.app";
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");
const money = (value: number) => `${value.toFixed(2).replace(".", ",")} €`;

export default function CheckoutPage() {
  const { items, total } = useCart();
  const { language } = useLanguage();
  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState("");
  const [shippingQuote, setShippingQuote] = useState<{ subtotalCents:number; shippingCents:number; totalCents:number; country:string; freeShipping:boolean } | null>(null);
  const [error, setError] = useState("");
  const de = language === "de";
  const payload = useMemo(() => items.map(item => ({ type: item.type, productId: item.productId, format: item.format, frameId: item.frameId, quantity: item.quantity })), [items]);

  useEffect(() => {
    if (!items.length) return;
    fetch(`${apiUrl}/api/public/payment-intent`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ locale: language, items: payload }) })
      .then(async response => { const data = await response.json(); if (!response.ok || !data.clientSecret) throw new Error(); return data; })
      .then(data => { setClientSecret(data.clientSecret); setOrderId(data.orderId || ""); setShippingQuote(null); })
      .catch(() => setError(de ? "Die Zahlung konnte nicht vorbereitet werden." : "No se pudo preparar el pago."));
  }, [de, items.length, language, payload]);

  const appearance = { theme: "flat" as const, variables: { colorPrimary: "#c85f46", colorBackground: "#f6efe5", colorText: "#162d29", colorDanger: "#c85f46", fontFamily: "Arial, sans-serif", borderRadius: "0px", spacingUnit: "5px" }, rules: { ".Input": { border: "1px solid rgba(22,45,41,.28)", boxShadow: "none", padding: "14px" }, ".Input:focus": { border: "1px solid #162d29", boxShadow: "none" }, ".Label": { fontSize: "11px", textTransform: "uppercase", letterSpacing: ".08em" } } };

  return <main><SiteHeader /><section className="checkout-page shell"><div className="checkout-heading"><p className="eyebrow">COLECTIVO GRÁFICO MALLORCA</p><h1>{de ? "Kasse" : "Pago"}</h1><Link href="/cart">← {de ? "Warenkorb bearbeiten" : "Editar cesta"}</Link></div>
    {!items.length ? <div className="empty-cart"><p>{de ? "Dein Warenkorb ist leer." : "Tu cesta está vacía."}</p><Link className="text-link" href="/shop">{de ? "Zum Shop" : "Ir a la tienda"}</Link></div> : <div className="checkout-layout"><div>{error && <p className="checkout-error">{error}</p>}{!clientSecret && !error && <p>{de ? "Zahlung wird vorbereitet …" : "Preparando el pago…"}</p>}{clientSecret && <Elements stripe={stripePromise} options={{ clientSecret, appearance, locale: language === "es" ? "es" : "de" }}><CheckoutForm orderId={orderId} onShippingQuote={setShippingQuote} /></Elements>}</div>
      <aside className="checkout-order"><p className="eyebrow">{de ? "Deine Bestellung" : "Tu pedido"}</p>{items.map(item => <div className="checkout-order-item" key={item.key}>{item.image ? <img src={item.image} alt="" /> : <div className="surprise-mark">5×</div>}<div><strong>{item.title}</strong><small>{item.type === "product" ? `${item.format} · ${item.quantity}×` : `${item.quantity}×`}</small></div><span>{money(item.unitPrice * item.quantity)}</span></div>)}<div className="checkout-costs"><div><span>{de ? "Zwischensumme" : "Subtotal"}</span><strong>{money(total)}</strong></div><div><span>{de ? "Versand" : "Envío"}</span><strong>{total >= 80 ? (de ? "Kostenlos" : "Gratis") : shippingQuote ? money(shippingQuote.shippingCents / 100) : (de ? "nach Lieferadresse" : "según dirección")}</strong></div>{total < 80 && !shippingQuote && <small>{de ? "Spanien 6,95 € · übrige angebotene Länder 12,95 € · ab 80 € kostenlos" : "España 6,95 € · resto de países disponibles 12,95 € · gratis desde 80 €"}</small>}</div><div className="cart-total"><span>{de ? "Gesamtsumme" : "Total"}</span><strong>{shippingQuote ? money(shippingQuote.totalCents / 100) : total >= 80 ? money(total) : "—"}</strong></div></aside></div>}
  </section></main>;
}
