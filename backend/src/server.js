import crypto from "node:crypto";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import multer from "multer";
import sharp from "sharp";
import Stripe from "stripe";
import { initializeDatabase } from "./init-db.js";
import { pool, query } from "./db.js";

const app = express();
const port = Number(process.env.PORT || 3001);
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const origins = [
  process.env.STOREFRONT_ORIGIN,
  process.env.CMS_ORIGIN,
  "https://colectivograficomallorca.com",
  "https://www.colectivograficomallorca.com",
  "https://colectivograficomallorca-production.up.railway.app"
].filter(Boolean);const fulfillmentStatuses = ["new", "processing", "ready", "shipped", "completed", "canceled"];
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024, files: 1 }, fileFilter: (_request, file, callback) => callback(null, ["image/jpeg","image/png","image/webp"].includes(file.mimetype)) });
// CGM NEWSLETTER HELPERS V1
const newsletterBaseUrl = String(process.env.STOREFRONT_ORIGIN || "https://colectivograficomallorca.com").replace(/\/$/, "");
const newsletterFrom = process.env.RESEND_FROM || "Colectivo Gráfico Mallorca <newsletter@colectivograficomallorca.com>";
const token = () => crypto.randomBytes(24).toString("hex");
const htmlEscape = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]));
async function resend(pathname, payload, idempotencyKey) {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");
  const result = await fetch(`https://api.resend.com${pathname}`, {
    method:"POST",
    headers:{authorization:`Bearer ${process.env.RESEND_API_KEY}`,"content-type":"application/json",...(idempotencyKey?{"Idempotency-Key":idempotencyKey}:{})},
    body:JSON.stringify(payload)
  });
  const text = await result.text();
  if (!result.ok) throw new Error(`Resend ${result.status}: ${text}`);
  return text ? JSON.parse(text) : {};
}
function campaignMail(campaign, locale, unsubscribeUrl) {
  const es = locale === "es";
  const subject = es ? campaign.subject_es : campaign.subject_de;
  const preheader = es ? campaign.preheader_es : campaign.preheader_de;
  const heading = es ? campaign.heading_es : campaign.heading_de;
  const body = es ? campaign.body_es : campaign.body_de;
  const ctaLabel = (es ? campaign.cta_label_es : campaign.cta_label_de) || (es ? "Ir a la tienda" : "Jetzt zum Shop");
  const ctaUrl = campaign.cta_url || `${newsletterBaseUrl}/shop`;
  const paragraphs = String(body || "").split(/\n{2,}/).map(value => `<p style="font:17px/1.65 Georgia,serif;margin:0 0 20px">${htmlEscape(value).replace(/\n/g,"<br>")}</p>`).join("");
  const cta = `<p style="margin:34px 0"><a href="${htmlEscape(ctaUrl)}" style="display:inline-block;background:#c85f46;color:#fff;text-decoration:none;padding:14px 20px;font:700 12px Arial,sans-serif">${htmlEscape(ctaLabel)}</a></p>`;
  const unsubscribe = es ? "Darse de baja" : "Newsletter abbestellen";
  return {
    subject,
    html:`<!doctype html><html><body style="margin:0;background:#f6efe5;color:#162d29"><div style="display:none;max-height:0;overflow:hidden">${htmlEscape(preheader)}</div><div style="max-width:680px;margin:auto;padding:55px 28px"><div style="font:900 13px/.85 Arial,sans-serif">COLECTIVO<br>GRÁFICO<br>MALLORCA</div><h1 style="font:400 52px/.95 Georgia,serif;letter-spacing:-.04em;margin:55px 0 32px">${htmlEscape(heading || subject)}</h1>${paragraphs}${cta}<div style="border-top:1px solid #162d2940;margin-top:55px;padding-top:22px;font:11px/1.5 Arial,sans-serif"><a href="${htmlEscape(unsubscribeUrl)}" style="color:#162d29">${unsubscribe}</a><br>Artà · Mallorca</div></div></body></html>`,
    text:`${heading || subject}\n\n${body}\n\n${ctaLabel && campaign.cta_url ? `${ctaLabel}: ${campaign.cta_url}\n\n` : ""}${unsubscribe}: ${unsubscribeUrl}`
  };
}


// CGM ORDER CONFIRMATION MAIL HELPER V1
function orderConfirmationMail(order, items) {
  const es = order.locale === "es";

  const money = cents =>
    new Intl.NumberFormat(es ? "es-ES" : "de-DE", {
      style: "currency",
      currency: "EUR"
    }).format(Number(cents || 0) / 100);

  const frameNames = {
    unframed: es ? "sin marco" : "ungerahmt",
    "standard-black": es ? "marco estándar negro" : "Standardrahmen Schwarz",
    "aluminium-silver": es ? "aluminio plata con cristal" : "Aluminium Silber mit Echtglas",
    "aluminium-black": es ? "aluminio negro con cristal" : "Aluminium Schwarz mit Echtglas",
    "aluminium-gold": es ? "aluminio oro con cristal" : "Aluminium Gold mit Echtglas",
    custom: es ? "enmarcación personalizada" : "individuelle Rahmung"
  };

  const formatNames = {
    A6: es ? "Postal" : "Postkarte",
    A4: "20 × 30 cm",
    A3: "30 × 40 cm",
    A2: "40 × 60 cm"
  };

  const rows = items.map(item => {
    const meta = [
      formatNames[item.format] || item.format,
      frameNames[item.frame_id] || item.frame_id
    ].filter(Boolean).join(" · ");

    return `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #162d2925">
          <strong style="display:block;font:700 14px Arial,sans-serif">
            ${htmlEscape(item.product_title)}
          </strong>
          <span style="display:block;margin-top:5px;font:12px Arial,sans-serif;opacity:.65">
            ${htmlEscape(meta)} · ${item.quantity}×
          </span>
        </td>
        <td style="padding:14px 0;border-bottom:1px solid #162d2925;text-align:right;font:14px Arial,sans-serif">
          ${money(item.unit_price_cents * item.quantity)}
        </td>
      </tr>`;
  }).join("");

  const orderNo = String(order.id || "").slice(0, 8).toUpperCase();

  const subject = es
    ? `Gracias por tu pedido · ${orderNo}`
    : `Vielen Dank für deine Bestellung · ${orderNo}`;

  const heading = es
    ? "Gracias por tu pedido."
    : "Vielen Dank für deine Bestellung.";

  const intro = es
    ? "Hemos recibido tu pago y tu pedido ya está en proceso. Prepararemos todo con cuidado en Artà."
    : "Wir haben deine Zahlung erhalten und deine Bestellung wird jetzt bearbeitet. Wir bereiten alles sorgfältig in Artà vor.";

  const follow = es
    ? "En cuanto hayamos enviado tu pedido, recibirás una confirmación de envío por correo electrónico."
    : "Sobald deine Bestellung versendet wurde, erhältst du eine Versandbestätigung per E-Mail.";

  const shopLabel = es ? "Volver a la tienda" : "Zurück zum Shop";
  const orderLabel = es ? "Pedido" : "Bestellung";
  const totalLabel = es ? "Total" : "Gesamtsumme";
  const subtotalLabel = es ? "Subtotal" : "Zwischensumme";
  const shippingLabel = es ? "Envío" : "Versand";
  const shippingValue = Number(order.shipping_cents || 0) === 0 ? (es ? "Gratis" : "Kostenlos") : money(order.shipping_cents);

  return {
    subject,
    html: `<!doctype html>
<html>
<body style="margin:0;background:#f6efe5;color:#162d29">
  <div style="max-width:680px;margin:auto;padding:55px 28px">

    <div style="font:900 13px/.85 Arial,sans-serif">
      COLECTIVO<br>GRÁFICO<br>MALLORCA
    </div>

    <h1 style="font:400 50px/.95 Georgia,serif;letter-spacing:-.04em;margin:55px 0 28px">
      ${heading}
    </h1>

    <p style="font:17px/1.65 Georgia,serif;margin:0 0 18px">${intro}</p>
    <p style="font:17px/1.65 Georgia,serif;margin:0 0 34px">${follow}</p>

    <div style="border-top:1px solid #162d2940;border-bottom:1px solid #162d2940;padding:18px 0;margin-bottom:24px">
      <span style="font:10px Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase">${orderLabel}</span>
      <strong style="float:right;font:18px Georgia,serif">${orderNo}</strong>
    </div>

    <table style="width:100%;border-collapse:collapse">
      ${rows}
    </table>

    <div style="padding:18px 0;border-bottom:1px solid #162d2925;font:13px Arial,sans-serif"><div style="display:flex;justify-content:space-between;gap:20px;margin-bottom:8px"><span>${subtotalLabel}</span><strong>${money(order.subtotal_cents || (order.total_cents - Number(order.shipping_cents || 0)))}</strong></div><div style="display:flex;justify-content:space-between;gap:20px"><span>${shippingLabel}</span><strong>${shippingValue}</strong></div></div><div style="padding:20px 0 34px;text-align:right">
      <span style="font:11px Arial,sans-serif;text-transform:uppercase;letter-spacing:.1em">${totalLabel}</span>
      <strong style="display:block;margin-top:6px;font:30px Georgia,serif">
        ${money(order.total_cents)}
      </strong>
    </div>

    <p style="margin:0 0 40px">
      <a href="${newsletterBaseUrl}/shop"
         style="display:inline-block;background:#c85f46;color:#fff;text-decoration:none;padding:14px 20px;font:700 12px Arial,sans-serif">
        ${shopLabel}
      </a>
    </p>

    <div style="border-top:1px solid #162d2940;padding-top:20px;font:11px/1.6 Arial,sans-serif">
      Colectivo Gráfico Mallorca · Artà · Mallorca<br>
      info@colectivograficomallorca.com
    </div>

  </div>
</body>
</html>`,
    text:
`${heading}

${intro}
${follow}

${orderLabel}: ${orderNo}

${items.map(item =>
  `${item.quantity}× ${item.product_title} — ${money(item.unit_price_cents * item.quantity)}`
).join("\n")}

${subtotalLabel}: ${money(order.subtotal_cents || (order.total_cents - Number(order.shipping_cents || 0)))}\n${shippingLabel}: ${shippingValue}\n${totalLabel}: ${money(order.total_cents)}

${shopLabel}: ${newsletterBaseUrl}/shop`
  };
}

// CGM SHIPPING HELPERS V1
const freeShippingThresholdCents = 8000;
const europeanShippingCountries = new Set(["DE","FR","AT","BE","NL","IT","PT"]);
function shippingCostCents(subtotalCents, country) {
  if (subtotalCents >= freeShippingThresholdCents) return 0;
  if (country === "ES") return 695;
  if (europeanShippingCountries.has(country)) return 1295;
  return null;
}

