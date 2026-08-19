let payload = { settings:{ hero_mode:"random", hero_image_id:null, selection_image_ids:[] }, images:[] };
const storefrontUrl = "https://colectivograficomallorca-production.up.railway.app";
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[char]);
const imageSource = image => image.path?.startsWith("/api/public/images/") ? `/media/${image.id}` : `${storefrontUrl}${image.path}`;
const label = image => `${image.artist} · ${image.title}${image.image_type === "room" ? " · Raumansicht" : " · Hauptbild"}`;

async function load() {
  const response = await fetch("/api/homepage");
  if (response.status === 401) return location.href = "/";
  payload = await response.json();
  render();
}
function render() {
  const selected = (payload.settings.selection_image_ids || []).map(Number);
  document.querySelector("#homepage-editor").innerHTML = `<section class="home-panel"><p class="eyebrow">HEADER</p><h2>Hauptbild</h2><div class="hero-modes"><label><input type="radio" name="hero-mode" value="graphic" ${payload.settings.hero_mode === "graphic" ? "checked" : ""}> Neutrale grafische Komposition</label><label><input type="radio" name="hero-mode" value="fixed" ${payload.settings.hero_mode === "fixed" ? "checked" : ""}> Festes Bild aus der Kollektion</label><label><input type="radio" name="hero-mode" value="random" ${payload.settings.hero_mode === "random" ? "checked" : ""}> Zufälliges Bild bei jedem Seitenaufruf</label></div><label class="hero-select">Festes Headerbild<select id="hero-image"><option value="">Bild wählen</option>${payload.images.map(image => `<option value="${image.id}" ${Number(payload.settings.hero_image_id) === Number(image.id) ? "selected" : ""}>${escapeHtml(label(image))}</option>`).join("")}</select></label></section><section class="home-panel"><div class="selection-title"><div><p class="eyebrow">EINE ERSTE AUSWAHL</p><h2>Vier Bilder festlegen</h2></div><strong id="selection-count">${selected.length}/4</strong></div><p class="editor-note">Hauptbilder und Raumansichten können frei gemischt werden. Dieser Bereich ist unabhängig von den acht Neuheiten.</p><div class="homepage-image-grid">${payload.images.map(image => `<label class="homepage-image ${selected.includes(Number(image.id)) ? "selected" : ""}"><input type="checkbox" value="${image.id}" ${selected.includes(Number(image.id)) ? "checked" : ""}><img src="${escapeHtml(imageSource(image))}" alt=""><span><strong>${escapeHtml(image.artist)} · ${escapeHtml(image.title)}</strong><small>${image.image_type === "room" ? "Raumansicht" : "Hauptbild"}</small></span></label>`).join("")}</div></section><p id="save-state"></p>`;
  document.querySelectorAll('.homepage-image input').forEach(input => input.onchange = enforceLimit);
}
function enforceLimit(event) {
  const checked = [...document.querySelectorAll('.homepage-image input:checked')];
  if (checked.length > 4) { event.target.checked = false; return; }
  document.querySelector("#selection-count").textContent = `${checked.length}/4`;
  document.querySelectorAll('.homepage-image').forEach(card => card.classList.toggle('selected', card.querySelector('input').checked));
}
async function save() {
  const state = document.querySelector("#save-state");
  const heroMode = document.querySelector('input[name="hero-mode"]:checked').value;
  const heroImageId = document.querySelector("#hero-image").value || null;
  if (heroMode === "fixed" && !heroImageId) { state.textContent = "Bitte ein festes Headerbild wählen."; return; }
  const selectionImageIds = [...document.querySelectorAll('.homepage-image input:checked')].map(input => Number(input.value));
  if (selectionImageIds.length !== 4) { state.textContent = "Bitte genau vier Bilder für die erste Auswahl markieren."; return; }
  state.textContent = "Speichert …";
  const response = await fetch("/api/homepage", { method:"PATCH", headers:{"content-type":"application/json"}, body:JSON.stringify({ heroMode, heroImageId, selectionImageIds }) });
  state.textContent = response.ok ? "Titelseite gespeichert." : "Speichern fehlgeschlagen.";
  if (response.ok) await load();
}
document.querySelector("#save-homepage").onclick = save;
load().catch(() => document.querySelector("#homepage-editor").innerHTML = '<div class="empty">Titelseite konnte nicht geladen werden.</div>');
