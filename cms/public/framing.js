const statuses = {
  new: "Neu",
  processing: "In Bearbeitung",
  forwarded: "An Art i Vases weitergeleitet",
  quote_ready: "Angebot erhalten",
  completed: "Erledigt"
};

let requests = [];
let active = "new";

const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
const date = value => value ? new Intl.DateTimeFormat("de-DE",{dateStyle:"medium",timeStyle:"short"}).format(new Date(value)) : "–";

async function load() {
  const response = await fetch("/api/framing-requests");
  if (!response.ok) throw new Error("load failed");
  const data = await response.json();
  requests = data.requests || [];
  render();
}

function render() {
  document.querySelector("#framing-summary").innerHTML =
    `<strong>${requests.filter(item => item.status === "new").length}</strong><span>neue Rahmungsanfragen</span>`;

  document.querySelector("#framing-filters").innerHTML = Object.entries(statuses)
    .map(([key,label]) => `<button class="${active===key?"active":""}" data-filter="${key}">${label} <span>${requests.filter(item=>item.status===key).length}</span></button>`)
    .join("");

  const visible = requests.filter(item => item.status === active);
  document.querySelector("#framing-list").innerHTML = visible.length
    ? visible.map(card).join("")
    : `<div class="empty">Keine Anfragen in „${statuses[active]}“.</div>`;

  document.querySelectorAll("[data-filter]").forEach(button => {
    button.onclick = () => { active = button.dataset.filter; render(); };
  });

  document.querySelectorAll("[data-request-status]").forEach(select => {
    select.onchange = () => updateStatus(select.dataset.requestStatus, select.value);
  });

  document.querySelectorAll("[data-save-offer]").forEach(button => {
    button.onclick = () => saveOffer(button.dataset.saveOffer);
  });

  document.querySelectorAll("[data-forward-request]").forEach(button => {
    button.onclick = () => forwardRequest(button.dataset.forwardRequest, button);
  });
}

function card(item) {
  const mail = item.confirmation_email_sent_at
    ? `<strong class="mail-ok">Kundenkopie gesendet · ${date(item.confirmation_email_sent_at)}</strong>`
    : item.confirmation_email_error
      ? `<strong class="mail-error">Kundenkopie Fehler</strong><small>${esc(item.confirmation_email_error)}</small>`
      : `<strong class="mail-pending">Kundenkopie nicht gesendet</strong>`;

  const images = (item.images || []).map(image =>
    `<a href="/api/framing-requests/${encodeURIComponent(item.id)}/images/${encodeURIComponent(image.id)}" target="_blank" rel="noopener"><img src="/api/framing-requests/${encodeURIComponent(item.id)}/images/${encodeURIComponent(image.id)}" alt="Referenzbild"></a>`
  ).join("");

  return `<article class="framing-card">
    <div class="framing-top">
      <div><strong>${esc(item.product_title)}</strong><small>${esc(item.artist_name)} · ${esc(item.format_label || item.format)}</small></div>
      <div class="framing-meta"><strong>${esc(String(item.id).slice(0,8).toUpperCase())}</strong><small>${date(item.created_at)}</small></div>
    </div>

    <div class="framing-grid">
      <section>
        <h2>${esc(item.customer_name)}</h2>
        <a href="mailto:${esc(item.customer_email)}">${esc(item.customer_email)}</a>
        ${item.customer_phone ? `<p>${esc(item.customer_phone)}</p>` : ""}
        <p>${mail}</p>
      </section>

      <section>
        <h3>Gewünschte Ausführung</h3>
        <div class="framing-details">
          <div><span>Material</span><strong>${esc(item.material)}</strong></div>
          <div><span>Farbe / Oberfläche</span><strong>${esc(item.frame_color)}</strong></div>
          <div><span>Passepartout</span><strong>${esc(item.passepartout)}</strong></div>
          <div><span>Passepartout-Breite</span><strong>${esc(item.passepartout_width)}</strong></div>
          <div><span>Glas</span><strong>${esc(item.glass_type)}</strong></div>
          <div><span>Sprache</span><strong>${esc(String(item.locale || "de").toUpperCase())}</strong></div>
        </div>
        ${item.message ? `<div class="framing-message"><h3>Weitere Wünsche</h3><p>${esc(item.message)}</p></div>` : ""}
        ${images ? `<div class="framing-images">${images}</div>` : ""}
      </section>
    </div>

    <div class="framing-offer">
      <div class="framing-offer-head">
        <div><p class="eyebrow">ANGEBOT</p><h3>Individuelle Rahmung</h3></div>
        ${item.forwarded_at ? `<span class="framing-forwarded">Weitergeleitet ${date(item.forwarded_at)}</span>` : ""}
      </div>

      <label>Angebotsbeschreibung
        <textarea data-quote-description="${esc(item.id)}" rows="4" placeholder="z. B. Eichenrahmen natur, Passepartout 6 cm, entspiegeltes Glas">${esc(item.quote_description || "")}</textarea>
      </label>

      <div class="framing-offer-row">
        <label>Endpreis inkl. MwSt.
          <div class="framing-price-input"><input data-quote-price="${esc(item.id)}" type="number" min="0" step="0.01" value="${item.quote_price_cents == null ? "" : (Number(item.quote_price_cents)/100).toFixed(2)}"><span>€</span></div>
        </label>
        <label>Interne Notiz
          <input data-internal-note="${esc(item.id)}" value="${esc(item.internal_note || "")}" placeholder="nur intern sichtbar">
        </label>
      </div>

      <div class="framing-offer-buttons">
        <button type="button" class="quiet" data-save-offer="${esc(item.id)}">Angebot speichern</button>
        <button type="button" class="framing-forward-button" data-forward-request="${esc(item.id)}" ${item.forwarded_at ? "disabled" : ""}>
          ${item.forwarded_at ? "An Art i Vases weitergeleitet" : "An Art i Vases weiterleiten"}
        </button>
      </div>

      ${item.forwarded_error ? `<p class="mail-error">${esc(item.forwarded_error)}</p>` : ""}
      ${item.forwarded_email ? `<small class="framing-forward-meta">${esc(item.forwarded_email)}${item.forwarded_resend_id ? ` · ${esc(item.forwarded_resend_id)}` : ""}</small>` : ""}
    </div>

    <div class="framing-actions">
      <label>Status
        <select data-request-status="${esc(item.id)}">
          ${Object.entries(statuses).map(([key,label]) => `<option value="${key}" ${key===item.status?"selected":""}>${label}</option>`).join("")}
        </select>
      </label>
      <small>${item.confirmation_email_resend_id ? `Resend: ${esc(item.confirmation_email_resend_id)}` : ""}</small>
    </div>
  </article>`;
}