function shippingConfirmationMail(order) {
  const es = order.locale === "es";
  const orderNo = String(order.id || "").slice(0,8).toUpperCase();
  const subject = es ? `Tu pedido ha sido enviado · ${orderNo}` : `Deine Bestellung wurde versendet · ${orderNo}`;
  const heading = es ? "Tu pedido está en camino." : "Deine Bestellung ist unterwegs.";
  const text = es
    ? "Hemos enviado tu pedido. Muchas gracias por tu compra y un saludo desde Artà."
    : "Wir haben deine Bestellung versendet. Vielen Dank für deinen Einkauf und viele Grüße aus Artà.";
  const button = es ? "Volver a la tienda" : "Zurück zum Shop";

  return {
    subject,
    html:`<!doctype html><html><body style="margin:0;background:#f6efe5;color:#162d29"><div style="max-width:680px;margin:auto;padding:55px 28px"><div style="font:900 13px/.85 Arial,sans-serif">COLECTIVO<br>GRÁFICO<br>MALLORCA</div><h1 style="font:400 50px/.95 Georgia,serif;letter-spacing:-.04em;margin:55px 0 28px">${heading}</h1><p style="font:17px/1.65 Georgia,serif;margin:0 0 32px">${text}</p><div style="border-top:1px solid #162d2940;border-bottom:1px solid #162d2940;padding:18px 0;margin-bottom:34px"><span style="font:10px Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase">${es?"Pedido":"Bestellung"}</span><strong style="float:right;font:18px Georgia,serif">${orderNo}</strong></div><p style="margin:0 0 40px"><a href="${newsletterBaseUrl}/shop" style="display:inline-block;background:#c85f46;color:#fff;text-decoration:none;padding:14px 20px;font:700 12px Arial,sans-serif">${button}</a></p><div style="border-top:1px solid #162d2940;padding-top:20px;font:11px/1.6 Arial,sans-serif">Colectivo Gráfico Mallorca · Artà · Mallorca<br>info@colectivograficomallorca.com</div></div></body></html>`,
    text:`${heading}\n\n${text}\n\n${es?"Pedido":"Bestellung"}: ${orderNo}\n\n${button}: ${newsletterBaseUrl}/shop`
  };
}


// CGM ORDER NOTIFICATION HELPER V1
function orderNotificationMail(order, items) {
  const money = cents => new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR"
  }).format(Number(cents || 0) / 100);

  const orderNo = String(order.id || "").slice(0, 8).toUpperCase();
  const address = order.shipping_address || {};
  const addressLines = [
    address.line1,
    address.line2,
    [address.postal_code, address.city].filter(Boolean).join(" "),
    address.state,
    address.country
  ].filter(Boolean);

  const itemLines = items.map(item => {
    const meta = [item.format, item.frame_id].filter(Boolean).join(" · ");
    return `${item.quantity}× ${item.product_title}${meta ? ` · ${meta}` : ""} — ${money(item.unit_price_cents * item.quantity)}`;
  }).join("\n");

  const subtotal = Number(order.subtotal_cents || (Number(order.total_cents || 0) - Number(order.shipping_cents || 0)));
  const shipping = Number(order.shipping_cents || 0);
  const subject = `Neue Bestellung · ${orderNo} · ${money(order.total_cents)}`;

  const text = `Neue Bestellung

Bestellung: ${orderNo}
Kunde: ${order.customer_name || "–"}
E-Mail: ${order.customer_email || "–"}
Telefon: ${order.customer_phone || "–"}

Artikel:
${itemLines || "–"}

Zwischensumme: ${money(subtotal)}
Versand: ${shipping === 0 ? "Kostenlos" : money(shipping)}
Gesamt: ${money(order.total_cents)}

Lieferadresse:
${addressLines.join("\n") || "–"}

Sprache: ${String(order.locale || "de").toUpperCase()}`;

  const rows = items.map(item => {
    const meta = [item.format, item.frame_id].filter(Boolean).join(" · ");
    return `<tr>
      <td style="padding:10px 0;border-bottom:1px solid #162d2925">
        <strong>${htmlEscape(item.product_title)}</strong>
        <div style="font-size:11px;opacity:.65;margin-top:4px">${htmlEscape(meta)} · ${item.quantity}×</div>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #162d2925;text-align:right">
        ${money(item.unit_price_cents * item.quantity)}
      </td>
    </tr>`;
  }).join("");

  const html = `<!doctype html><html><body style="margin:0;background:#f6efe5;color:#162d29">
    <div style="max-width:680px;margin:auto;padding:48px 28px">
      <div style="font:900 13px/.85 Arial,sans-serif">COLECTIVO<br>GRÁFICO<br>MALLORCA</div>
      <h1 style="font:400 44px/.95 Georgia,serif;letter-spacing:-.04em;margin:46px 0 28px">Neue Bestellung.</h1>
      <div style="font:14px/1.6 Arial,sans-serif;margin-bottom:28px">
        <strong>Bestellung ${orderNo}</strong><br>
        ${htmlEscape(order.customer_name || "–")}<br>
        ${htmlEscape(order.customer_email || "–")}
        ${order.customer_phone ? `<br>${htmlEscape(order.customer_phone)}` : ""}
      </div>
      <table style="width:100%;border-collapse:collapse;font:13px Arial,sans-serif">${rows}</table>
      <div style="padding:18px 0;font:13px Arial,sans-serif">
        <div style="display:flex;justify-content:space-between;margin-bottom:7px"><span>Zwischensumme</span><strong>${money(subtotal)}</strong></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:7px"><span>Versand</span><strong>${shipping === 0 ? "Kostenlos" : money(shipping)}</strong></div>
        <div style="display:flex;justify-content:space-between;border-top:1px solid #162d2940;padding-top:12px;margin-top:12px;font-size:18px"><span>Gesamt</span><strong>${money(order.total_cents)}</strong></div>
      </div>
      <div style="border-top:1px solid #162d2940;padding-top:20px;margin-top:10px;font:13px/1.6 Arial,sans-serif">
        <strong>Lieferadresse</strong><br>
        ${addressLines.map(htmlEscape).join("<br>") || "–"}
      </div>
    </div>
  </body></html>`;

  return { subject, text, html };
}


// CGM FRAMING REQUESTS V1
const framingUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 3 },
  fileFilter: (_request, file, callback) =>
    callback(null, ["image/jpeg","image/png","image/webp"].includes(file.mimetype))
});

const framingStatuses = ["new","processing","forwarded","quote_ready","offer_sent","paid","completed"];

const framingLabels = {
  de: {
    material: { wood:"Holz", aluminium:"Aluminium", unsure:"Noch unsicher" },
    color: { black:"Schwarz", white:"Weiß", natural:"Naturholz", silver:"Silber", gold:"Gold", other:"Andere", unsure:"Noch unsicher" },
    passepartout: { no:"Ohne Passepartout", yes:"Mit Passepartout", unsure:"Noch unsicher" },
    width: { narrow:"Schmal · ca. 3–4 cm", medium:"Mittel · ca. 5–7 cm", wide:"Breit · ca. 8–12 cm", other:"Andere Breite", unsure:"Noch unsicher" },
    glass: { normal:"Normalglas", anti_reflective:"Entspiegeltes Glas", unsure:"Noch unsicher" }
  },
  es: {
    material: { wood:"Madera", aluminium:"Aluminio", unsure:"Aún no lo sé" },
    color: { black:"Negro", white:"Blanco", natural:"Madera natural", silver:"Plata", gold:"Oro", other:"Otro", unsure:"Aún no lo sé" },
    passepartout: { no:"Sin paspartú", yes:"Con paspartú", unsure:"Aún no lo sé" },
    width: { narrow:"Estrecho · aprox. 3–4 cm", medium:"Medio · aprox. 5–7 cm", wide:"Ancho · aprox. 8–12 cm", other:"Otra anchura", unsure:"Aún no lo sé" },
    glass: { normal:"Cristal normal", anti_reflective:"Cristal antirreflejos", unsure:"Aún no lo sé" }
  }
};


