"use client";

import { AddressElement, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import { useLanguage } from "../components/language-provider";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { language } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const de = language === "de";

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
    <div className="checkout-section"><span>02</span><h2>{de ? "Lieferadresse" : "Dirección de entrega"}</h2><AddressElement options={{ mode: "shipping", allowedCountries: ["ES", "DE", "FR", "AT", "BE", "NL", "IT", "PT"] }} /></div>
    <div className="checkout-section"><span>03</span><h2>{de ? "Zahlung" : "Pago"}</h2><PaymentElement options={{ layout: "accordion" }} /></div>
    {error && <p className="checkout-error">{error}</p>}
    <button type="submit" className="checkout-button" disabled={!stripe || loading}>{loading ? (de ? "Zahlung wird verarbeitet …" : "Procesando el pago…") : (de ? "Bestellung bezahlen" : "Pagar pedido")}</button>
    <p className="checkout-security">{de ? "Sichere und verschlüsselte Zahlungsabwicklung durch Stripe." : "Pago seguro y cifrado procesado por Stripe."}</p>
  </form>;
}
