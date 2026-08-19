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
    setLoading(true);
    setError("");
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
        payment_method_data: { billing_details: { name, email } },
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
    <button className="checkout-button" disabled={!stripe || loading}>{loading ? "…" : (de ? "Bestellung bezahlen" : "Pagar pedido")}</button>
    <p className="checkout-security">{de ? "Sichere und verschlüsselte Zahlungsabwicklung durch Stripe." : "Pago seguro y cifrado procesado por Stripe."}</p>
  </form>;
}
