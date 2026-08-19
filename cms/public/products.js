const formatOrder = ["A6", "A4", "A3", "A2"];
let products = [];
let artists = [];
let selectedId = null;
const money = cents => new Intl.NumberFormat("de-DE", { style:"currency", currency:"EUR" }).format(Number(cents || 0) / 100);
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[char]);
const formatMap = product => Object.fromEntries((product?.formats || []).map(entry => [entry.format, entry]));
const storefrontUrl = "https://colectivograficomallorca-production.up.railway.app";
const imageSource = image => image.path?.startsWith("/api/public/images/") ? `/media/${image.id}` : `${storefrontUrl}${image.path}`;

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
  const imageManager = product ? `<section class="image-manager"><div class="image-heading"><div><p class="eyebrow">BILDER</p><h3>Produkt- und Raumansichten</h3></div><span>Automatisch WebP</span></div><div class="image-grid">${(product.images || []).map((image,index) => `<article class="image-card"><img src="${escapeHtml(imageSource(image))}" alt="${escapeHtml(image.type === "primary" ? "Hauptbild" : "Raumansicht")}"><div><strong>${image.type === "primary" ? "Hauptbild" : `Raumansicht${image.shownFormat ? ` · ${image.shownFormat}` : ""}`}</strong><small>${escapeHtml(image.originalName || image.path.split("/").pop())}</small></div><div class="image-actions">${image.type === "room" ? `<button type="button" data-move="up" data-image="${image.id}" data-index="${index}" ${index <= 1 ? "disabled" : ""}>↑</button><button type="button" data-move="down" data-image="${image.id}" data-index="${index}" ${index === product.images.length - 1 ? "disabled" : ""}>↓</button>` : ""}<button type="button" class="danger" data-delete-image="${image.id}">Löschen</button></div></article>`).join("") || '<p class="editor-note">Noch keine Bilder vorhanden.</p>'}</div><div class="upload-box"><label>Bildtyp<select id="image-type"><option value="primary">Hauptbild ersetzen</option><option value="room">Raumansicht hinzufügen</option></select></label><label id="room-format-label">Gezeigtes Format<select id="shown-format"><option value="">Nicht angegeben</option>${formatOrder.map(format => `<option>${format}</option>`).join("")}</select></label><label>Datei<input id="image-file" type="file" accept="image/jpeg,image/png,image/webp"></label><button type="button" class="primary" id="upload-image">Bild hochladen</button><span id="upload-state"></span></div></section>` : "";
  document.querySelector("#editor").innerHTML = `<form id="product-form"><div class="editor-head"><div><p class="eyebrow">${product ? "PRODUKT BEARBEITEN" : "NEUES PRODUKT"}</p><h2>${escapeHtml(product ? `${product.artist?.name} · ${product.title}` : "Neues Motiv")}</h2></div><button type="button" class="editor-close" aria-label="Schließen">×</button></div><label>Künstler<select name="artistId" required><option value="">Bitte wählen</option>${artists.map(artist => `<option value="${escapeHtml(artist.id)}" ${artist.id === product?.artist?.id ? "selected" : ""}>${escapeHtml(artist.name)}</option>`).join("")}</select></label><label>Motivname<input name="title" required value="${escapeHtml(product?.title || "")}" placeholder="z. B. Mallorca · Capdepera"></label><label>Beschreibung Deutsch<textarea name="descriptionDe" rows="5">${escapeHtml(product?.description_de || "")}</textarea></label><label>Descripción Español<textarea name="descriptionEs" rows="5">${escapeHtml(product?.description_es || "")}</textarea></label>${imageManager}<fieldset><legend>Formate & Grundpreise</legend>${formatOrder.map(format => { const entry = formats[format] || {}; return `<div class="format-row"><label class="check"><input type="checkbox" name="available-${format}" ${entry.available ? "checked" : ""}><span>${format} erhältlich</span></label><label>Preis €<input type="number" min="0" step="0.01" name="price-${format}" value="${Number(entry.priceCents || 0) / 100}"></label></div>`; }).join("")}</fieldset><div class="switches"><label class="check"><input type="checkbox" name="active" ${product?.active ? "checked" : ""}><span>Im Shop aktiv</span></label><label class="check"><input type="checkbox" name="featured" ${product?.featured ? "checked" : ""}><span>Als Neuheit markieren</span></label></div>${!product ? '<p class="editor-note">Speichere das neue Produkt zuerst. Danach kannst du die Bilder hinzufügen und es im Shop aktivieren.</p>' : ""}<div class="editor-actions"><span id="save-state"></span><button class="primary" type="submit">Produkt speichern</button></div></form>`;
  document.querySelector(".editor-close").onclick = closeEditor;
  document.querySelector("#product-form").onsubmit = saveProduct;
  if (product) bindImageActions(product);
}
function bindImageActions(product) {
  document.querySelector("#upload-image").onclick = () => uploadImage(product.id);
  document.querySelectorAll("[data-delete-image]").forEach(button => button.onclick = () => deleteImage(product.id, button.dataset.deleteImage));
  document.querySelectorAll("[data-move]").forEach(button => button.onclick = () => moveImage(product.id, button.dataset.image, Number(button.dataset.index), button.dataset.move));
}
async function uploadImage(productId) {
  const file = document.querySelector("#image-file").files[0];
  const state = document.querySelector("#upload-state");
  if (!file) { state.textContent = "Bitte eine Bilddatei wählen."; return; }
  const data = new FormData();
  data.append("image", file); data.append("imageType", document.querySelector("#image-type").value); data.append("shownFormat", document.querySelector("#shown-format").value);
  state.textContent = "Wird optimiert und hochgeladen …";
  const response = await fetch(`/api/products/${encodeURIComponent(productId)}/images`, { method:"POST", body:data });
  if (!response.ok) { state.textContent = "Upload fehlgeschlagen."; return; }
  await refreshSelected(productId);
}
async function deleteImage(productId, imageId) {
  const response = await fetch(`/api/products/${encodeURIComponent(productId)}/images/${encodeURIComponent(imageId)}`, { method:"DELETE" });
  if (response.ok) await refreshSelected(productId);
}
async function moveImage(productId, imageId, index, direction) {
  const sortOrder = direction === "up" ? Math.max(1,index - 1) : index + 1;
  const response = await fetch(`/api/products/${encodeURIComponent(productId)}/images/${encodeURIComponent(imageId)}`, { method:"PATCH", headers:{"content-type":"application/json"}, body:JSON.stringify({ sortOrder }) });
  if (response.ok) await refreshSelected(productId);
}
async function refreshSelected(productId) { await load(); openEditor(productId); }
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
