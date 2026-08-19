"use client";

import Link from "next/link";
import { useEffect } from "react";
import SiteHeader from "../../components/site-header";
import { useCart } from "../../components/cart-provider";
import { useLanguage } from "../../components/language-provider";

export default function CheckoutSuccessPage() {
  const { clear, count } = useCart();
  const { language } = useLanguage();
  const de = language === "de";
  useEffect(() => {
    if (count > 0) clear();
  }, [count, clear]);

  return <main><SiteHeader /><section className="checkout-success shell"><p className="eyebrow">{de ? "Bestellung eingegangen" : "Pedido recibido"}</p><h1>{de ? "Herzlichen Dank." : "Muchas gracias."}</h1><p>{de ? "Wir haben deinen Auftrag erhalten und beginnen umgehend mit der Bearbeitung. Sobald deine Bestellung versandbereit ist, erhältst du eine weitere Nachricht." : "Hemos recibido tu pedido y comenzamos a prepararlo. Te enviaremos otro mensaje cuando esté listo para su envío."}</p><div>MADE IN MALLORCA · PRINTED IN MALLORCA · DISTRIBUTED FROM MALLORCA</div><nav className="checkout-success-actions" aria-label={de ? "Weiter navigieren" : "Continuar navegando"}><Link className="checkout-button checkout-link" href="/shop">{de ? "Zurück zum Shop" : "Volver a la tienda"}</Link><Link className="checkout-button checkout-link checkout-link-secondary" href="/">{de ? "Zur Hauptseite" : "Ir a la página principal"}</Link></nav></section></main>;
}