function framingForwardMail(item, images) {
  const subject = `Solicitud de enmarcación ${String(item.id).slice(0,8).toUpperCase()} · ${item.product_title} · ${item.format}`;
  const imageNote = images.length
    ? `${images.length} imagen${images.length === 1 ? "" : "es"} de referencia adjunta${images.length === 1 ? "" : "s"}`
    : "Sin imágenes de referencia";

  const formatLabel = ({A4:"20 × 30 cm",A3:"30 × 40 cm",A2:"40 × 60 cm"})[item.format] || item.format;

  const material = framingLabels.es.material[item.material] || item.material;
  const color = framingLabels.es.color[item.frame_color] || item.frame_color;
  const passepartout = framingLabels.es.passepartout[item.passepartout] || item.passepartout;
  const passepartoutWidth = framingLabels.es.width[item.passepartout_width] || item.passepartout_width;
  const glass = framingLabels.es.glass[item.glass_type] || item.glass_type;

  const text = `Hola,

os enviamos la siguiente solicitud de enmarcación personalizada de Colectivo Gráfico Mallorca.

SOLICITUD
${String(item.id).slice(0,8).toUpperCase()}

PRINT
${item.product_title}
${item.artist_name}
${formatLabel}

CLIENTE
${item.customer_name}
${item.customer_email}
${item.customer_phone || "Sin teléfono indicado"}

ACABADO DESEADO
Material: ${material}
Color / acabado: ${color}
Paspartú: ${passepartout}
Anchura del paspartú: ${passepartoutWidth}
Cristal: ${glass}

OTROS DESEOS
${item.message || "No se han indicado otros deseos."}

${imageNote}

Por favor, revisad la opción solicitada y enviadnos el precio y las posibilidades de realización.

Muchas gracias.

Colectivo Gráfico Mallorca
Artà · Mallorca`;

  const html = `<!doctype html><html><body style="margin:0;background:#f6efe5;color:#162d29"><div style="max-width:680px;margin:auto;padding:48px 28px">
  <div style="font:900 13px/.85 Arial,sans-serif">COLECTIVO<br>GRÁFICO<br>MALLORCA</div>

  <h1 style="font:400 42px/.98 Georgia,serif;margin:45px 0 28px">
    Solicitud de enmarcación personalizada
  </h1>

  <p style="font:15px/1.6 Arial,sans-serif">
    Hola,<br><br>
    os enviamos la siguiente solicitud de enmarcación personalizada de Colectivo Gráfico Mallorca.
  </p>

  <div style="border-top:1px solid #162d2940;border-bottom:1px solid #162d2940;padding:16px 0;margin:24px 0">
    <strong style="font:22px Georgia,serif">${htmlEscape(item.product_title)}</strong><br>
    <span style="font:12px Arial,sans-serif">
      ${htmlEscape(item.artist_name)} · ${htmlEscape(formatLabel)}
    </span>
  </div>

  <table style="width:100%;border-collapse:collapse;font:13px Arial,sans-serif">
    <tr><td style="padding:8px 0;opacity:.6">Cliente</td><td style="padding:8px 0;text-align:right">${htmlEscape(item.customer_name)}</td></tr>
    <tr><td style="padding:8px 0;opacity:.6">E-Mail</td><td style="padding:8px 0;text-align:right">${htmlEscape(item.customer_email)}</td></tr>
    <tr><td style="padding:8px 0;opacity:.6">Teléfono</td><td style="padding:8px 0;text-align:right">${htmlEscape(item.customer_phone || "–")}</td></tr>
    <tr><td style="padding:8px 0;opacity:.6">Material</td><td style="padding:8px 0;text-align:right">${htmlEscape(material)}</td></tr>
    <tr><td style="padding:8px 0;opacity:.6">Color / acabado</td><td style="padding:8px 0;text-align:right">${htmlEscape(color)}</td></tr>
    <tr><td style="padding:8px 0;opacity:.6">Paspartú</td><td style="padding:8px 0;text-align:right">${htmlEscape(passepartout)}</td></tr>
    <tr><td style="padding:8px 0;opacity:.6">Anchura del paspartú</td><td style="padding:8px 0;text-align:right">${htmlEscape(passepartoutWidth)}</td></tr>
    <tr><td style="padding:8px 0;opacity:.6">Cristal</td><td style="padding:8px 0;text-align:right">${htmlEscape(glass)}</td></tr>
  </table>

  ${item.message ? `
    <div style="border-top:1px solid #162d2940;margin-top:22px;padding-top:18px">
      <strong style="font:11px Arial,sans-serif;text-transform:uppercase;letter-spacing:.08em">Otros deseos</strong>
      <p style="font:14px/1.6 Arial,sans-serif">${htmlEscape(item.message).replace(/\n/g,"<br>")}</p>
    </div>
  ` : ""}

  <p style="font:13px/1.6 Arial,sans-serif;margin-top:24px">
    ${htmlEscape(imageNote)}.<br><br>
    Por favor, revisad la opción solicitada y enviadnos el precio y las posibilidades de realización.
  </p>

  <p style="font:13px/1.6 Arial,sans-serif">
    Muchas gracias.
  </p>

  <div style="border-top:1px solid #162d2940;margin-top:36px;padding-top:18px;font:11px/1.5 Arial,sans-serif">
    Colectivo Gráfico Mallorca · Artà · Mallorca
  </div>
  </div></body></html>`;

  return { subject, text, html };
}

function framingOfferMail(item, offerUrl) {
  const es=item.locale==="es";
  const formatLabel=({A4:"20 × 30 cm",A3:"30 × 40 cm",A2:"40 × 60 cm"})[item.format]||item.format;
  const money=new Intl.NumberFormat(es?"es-ES":"de-DE",{style:"currency",currency:"EUR"}).format(Number(item.quote_price_cents||0)/100);
  const subject=es?`Tu oferta de enmarcación · ${item.product_title}`:`Dein Angebot für die individuelle Rahmung · ${item.product_title}`;
  const heading=es?"Tu oferta personalizada está lista.":"Dein individuelles Angebot ist fertig.";
  const intro=es?"Art i Vases ha revisado tu solicitud. Hemos preparado la siguiente oferta para ti.":"Art i Vases hat deine Anfrage geprüft. Wir haben daraus folgendes Angebot für dich erstellt.";
  const cta=es?"Ver oferta y pagar":"Angebot ansehen & bezahlen";
  const shipping=es?"Los gastos de envío se calculan según la dirección de entrega. A partir de 80 € el envío es gratuito.":"Die Versandkosten werden anhand der Lieferadresse berechnet. Ab 80 € Warenwert ist der Versand kostenlos.";
  return {subject,text:`${heading}

${intro}

${item.product_title}
${item.artist_name} · ${formatLabel}

${item.quote_description}

${es?"Precio de la oferta":"Angebotspreis"}: ${money}
${es?"IVA incluido":"inkl. MwSt."}

${shipping}

${cta}: ${offerUrl}

Colectivo Gráfico Mallorca
Artà · Mallorca`,html:`<!doctype html><html><body style="margin:0;background:#f6efe5;color:#162d29"><div style="max-width:680px;margin:auto;padding:55px 28px"><div style="font:900 13px/.85 Arial,sans-serif">COLECTIVO<br>GRÁFICO<br>MALLORCA</div><h1 style="font:400 48px/.96 Georgia,serif;margin:55px 0 28px">${htmlEscape(heading)}</h1><p style="font:17px/1.65 Georgia,serif">${htmlEscape(intro)}</p><div style="border-top:1px solid #162d2940;border-bottom:1px solid #162d2940;padding:20px 0;margin:24px 0"><strong style="display:block;font:24px Georgia,serif">${htmlEscape(item.product_title)}</strong><span style="font:12px Arial,sans-serif">${htmlEscape(item.artist_name)} · ${htmlEscape(formatLabel)}</span></div><div style="font:14px/1.65 Arial,sans-serif">${htmlEscape(item.quote_description||"").replace(/\n/g,"<br>")}</div><div style="border-top:1px solid #162d2940;padding-top:18px;margin-top:24px"><strong style="display:block;font:34px Georgia,serif">${htmlEscape(money)}</strong><small>${es?"IVA incluido":"inkl. MwSt."}</small></div><p style="font:12px/1.55 Arial,sans-serif">${htmlEscape(shipping)}</p><p style="margin:30px 0"><a href="${htmlEscape(offerUrl)}" style="display:inline-block;background:#c85f46;color:#fff;text-decoration:none;padding:15px 20px;font:700 12px Arial,sans-serif">${htmlEscape(cta)}</a></p><div style="border-top:1px solid #162d2940;margin-top:45px;padding-top:20px;font:11px Arial,sans-serif">Colectivo Gráfico Mallorca · Artà · Mallorca</div></div></body></html>`};
}

function framingRequestConfirmationMail(item) {
  const es = item.locale === "es";
  const orderNo = String(item.id || "").slice(0,8).toUpperCase();
  const subject = es ? `Hemos recibido tu solicitud de enmarcación · ${orderNo}` : `Wir haben deine Rahmungsanfrage erhalten · ${orderNo}`;

  const heading = es ? "Gracias por tu solicitud de enmarcación." : "Vielen Dank für deine Rahmungsanfrage.";
  const intro = es
    ? `Hemos recibido tus preferencias para ${htmlEscape(item.product_title)} en formato ${htmlEscape(item.format_label)}.`
    : `Wir haben deine Wünsche für ${htmlEscape(item.product_title)} im Format ${htmlEscape(item.format_label)} erhalten.`;
  const artIvases = es
    ? "Enviaremos tu solicitud a Art i Vases en Artà, nuestro taller de enmarcación de confianza. El equipo de Art i Vases revisará la opción solicitada y se pondrá en contacto contigo directamente con las posibilidades y el precio."
    : "Wir leiten deine Anfrage an Art i Vases in Artà, unsere Rahmerei des Vertrauens, weiter. Das Team von Art i Vases prüft die gewünschte Ausführung und meldet sich anschließend direkt bei dir mit den Möglichkeiten und dem Preis.";
  const nonBinding = es ? "La solicitud no implica ningún compromiso." : "Deine Anfrage ist selbstverständlich unverbindlich.";

  const rows = [
    [es ? "Material" : "Material", item.material_label],
    [es ? "Color / acabado" : "Farbe / Oberfläche", item.frame_color_label],
    ["Passepartout", item.passepartout_label],
    [es ? "Anchura del paspartú" : "Passepartout-Breite", item.passepartout_width_label],
    [es ? "Cristal" : "Glas", item.glass_type_label]
  ].map(([label,value]) => `<tr><td style="padding:9px 0;border-bottom:1px solid #162d2925;font:11px Arial,sans-serif;opacity:.65">${htmlEscape(label)}</td><td style="padding:9px 0;border-bottom:1px solid #162d2925;text-align:right;font:13px Arial,sans-serif">${htmlEscape(value)}</td></tr>`).join("");

  return {
    subject,
    html:`<!doctype html><html><body style="margin:0;background:#f6efe5;color:#162d29"><div style="max-width:680px;margin:auto;padding:55px 28px"><div style="font:900 13px/.85 Arial,sans-serif">COLECTIVO<br>GRÁFICO<br>MALLORCA</div><h1 style="font:400 48px/.95 Georgia,serif;letter-spacing:-.04em;margin:55px 0 28px">${heading}</h1><p style="font:17px/1.65 Georgia,serif;margin:0 0 18px">${intro}</p><p style="font:17px/1.65 Georgia,serif;margin:0 0 18px">${artIvases}</p><p style="font:17px/1.65 Georgia,serif;margin:0 0 32px">${nonBinding}</p><div style="border-top:1px solid #162d2940;border-bottom:1px solid #162d2940;padding:18px 0;margin-bottom:22px"><span style="font:10px Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase">${es?"Solicitud":"Anfrage"}</span><strong style="float:right;font:18px Georgia,serif">${orderNo}</strong></div><table style="width:100%;border-collapse:collapse">${rows}</table>${item.message ? `<p style="font:14px/1.6 Arial,sans-serif;margin:24px 0"><strong>${es?"Tus notas":"Deine Nachricht"}</strong><br>${htmlEscape(item.message).replace(/\n/g,"<br>")}</p>` : ""}<div style="border-top:1px solid #162d2940;margin-top:38px;padding-top:20px;font:11px/1.6 Arial,sans-serif">Colectivo Gráfico Mallorca · Artà · Mallorca<br>info@colectivograficomallorca.com</div></div></body></html>`,
    text:`${heading}\n\n${intro}\n\n${artIvases}\n\n${nonBinding}\n\n${es?"Solicitud":"Anfrage"}: ${orderNo}\n${es?"Material":"Material"}: ${item.material_label}\n${es?"Color / acabado":"Farbe / Oberfläche"}: ${item.frame_color_label}\nPassepartout: ${item.passepartout_label}\n${es?"Anchura del paspartú":"Passepartout-Breite"}: ${item.passepartout_width_label}\n${es?"Cristal":"Glas"}: ${item.glass_type_label}${item.message ? `\n\n${es?"Tus notas":"Deine Nachricht"}:\n${item.message}` : ""}`
  };
}

