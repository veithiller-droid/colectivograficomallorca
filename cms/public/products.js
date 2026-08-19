const formatOrder = ["A6", "A4", "A3", "A2"];
let products = [];
let artists = [];
let selectedId = null;
const money = cents => new Intl.NumberFormat("de-DE", { style:"currency", currency:"EUR" }).format(Number(cents || 0) / 100);
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[char]);
const formatMap = product => Object.fromEntries((product?.formats || []).map(entry => [entry.format, entry]));

async function load() {
  const [productResponse, artistResponse] = await Promise.all([fetch("/api/products"), fetch("/api/artists")]);
  if (productResponse.status === 401 || artistResponse.status === 401) return location.href = "/";
  products = (await productResponse.json()).products || [];
  artists = (await artistResponse.json()).artists || [];
  renderList();
}
function renderList() {
  const needle = document.querySelector("#search").value.trim().toLowerCase();
  const visible = products.filter(product => `${product.artist?.name} ${product.title}`.toLowerCase().includes(needle));
  document.querySelector("#product-count").textContent = `${visible.length} Produkte`;
  let previousArtist = "";
  document.querySelector("#product-list").innerHTML = visible.map(product => {
    const artist = product.artist?.name || "Ohne Künstler";
    const heading = artist !== previousArtist ? `<h2>${escapeHtml(artist)}</h2>` : "";
    previousArtist = artist;
    const prices = (product.formats || []).filter(entry => entry.available).map(entry => `${entry.format} ${money(entry.priceCents)}`).join(" · ");
    return `${heading}<button class="product-row ${selectedId === product.id ? "selected" : ""}" data-product="${escapeHtml(product.id)}"><span><strong>${escapeHtml(artist)} · ${escapeHtml(product.title)}</strong><small>${escapeHtml(prices || "Keine Formate aktiviert")}</small></span><span class="badges">${product.featured ? '<i class="featured">Neuheit</i>' : ""}<i class="${product.active ? "live" : "draft"}">${product.active ? "Aktiv" : "Entwurf"}</i></span></button>`;
  }).join("") || '<div class="empty">Keine Produkte gefunden.</div>';
  document.querySelectorAll("[data-product]").forEach(button => button.onclick = () => openEditor(button.dataset.product));
}
function openEditor(id) {
  selectedId = id;
  renderEditor(products.find(entry => entry.id === id));
  renderList();
}
function renderEditor(product = null) {
  const formats = formatMap(product);
  document.querySelector("#editor").innerHTML = `<form id="product-form"><div class="editor-head"><div><p class="eyebrow">${product ? "PRODUKT BEARBEITEN" : "NEUES PRODUKT"}</p><h2>${escapeHtml(product ? `${product.artist?.name} · ${product.title}` : "Neues Motiv")}</h2></div><button type="button" class="editor-close" aria-label="Schließen">×</button></div><label>Künstler<select name="artistId" required><option value="">Bitte wählen</option>${artists.map(artist => `<option value="${escapeHtml(artist.id)}" ${artist.id === product?.artist?.id ? "selected" : ""}>${escapeHtml(artist.name)}</option>`).join("")}</select></label><label>Motivname<input name="title" required value="${escapeHtml(product?.title || "")}" placeholder="z. B. Mallorca · Capdepera"></label><label>Beschreibung Deutsch<textarea name="descriptionDe" rows="5">${escapeHtml(product?.description_de || "")}</textarea></label><label>Descripción Español<textarea name="descriptionEs" rows="5">${escapeHtml(product?.description_es || "")}</textarea></label><fieldset><legend>Formate & Grundpreise</legend>${formatOrder.map(format => { const entry = formats[format] || {}; return `<div class="format-row"><label class="check"><input type="checkbox" name="available-${format}" ${entry.available ? "checked" : ""}><span>${format} erhältlich</span></label><label>Preis €<input type="number" min="0" step="0.01" name="price-${format}" value="${Number(entry.priceCents || 0) / 100}"></label></div>`; }).join("")}</fieldset><div class="switches"><label class="check"><input type="checkbox" name="active" ${product?.active ? "checked" : ""}><span>Im Shop aktiv</span></label><label class="check"><input type="checkbox" name="featured" ${product?.featured ? "checked" : ""}><span>Als Neuheit markieren</span></label></div>${!product ? '<p class="editor-note">Neue Produkte bleiben standardmäßig unsichtbar. Aktiviere sie erst, nachdem später das Produktbild hinzugefügt wurde.</p>' : ""}<div class="editor-actions"><span id="save-state"></span><button class="primary" type="submit">Produkt speichern</button></div></form>`;
  document.querySelector(".editor-close").onclick = closeEditor;
  document.querySelector("#product-form").onsubmit = saveProduct;
}
function closeEditor() {
  selectedId = null;
  document.querySelector("#editor").innerHTML = '<div class="editor-placeholder"><strong>Produkt auswählen</strong><p>Wähle links ein Motiv oder lege ein neues Produkt an.</p></div>';
  renderList();
}
async function saveProduct(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const body = { artistId:form.get("artistId"), title:form.get("title"), descriptionDe:form.get("descriptionDe"), descriptionEs:form.get("descriptionEs"), active:form.has("active"), featured:form.has("featured"), formats:formatOrder.map(format => ({ format, available:form.has(`available-${format}`), priceCents:Math.round(Number(form.get(`price-${format}`) || 0) * 100) })) };
  const state = document.querySelector("#save-state");
  state.textContent = "Speichert …";
  const response = await fetch(selectedId ? `/api/products/${encodeURIComponent(selectedId)}` : "/api/products", { method:selectedId ? "PATCH" : "POST", headers:{"content-type":"application/json"}, body:JSON.stringify(body) });
  if (!response.ok) { const data = await response.json().catch(() => ({})); state.textContent = data.error || "Speichern fehlgeschlagen"; return; }
  const result = await response.json();
  if (!selectedId) selectedId = result.id;
  await load();
  openEditor(selectedId);
}
document.querySelector("#new-product").onclick = () => { selectedId = null; renderEditor(); renderList(); };
document.querySelector("#search").oninput = renderList;
load().catch(() => document.querySelector("#product-list").innerHTML = '<div class="empty">Produkte konnten nicht geladen werden.</div>');
