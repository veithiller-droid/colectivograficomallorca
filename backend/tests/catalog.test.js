import test from "node:test";
import assert from "node:assert/strict";
import { artists, frames, products } from "../src/catalog.js";

test("catalog contains 31 real products", () => {
  assert.equal(products.length, 31);
  assert.equal(new Set(products.map(product => product.id)).size, 31);
  assert.equal(new Set(products.map(product => product.slug)).size, 31);
});

test("all products reference known artists and formats", () => {
  const artistIds = new Set(artists.map(artist => artist.id));
  for (const product of products) {
    assert.ok(artistIds.has(product.artistId));
    assert.ok(product.formats.length > 0);
  }
});

test("frame prices exist for A4, A3 and A2", () => {
  for (const frame of frames) assert.deepEqual(Object.keys(frame.prices), ["A4", "A3", "A2"]);
});
