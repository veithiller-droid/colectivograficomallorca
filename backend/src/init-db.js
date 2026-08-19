import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { pool } from "./db.js";
import { artists, frames, products } from "./catalog.js";

export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(await readFile(fileURLToPath(new URL("./schema.sql", import.meta.url)), "utf8"));
    for (const artist of artists) {
      await client.query(`INSERT INTO artists(id,name,sort_order) VALUES($1,$2,$3)
        ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,sort_order=EXCLUDED.sort_order,updated_at=NOW()`,
        [artist.id, artist.name, artist.sortOrder]);
    }
    for (const frame of frames) {
      await client.query(`INSERT INTO frame_options(id,name_de,name_es,material,glazing,color,custom_made)
        VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(id) DO UPDATE SET name_de=EXCLUDED.name_de,
        name_es=EXCLUDED.name_es,material=EXCLUDED.material,glazing=EXCLUDED.glazing,
        color=EXCLUDED.color,custom_made=EXCLUDED.custom_made`,
        [frame.id, frame.de, frame.es, frame.material, frame.glazing, frame.color, frame.custom]);
      for (const [format, surcharge] of Object.entries(frame.prices)) {
        await client.query(`INSERT INTO frame_prices(frame_id,format,surcharge_cents) VALUES($1,$2,$3)
          ON CONFLICT(frame_id,format) DO UPDATE SET surcharge_cents=EXCLUDED.surcharge_cents`,
          [frame.id, format, surcharge]);
      }
    }
    for (const [sortOrder, product] of products.entries()) {
      await client.query(`INSERT INTO products(id,slug,artist_id,title,sort_order) VALUES($1,$2,$3,$4,$5)
        ON CONFLICT(id) DO UPDATE SET slug=EXCLUDED.slug,artist_id=EXCLUDED.artist_id,
        title=EXCLUDED.title,sort_order=EXCLUDED.sort_order,updated_at=NOW()`,
        [product.id, product.slug, product.artistId, product.title, sortOrder + 1]);
      await client.query("DELETE FROM product_images WHERE product_id=$1", [product.id]);
      await client.query(`INSERT INTO product_images(product_id,image_type,path,sort_order)
        VALUES($1,'primary',$2,0)`, [product.id, product.primaryImage]);
      for (const [index, room] of product.rooms.entries()) {
        const match = room.match(/room(\d+)-(a\d)/i);
        await client.query(`INSERT INTO product_images(product_id,image_type,path,room_code,shown_format,sort_order)
          VALUES($1,'room',$2,$3,$4,$5)`,
          [product.id, `/images/products/${room}`, match?.[1] ?? null, match?.[2]?.toUpperCase() ?? null, index + 1]);
      }
      for (const entry of product.formats) {
        await client.query(`INSERT INTO product_formats(product_id,format,price_cents,available) VALUES($1,$2,$3,$4)
          ON CONFLICT(product_id,format) DO UPDATE SET price_cents=EXCLUDED.price_cents,available=EXCLUDED.available`,
          [product.id, entry.format, entry.priceCents, entry.available]);
      }
    }
    await client.query("INSERT INTO import_runs(source,product_count) VALUES('catalog-v1',$1)", [products.length]);
    await client.query("COMMIT");
    return products.length;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initializeDatabase().then(count => console.log(`Database initialized with ${count} products.`)).finally(() => pool.end());
}
