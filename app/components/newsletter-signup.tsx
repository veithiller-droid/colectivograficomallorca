"use client";

import { FormEvent, useState } from "react";
import { useLanguage } from "./language-provider";

export default function NewsletterSignup() {
  const { language, t } = useLanguage();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle"|"sending"|"done"|"error">("idle");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setState("sending");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, locale: language }),
      });
      if (!response.ok) throw new Error();
      setState("done");
      setEmail("");
    } catch {
      setState("error");
    }
  }

  return (
    <form onSubmit={submit}>
      <label htmlFor="email">{t.home.newsletterLabel}</label>
      <div>
        <input id="email" name="email" type="email" autoComplete="email" placeholder={t.home.newsletterPlaceholder} required value={email} onChange={event => setEmail(event.target.value)} />
        <button type="submit" disabled={state === "sending"}>{state === "sending" ? "…" : `${t.home.newsletterButton} →`}</button>
      </div>
      <small>
        {state === "done"
          ? (language === "es" ? "Revisa tu correo y confirma la suscripción." : "Bitte bestätige die Anmeldung über die E-Mail, die wir dir geschickt haben.")
          : state === "error"
            ? (language === "es" ? "No se pudo completar la suscripción." : "Die Anmeldung konnte nicht abgeschlossen werden.")
            : t.home.newsletterSmall}
      </small>
    </form>
  );
}
