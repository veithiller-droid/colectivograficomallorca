"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { fetchHomepage, products } from "../data/products";
import type { Product } from "../data/products";
import { useLanguage } from "./language-provider";

const fallbackProducts = products.filter(
  (item): item is Product & { image: string } => item.image !== null,
).slice(0,4);

export default function ParallaxGallery() {
  const { t } = useLanguage();
  const root = useRef<HTMLElement>(null);
  const [selection, setSelection] = useState<Awaited<ReturnType<typeof fetchHomepage>>["selection"]>([]);
  useEffect(() => { fetchHomepage().then(content => setSelection(content.selection)); }, []);
  useEffect(() => {
    const section = root.current;
    if (!section) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const progress = window.innerHeight - rect.top;
      section.style.setProperty("--parallax-slow", `${progress * 0.12}px`);
      section.style.setProperty("--parallax-fast", `${progress * -0.045}px`);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (frame) cancelAnimationFrame(frame); };
  }, []);

  return (
    <section ref={root} className="parallax-stage" aria-labelledby="gallery-title">
      <div className="edge edge-left" aria-hidden="true" />
      <div className="scroll-sheet">
        <div className="gallery-heading"><p className="eyebrow">{t.home.galleryEyebrow}</p><h2 id="gallery-title">{t.home.galleryTitle}</h2><p>{t.home.galleryText}</p></div>
        <div className="poster-stream">
          {(selection.length ? selection.map(item => ({ ...item, image:item.path })) : fallbackProducts).map((item, index) => <Link className={`stream-item stream-${index + 1}`} href={`/shop/${item.slug}`} key={`${item.slug}-${"id" in item ? item.id : index}`}><div className="stream-image"><img src={item.image!} alt={`${item.title} — ${item.artist}`} /></div><div className="stream-caption"><h3>{item.title}</h3><p>{item.artist}</p></div></Link>)}
        </div>
        <Link className="shop-link" href="/shop">{t.home.galleryLink} <span>→</span></Link>
      </div>
      <div className="edge edge-right" aria-hidden="true" />
    </section>
  );
}
