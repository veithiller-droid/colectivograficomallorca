"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SiteHeader from "../components/site-header";
import { artistOrder, fetchProducts, products, type Product } from "../data/products";
import { useLanguage } from "../components/language-provider";

const formatLabels: Record<string, string> = {
  A6: "Postkarte",
  A4: "20 × 30 cm",
  A3: "30 × 40 cm",
  A2: "40 × 60 cm",
};

export default function ShopPage() {
  const { t, language } = useLanguage();

  const [catalogProducts, setCatalogProducts] =
    useState<readonly Product[]>(products);

  const [filterMode, setFilterMode] =
    useState<"all" | "artist" | "format">("all");

  const [artistFilter, setArtistFilter] = useState("");
  const [formatFilter, setFormatFilter] = useState("");
  const [sort, setSort] = useState<"recent" | "artist">("recent");

  useEffect(() => {
    void fetchProducts().then(setCatalogProducts);
  }, []);

  const availableArtists = useMemo(
    () =>
      artistOrder.filter(artist =>
        catalogProducts.some(product => product.artist === artist)
      ),
    [catalogProducts]
  );

  const availableFormats = useMemo(() => {
    const set = new Set<string>();

    catalogProducts.forEach(product => {
      product.availableFormats.forEach(format => set.add(format));
    });

    return ["A6", "A4", "A3", "A2"].filter(format => set.has(format));
  }, [catalogProducts]);

  const filteredProducts = useMemo(() => {
    let result = [...catalogProducts];

    if (filterMode === "artist" && artistFilter) {
      result = result.filter(product => product.artist === artistFilter);
    }

    if (filterMode === "format" && formatFilter) {
      result = result.filter(product =>
        product.availableFormats.includes(formatFilter as never)
      );
    }

    if (sort === "artist") {
      result.sort((a, b) =>
        a.artist.localeCompare(b.artist) || a.title.localeCompare(b.title)
      );
    }

    return result;
  }, [catalogProducts, filterMode, artistFilter, formatFilter, sort]);

  const displayArtists =
    sort === "artist"
      ? [...new Set(filteredProducts.map(product => product.artist))].sort()
      : artistOrder.filter(artist =>
          filteredProducts.some(product => product.artist === artist)
        );

  const productsByArtist = displayArtists
    .map(artist => ({
      artist,
      products: filteredProducts.filter(item => item.artist === artist),
    }))
    .filter(group => group.products.length > 0);

  const resetFilters = () => {
    setFilterMode("all");
    setArtistFilter("");
    setFormatFilter("");
  };

  return (
    <main>
      <SiteHeader />

      <section className="shop-intro shell">
        <p className="eyebrow">{t.shop.eyebrow}</p>
        <h1>{t.shop.title}</h1>
        <p>{t.shop.intro}</p>
      </section>

      <section className="catalog-controls shell" aria-label="Filter">
        <button
          className={filterMode === "all" ? "active" : ""}
          onClick={resetFilters}
        >
          {t.shop.all} <span>{catalogProducts.length}</span>
        </button>

        <button
          className={filterMode === "artist" ? "active" : ""}
          onClick={() => {
            setFilterMode("artist");
            setFormatFilter("");
          }}
        >
          {t.shop.artists}
        </button>

        <button
          className={filterMode === "format" ? "active" : ""}
          onClick={() => {
            setFilterMode("format");
            setArtistFilter("");
          }}
        >
          {t.shop.formats}
        </button>

        <select
          aria-label="Sortierung"
          value={sort}
          onChange={event =>
            setSort(event.target.value as "recent" | "artist")
          }
        >
          <option value="recent">{t.shop.recent}</option>
          <option value="artist">{t.shop.artist}</option>
        </select>
      </section>

      {filterMode === "artist" && (
        <section className="catalog-subfilters shell">
          {availableArtists.map(artist => (
            <button
              key={artist}
              className={artistFilter === artist ? "active" : ""}
              onClick={() => setArtistFilter(artist)}
            >
              {artist}
            </button>
          ))}
        </section>
      )}

      {filterMode === "format" && (
        <section className="catalog-subfilters shell">
          {availableFormats.map(format => (
            <button
              key={format}
              className={formatFilter === format ? "active" : ""}
              onClick={() => setFormatFilter(format)}
            >
              {format === "A6"
                ? language === "es"
                  ? "Postal"
                  : "Postkarte"
                : formatLabels[format]}
            </button>
          ))}
        </section>
      )}

      <div className="artist-catalogs shell">
        {productsByArtist.map(group => (
          <section
            className="artist-catalog"
            aria-labelledby={`artist-${group.artist.replaceAll(" ", "-")}`}
            key={group.artist}
          >
            <header>
              <h2 id={`artist-${group.artist.replaceAll(" ", "-")}`}>
                {group.artist}
              </h2>
              <span>
                {group.products.length} {t.shop.designs}
              </span>
            </header>

            <div className="catalog">
              {group.products.map(item => (
                <Link
                  className="catalog-card"
                  href={`/shop/${item.slug}`}
                  key={item.id}
                >
                  <div className="catalog-image">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={`${item.title} — ${item.artist}`}
                      />
                    ) : (
                      <div
                        className="product-placeholder"
                        aria-label={`${item.title} Platzhalter`}
                      >
                        <span className="placeholder-circle" />
                        <span className="placeholder-line" />
                        <b>{item.id.toUpperCase()}</b>
                      </div>
                    )}
                  </div>

                  <div className="catalog-meta">
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.artist}</p>
                    </div>
                    <span>{t.shop.from} 3 €</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