async function updateStatus(id, status) {
  const response = await fetch(`/api/framing-requests/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {"content-type":"application/json"},
    body: JSON.stringify({ status })
  });
  if (!response.ok) {
    alert("Status konnte nicht gespeichert werden.");
    return;
  }
  await load();
}


async function saveOffer(id) {
  const description = document.querySelector(`[data-quote-description="${CSS.escape(id)}"]`)?.value || "";
  const rawPrice = document.querySelector(`[data-quote-price="${CSS.escape(id)}"]`)?.value || "";
  const internalNote = document.querySelector(`[data-internal-note="${CSS.escape(id)}"]`)?.value || "";
  const quotePriceCents = rawPrice === "" ? null : Math.round(Number(rawPrice.replace(",", ".")) * 100);

  if (rawPrice !== "" && (!Number.isFinite(quotePriceCents) || quotePriceCents < 0)) {
    alert("Bitte einen gültigen Preis eingeben.");
    return;
  }

  const payload = { quoteDescription: description, quotePriceCents, internalNote };
  if (description && quotePriceCents !== null) payload.status = "quote_ready";

  const response = await fetch(`/api/framing-requests/${encodeURIComponent(id)}`, {
    method:"PATCH",
    headers:{"content-type":"application/json"},
    body:JSON.stringify(payload)
  });

  if (!response.ok) {
    alert("Das Angebot konnte nicht gespeichert werden.");
    return;
  }
  await load();
}

async function forwardRequest(id, button) {
  if (!confirm("Diese Rahmungsanfrage jetzt per E-Mail an Art i Vases weiterleiten?")) return;

  const original = button.textContent;
  button.disabled = true;
  button.textContent = "Wird weitergeleitet …";

  const response = await fetch(`/api/framing-requests/${encodeURIComponent(id)}/forward`, { method:"POST" });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    alert(data.error === "FRAMING_FORWARD_EMAIL is not configured"
      ? "In Railway fehlt noch FRAMING_FORWARD_EMAIL."
      : "Die Anfrage konnte nicht weitergeleitet werden.");
    button.disabled = false;
    button.textContent = original;
    return;
  }

  await load();
}

load().catch(() => {
  document.querySelector("#framing-list").innerHTML = '<div class="empty">Die Rahmungsanfragen konnten nicht geladen werden.</div>';
});
