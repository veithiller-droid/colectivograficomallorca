"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import SiteHeader from "../../components/site-header";
import CheckoutForm from "../../checkout/checkout-form";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://creative-perfection-production-3c6e.up.railway.app";
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");
const money = (cents:number) => `${(cents / 100).toFixed(2).replace(".", ",")} €`;

type Offer = { id:string; token:string; locale:"de"|"es"; productTitle:string; artistName:string; format:string; formatLabel:string; image:string|null; description:string; priceCents:number; customerName:string; customerEmail:string; status:string; paid:boolean; };
type ShippingQuote = { subtotalCents:number; shippingCents:number; totalCents:number; country:string; freeShipping:boolean };

export default function FramingOfferPage() {
  const params = useParams<{token:string}>();
  const token = String(params?.token || "");
  const [offer,setOffer] = useState<Offer|null>(null);
  const [clientSecret,setClientSecret] = useState("");
  const [orderId,setOrderId] = useState("");
  const [shippingQuote,setShippingQuote] = useState<ShippingQuote|null>(null);
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    let active = true;
    fetch(`${apiUrl}/api/public/framing-offers/${encodeURIComponent(token)}`, {cache:"no-store"})
      .then(async response => { const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(); return data.offer as Offer; })
      .then(async item => {
        if (!active) return;
        setOffer(item);
        if (item.paid) return;
        const response = await fetch(`${apiUrl}/api/public/framing-offers/${encodeURIComponent(token)}/payment-intent`, {method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({})});
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.clientSecret) throw new Error();
        if (!active) return;
        setClientSecret(data.clientSecret); setOrderId(data.orderId || "");
      })
      .catch(() => { if (active) setError("offer"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  const de = offer?.locale !== "es";
  const appearance = { theme:"flat" as const, variables:{colorPrimary:"#c85f46",colorBackground:"#f6efe5",colorText:"#162d29",colorDanger:"#c85f46",fontFamily:"Arial, sans-serif",borderRadius:"0px",spacingUnit:"5px"}, rules:{".Input":{border:"1px solid rgba(22,45,41,.28)",boxShadow:"none",padding:"14px"},".Input:focus":{border:"1px solid #162d29",boxShadow:"none"},".Label":{fontSize:"11px",textTransform:"uppercase",letterSpacing:".08em"}} };

  if (loading) return <main><SiteHeader /><section className="framing-offer-page shell"><p>{de ? "Angebot wird geladen …" : "Cargando oferta…"}</p></section></main>;
  if (error || !offer) return <main><SiteHeader /><section className="framing-offer-page shell"><h1>Angebot nicht verfügbar.</h1><p>Este enlace de oferta no está disponible.</p><Link href="/shop">Shop</Link></section></main>;
  if (offer.paid) return <main><SiteHeader /><section className="framing-offer-page shell"><p className="eyebrow">{de ? "Angebot angenommen" : "Oferta aceptada"}</p><h1>{de ? "Vielen Dank." : "Muchas gracias."}</h1><p>{de ? "Dieses individuelle Angebot wurde bereits bezahlt und wird bearbeitet." : "Esta oferta personalizada ya ha sido pagada y está siendo procesada."}</p></section></main>;

  return <main><SiteHeader /><section className="framing-offer-page shell">
    <div className="framing-offer-title"><p className="eyebrow">COLECTIVO GRÁFICO MALLORCA</p><h1>{de ? "Dein individuelles Angebot" : "Tu oferta personalizada"}</h1><p>{de ? "Individuelle Rahmung in Zusammenarbeit mit Art i Vases in Artà." : "Enmarcación personalizada en colaboración con Art i Vases en Artà."}</p></div>
    <div className="framing-offer-layout">
      <aside className="framing-offer-summary">
        {offer.image && <img src={`${apiUrl}${offer.image}`} alt={`${offer.productTitle} — ${offer.artistName}`} />}
        <p className="eyebrow">{de ? "Dein Print" : "Tu print"}</p><h2>{offer.productTitle}</h2><p className="framing-offer-artist">{offer.artistName} · {offer.formatLabel}</p>
        <div className="framing-offer-description"><span>{de ? "Individuelle Rahmung" : "Enmarcación personalizada"}</span><p>{offer.description}</p></div>
        <div className="framing-offer-price"><span>{de ? "Angebotspreis" : "Precio de la oferta"}</span><strong>{money(offer.priceCents)}</strong></div><p className="framing-offer-vat">{de ? "inkl. MwSt." : "IVA incluido"}</p>
        <div className="framing-offer-shipping"><span>{de ? "Versand" : "Envío"}</span><strong>{offer.priceCents >= 8000 ? (de ? "Kostenlos" : "Gratis") : shippingQuote ? money(shippingQuote.shippingCents) : (de ? "nach Lieferadresse" : "según dirección")}</strong></div>
        {shippingQuote && <div className="framing-offer-total"><span>{de ? "Gesamtsumme" : "Total"}</span><strong>{money(shippingQuote.totalCents)}</strong></div>}
      </aside>
      <div className="framing-offer-payment"><p className="eyebrow">{de ? "Angebot annehmen" : "Aceptar oferta"}</p><h2>{de ? "Lieferung & Zahlung" : "Entrega y pago"}</h2>
        {!clientSecret && <p>{de ? "Zahlung wird vorbereitet …" : "Preparando el pago…"}</p>}
        {clientSecret && <Elements stripe={stripePromise} options={{clientSecret,appearance,locale:offer.locale}}><CheckoutForm orderId={orderId} onShippingQuote={setShippingQuote} locale={offer.locale} initialName={offer.customerName} initialEmail={offer.customerEmail} returnUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/checkout/success?type=framing`} submitLabel={de ? "Angebot annehmen & bezahlen" : "Aceptar oferta y pagar"} /></Elements>}
      </div>
    </div>
  </section></main>;
}