function requireCms(request, response, next) {
  const expected = process.env.CMS_API_TOKEN;
  const supplied = request.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!expected || !supplied || supplied.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return response.status(401).json({ error: "Unauthorized" });
  next();
}
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: origins.length ? origins : false }));
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (request, response) => {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return response.status(503).send("Stripe is not configured");
  try {
    const event = stripe.webhooks.constructEvent(request.body, request.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      await query(`UPDATE orders SET status='paid',stripe_payment_intent_id=$1,customer_email=$2,total_cents=$3,updated_at=NOW() WHERE stripe_checkout_session_id=$4`, [session.payment_intent, session.customer_details?.email || null, session.amount_total || 0, session.id]);
    } else if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object;
      const paymentMethod = intent.payment_method ? await stripe.paymentMethods.retrieve(intent.payment_method) : null;
      const billing = paymentMethod?.billing_details;
      const shipping = intent.shipping;
      await query(`UPDATE orders SET status='paid',fulfillment_status=CASE WHEN fulfillment_status='new' THEN 'new' ELSE fulfillment_status END,
        customer_email=$1,customer_name=$2,customer_phone=$3,shipping_address=$4,total_cents=$5,updated_at=NOW()
        WHERE stripe_payment_intent_id=$6`, [intent.receipt_email || billing?.email || null, shipping?.name || billing?.name || null,
        shipping?.phone || billing?.phone || null, shipping?.address ? JSON.stringify(shipping.address) : null,
        intent.amount_received || intent.amount, intent.id]);

      // CGM SEND ORDER CONFIRMATION V2
      const paidOrder = (await query("SELECT * FROM orders WHERE stripe_payment_intent_id=$1", [intent.id])).rows[0];
      if (paidOrder) await query("UPDATE framing_requests SET status='paid',paid_at=COALESCE(paid_at,NOW()),updated_at=NOW() WHERE order_id=$1",[paidOrder.id]);
      if (paidOrder?.customer_email && !paidOrder.confirmation_email_sent_at) {
        const orderItems = (await query("SELECT product_title,format,frame_id,quantity,unit_price_cents FROM order_items WHERE order_id=$1 ORDER BY id", [paidOrder.id])).rows;
        const mail = orderConfirmationMail(paidOrder, orderItems);
        try {
          const sentMail = await resend("/emails", {
            from: newsletterFrom,
            to: [paidOrder.customer_email],
            subject: mail.subject,
            html: mail.html,
            text: mail.text,
            tags: [{ name:"category", value:"order_confirmation" }]
          }, `order-confirmation/${paidOrder.id}`);
          await query(
            `UPDATE orders SET confirmation_email_sent_at=NOW(),confirmation_email_resend_id=$2,confirmation_email_error=NULL,updated_at=NOW() WHERE id=$1`,
            [paidOrder.id, sentMail?.id || null]
          );
        } catch (mailError) {
          console.error("Order confirmation email failed", { orderId: paidOrder.id, error: mailError.message });
          await query(
            "UPDATE orders SET confirmation_email_error=$2,updated_at=NOW() WHERE id=$1",
            [paidOrder.id, String(mailError.message || "Unknown email error").slice(0,2000)]
          );
        }
      }


      // CGM SEND ORDER NOTIFICATION V1
      const notifyEmail = String(process.env.ORDER_NOTIFICATION_EMAIL || "").trim();
      if (notifyEmail) {
        const notifyOrder = (await query(
          "SELECT * FROM orders WHERE stripe_payment_intent_id=$1",
          [intent.id]
        )).rows[0];

        if (notifyOrder && !notifyOrder.notification_email_sent_at) {
          const notifyItems = (await query(
            "SELECT product_title,format,frame_id,quantity,unit_price_cents FROM order_items WHERE order_id=$1 ORDER BY id",
            [notifyOrder.id]
          )).rows;

          const notification = orderNotificationMail(notifyOrder, notifyItems);

          try {
            const sentMail = await resend("/emails", {
              from: newsletterFrom,
              to: [notifyEmail],
              subject: notification.subject,
              html: notification.html,
              text: notification.text,
              tags: [{ name: "category", value: "order_notification" }]
            }, `order-notification/${notifyOrder.id}`);

            await query(
              `UPDATE orders
               SET notification_email_sent_at=NOW(),
                   notification_email_resend_id=$2,
                   notification_email_error=NULL,
                   updated_at=NOW()
               WHERE id=$1`,
              [notifyOrder.id, sentMail?.id || null]
            );
          } catch (mailError) {
            console.error("Order notification email failed", {
              orderId: notifyOrder.id,
              error: mailError.message
            });

            await query(
              "UPDATE orders SET notification_email_error=$2,updated_at=NOW() WHERE id=$1",
              [notifyOrder.id, String(mailError.message || "Unknown email error").slice(0,2000)]
            );
          }
        }
      }

    } else if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object;
      await query(`UPDATE orders SET status='payment_failed',updated_at=NOW() WHERE stripe_payment_intent_id=$1`, [intent.id]);
    } else if (event.type === "payment_intent.canceled") {
      const intent = event.data.object;
      await query(`UPDATE orders SET status='canceled',fulfillment_status='canceled',updated_at=NOW() WHERE stripe_payment_intent_id=$1`, [intent.id]);
    } else if (event.type === "charge.refunded") {
      const charge = event.data.object;
      await query(`UPDATE orders SET status='refunded',fulfillment_status='canceled',updated_at=NOW() WHERE stripe_payment_intent_id=$1`, [charge.payment_intent]);
    }
    response.json({ received: true });
  } catch (error) { response.status(400).send(`Webhook error: ${error.message}`); }
});
app.use(express.json({ limit: "100kb" }));

app.get("/health", async (_request, response) => {
  try {
    await query("SELECT 1");
    response.json({ status: "ok", database: "connected" });
  } catch { response.status(503).json({ status: "error", database: "unavailable" }); }
});

app.get("/api/public/artists", async (_request, response, next) => {
  try {
    const result = await query("SELECT id,name,bio_de,bio_es FROM artists WHERE active=TRUE ORDER BY sort_order,name");
    response.json({ artists: result.rows });
  } catch (error) { next(error); }
});

const productQuery = `SELECT p.id,p.slug,p.title,p.description_de,p.description_es,p.active,p.featured,p.sort_order,p.updated_at,
  json_build_object('id',a.id,'name',a.name) AS artist,
  COALESCE((SELECT json_agg(json_build_object('id',i.id,'type',i.image_type,'path',i.path,'roomCode',i.room_code,'shownFormat',i.shown_format,'sortOrder',i.sort_order,'originalName',i.original_name) ORDER BY i.sort_order)
    FROM product_images i WHERE i.product_id=p.id),'[]') AS images,
  COALESCE((SELECT json_agg(json_build_object('format',f.format,'priceCents',f.price_cents,'available',f.available)
    ORDER BY array_position(ARRAY['A6','A4','A3','A2'],f.format)) FROM product_formats f WHERE f.product_id=p.id),'[]') AS formats
  FROM products p JOIN artists a ON a.id=p.artist_id`;

app.get("/api/public/products", async (request, response, next) => {
  try {
    const values = [];
    let where = "WHERE p.active=TRUE";
    if (request.query.artist) {
      values.push(request.query.artist);
      where += ` AND a.id=$${values.length}`;
    }
    const limit = request.query.featured === "true" ? " LIMIT 8" : "";
    const order = request.query.featured === "true" ? "p.featured DESC,p.updated_at DESC,p.created_at DESC" : "a.sort_order,p.sort_order";
    const result = await query(`${productQuery} ${where} ORDER BY ${order}${limit}`, values);
    response.json({ products: result.rows });
  } catch (error) { next(error); }
});

app.get("/api/public/images/:id", async (request, response, next) => {
  try {
    const result = await query("SELECT image_data,mime_type,uploaded_at FROM product_images WHERE id=$1 AND image_data IS NOT NULL", [request.params.id]);
    if (!result.rowCount) return response.status(404).send("Image not found");
    response.set({ "Content-Type": result.rows[0].mime_type || "image/webp", "Cache-Control": "public, max-age=31536000, immutable" });
    response.send(result.rows[0].image_data);
  } catch (error) { next(error); }
});

app.get("/api/public/homepage", async (_request, response, next) => {
  try {
    const settings = (await query("SELECT hero_mode,hero_image_id,selection_image_ids FROM homepage_settings WHERE id=TRUE")).rows[0] || { hero_mode:"random", selection_image_ids:[] };
    let hero = null;
    if (settings.hero_mode === "fixed" && settings.hero_image_id) {
      hero = (await query(`SELECT i.id,i.path,i.image_type,p.slug,p.title,a.name AS artist FROM product_images i JOIN products p ON p.id=i.product_id JOIN artists a ON a.id=p.artist_id WHERE i.id=$1 AND p.active=TRUE`, [settings.hero_image_id])).rows[0] || null;
    } else if (settings.hero_mode === "random") {
      hero = (await query(`SELECT i.id,i.path,i.image_type,p.slug,p.title,a.name AS artist FROM product_images i JOIN products p ON p.id=i.product_id JOIN artists a ON a.id=p.artist_id WHERE p.active=TRUE ORDER BY RANDOM() LIMIT 1`)).rows[0] || null;
    }
    const selection = (await query(`SELECT i.id,i.path,i.image_type,p.slug,p.title,a.name AS artist FROM jsonb_array_elements_text($1::jsonb) WITH ORDINALITY chosen(id,position) JOIN product_images i ON i.id=chosen.id::bigint JOIN products p ON p.id=i.product_id JOIN artists a ON a.id=p.artist_id WHERE p.active=TRUE ORDER BY chosen.position LIMIT 4`, [JSON.stringify(settings.selection_image_ids || [])])).rows;
    response.set("Cache-Control", "no-store");
    response.json({ heroMode:settings.hero_mode, hero, selection });
  } catch (error) { next(error); }
});

app.get("/api/public/products/:slug", async (request, response, next) => {
  try {
    const result = await query(`${productQuery} WHERE p.slug=$1 AND p.active=TRUE`, [request.params.slug]);
    if (!result.rowCount) return response.status(404).json({ error: "Product not found" });
    response.json(result.rows[0]);
  } catch (error) { next(error); }
});

