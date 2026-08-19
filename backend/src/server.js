import crypto from "node:crypto";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import Stripe from "stripe";
import { initializeDatabase } from "./init-db.js";
import { pool, query } from "./db.js";

const app = express();
const port = Number(process.env.PORT || 3001);
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const origins = [process.env.STOREFRONT_ORIGIN, process.env.CMS_ORIGIN].filter(Boolean);
const fulfillmentStatuses = ["new", "processing", "ready", "shipped", "completed", "canceled"];
function requireCms(request, response, next) {
  const expected = process.env.CMS_API_TOKEN;
  const supplied = request.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!expected || !supplied || supplied.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return response.status(401).json({ error: "Unauthorized" });
  next();
}
app.use(helmet());
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

const productQuery = `SELECT p.id,p.slug,p.title,p.description_de,p.description_es,
  json_build_object('id',a.id,'name',a.name) AS artist,
  COALESCE((SELECT json_agg(json_build_object('type',i.image_type,'path',i.path,'roomCode',i.room_code,'shownFormat',i.shown_format) ORDER BY i.sort_order)
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
    const result = await query(`${productQuery} ${where} ORDER BY a.sort_order,p.sort_order`, values);
    response.json({ products: result.rows });
  } catch (error) { next(error); }
});

app.get("/api/public/products/:slug", async (request, response, next) => {
  try {
    const result = await query(`${productQuery} WHERE p.slug=$1 AND p.active=TRUE`, [request.params.slug]);
    if (!result.rowCount) return response.status(404).json({ error: "Product not found" });
    response.json(result.rows[0]);
  } catch (error) { next(error); }
});

app.post("/api/public/newsletter", async (request, response, next) => {
  try {
    const email = String(request.body?.email || "").trim().toLowerCase();
    const locale = ["de", "es", "en", "fr"].includes(request.body?.locale) ? request.body.locale : "de";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return response.status(400).json({ error: "Invalid email" });
    await query(`INSERT INTO newsletter_subscribers(email,locale,status) VALUES($1,$2,'pending')
      ON CONFLICT(email) DO UPDATE SET locale=EXCLUDED.locale,status='pending',consent_at=NOW(),unsubscribed_at=NULL`,
      [email, locale]);
    response.status(202).json({ accepted: true });
  } catch (error) { next(error); }
});

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
    await query(`INSERT INTO orders(id,stripe_payment_intent_id,status,currency,total_cents) VALUES($1,$2,'pending','eur',$3)`, [orderId, intent.id, total]);
    for (const item of verified) await query(`INSERT INTO order_items(order_id,product_id,product_title,format,frame_id,quantity,unit_price_cents) VALUES($1,$2,$3,$4,$5,$6,$7)`, [orderId, item.productId, item.title, item.format, item.frameId, item.quantity, item.unitPriceCents]);
    response.status(201).json({ clientSecret: intent.client_secret, orderId });
  } catch (error) { next(error); }
});

app.get("/api/cms/orders", requireCms, async (request, response, next) => {
  try {
    const status = request.query.status && fulfillmentStatuses.includes(String(request.query.status)) ? String(request.query.status) : null;
    const result = await query(`SELECT o.*,
      COALESCE(json_agg(json_build_object('id',oi.id,'productId',oi.product_id,'title',oi.product_title,'format',oi.format,
      'frameId',oi.frame_id,'quantity',oi.quantity,'unitPriceCents',oi.unit_price_cents) ORDER BY oi.id)
      FILTER (WHERE oi.id IS NOT NULL),'[]') AS items
      FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id
      WHERE o.status='paid' AND ($1::text IS NULL OR o.fulfillment_status=$1)
      GROUP BY o.id ORDER BY o.created_at DESC LIMIT 250`, [status]);
    response.json({ orders: result.rows });
  } catch (error) { next(error); }
});

app.patch("/api/cms/orders/:id", requireCms, async (request, response, next) => {
  try {
    const fulfillmentStatus = String(request.body?.fulfillmentStatus || "");
    if (!fulfillmentStatuses.includes(fulfillmentStatus)) return response.status(400).json({ error: "Invalid status" });
    const internalNote = String(request.body?.internalNote || "").slice(0, 4000);
    const result = await query(`UPDATE orders SET fulfillment_status=$1,internal_note=$2,
      shipped_at=CASE WHEN $1='shipped' AND shipped_at IS NULL THEN NOW() ELSE shipped_at END,updated_at=NOW()
      WHERE id=$3 RETURNING *`, [fulfillmentStatus, internalNote, request.params.id]);
    if (!result.rowCount) return response.status(404).json({ error: "Order not found" });
    response.json({ order: result.rows[0] });
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
