import crypto from "node:crypto";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { initializeDatabase } from "./init-db.js";
import { pool, query } from "./db.js";

const app = express();
const port = Number(process.env.PORT || 3001);
const origins = [process.env.STOREFRONT_ORIGIN, process.env.CMS_ORIGIN].filter(Boolean);
app.use(helmet());
app.use(cors({ origin: origins.length ? origins : false }));
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