// CGM NEWSLETTER PUBLIC V1
app.post("/api/public/newsletter", async (request, response, next) => {
  try {
    const email = String(request.body?.email || "").trim().toLowerCase();
    const locale = request.body?.locale === "es" ? "es" : "de";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return response.status(400).json({ error:"Invalid email" });
    const confirmationToken = token();
    const unsubscribeToken = token();
    await query(`INSERT INTO newsletter_subscribers(email,locale,status,confirmation_token,unsubscribe_token,consent_at,confirmation_sent_at)
      VALUES($1,$2,'pending',$3,$4,NOW(),NOW())
      ON CONFLICT(email) DO UPDATE SET locale=EXCLUDED.locale,status='pending',confirmation_token=EXCLUDED.confirmation_token,
      unsubscribe_token=COALESCE(newsletter_subscribers.unsubscribe_token,EXCLUDED.unsubscribe_token),consent_at=NOW(),confirmation_sent_at=NOW(),unsubscribed_at=NULL`,
      [email,locale,confirmationToken,unsubscribeToken]);
    const confirmUrl = `${newsletterBaseUrl}/api/newsletter/confirm?token=${encodeURIComponent(confirmationToken)}`;
    const es = locale === "es";
    await resend("/emails", {
      from:newsletterFrom,to:[email],
      subject:es ? "Confirma tu suscripción" : "Newsletter-Anmeldung bestätigen",
      html:`<div style="font-family:Arial,sans-serif;color:#162d29;max-width:620px;margin:auto;padding:40px"><h1 style="font-family:Georgia,serif;font-weight:400">${es?"Confirma tu suscripción":"Anmeldung bestätigen"}</h1><p>${es?"Haz clic en el botón para confirmar que deseas recibir el newsletter de Colectivo Gráfico Mallorca.":"Klicke auf den Button, um zu bestätigen, dass du den Newsletter von Colectivo Gráfico Mallorca erhalten möchtest."}</p><p><a href="${confirmUrl}" style="display:inline-block;background:#c85f46;color:white;padding:13px 18px;text-decoration:none">${es?"Confirmar":"Bestätigen"}</a></p></div>`,
      text:`${es?"Confirmar suscripción":"Newsletter-Anmeldung bestätigen"}: ${confirmUrl}`,
      tags:[{name:"category",value:"newsletter_confirm"}]
    }, `newsletter-confirm/${email}/${confirmationToken.slice(0,12)}`);
    response.status(202).json({ accepted:true });
  } catch (error) { next(error); }
});
app.get("/api/public/newsletter/confirm", async (request,response,next) => {
  try {
    const supplied=String(request.query.token||"");
    const result=await query(`UPDATE newsletter_subscribers SET status='subscribed',confirmed_at=NOW(),confirmation_token=NULL,unsubscribed_at=NULL WHERE confirmation_token=$1 RETURNING locale`,[supplied]);
    if(!result.rowCount) return response.status(400).send("Invalid or expired confirmation link");
    const es=result.rows[0].locale==="es";
    response.type("html").send(`<html><body style="background:#f6efe5;color:#162d29;font-family:Georgia,serif;padding:10vw"><h1>${es?"Suscripción confirmada.":"Anmeldung bestätigt."}</h1><p>${es?"Gracias. Ya formas parte del newsletter de Colectivo Gráfico Mallorca.":"Danke. Du erhältst ab jetzt den Newsletter von Colectivo Gráfico Mallorca."}</p><a href="${newsletterBaseUrl}">${es?"Volver a la tienda":"Zurück zum Shop"}</a></body></html>`);
  } catch(error){next(error);}
});
async function unsubscribe(request,response,next) {
  try {
    const supplied=String((request.method==="POST"?request.body?.token:request.query.token)||"");
    const result=await query(`UPDATE newsletter_subscribers SET status='unsubscribed',unsubscribed_at=NOW() WHERE unsubscribe_token=$1 RETURNING locale`,[supplied]);
    if(!result.rowCount) return response.status(400).send("Invalid unsubscribe link");
    if(request.method==="POST") return response.status(204).end();
    const es=result.rows[0].locale==="es";
    response.type("html").send(`<html><body style="background:#f6efe5;color:#162d29;font-family:Georgia,serif;padding:10vw"><h1>${es?"Suscripción cancelada.":"Newsletter abbestellt."}</h1><a href="${newsletterBaseUrl}">${es?"Volver a la tienda":"Zurück zum Shop"}</a></body></html>`);
  } catch(error){next(error);}
}
app.get("/api/public/newsletter/unsubscribe",unsubscribe);
app.post("/api/public/newsletter/unsubscribe",unsubscribe);


app.post("/api/public/payment-intent", async (request, response, next) => {
  if (!stripe) return response.status(503).json({ error: "Stripe is not configured" });
  try {
    const requestedItems = Array.isArray(request.body?.items) ? request.body.items.slice(0, 50) : [];
    if (!requestedItems.length) return response.status(400).json({ error: "Cart is empty" });
    const locale = request.body?.locale === "es" ? "es" : "de";
    const verified = [];
    for (const item of requestedItems) {
      const quantity = Math.max(1, Math.min(20, Number(item.quantity) || 1));
      if (item.type === "surprise") {
        verified.push({ type: "surprise", title: locale === "es" ? "5 postales sorpresa" : "5 Surprise-Postkarten", quantity, unitPriceCents: 1000, format: "A6", frameId: null, productId: null });
        continue;
      }
      const frameId = String(item.frameId || "unframed");
      if (!["unframed", "standard-black", "aluminium-silver", "aluminium-black", "aluminium-gold"].includes(frameId)) return response.status(400).json({ error: "Frame option is not available for checkout" });
      const result = await query(`SELECT p.id,p.title,p.active,pf.format,pf.price_cents,pf.available,COALESCE(fp.surcharge_cents,0) AS surcharge_cents FROM products p JOIN product_formats pf ON pf.product_id=p.id LEFT JOIN frame_prices fp ON fp.frame_id=$3 AND fp.format=pf.format WHERE p.id=$1 AND pf.format=$2`, [item.productId, item.format, frameId]);
      const row = result.rows[0];
      if (!row?.active || !row.available) return response.status(400).json({ error: "Product format is unavailable" });
      if (row.format === "A6" && frameId !== "unframed") return response.status(400).json({ error: "A6 is only available unframed" });
      if (frameId !== "unframed" && !Number(row.surcharge_cents)) return response.status(400).json({ error: "Frame format is unavailable" });
      verified.push({ type: "product", productId: row.id, title: row.title, format: row.format, frameId, quantity, unitPriceCents: Number(row.price_cents) + Number(row.surcharge_cents) });
    }
    const orderId = crypto.randomUUID();
    const total = verified.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
    const intent = await stripe.paymentIntents.create({ amount: total, currency: "eur", automatic_payment_methods: { enabled: true }, metadata: { orderId } });
    await query(`INSERT INTO orders(id,stripe_payment_intent_id,status,currency,total_cents,subtotal_cents,shipping_cents,locale) VALUES($1,$2,'pending','eur',$3,$3,0,$4)`, [orderId, intent.id, total, locale]);
    for (const item of verified) await query(`INSERT INTO order_items(order_id,product_id,product_title,format,frame_id,quantity,unit_price_cents) VALUES($1,$2,$3,$4,$5,$6,$7)`, [orderId, item.productId, item.title, item.format, item.frameId, item.quantity, item.unitPriceCents]);
    response.status(201).json({ clientSecret: intent.client_secret, orderId });
  } catch (error) { next(error); }
});

// CGM SHIPPING QUOTE V1
app.post("/api/public/payment-intent/shipping", async (request, response, next) => {
  if (!stripe) return response.status(503).json({ error: "Stripe is not configured" });
  try {
    const orderId = String(request.body?.orderId || "");
    const country = String(request.body?.country || "").trim().toUpperCase();
    if (!orderId || !country) return response.status(400).json({ error: "Order and country are required" });

    const order = (await query("SELECT id,status,stripe_payment_intent_id FROM orders WHERE id=$1", [orderId])).rows[0];
    if (!order) return response.status(404).json({ error: "Order not found" });
    if (order.status !== "pending") return response.status(409).json({ error: "Order can no longer be changed" });

    const subtotalResult = await query(
      "SELECT COALESCE(SUM(unit_price_cents * quantity),0)::int AS subtotal_cents FROM order_items WHERE order_id=$1",
      [orderId]
    );
    const subtotalCents = Number(subtotalResult.rows[0]?.subtotal_cents || 0);
    const shippingCents = shippingCostCents(subtotalCents, country);
    if (shippingCents === null) return response.status(400).json({ error: "Shipping country is not supported" });

    const totalCents = subtotalCents + shippingCents;
    await stripe.paymentIntents.update(order.stripe_payment_intent_id, {
      amount: totalCents,
      metadata: { orderId, shippingCountry: country, shippingCents: String(shippingCents) }
    });
    await query(
      `UPDATE orders SET subtotal_cents=$1,shipping_cents=$2,shipping_country=$3,total_cents=$4,updated_at=NOW() WHERE id=$5`,
      [subtotalCents, shippingCents, country, totalCents, orderId]
    );

    response.json({ subtotalCents, shippingCents, totalCents, country, freeShipping: shippingCents === 0 });
  } catch (error) { next(error); }
});


// CGM PUBLIC FRAMING OFFER PAYMENT V1
app.get("/api/public/framing-offers/:token",async(request,response,next)=>{try{const item=(await query(`SELECT r.*,(SELECT path FROM product_images WHERE product_id=r.product_id AND image_type='primary' ORDER BY sort_order,id LIMIT 1) AS image FROM framing_requests r WHERE r.offer_token=$1 AND r.offer_sent_at IS NOT NULL`,[String(request.params.token||"")])).rows[0];if(!item)return response.status(404).json({error:"Offer not found"});response.set("Cache-Control","no-store");response.json({offer:{id:item.id,token:item.offer_token,locale:item.locale==="es"?"es":"de",productTitle:item.product_title,artistName:item.artist_name,format:item.format,formatLabel:({A4:"20 × 30 cm",A3:"30 × 40 cm",A2:"40 × 60 cm"})[item.format]||item.format,image:item.image||null,description:item.quote_description||"",priceCents:Number(item.quote_price_cents||0),customerName:item.customer_name,customerEmail:item.customer_email,status:item.status,paid:Boolean(item.paid_at||item.status==="paid")}});}catch(error){next(error);}});
app.post("/api/public/framing-offers/:token/payment-intent",async(request,response,next)=>{if(!stripe)return response.status(503).json({error:"Stripe is not configured"});const client=await pool.connect();try{const item=(await client.query("SELECT * FROM framing_requests WHERE offer_token=$1 AND offer_sent_at IS NOT NULL",[String(request.params.token||"")])).rows[0];if(!item)return response.status(404).json({error:"Offer not found"});if(item.paid_at||item.status==="paid")return response.status(409).json({error:"Offer already paid"});if(!item.quote_description||!Number(item.quote_price_cents))return response.status(409).json({error:"Offer is incomplete"});if(item.order_id){const existing=(await client.query("SELECT id,status,stripe_payment_intent_id FROM orders WHERE id=$1",[item.order_id])).rows[0];if(existing?.status==="pending"&&existing.stripe_payment_intent_id){const intent=await stripe.paymentIntents.retrieve(existing.stripe_payment_intent_id);if(intent?.client_secret)return response.json({clientSecret:intent.client_secret,orderId:existing.id,reused:true});}if(existing?.status==="paid"){await client.query("UPDATE framing_requests SET status='paid',paid_at=COALESCE(paid_at,NOW()),updated_at=NOW() WHERE id=$1",[item.id]);return response.status(409).json({error:"Offer already paid"});}}const orderId=crypto.randomUUID();const total=Number(item.quote_price_cents);const intent=await stripe.paymentIntents.create({amount:total,currency:"eur",automatic_payment_methods:{enabled:true},receipt_email:item.customer_email,metadata:{orderId,framingRequestId:item.id,orderType:"custom_framing"}});await client.query("BEGIN");await client.query(`INSERT INTO orders(id,stripe_payment_intent_id,status,currency,total_cents,subtotal_cents,shipping_cents,locale,customer_email,customer_name) VALUES($1,$2,'pending','eur',$3,$3,0,$4,$5,$6)`,[orderId,intent.id,total,item.locale==="es"?"es":"de",item.customer_email,item.customer_name]);await client.query(`INSERT INTO order_items(order_id,product_id,product_title,format,frame_id,quantity,unit_price_cents) VALUES($1,$2,$3,$4,'custom',1,$5)`,[orderId,item.product_id,`${item.product_title} · ${item.locale==="es"?"Enmarcación personalizada":"Individuelle Rahmung"}`,item.format,total]);await client.query("UPDATE framing_requests SET order_id=$2,updated_at=NOW() WHERE id=$1",[item.id,orderId]);await client.query("COMMIT");response.status(201).json({clientSecret:intent.client_secret,orderId});}catch(error){try{await client.query("ROLLBACK");}catch{}next(error);}finally{client.release();}});

