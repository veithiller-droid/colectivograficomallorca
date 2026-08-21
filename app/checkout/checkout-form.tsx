"use client";

import { AddressElement, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import { useLanguage } from "../components/language-provider";

type ShippingQuote = { subtotalCents:number; shippingCents:number; totalCents:number; country:string; freeShipping:boolean };

export default function CheckoutForm({ orderId, onShippingQuote }: { orderId:string; onShippingQuote:(quote:ShippingQuote) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { language } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shippingCountry, setShippingCountry] = useState("");
  const de = language === "de";

  async function updateShipping(country: string, refreshElements = true) {
    if (!country || !orderId) throw new Error(de ? "Lieferland fehlt." : "Falta el país de entrega.");
    const response = await fetch("/api/checkout/shipping", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ orderId, country }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || (de ? "Versandkosten konnten nicht berechnet werden." : "No se pudieron calcular los gastos de envío."));
    setShippingCountry(country);
    onShippingQuote(data);
    if (refreshElements && elements) await elements.fetchUpdates();
    return data as ShippingQuote;
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setError("");

    const addressElement = elements.getElement(AddressElement);
    const addressResult = await addressElement?.getValue();
    if (!addressResult?.complete) {
      setError(de ? "Bitte vervollständige deine Lieferadresse." : "Completa tu dirección de entrega.");
      return;
    }

    try {
      await updateShipping(addressResult.value.address.country, true);
    } catch (shippingError) {
      setError(shippingError instanceof Error ? shippingError.message : (de ? "Versandkosten konnten nicht berechnet werden." : "No se pudieron calcular los gastos de envío."));
      return;
    }

    const submitResult = await elements.submit();
    if (submitResult.error) {
      setError(submitResult.error.message || (de ? "Bitte prüfe deine Zahlungsangaben." : "Revisa tus datos de pago."));
      return;
    }

    setLoading(true);
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
        payment_method_data: { billing_details: { name, email } },
        shipping: {
          name: addressResult.value.name || name,
          address: {
            line1: addressResult.value.address.line1,
            line2: addressResult.value.address.line2 || undefined,
            city: addressResult.value.address.city,
            state: addressResult.value.address.state,
            postal_code: addressResult.value.address.postal_code,
            country: addressResult.value.address.country,
          },
          phone: addressResult.value.phone || undefined,
        },
      },
    });
    if (result.error) {
      setError(result.error.message || (de ? "Die Zahlung konnte nicht abgeschlossen werden." : "No se pudo completar el pago."));
      setLoading(false);
    }
  };

  return <form className="payment-form" onSubmit={submit}>
    <div className="checkout-section"><span>01</span><h2>{de ? "Kontakt" : "Contacto"}</h2>
      <label>{de ? "Name" : "Nombre"}<input required autoComplete="name" value={name} onChange={event => setName(event.target.value)} /></label>
      <label>E-Mail<input required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} /></label>
    </div>
    <div className="checkout-section"><span>02</span><h2>{de ? "Lieferadresse" : "Dirección de entrega"}</h2><AddressElement options={{ mode: "shipping", allowedCountries: ["ES", "DE", "FR", "AT", "BE", "NL", "IT", "PT"] }} onChange={event => { const country = event.value.address.country; if (country && country !== shippingCountry) updateShipping(country, true).catch(() => {}); }} /></div>
    <div className="checkout-section"><span>03</span><h2>{de ? "Zahlung" : "Pago"}</h2><PaymentElement options={{ layout: "accordion" }} /></div>
    {error && <p className="checkout-error">{error}</p>}
    <button type="submit" className="checkout-button" disabled={!stripe || loading}>{loading ? (de ? "Zahlung wird verarbeitet …" : "Procesando el pago…") : (de ? "Bestellung bezahlen" : "Pagar pedido")}</button>
    <p className="checkout-security">{de ? "Sichere und verschlüsselte Zahlungsabwicklung durch Stripe." : "Pago seguro y cifrado procesado por Stripe."}</p>
  </form>;
}
