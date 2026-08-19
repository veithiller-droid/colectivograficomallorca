const statuses = { new:"Neubestellungen", processing:"In Bearbeitung", ready:"Versandbereit", shipped:"Versendet", completed:"Erledigt", canceled:"Storniert" };
const frames = { unframed:"Ungerahmt", "standard-black":"Standardrahmen Schwarz", "aluminium-silver":"Aluminium Silber", "aluminium-black":"Aluminium Schwarz", "aluminium-gold":"Aluminium Gold" };
let orders = [];
let active = "new";
const money = cents => new Intl.NumberFormat("de-DE", { style:"currency", currency:"EUR" }).format(Number(cents || 0) / 100);
const date = value => new Intl.DateTimeFormat("de-DE", { dateStyle:"medium", timeStyle:"short" }).format(new Date(value));
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[char]);

async function load() {
  const response = await fetch("/api/orders");
  if (response.status === 401) return location.reload();
  const data = await response.json();
  orders = data.orders || [];
  render();
}
function render() {
  document.querySelector("#summary").innerHTML = `<strong>${orders.filter(order => order.fulfillment_status === "new").length}</strong><span>neue bezahlte Bestellungen</span>`;
  document.querySelector("#filters").innerHTML = Object.entries(statuses).map(([key,label]) => `<button class="${active === key ? "active" : ""}" data-filter="${key}">${label}<span>${orders.filter(order => order.fulfillment_status === key).length}</span></button>`).join("");
  const visible = orders.filter(order => order.fulfillment_status === active);
  document.querySelector("#orders").innerHTML = visible.length ? visible.map(orderCard).join("") : `<div class="empty">Keine Bestellungen in „${statuses[active]}“.</div>`;
  document.querySelectorAll("[data-filter]").forEach(button => button.onclick = () => { active = button.dataset.filter; render(); });
  document.querySelectorAll("[data-order]").forEach(select => select.onchange = () => update(select.dataset.order, select.value));
}
function orderCard(order) {
  const address = order.shipping_address || {};
  const addressLines = [address.line1,address.line2,[address.postal_code,address.city].filter(Boolean).join(" "),address.state,address.country].filter(Boolean);
  return `<article class="order-card"><div class="order-top"><div><span class="order-number">${escapeHtml(order.id.slice(0,8).toUpperCase())}</span><small>${date(order.created_at)}</small></div><strong>${money(order.total_cents)}</strong></div><div class="order-grid"><section><h2>${escapeHtml(order.customer_name || "Kunde")}</h2><a href="mailto:${escapeHtml(order.customer_email)}">${escapeHtml(order.customer_email || "Keine E-Mail")}</a>${order.customer_phone ? `<p>${escapeHtml(order.customer_phone)}</p>` : ""}<address>${addressLines.map(escapeHtml).join("<br>") || "Keine Adresse gespeichert"}</address></section><section><h3>Positionen</h3>${order.items.map(item => `<div class="item"><div><strong>${escapeHtml(item.artistName ? `${item.artistName} · ${item.title}` : item.title)}</strong><small>${escapeHtml(item.format)} · ${escapeHtml(frames[item.frameId] || item.frameId || "–")} · ${item.quantity}×</small></div><span>${money(item.unitPriceCents * item.quantity)}</span></div>`).join("")}</section></div><div class="order-actions"><label>Status<select data-order="${escapeHtml(order.id)}">${Object.entries(statuses).map(([key,label]) => `<option value="${key}" ${key === order.fulfillment_status ? "selected" : ""}>${label}</option>`).join("")}</select></label><span>${escapeHtml(order.stripe_payment_intent_id)}</span></div></article>`;
}
async function update(id, fulfillmentStatus) {
  const response = await fetch(`/api/orders/${encodeURIComponent(id)}`, { method:"PATCH", headers:{"content-type":"application/json"}, body:JSON.stringify({ fulfillmentStatus }) });
  if (!response.ok) return alert("Status konnte nicht gespeichert werden.");
  const order = orders.find(entry => entry.id === id);
  if (order) order.fulfillment_status = fulfillmentStatus;
  render();
}
load().catch(() => document.querySelector("#orders").innerHTML = '<div class="empty">Die Bestellungen konnten nicht geladen werden.</div>');