// CGM NEWSLETTER CMS V1
app.get("/api/cms/newsletter/subscribers", requireCms, async (_request,response,next) => {
  try {
    const result=await query("SELECT id,email,locale,status,consent_at,confirmed_at,unsubscribed_at FROM newsletter_subscribers ORDER BY consent_at DESC");
    response.json({subscribers:result.rows});
  } catch(error){next(error);}
});
app.get("/api/cms/newsletter/campaigns", requireCms, async (_request,response,next) => {
  try {
    const result=await query("SELECT * FROM newsletter_campaigns ORDER BY created_at DESC LIMIT 100");
    response.json({campaigns:result.rows});
  } catch(error){next(error);}
});
function campaignValues(body={}) {
  return [
    String(body.subjectDe||"").slice(0,180), String(body.subjectEs||"").slice(0,180),
    String(body.preheaderDe||"").slice(0,220), String(body.preheaderEs||"").slice(0,220),
    String(body.headingDe||"").slice(0,180), String(body.headingEs||"").slice(0,180),
    String(body.bodyDe||"").slice(0,20000), String(body.bodyEs||"").slice(0,20000),
    String(body.ctaLabelDe||"").slice(0,80), String(body.ctaLabelEs||"").slice(0,80),
    String(body.ctaUrl||"").slice(0,1000)
  ];
}
app.post("/api/cms/newsletter/campaigns", requireCms, async (request,response,next) => {
  try {
    const values=campaignValues(request.body);
    if(!values[0]||!values[1]||!values[6]||!values[7]) return response.status(400).json({error:"Betreff und Text in DE/ES sind erforderlich"});
    const id=crypto.randomUUID();
    const result=await query(`INSERT INTO newsletter_campaigns(id,subject_de,subject_es,preheader_de,preheader_es,heading_de,heading_es,body_de,body_es,cta_label_de,cta_label_es,cta_url)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,[id,...values]);
    response.status(201).json({campaign:result.rows[0]});
  } catch(error){next(error);}
});
app.patch("/api/cms/newsletter/campaigns/:id", requireCms, async (request,response,next) => {
  try {
    const values=campaignValues(request.body);
    if(!values[0]||!values[1]||!values[6]||!values[7]) return response.status(400).json({error:"Betreff und Text in DE/ES sind erforderlich"});
    const result=await query(`UPDATE newsletter_campaigns SET subject_de=$1,subject_es=$2,preheader_de=$3,preheader_es=$4,heading_de=$5,heading_es=$6,body_de=$7,body_es=$8,cta_label_de=$9,cta_label_es=$10,cta_url=$11,updated_at=NOW()
      WHERE id=$12 AND status IN ('draft','failed') RETURNING *`,[...values,request.params.id]);
    if(!result.rowCount) return response.status(409).json({error:"Dieser Newsletter kann nicht mehr bearbeitet werden"});
    response.json({campaign:result.rows[0]});
  } catch(error){next(error);}
});
app.post("/api/cms/newsletter/campaigns/:id/test", requireCms, async (request,response,next) => {
  try {
    const email=String(request.body?.email||"").trim().toLowerCase();
    const locale=request.body?.locale==="es"?"es":"de";
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return response.status(400).json({error:"Ungültige Testadresse"});
    const campaign=(await query("SELECT * FROM newsletter_campaigns WHERE id=$1",[request.params.id])).rows[0];
    if(!campaign) return response.status(404).json({error:"Newsletter nicht gefunden"});
    const mail=campaignMail(campaign,locale,`${newsletterBaseUrl}/`);
    await resend("/emails",{from:newsletterFrom,to:[email],subject:`[TEST] ${mail.subject}`,html:mail.html,text:mail.text,tags:[{name:"category",value:"newsletter_test"}]});
    response.json({sent:true});
  } catch(error){next(error);}
});
app.post("/api/cms/newsletter/campaigns/:id/send", requireCms, async (request,response,next) => {
  try {
    const campaign=(await query("SELECT * FROM newsletter_campaigns WHERE id=$1",[request.params.id])).rows[0];
    if(!campaign) return response.status(404).json({error:"Newsletter nicht gefunden"});
    if(campaign.status==="sent") return response.status(409).json({error:"Newsletter wurde bereits versendet"});
    await query("UPDATE newsletter_campaigns SET status='sending',recipient_count=0,failed_count=0,updated_at=NOW() WHERE id=$1",[campaign.id]);
    const subscribers=(await query("SELECT id,email,locale,unsubscribe_token FROM newsletter_subscribers WHERE status='subscribed' ORDER BY id")).rows;
    let sent=0,failed=0;
    for(let offset=0;offset<subscribers.length;offset+=100) {
      const chunk=subscribers.slice(offset,offset+100), payload=[];
      for(const subscriber of chunk) {
        let unsubscribeToken=subscriber.unsubscribe_token;
        if(!unsubscribeToken) {
          unsubscribeToken=token();
          await query("UPDATE newsletter_subscribers SET unsubscribe_token=$1 WHERE id=$2",[unsubscribeToken,subscriber.id]);
        }
        const unsubscribeUrl=`${newsletterBaseUrl}/api/newsletter/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;
        const mail=campaignMail(campaign,subscriber.locale,unsubscribeUrl);
        payload.push({from:newsletterFrom,to:[subscriber.email],subject:mail.subject,html:mail.html,text:mail.text,headers:{"List-Unsubscribe":`<${unsubscribeUrl}>`},tags:[{name:"category",value:"newsletter"}]});
      }
      try {
        await resend("/emails/batch",payload,`newsletter/${campaign.id}/${offset}`);
        sent+=chunk.length;
      } catch(error) {
        console.error("Newsletter batch failed",error);
        failed+=chunk.length;
      }
      await query("UPDATE newsletter_campaigns SET recipient_count=$1,failed_count=$2,updated_at=NOW() WHERE id=$3",[sent,failed,campaign.id]);
    }
    const status=failed?"failed":"sent";
    await query("UPDATE newsletter_campaigns SET status=$1,recipient_count=$2,failed_count=$3,sent_at=CASE WHEN $1='sent' THEN NOW() ELSE sent_at END,updated_at=NOW() WHERE id=$4",[status,sent,failed,campaign.id]);
    response.json({sent,failed,status});
  } catch(error){next(error);}
});



app.post("/api/public/framing-requests", framingUpload.array("images", 3), async (request, response, next) => {
  const client = await pool.connect();
  try {
    const locale = request.body?.locale === "es" ? "es" : "de";
    const labels = framingLabels[locale];
    const productId = String(request.body?.productId || "");
    const format = String(request.body?.format || "");
    const customerName = String(request.body?.name || "").trim().slice(0,180);
    const customerEmail = String(request.body?.email || "").trim().toLowerCase().slice(0,320);
    const customerPhone = String(request.body?.phone || "").trim().slice(0,100) || null;
    const material = String(request.body?.material || "unsure");
    const frameColor = String(request.body?.frameColor || "unsure");
    const passepartout = String(request.body?.passepartout || "unsure");
    const passepartoutWidth = String(request.body?.passepartoutWidth || "unsure");
    const glassType = String(request.body?.glassType || "unsure");
    const message = String(request.body?.message || "").trim().slice(0,5000) || null;

    if (!productId || !format || !customerName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return response.status(400).json({ error: locale === "es" ? "Completa nombre, email y formato." : "Bitte Name, E-Mail und Format vollständig angeben." });
    }
    if (!labels.material[material] || !labels.color[frameColor] || !labels.passepartout[passepartout] || !labels.width[passepartoutWidth] || !labels.glass[glassType]) {
      return response.status(400).json({ error: "Invalid framing option" });
    }

    const product = (await client.query(
      `SELECT p.id,p.slug,p.title,a.name AS artist_name
       FROM products p JOIN artists a ON a.id=p.artist_id
       WHERE p.id=$1 AND p.active=TRUE`,
      [productId]
    )).rows[0];

    if (!product) return response.status(404).json({ error: "Product not found" });

    const available = await client.query(
      "SELECT 1 FROM product_formats WHERE product_id=$1 AND format=$2 AND available=TRUE",
      [productId, format]
    );
    if (!available.rowCount || format === "A6") return response.status(400).json({ error: "Format is not available for custom framing" });

    const requestId = crypto.randomUUID();
    const formatLabel = ({A4:"20 × 30 cm",A3:"30 × 40 cm",A2:"40 × 60 cm"})[format] || format;

    await client.query("BEGIN");
    await client.query(
      `INSERT INTO framing_requests(
        id,product_id,product_slug,product_title,artist_name,format,locale,
        customer_name,customer_email,customer_phone,material,frame_color,
        passepartout,passepartout_width,glass_type,message,status
      ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'new')`,
      [requestId,product.id,product.slug,product.title,product.artist_name,format,locale,
       customerName,customerEmail,customerPhone,material,frameColor,passepartout,passepartoutWidth,glassType,message]
    );

    const files = Array.isArray(request.files) ? request.files : [];
    for (let index=0; index<files.length; index++) {
      const file = files[index];
      const imageData = await sharp(file.buffer).rotate().resize({ width:1600,height:1600,fit:"inside",withoutEnlargement:true }).webp({quality:82,effort:5}).toBuffer();
      await client.query(
        `INSERT INTO framing_request_images(request_id,sort_order,image_data,mime_type,original_name)
         VALUES($1,$2,$3,'image/webp',$4)`,
        [requestId,index,imageData,file.originalname]
      );
    }

    await client.query("COMMIT");

    const mailData = {
      id: requestId,
      locale,
      product_title: product.title,
      format_label: formatLabel,
      material_label: labels.material[material],
      frame_color_label: labels.color[frameColor],
      passepartout_label: labels.passepartout[passepartout],
      passepartout_width_label: labels.width[passepartoutWidth],
      glass_type_label: labels.glass[glassType],
      message
    };

    try {
      const mail = framingRequestConfirmationMail(mailData);
      const sentMail = await resend("/emails", {
        from: newsletterFrom,
        to: [customerEmail],
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        tags: [{name:"category",value:"framing_request"}]
      }, `framing-request/${requestId}`);

      await query(
        `UPDATE framing_requests
         SET confirmation_email_sent_at=NOW(),confirmation_email_resend_id=$2,confirmation_email_error=NULL,updated_at=NOW()
         WHERE id=$1`,
        [requestId,sentMail?.id || null]
      );
    } catch (mailError) {
      console.error("Framing request confirmation failed", {requestId,error:mailError.message});
      await query(
        "UPDATE framing_requests SET confirmation_email_error=$2,updated_at=NOW() WHERE id=$1",
        [requestId,String(mailError.message || "Unknown email error").slice(0,2000)]
      );
    }

    response.status(201).json({ accepted:true, id:requestId });
  } catch (error) {
    try { await client.query("ROLLBACK"); } catch {}
    next(error);
  } finally {
    client.release();
  }
});

app.get("/api/cms/framing-requests", requireCms, async (_request,response,next) => {
  try {
    const result = await query(
      `SELECT r.*,
        COALESCE(json_agg(json_build_object('id',i.id,'originalName',i.original_name,'uploadedAt',i.uploaded_at) ORDER BY i.sort_order)
        FILTER (WHERE i.id IS NOT NULL),'[]') AS images
       FROM framing_requests r
       LEFT JOIN framing_request_images i ON i.request_id=r.id
       GROUP BY r.id
       ORDER BY r.created_at DESC
       LIMIT 500`
    );
    const requests = result.rows.map(row => ({
      ...row,
      offer_url: row.offer_token ? `${newsletterBaseUrl}/angebot/${row.offer_token}` : null,
      format_label: ({A4:"20 × 30 cm",A3:"30 × 40 cm",A2:"40 × 60 cm"})[row.format] || row.format,
      material: framingLabels.de.material[row.material] || row.material,
      frame_color: framingLabels.de.color[row.frame_color] || row.frame_color,
      passepartout: framingLabels.de.passepartout[row.passepartout] || row.passepartout,
      passepartout_width: framingLabels.de.width[row.passepartout_width] || row.passepartout_width,
      glass_type: framingLabels.de.glass[row.glass_type] || row.glass_type
    }));
    response.json({requests});
  } catch(error){ next(error); }
});

app.patch("/api/cms/framing-requests/:id", requireCms, async (request,response,next) => {
  try {
    const current = (await query("SELECT * FROM framing_requests WHERE id=$1", [request.params.id])).rows[0];
    if (!current) return response.status(404).json({error:"Request not found"});

    const status = request.body?.status === undefined ? current.status : String(request.body.status || "");
    if (!framingStatuses.includes(status)) return response.status(400).json({error:"Invalid status"});

    const quoteDescription = request.body?.quoteDescription === undefined
      ? current.quote_description
      : String(request.body.quoteDescription || "").trim().slice(0,5000) || null;

    let quotePriceCents = current.quote_price_cents;
    if (request.body?.quotePriceCents !== undefined) {
      const parsed = Number(request.body.quotePriceCents);
      quotePriceCents = Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : null;
    }

    const internalNote = request.body?.internalNote === undefined
      ? current.internal_note
      : String(request.body.internalNote || "").trim().slice(0,5000) || null;

    const result = await query(
      `UPDATE framing_requests
       SET status=$1,quote_description=$2,quote_price_cents=$3,internal_note=$4,updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [status,quoteDescription,quotePriceCents,internalNote,request.params.id]
    );

    response.json({request:result.rows[0]});
  } catch(error){ next(error); }
});


app.post("/api/cms/framing-requests/:id/forward", requireCms, async (request,response,next) => {
  try {
    const target = String(process.env.FRAMING_FORWARD_EMAIL || "").trim();
    if (!target) return response.status(503).json({error:"FRAMING_FORWARD_EMAIL is not configured"});

    const item = (await query("SELECT * FROM framing_requests WHERE id=$1", [request.params.id])).rows[0];
    if (!item) return response.status(404).json({error:"Request not found"});

    const images = (await query(
      "SELECT id,image_data,mime_type,original_name FROM framing_request_images WHERE request_id=$1 ORDER BY sort_order,id",
      [item.id]
    )).rows;

    const productImage = item.product_id
      ? (await query(
          `SELECT id,image_data,mime_type,original_name
           FROM product_images
           WHERE product_id=$1
             AND image_data IS NOT NULL
           ORDER BY CASE WHEN image_type='primary' THEN 0 ELSE 1 END, sort_order, id
           LIMIT 1`,
          [item.product_id]
        )).rows[0] || null
      : null;

    const mail = framingForwardMail(item, images);

    const attachments = [
      ...(productImage ? [{
        filename: `MOTIV-${String(item.product_title || "Print")
          .replace(/[^a-zA-Z0-9äöüÄÖÜß_-]+/g, "-")}.webp`,
        content: Buffer.from(productImage.image_data).toString("base64")
      }] : []),

      ...images.map((image,index) => ({
        filename: String(image.original_name || `referenz-${index+1}.webp`)
          .replace(/\.[^.]+$/, "") + ".webp",
        content: Buffer.from(image.image_data).toString("base64")
      }))
    ];

    try {
      const sentMail = await resend("/emails", {
        from: newsletterFrom,
        to: [target],
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        ...(attachments.length ? {attachments} : {}),
        tags: [{name:"category",value:"framing_forward"}]
      }, `framing-forward/${item.id}`);

      const saved = await query(
        `UPDATE framing_requests
         SET status='forwarded',forwarded_at=NOW(),forwarded_email=$2,forwarded_resend_id=$3,forwarded_error=NULL,updated_at=NOW()
         WHERE id=$1 RETURNING *`,
        [item.id,target,sentMail?.id || null]
      );
      response.json({request:saved.rows[0]});
    } catch(mailError) {
      console.error("Framing forward email failed", {requestId:item.id,error:mailError.message});
      await query(
        "UPDATE framing_requests SET forwarded_email=$2,forwarded_error=$3,updated_at=NOW() WHERE id=$1",
        [item.id,target,String(mailError.message || "Unknown email error").slice(0,2000)]
      );
      response.status(502).json({error:"Forward email failed"});
    }
  } catch(error){ next(error); }
});

app.post("/api/cms/framing-requests/:id/send-offer",requireCms,async(request,response,next)=>{try{const item=(await query("SELECT * FROM framing_requests WHERE id=$1",[request.params.id])).rows[0];if(!item)return response.status(404).json({error:"Request not found"});if(!item.quote_description||!Number(item.quote_price_cents))return response.status(409).json({error:"Quote description and price are required"});if(item.paid_at||item.status==="paid")return response.status(409).json({error:"Offer already paid"});const offerToken=item.offer_token||crypto.randomBytes(32).toString("hex");const offerUrl=`${newsletterBaseUrl}/angebot/${offerToken}`;const mail=framingOfferMail({...item,offer_token:offerToken},offerUrl);try{const sentMail=await resend("/emails",{from:newsletterFrom,to:[item.customer_email],subject:mail.subject,html:mail.html,text:mail.text,tags:[{name:"category",value:"framing_offer"}]},`framing-offer/${item.id}`);const saved=await query(`UPDATE framing_requests SET offer_token=$2,offer_sent_at=NOW(),offer_email_resend_id=$3,offer_email_error=NULL,status='offer_sent',updated_at=NOW() WHERE id=$1 RETURNING *`,[item.id,offerToken,sentMail?.id||null]);response.json({request:saved.rows[0],offerUrl});}catch(mailError){await query("UPDATE framing_requests SET offer_token=$2,offer_email_error=$3,updated_at=NOW() WHERE id=$1",[item.id,offerToken,String(mailError.message||"Unknown email error").slice(0,2000)]);response.status(502).json({error:"Offer email failed"});}}catch(error){next(error);}});

app.get("/api/cms/framing-requests/:requestId/images/:imageId", requireCms, async (request,response,next) => {
  try {
    const result = await query(
      "SELECT image_data,mime_type FROM framing_request_images WHERE id=$1 AND request_id=$2",
      [request.params.imageId,request.params.requestId]
    );
    if (!result.rowCount) return response.status(404).end();
    response.type(result.rows[0].mime_type || "image/webp").send(result.rows[0].image_data);
  } catch(error){ next(error); }
});


app.get("/api/cms/orders", requireCms, async (request, response, next) => {
  try {
    const status = request.query.status && fulfillmentStatuses.includes(String(request.query.status)) ? String(request.query.status) : null;
    const result = await query(`SELECT o.*,
      COALESCE(json_agg(json_build_object('id',oi.id,'productId',oi.product_id,'title',oi.product_title,'artistName',a.name,'format',oi.format,
      'frameId',oi.frame_id,'quantity',oi.quantity,'unitPriceCents',oi.unit_price_cents) ORDER BY oi.id)
      FILTER (WHERE oi.id IS NOT NULL),'[]') AS items
      FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id LEFT JOIN products p ON p.id=oi.product_id LEFT JOIN artists a ON a.id=p.artist_id
      WHERE o.status='paid' AND ($1::text IS NULL OR o.fulfillment_status=$1)
      GROUP BY o.id ORDER BY o.created_at DESC LIMIT 250`, [status]);
    response.json({ orders: result.rows });
  } catch (error) { next(error); }
});

app.get("/api/cms/artists", requireCms, async (_request, response, next) => {
  try {
    const result = await query("SELECT id,name,active,sort_order FROM artists ORDER BY sort_order,name");
    response.json({ artists: result.rows });
  } catch (error) { next(error); }
});

app.get("/api/cms/products", requireCms, async (_request, response, next) => {
  try {
    const result = await query(`${productQuery} ORDER BY a.sort_order,p.sort_order,p.title`);
    response.json({ products: result.rows });
  } catch (error) { next(error); }
});

app.get("/api/cms/homepage", requireCms, async (_request, response, next) => {
  try {
    const settings = (await query("SELECT hero_mode,hero_image_id,selection_image_ids FROM homepage_settings WHERE id=TRUE")).rows[0];
    const images = (await query(`SELECT i.id,i.image_type,i.path,i.room_code,i.shown_format,p.id AS product_id,p.slug,p.title,a.name AS artist FROM product_images i JOIN products p ON p.id=i.product_id JOIN artists a ON a.id=p.artist_id WHERE p.active=TRUE ORDER BY a.sort_order,p.sort_order,i.sort_order`)).rows;
    response.json({ settings, images });
  } catch (error) { next(error); }
});

app.patch("/api/cms/homepage", requireCms, async (request, response, next) => {
  try {
    const heroMode = ["graphic","fixed","random"].includes(request.body?.heroMode) ? request.body.heroMode : "graphic";
    const heroImageId = heroMode === "fixed" && request.body?.heroImageId ? Number(request.body.heroImageId) : null;
    const selectionImageIds = [...new Set((Array.isArray(request.body?.selectionImageIds) ? request.body.selectionImageIds : []).map(Number).filter(Number.isSafeInteger))].slice(0,4);
    const validIds = (await query("SELECT id FROM product_images WHERE id=ANY($1::bigint[])", [selectionImageIds])).rows.map(row => Number(row.id));
    if (heroImageId && !(await query("SELECT 1 FROM product_images WHERE id=$1", [heroImageId])).rowCount) return response.status(400).json({ error:"Invalid hero image" });
    await query("UPDATE homepage_settings SET hero_mode=$1,hero_image_id=$2,selection_image_ids=$3::jsonb,updated_at=NOW() WHERE id=TRUE", [heroMode, heroImageId, JSON.stringify(selectionImageIds.filter(id => validIds.includes(id)))]);
    response.json({ saved:true });
  } catch (error) { next(error); }
});

app.post("/api/cms/products", requireCms, async (request, response, next) => {
  const client = await pool.connect();
  try {
    const title = String(request.body?.title || "").trim();
    const artistId = String(request.body?.artistId || "");
    const slug = String(request.body?.slug || title).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100);
    if (!title || !artistId || !slug) return response.status(400).json({ error: "Title and artist are required" });
    const id = crypto.randomUUID();
    await client.query("BEGIN");
    const sort = await client.query("SELECT COALESCE(MAX(sort_order),0)+1 AS value FROM products WHERE artist_id=$1", [artistId]);
    await client.query(`INSERT INTO products(id,slug,artist_id,title,description_de,description_es,active,featured,sort_order)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [id, slug, artistId, title, String(request.body.descriptionDe || ""), String(request.body.descriptionEs || ""), Boolean(request.body.active), Boolean(request.body.featured), sort.rows[0].value]);
    for (const format of ["A6","A4","A3","A2"]) {
      const entry = request.body.formats?.find(item => item.format === format);
      await client.query("INSERT INTO product_formats(product_id,format,price_cents,available) VALUES($1,$2,$3,$4)", [id, format, Math.max(0, Number(entry?.priceCents) || 0), Boolean(entry?.available)]);
    }
    await client.query("COMMIT");
    response.status(201).json({ id, slug });
  } catch (error) { await client.query("ROLLBACK"); next(error); } finally { client.release(); }
});

app.patch("/api/cms/products/:id", requireCms, async (request, response, next) => {
  const client = await pool.connect();
  try {
    const title = String(request.body?.title || "").trim();
    const artistId = String(request.body?.artistId || "");
    if (!title || !artistId) return response.status(400).json({ error: "Title and artist are required" });
    await client.query("BEGIN");
    const result = await client.query(`UPDATE products SET title=$1,artist_id=$2,description_de=$3,description_es=$4,active=$5,featured=$6,updated_at=NOW() WHERE id=$7 RETURNING id`,
      [title, artistId, String(request.body.descriptionDe || ""), String(request.body.descriptionEs || ""), Boolean(request.body.active), Boolean(request.body.featured), request.params.id]);
    if (!result.rowCount) { await client.query("ROLLBACK"); return response.status(404).json({ error: "Product not found" }); }
    for (const entry of Array.isArray(request.body.formats) ? request.body.formats : []) {
      if (!["A6","A4","A3","A2"].includes(entry.format)) continue;
      await client.query(`INSERT INTO product_formats(product_id,format,price_cents,available) VALUES($1,$2,$3,$4)
        ON CONFLICT(product_id,format) DO UPDATE SET price_cents=EXCLUDED.price_cents,available=EXCLUDED.available`,
        [request.params.id, entry.format, Math.max(0, Number(entry.priceCents) || 0), Boolean(entry.available)]);
    }
    await client.query("COMMIT");
    response.json({ saved: true });
  } catch (error) { await client.query("ROLLBACK"); next(error); } finally { client.release(); }
});

app.post("/api/cms/products/:id/images", requireCms, upload.single("image"), async (request, response, next) => {
  const client = await pool.connect();
  try {
    if (!request.file) return response.status(400).json({ error: "JPEG, PNG or WebP image required" });
    const imageType = request.body.imageType === "room" ? "room" : "primary";
    const shownFormat = ["A6","A4","A3","A2"].includes(request.body.shownFormat) ? request.body.shownFormat : null;
    const roomCode = imageType === "room" ? String(request.body.roomCode || "").slice(0, 30) || null : null;
    const imageData = await sharp(request.file.buffer).rotate().resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true }).webp({ quality: 84, effort: 5 }).toBuffer();
    await client.query("BEGIN");
    const exists = await client.query("SELECT id FROM products WHERE id=$1", [request.params.id]);
    if (!exists.rowCount) { await client.query("ROLLBACK"); return response.status(404).json({ error: "Product not found" }); }
    if (imageType === "primary") await client.query("DELETE FROM product_images WHERE product_id=$1 AND image_type='primary'", [request.params.id]);
    const sort = await client.query("SELECT COALESCE(MAX(sort_order),-1)+1 AS value FROM product_images WHERE product_id=$1", [request.params.id]);
    const inserted = await client.query(`INSERT INTO product_images(product_id,image_type,path,room_code,shown_format,sort_order,image_data,mime_type,original_name,uploaded_at)
      VALUES($1,$2,'pending',$3,$4,$5,$6,'image/webp',$7,NOW()) RETURNING id`,
      [request.params.id, imageType, roomCode, shownFormat, imageType === "primary" ? 0 : sort.rows[0].value, imageData, request.file.originalname]);
    const id = inserted.rows[0].id;
    const path = `/api/public/images/${id}`;
    await client.query("UPDATE product_images SET path=$1 WHERE id=$2", [path, id]);
    await client.query("UPDATE products SET updated_at=NOW() WHERE id=$1", [request.params.id]);
    await client.query("COMMIT");
    response.status(201).json({ image: { id, type:imageType, path, roomCode, shownFormat } });
  } catch (error) { await client.query("ROLLBACK"); next(error); } finally { client.release(); }
});

app.patch("/api/cms/products/:productId/images/:imageId", requireCms, async (request, response, next) => {
  try {
    const sortOrder = Math.max(0, Number(request.body?.sortOrder) || 0);
    const result = await query("UPDATE product_images SET sort_order=$1 WHERE id=$2 AND product_id=$3 RETURNING id", [sortOrder, request.params.imageId, request.params.productId]);
    if (!result.rowCount) return response.status(404).json({ error: "Image not found" });
    response.json({ saved:true });
  } catch (error) { next(error); }
});

app.delete("/api/cms/products/:productId/images/:imageId", requireCms, async (request, response, next) => {
  try {
    const result = await query("DELETE FROM product_images WHERE id=$1 AND product_id=$2 RETURNING id", [request.params.imageId, request.params.productId]);
    if (!result.rowCount) return response.status(404).json({ error: "Image not found" });
    await query("UPDATE products SET updated_at=NOW() WHERE id=$1", [request.params.productId]);
    response.status(204).end();
  } catch (error) { next(error); }
});

app.patch("/api/cms/orders/:id", requireCms, async (request, response, next) => {
  try {
    const fulfillmentStatus = String(request.body?.fulfillmentStatus || "");
    if (!fulfillmentStatuses.includes(fulfillmentStatus)) return response.status(400).json({ error: "Invalid status" });
    const internalNote = String(request.body?.internalNote || "").slice(0, 4000);

    const updated = await query(`UPDATE orders SET fulfillment_status=$1,internal_note=$2,
      shipped_at=CASE WHEN $1='shipped' AND shipped_at IS NULL THEN NOW() ELSE shipped_at END,updated_at=NOW()
      WHERE id=$3 RETURNING *`, [fulfillmentStatus, internalNote, request.params.id]);

    if (!updated.rowCount) return response.status(404).json({ error: "Order not found" });
    let order = updated.rows[0];

    if (fulfillmentStatus === "shipped" && order.customer_email && !order.shipping_email_sent_at) {
      const mail = shippingConfirmationMail(order);
      try {
        const sentMail = await resend("/emails", {
          from: newsletterFrom,
          to: [order.customer_email],
          subject: mail.subject,
          html: mail.html,
          text: mail.text,
          tags: [{ name:"category", value:"shipping_confirmation" }]
        }, `shipping-confirmation/${order.id}`);

        const saved = await query(
          `UPDATE orders SET shipping_email_sent_at=NOW(),shipping_email_resend_id=$2,shipping_email_error=NULL,updated_at=NOW() WHERE id=$1 RETURNING *`,
          [order.id, sentMail?.id || null]
        );
        order = saved.rows[0];
      } catch (mailError) {
        console.error("Shipping confirmation email failed", { orderId: order.id, error: mailError.message });
        const saved = await query(
          `UPDATE orders SET shipping_email_error=$2,updated_at=NOW() WHERE id=$1 RETURNING *`,
          [order.id, String(mailError.message || "Unknown email error").slice(0,2000)]
        );
        order = saved.rows[0];
      }
    }

    response.json({ order });
  } catch (error) { next(error); }
});


app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: "Internal server error", requestId: crypto.randomUUID() });
});

initializeDatabase()
  .then(count => app.listen(port, () => console.log(`API listening on ${port}; ${count} products imported.`)))
  .catch(error => {
    console.error("Database initialization failed", error);
    pool.end().finally(() => process.exit(1));
  });
